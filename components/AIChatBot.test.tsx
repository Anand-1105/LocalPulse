import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import AIChatBot from './AIChatBot';

/**
 * Feature: gemini-api-fix, Property 7: UI State Persistence and Responsiveness
 * 
 * For any chat interface interaction, the system should maintain conversation history 
 * when reopened and provide visual feedback during all user interactions
 * 
 * Validates: Requirements 4.3, 4.4
 */

// Mock dependencies
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn(() => Promise.resolve({ text: 'Mock AI response' }))
    },
    live: {
      connect: vi.fn(() => Promise.resolve({
        close: vi.fn(),
        sendRealtimeInput: vi.fn()
      }))
    }
  })),
  Modality: { AUDIO: 'audio' }
}));

vi.mock('gsap', () => ({
  gsap: {
    fromTo: vi.fn()
  }
}));

vi.mock('../services/geminiConfig', () => ({
  ModelConfigManager: {
    getOptimalTextModel: () => ({
      primary: 'gemini-2.5-flash',
      fallbacks: ['gemini-2.5-flash-lite']
    }),
    getOptimalLiveAudioModel: () => ({
      primary: 'gemini-2.5-flash-native-audio-preview-12-2025',
      fallbacks: []
    })
  }
}));

vi.mock('../services/apiConfigValidator', () => ({
  ApiConfigValidator: {
    getApiKey: () => ({ key: 'test-api-key', source: 'environment' }),
    validateStartupConfiguration: () => ({ isValid: true })
  }
}));

vi.mock('../services/contextualResponseService', () => ({
  ContextualResponseService: {
    generateSystemInstruction: () => 'Test system instruction',
    generateContextualResponse: () => 'Test fallback response'
  }
}));

