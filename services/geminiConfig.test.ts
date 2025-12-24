import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ModelConfigManager } from './geminiConfig';

/**
 * Feature: gemini-api-fix, Property 1: API Configuration Correctness
 * 
 * For any chat request, the system should use only currently supported Gemini model identifiers 
 * and establish valid API connections when configuration is correct
 * 
 * Validates: Requirements 1.1, 1.2, 3.4
 */

describe('Gemini API Configuration', () => {
  describe('Property 1: API Configuration Correctness', () => {
    it('should always return valid model configurations', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Test text model configuration
          const textConfig = ModelConfigManager.getOptimalTextModel();
          
          // Property: Primary model should be valid
          expect(ModelConfigManager.validateModelAvailability(textConfig.primary)).toBe(true);
          
          // Property: All fallback models should be valid
          textConfig.fallbacks.forEach(fallback => {
            expect(ModelConfigManager.validateModelAvailability(fallback)).toBe(true);
          });
          
          // Property: Should have at least one fallback
          expect(textConfig.fallbacks.length).toBeGreaterThan(0);
          
          // Property: API version should be specified
          expect(textConfig.apiVersion).toBeDefined();
          expect(textConfig.apiVersion).toBe('v1beta');
        }),
        { numRuns: 100 }
      );
    });

    it('should always return valid live audio model configurations', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Test live audio model configuration
          const audioConfig = ModelConfigManager.getOptimalLiveAudioModel();
          
          // Property: Primary audio model should be valid
          expect(ModelConfigManager.validateModelAvailability(audioConfig.primary)).toBe(true);
          
          // Property: All fallback audio models should be valid
          audioConfig.fallbacks.forEach(fallback => {
            expect(ModelConfigManager.validateModelAvailability(fallback)).toBe(true);
          });
          
          // Property: Should have at least one fallback
          expect(audioConfig.fallbacks.length).toBeGreaterThan(0);
          
          // Property: API version should be specified
          expect(audioConfig.apiVersion).toBeDefined();
          expect(audioConfig.apiVersion).toBe('v1beta');
        }),
        { numRuns: 100 }
      );
    });

    it('should generate valid default configurations for any API key', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }), // Generate random API keys
          (apiKey) => {
            const config = ModelConfigManager.getDefaultConfig(apiKey);
            
            // Property: API key should be preserved
            expect(config.apiKey).toBe(apiKey);
            
            // Property: Should have both text and audio model configs
            expect(config.models.text).toBeDefined();
            expect(config.models.liveAudio).toBeDefined();
            
            // Property: Fallback should be enabled by default
            expect(config.fallbackEnabled).toBe(true);
            
            // Property: Should have reasonable retry attempts
            expect(config.retryAttempts).toBeGreaterThan(0);
            expect(config.retryAttempts).toBeLessThanOrEqual(10);
            
            // Property: Text model should use current stable model
            expect(config.models.text.primary).toBe('gemini-2.5-flash');
            
            // Property: Audio model should use current preview model
            expect(config.models.liveAudio.primary).toBe('gemini-2.5-flash-native-audio-preview-12-2025');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate model names correctly for all supported patterns', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Valid model patterns
            fc.record({
              major: fc.integer({ min: 2, max: 3 }),
              minor: fc.integer({ min: 0, max: 9 }),
              variant: fc.constantFrom('flash', 'flash-lite')
            }).map(({ major, minor, variant }) => `gemini-${major}.${minor}-${variant}`),
            
            // Valid audio model patterns
            fc.record({
              major: fc.integer({ min: 2, max: 3 }),
              minor: fc.integer({ min: 0, max: 9 }),
              month: fc.integer({ min: 1, max: 12 }).map(m => m.toString().padStart(2, '0')),
              year: fc.integer({ min: 2024, max: 2030 })
            }).map(({ major, minor, month, year }) => 
              `gemini-${major}.${minor}-flash-native-audio-preview-${month}-${year}`
            )
          ),
          (validModel) => {
            // Property: All generated valid models should pass validation
            expect(ModelConfigManager.validateModelAvailability(validModel)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid model names for any invalid pattern', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid patterns
            fc.string().filter(s => !s.startsWith('gemini-')),
            fc.constantFrom(
              'gemini-pro', // deprecated model
              'gemini-1.0-flash', // old version
              'invalid-model',
              '',
              'gemini-flash', // missing version
              'gemini-2.5', // missing variant
            )
          ),
          (invalidModel) => {
            // Property: All invalid models should fail validation
            expect(ModelConfigManager.validateModelAvailability(invalidModel)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});