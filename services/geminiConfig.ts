// Gemini API Configuration with fallback models
import { ApiConfigValidator, ValidationResult } from './apiConfigValidator';

export interface ModelConfig {
  primary: string;
  fallbacks: string[];
  apiVersion: string;
}

export interface GeminiConfig {
  apiKey: string;
  models: {
    text: ModelConfig;
    liveAudio: ModelConfig;
  };
  fallbackEnabled: boolean;
  retryAttempts: number;
  validationResult?: ValidationResult;
}

export class ModelConfigManager {
  private static readonly TEXT_MODELS: ModelConfig = {
    primary: 'gemini-2.5-flash',
    fallbacks: ['gemini-2.5-flash-lite', 'gemini-2.0-flash'],
    apiVersion: 'v1beta'
  };

  private static readonly LIVE_AUDIO_MODELS: ModelConfig = {
    primary: 'gemini-2.5-flash-native-audio-preview-12-2025',
    fallbacks: ['gemini-2.5-flash-native-audio-preview-09-2025'],
    apiVersion: 'v1beta'
  };

  static getOptimalTextModel(): ModelConfig {
    return this.TEXT_MODELS;
  }

  static getOptimalLiveAudioModel(): ModelConfig {
    return this.LIVE_AUDIO_MODELS;
  }

  static getDefaultConfig(apiKey?: string): GeminiConfig {
    // If no API key provided, get it from available sources
    const { key: resolvedApiKey } = apiKey ? { key: apiKey } : ApiConfigValidator.getApiKey();
    
    // Validate configuration at startup
    const validationResult = ApiConfigValidator.validateStartupConfiguration();
    
    return {
      apiKey: resolvedApiKey || '',
      models: {
        text: this.getOptimalTextModel(),
        liveAudio: this.getOptimalLiveAudioModel()
      },
      fallbackEnabled: true,
      retryAttempts: 3,
      validationResult
    };
  }

  static validateModelAvailability(model: string): boolean {
    // Basic validation - check if model name follows expected pattern
    const validPatterns = [
      /^gemini-[2-3]\.\d+-flash$/,
      /^gemini-[2-3]\.\d+-flash-lite$/,
      /^gemini-[2-3]\.\d+-flash-native-audio-preview-\d{2}-\d{4}$/
    ];
    
    return validPatterns.some(pattern => pattern.test(model));
  }

  /**
   * Validates complete API configuration including key and models
   */
  static validateConfiguration(config?: GeminiConfig): ValidationResult {
    const configToValidate = config || this.getDefaultConfig();
    
    // First validate the API key
    const keyValidation = ApiConfigValidator.validateStartupConfiguration();
    if (!keyValidation.isValid) {
      return keyValidation;
    }
    
    // Then validate model configurations
    const textModel = configToValidate.models.text.primary;
    const audioModel = configToValidate.models.liveAudio.primary;
    
    if (!this.validateModelAvailability(textModel)) {
      return {
        isValid: false,
        errorMessage: `Invalid text model: ${textModel}`,
        suggestedActions: [
          'Use supported model names',
          'Check model availability',
          'Update model configuration'
        ]
      };
    }
    
    if (!this.validateModelAvailability(audioModel)) {
      return {
        isValid: false,
        errorMessage: `Invalid audio model: ${audioModel}`,
        suggestedActions: [
          'Use supported audio model names',
          'Check model availability',
          'Update audio model configuration'
        ]
      };
    }
    
    return {
      isValid: true,
      suggestedActions: ['Configuration is valid and ready to use']
    };
  }
}