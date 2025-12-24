import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { gsap } from 'gsap';

// Helper for Base64 encoding/decoding as per SDK requirements
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Ensure we handle non-aligned buffers which can cause RangeErrors in Int16Array
  const arrayBuffer = data.buffer;
  const byteOffset = data.byteOffset;
  const byteLength = data.byteLength;
  
  // Safe creation of Int16Array ensuring alignment and length
  const dataInt16 = new Int16Array(arrayBuffer, byteOffset, byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string; sources?: any[] }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        const el = document.getElementById("chat-window");
        if (el) {
           gsap.fromTo(el, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power4.out" });
        }
      }, 0);
    }
  };

  const handleSendText = async () => {
    const apiKey = process?.env?.API_KEY;
    if (!apiKey || !inputText.trim()) return;
    
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are the LocalPulse Assistant. Help users find businesses and answer city-related questions. Use Google Search to provide the most current info."
        },
      });

      const text = response.text || "I couldn't find an answer for that.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      setMessages(prev => [...prev, { role: 'ai', text, sources }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startLiveSession = async () => {
    if (isLive) {
      stopLiveSession();
      return;
    }

    const apiKey = process?.env?.API_KEY;
    if (!apiKey) {
      console.error("API Key not found for live session");
      return;
    }

    try {
      setIsLive(true);
      const ai = new GoogleGenAI({ apiKey });
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext not supported");

      const inCtx = new AudioContextClass({ sampleRate: 16000 });
      const outCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = outCtx;
      const outNode = outCtx.createGain();
      outNode.connect(outCtx.destination);
      outputNodeRef.current = outNode;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => console.debug("Realtime input send failed:", err));
            };
            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              try {
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputNodeRef.current!);
                source.onended = () => activeSourcesRef.current.delete(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                activeSourcesRef.current.add(source);
              } catch (decodeErr) {
                console.error("Audio decoding failed:", decodeErr);
              }
            }
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (err) => console.error("Live session error:", err),
          onclose: () => setIsLive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: "You are a friendly local expert voice assistant for LocalPulse. Help the user discover gems in their city in real-time."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start live session:", err);
      setIsLive(false);
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e){}
      sessionRef.current = null;
    }
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    activeSourcesRef.current.clear();
    setIsLive(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      {isOpen && (
        <div id="chat-window" className="w-[400px] h-[600px] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col mb-6 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">LocalPulse AI</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">Powered by Gemini</p>
            </div>
            <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow p-8 overflow-y-auto space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl">✨</div>
                <h4 className="font-bold text-slate-900 mb-2">How can I help you today?</h4>
                <p className="text-sm text-slate-400">Ask about restaurants, events, or local tips.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[28px] text-[15px] leading-relaxed font-medium ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none'}`}>
                  {m.text}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.sources.map((s, idx) => (
                      <a key={idx} href={s.web?.uri || s.maps?.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100">
                        {s.web?.title || s.maps?.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-slate-50 p-4 rounded-full flex gap-1 animate-pulse">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
            <div className="flex gap-4 items-center">
              <button 
                onClick={startLiveSession}
                className={`p-4 rounded-2xl transition-all shadow-sm ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-400'}`}
                title="Voice Chat"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </button>
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                  placeholder="Ask something..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:border-indigo-600 transition-colors"
                />
                <button 
                  onClick={handleSendText}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:scale-110 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
            {isLive && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center mt-4">Live Session Active</p>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-10"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        )}
      </button>
    </div>
  );
};

export default AIChatBot;