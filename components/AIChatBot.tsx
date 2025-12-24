import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { gsap } from 'gsap';
import { ModelConfigManager } from '../services/geminiConfig';
import { ApiConfigValidator } from '../services/apiConfigValidator';
import { ContextualResponseService } from '../services/contextualResponseService';
import { LocalBusinessFallback } from '../services/fallbackResponseGenerator';
import { ResponseProcessor } from '../services/responseProcessor';

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
  // CRITICAL: Ensure the buffer is aligned for Int16Array (multiple of 2)
  // Uint8Array views can have arbitrary byteOffsets which cause RangeErrors when creating typed arrays of larger width.
  let arrayBuffer = data.buffer;
  let byteOffset = data.byteOffset;
  const byteLength = data.byteLength;
  
  if (byteOffset % 2 !== 0) {
    // If offset is odd, create a copy to get a new aligned buffer
    const copy = new Uint8Array(byteLength);
    copy.set(data);
    arrayBuffer = copy.buffer;
    byteOffset = 0;
  }

  // Safe creation of Int16Array ensuring alignment and length
  const dataInt16 = new Int16Array(arrayBuffer, byteOffset, Math.floor(byteLength / 2));
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
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Load conversation history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('localpulse_chat_history');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.warn('Failed to load chat history:', error);
        // Clear corrupted data
        localStorage.removeItem('localpulse_chat_history');
      }
    }
  }, []);

  // Save conversation history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('localpulse_chat_history', JSON.stringify(messages));
      } catch (error) {
        console.warn('Failed to save chat history:', error);
      }
    }
  }, [messages]);

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

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('localpulse_chat_history');
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    
    const userMsg = inputText.trim();
    const startTime = Date.now();
    
    // Create request context for tracking
    const requestContext = ResponseProcessor.createRequestContext(userMsg);
    
    // Immediately update UI with user message and clear input
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);
    setIsLoading(true);

    // Use the new API configuration validator
    const { key: apiKey } = ApiConfigValidator.getApiKey();
    const validationResult = ApiConfigValidator.validateStartupConfiguration();
    
    if (!validationResult.isValid) {
      // Show configuration error message with proper formatting
      const errorMessage = ApiConfigValidator.createConfigurationErrorMessage(validationResult);
      setMessages(prev => [...prev, { role: 'ai', text: errorMessage }]);
      setIsTyping(false);
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const textModelConfig = ModelConfigManager.getOptimalTextModel();
      
      // Try primary model first, then fallbacks
      let response;
      let lastError;
      let usedModel = '';
      
      for (const model of [textModelConfig.primary, ...textModelConfig.fallbacks]) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: userMsg,
            config: {
              systemInstruction: ContextualResponseService.generateSystemInstruction(false)
            },
          });
          usedModel = model;
          break; // Success, exit loop
        } catch (modelError: any) {
          lastError = modelError;
          console.warn(`Model ${model} failed, trying next fallback:`, modelError);
          continue;
        }
      }
      
      if (!response) {
        throw lastError || new Error('All models failed');
      }

      // Process successful response using ResponseProcessor
      const processedResponse = ResponseProcessor.processSuccessfulResponse(
        response, 
        usedModel, 
        requestContext, 
        startTime
      );
      
      // Validate response completeness
      const validation = ResponseProcessor.validateResponseCompleteness(processedResponse);
      if (!validation.isComplete) {
        console.warn('Response validation issues:', validation.issues);
      }
      
      // Log metrics for monitoring
      ResponseProcessor.logResponseMetrics(processedResponse, requestContext);
      
      // Format for display
      const displayData = ResponseProcessor.formatForDisplay(processedResponse);
      
      // Update UI with successful response
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: displayData.displayText, 
        sources: displayData.displaySources 
      }]);
      
      // Log successful interaction for debugging
      console.log(`Successful API response using model: ${usedModel}`);
      
    } catch (err: any) {
      console.error('AI Error:', err);
      
      // Process error response using ResponseProcessor
      const errorResponse = ResponseProcessor.processErrorResponse(err, requestContext, startTime);
      
      // Log error metrics
      ResponseProcessor.logResponseMetrics(errorResponse, requestContext);
      
      // Format error for display
      const displayData = ResponseProcessor.formatForDisplay(errorResponse);
      
      // Update UI with error response
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: displayData.displayText,
        sources: displayData.displaySources 
      }]);
      
    } finally {
      // Ensure UI state is properly reset
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const startLiveSession = async () => {
    if (isLive) {
      stopLiveSession();
      return;
    }

    // Use the new API configuration validator
    const { key: apiKey } = ApiConfigValidator.getApiKey();
    const validationResult = ApiConfigValidator.validateStartupConfiguration();
    
    if (!validationResult.isValid) {
      const errorMessage = ApiConfigValidator.createConfigurationErrorMessage(validationResult);
      alert(`Voice Chat Configuration Required\n\n${errorMessage}`);
      return;
    }

    try {
      setIsLive(true);
      setIsLoading(true);
      const ai = new GoogleGenAI({ apiKey });
      const audioModelConfig = ModelConfigManager.getOptimalLiveAudioModel();
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext not supported");

      const inCtx = new AudioContextClass({ sampleRate: 16000 });
      const outCtx = new AudioContextClass({ sampleRate: 24000 });
      audioContextRef.current = outCtx;
      const outNode = outCtx.createGain();
      outNode.connect(outCtx.destination);
      outputNodeRef.current = outNode;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try primary audio model first, then fallbacks
      let sessionPromise;
      let lastError;
      let usedModel = '';
      
      for (const model of [audioModelConfig.primary, ...audioModelConfig.fallbacks]) {
        try {
          sessionPromise = ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                setIsLoading(false);
                usedModel = model;
                console.log(`Live session started with model: ${model}`);
                
                const source = inCtx.createMediaStreamSource(stream);
                const processor = inCtx.createScriptProcessor(4096, 1, 1);
                processor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const int16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                  
                  // Correct creation of pcmBlob using the view's specific buffer segment
                  const pcmBlob = { 
                    data: encode(new Uint8Array(int16.buffer, int16.byteOffset, int16.byteLength)), 
                    mimeType: 'audio/pcm;rate=16000' 
                  };
                  
                  sessionPromise.then(session => {
                    if (session) session.sendRealtimeInput({ media: pcmBlob });
                  }).catch(err => console.debug("Realtime input send failed:", err));
                };
                source.connect(processor);
                processor.connect(inCtx.destination);
              },
              onmessage: async (message: LiveServerMessage) => {
                // Enhanced message handling with proper audio processing
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
                    
                    // Log successful audio response for debugging
                    console.log(`Audio response processed successfully using model: ${usedModel}`);
                  } catch (decodeErr) {
                    console.error("Audio decoding failed:", decodeErr);
                  }
                }
                
                // Handle interruptions properly
                if (message.serverContent?.interrupted) {
                  activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
                  activeSourcesRef.current.clear();
                  nextStartTimeRef.current = 0;
                }
              },
              onerror: (err) => {
                console.error("Live session error:", err);
                setIsLoading(false);
                // Enhanced error handling for live sessions
                this.handleLiveSessionError(err);
              },
              onclose: () => {
                setIsLive(false);
                setIsLoading(false);
                console.log("Live session closed");
              }
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              systemInstruction: ContextualResponseService.generateSystemInstruction(true)
            }
          });
          break; // Success, exit loop
        } catch (modelError: any) {
          lastError = modelError;
          console.warn(`Audio model ${model} failed, trying next fallback:`, modelError);
          continue;
        }
      }
      
      if (!sessionPromise) {
        throw lastError || new Error('All audio models failed');
      }

      sessionRef.current = await sessionPromise;
      console.log(`Live session established successfully using model: ${usedModel}`);
      
    } catch (err) {
      console.error("Failed to start live session:", err);
      setIsLive(false);
      setIsLoading(false);
      this.handleLiveSessionError(err);
    }
  };

  // Enhanced error handling for live sessions
  const handleLiveSessionError = (error: any) => {
    let errorMessage = "Voice chat is temporarily unavailable. ";
    
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      errorMessage += "API quota exceeded. Please try again later.";
    } else if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      errorMessage += "Voice model is being updated. Please try again in a few minutes.";
    } else if (error?.message?.includes('permission') || error?.message?.includes('microphone')) {
      errorMessage += "Please allow microphone access to use voice chat.";
    } else {
      errorMessage += "Please check your connection and try again.";
    }
    
    // Show error message to user
    alert(`Voice Chat Error\n\n${errorMessage}\n\nYou can still use text chat for assistance.`);
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
        <div id="chat-window" className="w-[400px] h-[600px] bg-white dark:bg-slate-800 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col mb-6 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-slate-900 dark:bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">LocalPulse AI</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">Powered by Gemini</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button 
                  onClick={clearChatHistory}
                  className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-full transition-colors"
                  title="Clear chat history"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              )}
              <button onClick={toggleChat} className="p-2 hover:bg-white/10 dark:hover:bg-white/10 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow p-8 overflow-y-auto space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center mt-12">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl">✨</div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">How can I help you today?</h4>
                <p className="text-sm text-slate-400 dark:text-slate-500">Ask about restaurants, events, or local tips.</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-4">💾 Your conversation history is automatically saved</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[28px] text-[15px] leading-relaxed font-medium ${m.role === 'user' ? 'bg-indigo-600 dark:bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                  {/* Enhanced message formatting with proper line breaks */}
                  {m.text.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
                {/* Enhanced source display with better formatting */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.web?.uri || s.maps?.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        title={s.web?.title || s.maps?.title || 'Source'}
                      >
                        {s.web?.title || s.maps?.title || 'Source'}
                      </a>
                    ))}
                  </div>
                )}
                {/* Show timestamp for better UX */}
                <div className={`text-[10px] text-slate-400 dark:text-slate-500 mt-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 mt-4">
                  {isLoading ? 'Generating response...' : 'AI is typing...'}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-8 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
            <div className="flex gap-4 items-center">
              <button 
                onClick={startLiveSession}
                disabled={isLoading}
                className={`p-4 rounded-2xl transition-all shadow-sm ${
                  isLive 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : isLoading 
                      ? 'bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
                title={isLive ? "Stop Voice Chat" : isLoading ? "Connecting..." : "Start Voice Chat"}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-slate-400 dark:border-slate-500 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                )}
              </button>
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendText()}
                  placeholder={isLoading ? "Processing your message..." : "Ask something..."}
                  disabled={isLoading}
                  className={`w-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:border-indigo-600 dark:focus:border-indigo-400 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <button 
                  onClick={handleSendText}
                  disabled={isLoading || !inputText.trim()}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all ${
                    isLoading || !inputText.trim() 
                      ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                      : 'text-indigo-600 dark:text-indigo-400 hover:scale-110'
                  }`}
                  title={isLoading ? "Processing..." : !inputText.trim() ? "Enter a message" : "Send message"}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  )}
                </button>
              </div>
            </div>
            {(isLive || isLoading) && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-center mt-4">
                {isLoading ? (
                  <span className="text-blue-500 dark:text-blue-400">Connecting...</span>
                ) : (
                  <span className="text-red-500 animate-pulse">Live Session Active</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={toggleChat}
        className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-10"
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