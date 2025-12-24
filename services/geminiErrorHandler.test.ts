import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GeminiErrorHandler } from './geminiErrorHandler';

/**
 * Feature: gemini-api-fix, Property 3: Comprehensive Error Handling
 * 
 * For any API error condition (network, quota, authentication, etc.), the system should provide 
 * user-friendly error messages and handle failures gracefully
 * 
 * Validates: Requirements 2.1, 2.4
 */

describe('Gemini Error Handler', () => {
  describe('Property 3: Comprehensive Error Handling', () => {
    it('should always provide user-friendly messages for any error type', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Generate quota errors
            fc.record({
              error: fc.record({ code: fc.constant(429) }),
              message: fc.constantFrom('quota exceeded', 'rate limit', '429 error')
            }),
            // Generate model not found errors  
            fc.record({
              error: fc.record({ code: fc.constant(404) }),
              message: fc.constantFrom('model not found', '404 error', 'not found')
            }),
            // Generate auth errors
            fc.record({
              error: fc.record({ code: fc.oneof(fc.constant(401), fc.constant(403)) }),
              message: fc.constantFrom('unauthorized', 'forbidden', 'api key invalid')
            }),
            // Generate network errors
            fc.record({
              code: fc.constant('NETWORK_ERROR'),
              message: fc.constantFrom('network error', 'connection failed', 'timeout')
            }),
            // Generate unknown errors
            fc.record({
              message: fc.string({ minLength: 1, maxLength: 100 })
            })
          ),
          fc.string({ minLength: 0, maxLength: 200 }), // user input
          (error, userInput) => {
            const response = GeminiErrorHandler.handleApiError(error, userInput);
            
            // Property: Should always provide a user message
            expect(response.userMessage).toBeDefined();
            expect(response.userMessage.length).toBeGreaterThan(0);
            expect(typeof response.userMessage).toBe('string');
            
            // Property: User message should be user-friendly (no technical jargon)
            expect(response.userMessage).not.toMatch(/undefined|null|NaN/i);
            expect(response.userMessage).not.toMatch(/error\.code|error\.message/i);
            
            // Property: Should always provide suggested actions
            expect(response.suggestedActions).toBeDefined();
            expect(Array.isArray(response.suggestedActions)).toBe(true);
            expect(response.suggestedActions.length).toBeGreaterThan(0);
            
            // Property: All suggested actions should be strings
            response.suggestedActions.forEach(action => {
              expect(typeof action).toBe('string');
              expect(action.length).toBeGreaterThan(0);
            });
            
            // Property: Should indicate fallback availability
            expect(typeof response.fallbackAvailable).toBe('boolean');
            
            // Property: Should indicate if retryable
            expect(typeof response.retryable).toBe('boolean');
            
            // Property: Technical details should be optional but if present, should be string
            if (response.technicalDetails !== undefined) {
              expect(typeof response.technicalDetails).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly classify error types for any error structure', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Quota error variations
            fc.oneof(
              fc.record({ error: fc.record({ code: fc.constant(429) }) }),
              fc.record({ status: fc.constant(429) }),
              fc.record({ message: fc.constantFrom('quota exceeded', 'rate limit exceeded', '429') })
            ),
            // Model not found error variations
            fc.oneof(
              fc.record({ error: fc.record({ code: fc.constant(404) }) }),
              fc.record({ status: fc.constant(404) }),
              fc.record({ message: fc.constantFrom('model not found', '404', 'not found') })
            ),
            // Auth error variations
            fc.oneof(
              fc.record({ error: fc.record({ code: fc.oneof(fc.constant(401), fc.constant(403)) }) }),
              fc.record({ status: fc.oneof(fc.constant(401), fc.constant(403)) }),
              fc.record({ message: fc.constantFrom('unauthorized', 'forbidden', 'api key', 'authentication') })
            ),
            // Network error variations
            fc.oneof(
              fc.record({ code: fc.constant('NETWORK_ERROR') }),
              fc.record({ name: fc.constant('NetworkError') }),
              fc.record({ message: fc.constantFrom('network', 'connection', 'timeout') })
            )
          ),
          (error) => {
            const response = GeminiErrorHandler.handleApiError(error);
            
            // Property: Error classification should be consistent
            if (error.error?.code === 429 || error.status === 429 || 
                (error.message && (error.message.includes('quota') || error.message.includes('429')))) {
              expect(response.userMessage).toMatch(/quota|limit/i);
              expect(response.retryable).toBe(true);
            }
            
            if (error.error?.code === 404 || error.status === 404 || 
                (error.message && error.message.includes('not found'))) {
              expect(response.userMessage).toMatch(/update|service/i);
              expect(response.retryable).toBe(false);
            }
            
            if (error.error?.code === 401 || error.error?.code === 403 || 
                error.status === 401 || error.status === 403 ||
                (error.message && (error.message.includes('unauthorized') || error.message.includes('api key')))) {
              expect(response.userMessage).toMatch(/configuration|key/i);
              expect(response.retryable).toBe(false);
            }
            
            if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError' ||
                (error.message && (error.message.includes('network') || error.message.includes('connection')))) {
              expect(response.userMessage).toMatch(/connection|network/i);
              expect(response.retryable).toBe(true);
            }
            
            // Property: All errors should have fallback available
            expect(response.fallbackAvailable).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide consistent fallback decisions for any error', () => {
      fc.assert(
        fc.property(
          fc.anything(), // Any error object
          (error) => {
            const shouldFallback = GeminiErrorHandler.shouldUseFallback(error);
            
            // Property: Fallback decision should be boolean
            expect(typeof shouldFallback).toBe('boolean');
            
            // Property: Should be consistent with error response
            const response = GeminiErrorHandler.handleApiError(error);
            
            // If error is not retryable, should use fallback
            if (!response.retryable) {
              expect(shouldFallback).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle malformed or null errors gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant({}),
            fc.record({}),
            fc.string(),
            fc.integer(),
            fc.boolean()
          ),
          fc.string({ minLength: 0, maxLength: 100 }),
          (malformedError, userInput) => {
            // Property: Should never throw for any input
            expect(() => {
              const response = GeminiErrorHandler.handleApiError(malformedError, userInput);
              
              // Property: Should always return valid response structure
              expect(response).toBeDefined();
              expect(response.userMessage).toBeDefined();
              expect(response.suggestedActions).toBeDefined();
              expect(typeof response.fallbackAvailable).toBe('boolean');
              expect(typeof response.retryable).toBe('boolean');
              
            }).not.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always include Geographic Discovery as fallback option', () => {
      fc.assert(
        fc.property(
          fc.anything(), // Any error
          fc.string({ minLength: 0, maxLength: 200 }), // Any user input
          (error, userInput) => {
            const response = GeminiErrorHandler.handleApiError(error, userInput);
            
            // Property: Should always mention Geographic Discovery as alternative
            const hasGeographicDiscovery = 
              response.userMessage.toLowerCase().includes('geographic discovery') ||
              response.userMessage.toLowerCase().includes('map') ||
              response.suggestedActions.some(action => 
                action.toLowerCase().includes('geographic discovery') ||
                action.toLowerCase().includes('map')
              );
            
            expect(hasGeographicDiscovery).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});