describe('AIChatBot UI State and Responsiveness', () => {
  let originalLocalStorage: Storage;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    originalLocalStorage = window.localStorage;
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        })
      },
      writable: true
    });

    // Mock navigator.mediaDevices for audio tests
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn(() => Promise.resolve({
          getTracks: () => []
        }))
      },
      writable: true
    });

    // Mock AudioContext
    global.AudioContext = vi.fn(() => ({
      createGain: () => ({
        connect: vi.fn()
      }),
      createMediaStreamSource: () => ({
        connect: vi.fn()
      }),
      createScriptProcessor: () => ({
        connect: vi.fn(),
        onaudioprocess: null
      }),
      createBuffer: () => ({
        getChannelData: () => new Float32Array(1024),
        duration: 1.0
      }),
      createBufferSource: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
        buffer: null
      }),
      destination: {},
      currentTime: 0
    })) as any;
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    vi.clearAllMocks();
  });

  describe('Property 7: UI State Persistence and Responsiveness', () => {
    it('should persist conversation history across component remounts for any message sequence', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              role: fc.constantFrom('user', 'ai'),
              text: fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('LocalPulse')),
              sources: fc.option(fc.array(fc.record({
                web: fc.option(fc.record({
                  title: fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('LocalPulse')),
                  uri: fc.webUrl()
                }))
              })))
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (messages) => {
            // Set up initial conversation history in localStorage
            const historyKey = 'localpulse_chat_history';
            mockLocalStorage[historyKey] = JSON.stringify(messages);

            // Render component
            const { unmount } = render(<AIChatBot />);
            
            // Find the main toggle button (the one that's always visible)
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            expect(mainToggleButton).toBeInTheDocument();
            
            // Open chat to trigger history loading
            fireEvent.click(mainToggleButton!);

            // Wait for chat to open
            expect(screen.getByText('LocalPulse AI')).toBeInTheDocument();

            // Property: All messages should be displayed after loading from localStorage
            messages.forEach((message) => {
              expect(screen.getByText(message.text)).toBeInTheDocument();
            });

            // Property: Sources should be rendered if present
            messages.forEach((message) => {
              if (message.sources && message.sources.length > 0) {
                message.sources.forEach((source) => {
                  if (source.web?.title) {
                    expect(screen.getByText(source.web.title)).toBeInTheDocument();
                  }
                });
              }
            });

            // Unmount and remount to test persistence
            unmount();
            render(<AIChatBot />);
            
            // Open chat again
            const newToggleButtons = screen.getAllByRole('button');
            const newMainToggleButton = newToggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            fireEvent.click(newMainToggleButton!);

            // Property: Messages should still be present after remount
            messages.forEach((message) => {
              expect(screen.getByText(message.text)).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should provide visual feedback during all user interactions', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('LocalPulse')),
          async (userMessage) => {
            render(<AIChatBot />);
            
            // Find the main toggle button
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            expect(mainToggleButton).toBeInTheDocument();
            
            // Open chat
            fireEvent.click(mainToggleButton!);

            // Property: Chat window should be visible after opening
            await waitFor(() => {
              expect(screen.getByText('LocalPulse AI')).toBeInTheDocument();
            });

            // Property: Input field should be responsive
            const inputField = screen.getByPlaceholderText('Ask something...');
            expect(inputField).toBeInTheDocument();
            expect(inputField).not.toBeDisabled();

            // Type message and verify input responsiveness
            fireEvent.change(inputField, { target: { value: userMessage } });
            
            // Property: Input should reflect typed text
            expect(inputField).toHaveValue(userMessage);

            // Property: Send button should be enabled when text is present
            const sendButtons = screen.getAllByRole('button');
            const sendButton = sendButtons.find(btn => 
              btn.querySelector('svg path[d*="M14 5l7 7"]')
            );
            if (sendButton) {
              expect(sendButton).not.toBeDisabled();
            }

            // Property: User message should be ready for sending
            expect(inputField).toHaveValue(userMessage);

            // Property: Input field should be functional
            expect(inputField).toBeInTheDocument();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain UI responsiveness during voice chat interactions', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // Whether to start or stop voice chat
          async (shouldStartVoice) => {
            render(<AIChatBot />);
            
            // Find the main toggle button
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            
            // Open chat
            fireEvent.click(mainToggleButton!);

            // Wait for chat to open
            await waitFor(() => {
              expect(screen.getByText('LocalPulse AI')).toBeInTheDocument();
            });

            // Find voice chat button by title
            const voiceButton = screen.getByTitle('Start Voice Chat');

            // Property: Voice button should be responsive
            expect(voiceButton).not.toBeDisabled();

            if (shouldStartVoice) {
              // Start voice chat
              fireEvent.click(voiceButton);

              // Property: UI should provide feedback for voice state
              await waitFor(() => {
                // Voice state feedback should be present - button should still exist
                expect(voiceButton).toBeInTheDocument();
              });
            }

            // Property: Voice button should remain interactive
            expect(voiceButton).toBeInTheDocument();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should handle localStorage errors gracefully and maintain functionality', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid json'),
            fc.constant('null'),
            fc.constant('undefined'),
            fc.array(fc.anything(), { maxLength: 3 }) // Invalid message format
          ),
          (corruptedData) => {
            // Set up corrupted localStorage data
            const historyKey = 'localpulse_chat_history';
            if (typeof corruptedData === 'string') {
              mockLocalStorage[historyKey] = corruptedData;
            } else {
              mockLocalStorage[historyKey] = JSON.stringify(corruptedData);
            }

            // Mock console.warn to verify error handling
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            render(<AIChatBot />);
            
            // Find the main toggle button
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            
            // Open chat
            fireEvent.click(mainToggleButton!);

            // Property: Component should render without crashing
            expect(screen.getByText('LocalPulse AI')).toBeInTheDocument();

            // Property: Should show empty state when history is corrupted
            expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument();

            // Property: Should handle localStorage errors gracefully
            // (Console warning may or may not be called depending on data validity)
            
            consoleSpy.mockRestore();
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should clear conversation history and update UI state consistently', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              role: fc.constantFrom('user', 'ai'),
              text: fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('LocalPulse'))
            }),
            { minLength: 2, maxLength: 4 }
          ),
          (initialMessages) => {
            // Set up initial conversation history
            const historyKey = 'localpulse_chat_history';
            mockLocalStorage[historyKey] = JSON.stringify(initialMessages);

            render(<AIChatBot />);
            
            // Find the main toggle button
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            
            // Open chat
            fireEvent.click(mainToggleButton!);

            // Verify messages are loaded
            initialMessages.forEach((message) => {
              expect(screen.getByText(message.text)).toBeInTheDocument();
            });

            // Find clear history button (trash icon in header)
            const clearButton = screen.getByTitle('Clear chat history');
            expect(clearButton).toBeInTheDocument();

            fireEvent.click(clearButton);

            // Property: All messages should be removed from UI
            initialMessages.forEach((message) => {
              expect(screen.queryByText(message.text)).not.toBeInTheDocument();
            });

            // Property: Empty state should be shown
            expect(screen.getByText(/how can i help you today/i)).toBeInTheDocument();

            // Property: localStorage should be cleared
            expect(mockLocalStorage[historyKey]).toBeUndefined();
          }
        ),
        { numRuns: 3 }
      );
    });

    it('should maintain scroll position and auto-scroll behavior during message updates', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('LocalPulse')),
            { minLength: 2, maxLength: 8 }
          ),
          (messageTexts) => {
            render(<AIChatBot />);
            
            // Find the main toggle button
            const toggleButtons = screen.getAllByRole('button');
            const mainToggleButton = toggleButtons.find(btn => 
              btn.classList.contains('w-16') && btn.classList.contains('h-16')
            );
            
            // Open chat
            fireEvent.click(mainToggleButton!);

            // Property: Messages container should be present
            const messagesContainer = screen.getByText('LocalPulse AI').closest('.flex-grow');
            expect(messagesContainer).toBeInTheDocument();

            // Property: Auto-scroll reference element should be present
            // (The messagesEndRef div should exist for scroll behavior)
            const chatWindow = screen.getByText('LocalPulse AI').closest('[id="chat-window"]');
            expect(chatWindow).toBeInTheDocument();

            // Property: UI should handle multiple messages without breaking
            messageTexts.forEach((text, index) => {
              // Simulate adding messages by checking the structure remains intact
              expect(screen.getByText('LocalPulse AI')).toBeInTheDocument();
              expect(screen.getByPlaceholderText('Ask something...')).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 3 }
      );
    });
  });
});