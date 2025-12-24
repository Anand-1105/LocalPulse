import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { LocalBusinessFallback } from './fallbackResponseGenerator';

/**
 * Feature: gemini-api-fix, Property 4: Fallback Response Availability
 * 
 * For any user input when the API is completely unavailable, the system should provide 
 * contextual fallback responses based on the input content
 * 
 * Validates: Requirements 2.3
 */

describe('Local Business Fallback', () => {
  describe('Property 4: Fallback Response Availability', () => {
    it('should always provide contextual responses for any user input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }), // Any user input
          (userInput) => {
            const response = LocalBusinessFallback.generateContextualResponse(userInput);
            
            // Property: Should always return a non-empty string
            expect(response).toBeDefined();
            expect(typeof response).toBe('string');
            expect(response.length).toBeGreaterThan(0);
            
            // Property: Should always mention LocalPulse or LPU context
            const hasLocalContext = 
              response.toLowerCase().includes('localpulse') ||
              response.toLowerCase().includes('lovely professional university') ||
              response.toLowerCase().includes('lpu') ||
              response.toLowerCase().includes('local');
            expect(hasLocalContext).toBe(true);
            
            // Property: Should always provide actionable guidance
            const hasActionableGuidance = 
              response.toLowerCase().includes('geographic discovery') ||
              response.toLowerCase().includes('map') ||
              response.toLowerCase().includes('category') ||
              response.toLowerCase().includes('find') ||
              response.toLowerCase().includes('discover') ||
              response.toLowerCase().includes('explore');
            expect(hasActionableGuidance).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide category-specific responses for business-related queries', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Restaurant keywords
            fc.constantFrom('restaurant', 'food', 'eat', 'dining', 'meal', 'lunch', 'dinner'),
            // Fitness keywords  
            fc.constantFrom('gym', 'fitness', 'workout', 'exercise', 'sports', 'training'),
            // Coffee keywords
            fc.constantFrom('coffee', 'cafe', 'espresso', 'latte', 'tea'),
            // Shopping keywords
            fc.constantFrom('shop', 'store', 'buy', 'purchase', 'mall', 'shopping'),
            // Entertainment keywords
            fc.constantFrom('movie', 'cinema', 'theater', 'entertainment', 'fun'),
            // Service keywords
            fc.constantFrom('service', 'repair', 'salon', 'spa', 'beauty', 'clinic')
          ),
          fc.string({ minLength: 0, maxLength: 100 }), // Additional context
          (businessKeyword, additionalText) => {
            const userInput = `${businessKeyword} ${additionalText}`.trim();
            const response = LocalBusinessFallback.generateContextualResponse(userInput);
            
            // Property: Should recognize business category
            expect(LocalBusinessFallback.isBusinessCategoryQuery(userInput)).toBe(true);
            
            // Property: Response should be contextual to the business type
            const lowerResponse = response.toLowerCase();
            const lowerKeyword = businessKeyword.toLowerCase();
            
            // Should mention relevant category or provide specific guidance
            const isContextual = 
              lowerResponse.includes(lowerKeyword) ||
              lowerResponse.includes('category') ||
              lowerResponse.includes('geographic discovery') ||
              lowerResponse.includes('map');
            expect(isContextual).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide help responses for help-related queries', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom('help', 'how', 'what', 'guide', 'tutorial', 'instructions'),
            fc.record({
              helpWord: fc.constantFrom('help', 'how', 'what'),
              context: fc.string({ minLength: 0, maxLength: 50 })
            }).map(({ helpWord, context }) => `${helpWord} ${context}`.trim())
          ),
          (helpQuery) => {
            const response = LocalBusinessFallback.generateContextualResponse(helpQuery);
            
            // Property: Help responses should be comprehensive
            expect(response.length).toBeGreaterThan(100); // Should be detailed
            
            // Property: Should include usage instructions
            const hasInstructions = 
              response.toLowerCase().includes('geographic discovery') &&
              response.toLowerCase().includes('category') &&
              response.toLowerCase().includes('map');
            expect(hasInstructions).toBe(true);
            
            // Property: Should mention multiple features
            const mentionsMultipleFeatures = 
              (response.match(/•/g) || []).length >= 3; // At least 3 bullet points
            expect(mentionsMultipleFeatures).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide location-specific responses for location queries', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom('lpu', 'lovely professional university', 'phagwara', 'punjab'),
            fc.record({
              locationWord: fc.constantFrom('near', 'around', 'local', 'nearby'),
              place: fc.constantFrom('lpu', 'university', 'campus')
            }).map(({ locationWord, place }) => `${locationWord} ${place}`)
          ),
          (locationQuery) => {
            const response = LocalBusinessFallback.generateContextualResponse(locationQuery);
            
            // Property: Should mention specific location context
            const hasLocationContext = 
              response.toLowerCase().includes('lovely professional university') ||
              response.toLowerCase().includes('lpu') ||
              response.toLowerCase().includes('phagwara') ||
              response.toLowerCase().includes('punjab');
            expect(hasLocationContext).toBe(true);
            
            // Property: Should provide local-specific guidance
            const hasLocalGuidance = 
              response.toLowerCase().includes('students') ||
              response.toLowerCase().includes('faculty') ||
              response.toLowerCase().includes('area') ||
              response.toLowerCase().includes('local');
            expect(hasLocalGuidance).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty or whitespace-only inputs gracefully', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.string().filter(s => s.trim() === ''), // Whitespace only
            fc.constantFrom(' ', '  ', '\t', '\n', '   \t  \n  ')
          ),
          (emptyInput) => {
            const response = LocalBusinessFallback.generateContextualResponse(emptyInput);
            
            // Property: Should provide default helpful response
            expect(response).toBeDefined();
            expect(response.length).toBeGreaterThan(0);
            
            // Property: Should still provide actionable guidance
            const hasGuidance = 
              response.toLowerCase().includes('geographic discovery') ||
              response.toLowerCase().includes('category') ||
              response.toLowerCase().includes('map');
            expect(hasGuidance).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide enhanced responses with alternatives when requested', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.boolean(),
          (userInput, includeAlternatives) => {
            const response = LocalBusinessFallback.generateEnhancedResponse(userInput, includeAlternatives);
            
            // Property: Enhanced response should always be valid
            expect(response).toBeDefined();
            expect(response.length).toBeGreaterThan(0);
            
            if (includeAlternatives) {
              // Property: Should include alternative options section
              expect(response.toLowerCase()).toMatch(/alternative|options/);
              
              // Property: Should have multiple suggestions (bullet points)
              const bulletCount = (response.match(/•/g) || []).length;
              expect(bulletCount).toBeGreaterThan(0);
            }
            
            // Property: Should contain base response content
            const baseResponse = LocalBusinessFallback.generateContextualResponse(userInput);
            expect(response).toContain(baseResponse.split('\n')[0]); // At least first line should match
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly identify business category queries', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Business category inputs
            fc.record({
              category: fc.constantFrom('restaurant', 'gym', 'coffee', 'shop', 'movie', 'service'),
              context: fc.string({ minLength: 0, maxLength: 50 })
            }).map(({ category, context }) => `${category} ${context}`.trim()),
            
            // Non-business inputs
            fc.oneof(
              fc.constantFrom('hello', 'weather', 'news', 'politics', 'sports scores'),
              fc.string().filter(s => 
                !s.toLowerCase().includes('restaurant') &&
                !s.toLowerCase().includes('gym') &&
                !s.toLowerCase().includes('coffee') &&
                !s.toLowerCase().includes('shop') &&
                !s.toLowerCase().includes('food') &&
                s.length > 0
              )
            )
          ),
          (input) => {
            const isBusinessQuery = LocalBusinessFallback.isBusinessCategoryQuery(input);
            
            // Property: Classification should be boolean
            expect(typeof isBusinessQuery).toBe('boolean');
            
            // Property: Should correctly identify business keywords
            const lowerInput = input.toLowerCase();
            const hasBusinessKeywords = 
              lowerInput.includes('restaurant') || lowerInput.includes('food') ||
              lowerInput.includes('gym') || lowerInput.includes('fitness') ||
              lowerInput.includes('coffee') || lowerInput.includes('cafe') ||
              lowerInput.includes('shop') || lowerInput.includes('store') ||
              lowerInput.includes('movie') || lowerInput.includes('cinema') ||
              lowerInput.includes('service') || lowerInput.includes('salon');
            
            if (hasBusinessKeywords) {
              expect(isBusinessQuery).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always return valid business categories', () => {
      fc.assert(
        fc.property(
          fc.constant(null), // No input needed for this test
          () => {
            const allCategories = LocalBusinessFallback.getAllCategories();
            
            // Property: Should return array of categories
            expect(Array.isArray(allCategories)).toBe(true);
            expect(allCategories.length).toBeGreaterThan(0);
            
            // Property: Each category should have required structure
            allCategories.forEach(category => {
              expect(category.name).toBeDefined();
              expect(typeof category.name).toBe('string');
              expect(category.name.length).toBeGreaterThan(0);
              
              expect(Array.isArray(category.keywords)).toBe(true);
              expect(category.keywords.length).toBeGreaterThan(0);
              
              expect(category.response).toBeDefined();
              expect(typeof category.response).toBe('string');
              expect(category.response.length).toBeGreaterThan(0);
            });
            
            // Property: Random category should be valid
            const randomCategory = LocalBusinessFallback.getRandomCategoryExample();
            expect(allCategories).toContain(randomCategory);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});