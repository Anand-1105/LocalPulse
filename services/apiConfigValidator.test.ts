import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { ApiConfigValidator } from './apiConfigValidator';

/**
 * Feature: gemini-api-fix, Property 5: Configuration Validation Consistency
 * 
 * For any application startup, the system should validate API key availability 
 * and provide clear configuration instructions when keys are missing or invalid
 * 
 * Validates: Requirements 3.1, 3.2, 3.3
 */

describe('API Configuration Validator', () => {
  // Store original environment to restore after tests
  let originalEnv: any;
  let originalWindow: any;

  beforeEach(() => {
    // Store original values
    originalEnv = { ...import.meta.env };
    originalWindow = (window as any).GEMINI_API_KEY;
  });

  afterEach(() => {
    // Restore original values
    Object.assign(import.meta.env, originalEnv);
    if (originalWindow !== undefined) {
      (window as any).GEMINI_API_KEY = originalWindow;
    } else {
      delete (window as any).GEMINI_API_KEY;
    }
  });

  describe('Property 5: Configuration Validation Consistency', () => {
    it('should consistently validate API key format for any input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Valid API key pattern
            fc.string({ minLength: 39, maxLength: 39 })
              .filter(s => s.startsWith('AIza'))
              .map(s => 'AIza' + s.slice(4).replace(/[^A-Za-z0-9_-]/g, 'A')),
            
            // Invalid patterns
            fc.oneof(
              fc.string({ maxLength: 38 }), // Too short
              fc.string({ minLength: 40 }), // Too long  
              fc.string().filter(s => !s.startsWith('AIza')), // Wrong prefix
              fc.constantFrom('', null, undefined), // Empty/null values
            )
          ),
          (apiKey) => {
            const isValid = ApiConfigValidator.validateApiKeyFormat(apiKey);
            
            if (apiKey && typeof apiKey === 'string' && apiKey.length >= 39 && apiKey.startsWith('AIza')) {
              // Property: Valid format keys should pass validation
              expect(isValid).toBe(true);
            } else {
              // Property: Invalid format keys should fail validation
              expect(isValid).toBe(false);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should provide consistent validation results for startup configuration', () => {
      fc.assert(
        fc.property(
          fc.record({
            envKey: fc.option(fc.string(), { nil: undefined }),
            windowKey: fc.option(fc.string(), { nil: undefined }),
            hasValidFormat: fc.boolean()
          }),
          ({ envKey, windowKey, hasValidFormat }) => {
            // Set up test environment
            if (envKey !== undefined) {
              (import.meta.env as any).VITE_GEMINI_API_KEY = envKey;
            } else {
              delete (import.meta.env as any).VITE_GEMINI_API_KEY;
            }
            
            if (windowKey !== undefined) {
              (window as any).GEMINI_API_KEY = windowKey;
            } else {
              delete (window as any).GEMINI_API_KEY;
            }

            const result = ApiConfigValidator.validateStartupConfiguration();
            
            // Property: Result should always have required fields
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('suggestedActions');
            expect(Array.isArray(result.suggestedActions)).toBe(true);
            
            // Property: Invalid configurations should provide error messages
            if (!result.isValid) {
              expect(result.errorMessage).toBeDefined();
              expect(typeof result.errorMessage).toBe('string');
              expect(result.errorMessage.length).toBeGreaterThan(0);
            }
            
            // Property: All results should provide actionable suggestions
            expect(result.suggestedActions.length).toBeGreaterThan(0);
            result.suggestedActions.forEach(action => {
              expect(typeof action).toBe('string');
              expect(action.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should consistently retrieve API keys from available sources', () => {
      fc.assert(
        fc.property(
          fc.record({
            envKey: fc.option(fc.string()),
            windowKey: fc.option(fc.string())
          }),
          ({ envKey, windowKey }) => {
            // Set up test environment
            if (envKey !== undefined) {
              (import.meta.env as any).VITE_GEMINI_API_KEY = envKey;
            } else {
              delete (import.meta.env as any).VITE_GEMINI_API_KEY;
            }
            
            if (windowKey !== undefined) {
              (window as any).GEMINI_API_KEY = windowKey;
            } else {
              delete (window as any).GEMINI_API_KEY;
            }

            const { key, source } = ApiConfigValidator.getApiKey();
            
            // Property: Should always return a source
            expect(source).toBeDefined();
            expect(['environment', 'window', 'default', 'missing']).toContain(source);
            
            // Property: Source priority should be consistent
            if (envKey) {
              expect(source).toBe('environment');
              expect(key).toBe(envKey);
            } else if (windowKey) {
              expect(source).toBe('window');
              expect(key).toBe(windowKey);
            } else {
              // Should fall back to default or missing
              expect(['default', 'missing']).toContain(source);
            }
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should generate consistent configuration instructions', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed for this test
          () => {
            const instructions = ApiConfigValidator.getConfigurationInstructions();
            
            // Property: Instructions should always be provided
            expect(instructions).toBeDefined();
            expect(typeof instructions).toBe('string');
            expect(instructions.length).toBeGreaterThan(0);
            
            // Property: Instructions should contain key setup information
            expect(instructions.toLowerCase()).toMatch(/api.?key|gemini|configuration/);
            
            // Property: Instructions should provide actionable steps
            expect(instructions).toMatch(/\d+\./); // Should contain numbered steps
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should create consistent error messages for configuration issues', () => {
      fc.assert(
        fc.property(
          fc.record({
            isValid: fc.boolean(),
            errorMessage: fc.option(fc.string()),
            suggestedActions: fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
            configurationInstructions: fc.option(fc.string())
          }),
          (validationResult) => {
            const errorMessage = ApiConfigValidator.createConfigurationErrorMessage(validationResult);
            
            if (validationResult.isValid) {
              // Property: Valid configurations should return empty error message
              expect(errorMessage).toBe('');
            } else {
              // Property: Invalid configurations should return helpful error message
              expect(errorMessage).toBeDefined();
              expect(typeof errorMessage).toBe('string');
              expect(errorMessage.length).toBeGreaterThan(0);
              
              // Property: Error message should contain fallback options
              expect(errorMessage.toLowerCase()).toMatch(/geographic|discovery|map|browse/);
              
              // Property: Error message should be user-friendly (no technical jargon)
              expect(errorMessage).not.toMatch(/undefined|null|error|exception/i);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle edge cases consistently', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(null, undefined, '', 0, false, {}),
            fc.string({ maxLength: 5 }),
            fc.string({ minLength: 100 })
          ),
          (edgeCase) => {
            // Property: Edge cases should not crash validation
            expect(() => {
              ApiConfigValidator.validateApiKeyFormat(edgeCase as any);
            }).not.toThrow();
            
            // Property: Edge cases should consistently return false for validation
            const isValid = ApiConfigValidator.validateApiKeyFormat(edgeCase as any);
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});