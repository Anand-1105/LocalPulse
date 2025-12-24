// Enhanced Error Handler for Gemini API
export interface ErrorResponse {
  userMessage: string;
  technicalDetails?: string;
  suggestedActions: string[];
  fallbackAvailable: boolean;
  retryable: boolean;
}

export interface ErrorContext {
  errorType: 'quota' | 'model_not_found' | 'network' | 'auth' | 'unknown';
  originalError: any;
  userInput: string;
  timestamp: Date;
  retryable: boolean;
}

export class GeminiErrorHandler {
  /**
   * Handles API errors and provides contextual error responses
   */
  static handleApiError(error: any, userInput: string = ''): ErrorResponse {
    const context = this.classifyError(error, userInput);
    
    switch (context.errorType) {
      case 'quota':
        return this.handleQuotaError(error, context);
      
      case 'model_not_found':
        return this.handleModelNotFoundError(error, context);
      
      case 'auth':
        return this.handleAuthError(error, context);
      
      case 'network':
        return this.handleNetworkError(error, context);
      
      default:
        return this.handleUnknownError(error, context);
    }
  }

  /**
   * Determines if fallback responses should be used
   */
  static shouldUseFallback(error: any): boolean {
    const context = this.classifyError(error);
    
    // Use fallback for non-retryable errors or when API is completely unavailable
    return !context.retryable || 
           context.errorType === 'quota' || 
           context.errorType === 'auth' ||
           context.errorType === 'model_not_found';
  }

  /**
   * Classifies errors into specific types for targeted handling
   */
  private static classifyError(error: any, userInput: string = ''): ErrorContext {
    const timestamp = new Date();
    
    // Check for quota/rate limit errors
    if (this.isQuotaError(error)) {
      return {
        errorType: 'quota',
        originalError: error,
        userInput,
        timestamp,
        retryable: true
      };
    }
    
    // Check for model not found errors
    if (this.isModelNotFoundError(error)) {
      return {
        errorType: 'model_not_found',
        originalError: error,
        userInput,
        timestamp,
        retryable: false
      };
    }
    
    // Check for authentication errors
    if (this.isAuthError(error)) {
      return {
        errorType: 'auth',
        originalError: error,
        userInput,
        timestamp,
        retryable: false
      };
    }
    
    // Check for network errors
    if (this.isNetworkError(error)) {
      return {
        errorType: 'network',
        originalError: error,
        userInput,
        timestamp,
        retryable: true
      };
    }
    
    // Default to unknown error
    return {
      errorType: 'unknown',
      originalError: error,
      userInput,
      timestamp,
      retryable: true
    };
  }

  private static handleQuotaError(error: any, context: ErrorContext): ErrorResponse {
    const retryAfter = this.extractRetryAfter(error) || '60 seconds';
    
    return {
      userMessage: `⚠️ API Quota Exceeded\n\nI've reached my usage limit for today. Please try again in ${retryAfter}.\n\nIn the meantime, you can:\n• Use the Geographic Discovery map to find businesses\n• Search by category (Restaurants, Fitness, Coffee, etc.)\n• Click on map markers to see business details`,
      technicalDetails: `Quota exceeded at ${context.timestamp.toISOString()}`,
      suggestedActions: [
        'Wait for quota reset',
        'Use Geographic Discovery map',
        'Try again later',
        'Check usage at https://ai.dev/usage'
      ],
      fallbackAvailable: true,
      retryable: true
    };
  }

  private static handleModelNotFoundError(error: any, context: ErrorContext): ErrorResponse {
    return {
      userMessage: `🔧 Service Update in Progress\n\nThe AI service is being updated with new models. This should be resolved automatically.\n\nYou can still:\n• Use the Geographic Discovery map\n• Browse businesses by category\n• View detailed business information`,
      technicalDetails: `Model not found: ${error?.message || 'Unknown model error'}`,
      suggestedActions: [
        'Use Geographic Discovery map',
        'Try again in a few minutes',
        'Contact support if issue persists'
      ],
      fallbackAvailable: true,
      retryable: false
    };
  }

