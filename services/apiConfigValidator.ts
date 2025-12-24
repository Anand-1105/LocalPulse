// API Configuration Validator for Gemini API
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  suggestedActions: string[];
  configurationInstructions?: string;
}

export interface ApiKeyValidationContext {
  apiKey: string | null;
  source: 'environment' | 'window' | 'default' | 'missing';
  keyFormat: 'valid' | 'invalid' | 'empty';
}

export class ApiConfigValidator {
  private static readonly VALID_API_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{35}$/;
  private static readonly MIN_KEY_LENGTH = 39;
  
  /**
   * Validates API key presence and format at application startup
   */
  static validateStartupConfiguration(): ValidationResult {
    const context = this.analyzeApiKeyContext();
    
    if (!context.apiKey) {
      return this.handleMissingApiKey(context);
    }
    
    if (context.keyFormat === 'invalid') {
      return this.handleInvalidApiKeyFormat(context);
    }
    
    return this.handleValidConfiguration(context);
  }
  
  /**
   * Validates API key format without making network calls
   */
  static validateApiKeyFormat(apiKey: string | null): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    // Check minimum length
    if (apiKey.length < this.MIN_KEY_LENGTH) {
      return false;
    }
    
    // Check pattern match
    return this.VALID_API_KEY_PATTERN.test(apiKey);
  }
  
  /**
   * Gets API key from various sources with priority order
   */
  static getApiKey(): { key: string | null; source: string } {
    // Priority order: environment variable, window object, default
    
    // 1. Check environment variables (Vite uses VITE_ prefix)
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (envKey) {
      return { key: envKey, source: 'environment' };
    }
    
    // 2. Check window object (for runtime configuration)
    const windowKey = (window as any).GEMINI_API_KEY;
    if (windowKey) {
      return { key: windowKey, source: 'window' };
    }
    
    // 3. Check for hardcoded default (development only)
    const defaultKey = 'AIzaSyDfiLnKlRGaYqmjnE0_0js20aic21nQLPg';
    if (defaultKey && this.validateApiKeyFormat(defaultKey)) {
      return { key: defaultKey, source: 'default' };
    }
    
    return { key: null, source: 'missing' };
  }
  
  /**
   * Provides configuration instructions based on environment
   */
  static getConfigurationInstructions(): string {
    const isProduction = import.meta.env?.PROD || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      return `Production Configuration:
1. Set VITE_GEMINI_API_KEY environment variable
2. Or set window.GEMINI_API_KEY in your application
3. Obtain API key from: https://ai.google.dev/gemini-api/docs/api-key
4. Ensure the key has proper permissions for Gemini API`;
    } else {
      return `Development Configuration:
1. Create/update .env file with: VITE_GEMINI_API_KEY=your_api_key_here
2. Or set window.GEMINI_API_KEY = "your_api_key_here" in browser console
3. Obtain API key from: https://ai.google.dev/gemini-api/docs/api-key
4. Restart development server after adding .env file`;
    }
  }
  
  private static analyzeApiKeyContext(): ApiKeyValidationContext {
    const { key, source } = this.getApiKey();
    
    let keyFormat: 'valid' | 'invalid' | 'empty' = 'empty';
    if (key) {
      keyFormat = this.validateApiKeyFormat(key) ? 'valid' : 'invalid';
    }
    
    return {
      apiKey: key,
      source: source as ApiKeyValidationContext['source'],
      keyFormat
    };
  }
  
  private static handleMissingApiKey(context: ApiKeyValidationContext): ValidationResult {
    return {
      isValid: false,
      errorMessage: '🔑 Gemini API Key Required',
      suggestedActions: [
        'Configure VITE_GEMINI_API_KEY environment variable',
        'Set window.GEMINI_API_KEY in browser',
        'Obtain API key from Google AI Studio',
        'Use Geographic Discovery map as alternative'
      ],
      configurationInstructions: this.getConfigurationInstructions()
    };
  }
  
  private static handleInvalidApiKeyFormat(context: ApiKeyValidationContext): ValidationResult {
    const keyLength = context.apiKey?.length || 0;
    const expectedLength = this.MIN_KEY_LENGTH;
    
    return {
      isValid: false,
      errorMessage: `🔧 Invalid API Key Format (Length: ${keyLength}, Expected: ${expectedLength}+)`,
      suggestedActions: [
        'Check API key format (should start with "AIza")',
        'Verify key was copied completely',
        'Generate new key if corrupted',
        'Use Geographic Discovery map as alternative'
      ],
      configurationInstructions: this.getConfigurationInstructions()
    };
  }
  
  private static handleValidConfiguration(context: ApiKeyValidationContext): ValidationResult {
    return {
      isValid: true,
      suggestedActions: [
        'API key format is valid',
        'Ready for Gemini API calls'
      ]
    };
  }
  
  /**
   * Creates user-friendly error messages for configuration issues
   */
  static createConfigurationErrorMessage(validationResult: ValidationResult): string {
    if (validationResult.isValid) {
      return '';
    }
    
    let message = `${validationResult.errorMessage}\n\n`;
    message += `The AI chat functionality requires a valid Gemini API key.\n\n`;
    
    if (validationResult.configurationInstructions) {
      message += `${validationResult.configurationInstructions}\n\n`;
    }
    
    message += `Meanwhile, you can:\n`;
    message += `• Use the Geographic Discovery map to find businesses\n`;
    message += `• Browse businesses by category\n`;
    message += `• View detailed business information\n`;
    message += `• Explore the map for local recommendations`;
    
    return message;
  }
}