  private static handleAuthError(error: any, context: ErrorContext): ErrorResponse {
    return {
      userMessage: `🔑 Configuration Issue\n\nThe AI service needs to be configured with a valid API key.\n\nFor now, you can:\n• Use the Geographic Discovery map to find businesses\n• Browse all available categories\n• View business details and locations`,
      technicalDetails: `Authentication failed: ${error?.message || 'Invalid API key'}`,
      suggestedActions: [
        'Configure valid API key',
        'Use Geographic Discovery map',
        'Contact administrator'
      ],
      fallbackAvailable: true,
      retryable: false
    };
  }

  private static handleNetworkError(error: any, context: ErrorContext): ErrorResponse {
    return {
      userMessage: `🌐 Connection Issue\n\nI'm having trouble connecting to the AI service. Please check your internet connection.\n\nYou can still:\n• Use the Geographic Discovery map\n• Browse businesses offline\n• View cached business information`,
      technicalDetails: `Network error: ${error?.message || 'Connection failed'}`,
      suggestedActions: [
        'Check internet connection',
        'Try again in a moment',
        'Use offline features'
      ],
      fallbackAvailable: true,
      retryable: true
    };
  }

  private static handleUnknownError(error: any, context: ErrorContext): ErrorResponse {
    return {
      userMessage: `⚠️ Temporary Service Issue\n\nI'm experiencing a temporary issue. Please try again in a moment.\n\nMeanwhile, you can:\n• Use the Geographic Discovery map\n• Browse businesses by category\n• View business details`,
      technicalDetails: `Unknown error: ${error?.message || 'Unclassified error'}`,
      suggestedActions: [
        'Try again in a moment',
        'Use Geographic Discovery map',
        'Contact support if issue persists'
      ],
      fallbackAvailable: true,
      retryable: true
    };
  }

  // Error detection helper methods
  private static isQuotaError(error: any): boolean {
    return error?.error?.code === 429 ||
           error?.status === 429 ||
           error?.message?.toLowerCase().includes('quota') ||
           error?.message?.toLowerCase().includes('rate limit') ||
           error?.message?.toLowerCase().includes('429');
  }

  private static isModelNotFoundError(error: any): boolean {
    return error?.error?.code === 404 ||
           error?.status === 404 ||
           error?.message?.toLowerCase().includes('model not found') ||
           error?.message?.toLowerCase().includes('404') ||
           error?.message?.toLowerCase().includes('not found');
  }

  private static isAuthError(error: any): boolean {
    return error?.error?.code === 401 ||
           error?.error?.code === 403 ||
           error?.status === 401 ||
           error?.status === 403 ||
           error?.message?.toLowerCase().includes('unauthorized') ||
           error?.message?.toLowerCase().includes('forbidden') ||
           error?.message?.toLowerCase().includes('api key') ||
           error?.message?.toLowerCase().includes('authentication');
  }

  private static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' ||
           error?.message?.toLowerCase().includes('network') ||
           error?.message?.toLowerCase().includes('connection') ||
           error?.message?.toLowerCase().includes('timeout') ||
           error?.name === 'NetworkError' ||
           !navigator.onLine;
  }

  private static extractRetryAfter(error: any): string | null {
    // Try to extract retry-after from error details
    const retryInfo = error?.error?.details?.find((d: any) => 
      d['@type']?.includes('RetryInfo')
    );
    
    if (retryInfo?.retryDelay) {
      return retryInfo.retryDelay;
    }
    
    // Check headers if available
    if (error?.headers?.['retry-after']) {
      const seconds = parseInt(error.headers['retry-after']);
      return isNaN(seconds) ? null : `${seconds} seconds`;
    }
    
    return null;
  }
}