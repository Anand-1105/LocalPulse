// Response Processor for handling complete request-response cycle
import { ContextualResponseService } from './contextualResponseService';
import { GeminiErrorHandler } from './geminiErrorHandler';

export interface ProcessedResponse {
  text: string;
  sources: any[];
  metadata: {
    model: string;
    timestamp: Date;
    processingTime?: number;
    isFromFallback: boolean;
  };
}

export interface RequestContext {
  userInput: string;
  timestamp: Date;
  sessionId?: string;
}

export class ResponseProcessor {
  /**
   * Processes successful API responses with proper formatting and validation
   */
  static processSuccessfulResponse(
    response: any, 
    model: string, 
    context: RequestContext,
    startTime?: number
  ): ProcessedResponse {
    const processingTime = startTime ? Date.now() - startTime : undefined;
    
    // Extract and validate response text
    let responseText = response.text || response.content || '';
    if (!responseText || responseText.trim() === '') {
      responseText = "I couldn't generate a response for that. Please try rephrasing your question.";
    }
    
    // Format response text for better display
    const formattedText = this.formatResponseText(responseText);
    
    // Extract and validate sources
    const sources = this.extractAndValidateSources(response);
    
    // Create metadata
    const metadata = {
      model,
      timestamp: new Date(),
      processingTime,
      isFromFallback: false
    };
    
    return {
      text: formattedText,
      sources,
      metadata
    };
  }

  /**
   * Processes error responses with fallback generation
   */
  static processErrorResponse(
    error: any, 
    context: RequestContext,
    startTime?: number
  ): ProcessedResponse {
    const processingTime = startTime ? Date.now() - startTime : undefined;
    
    // Use enhanced error handler
    const errorResponse = GeminiErrorHandler.handleApiError(error, context.userInput);
    
    let fallbackText: string;
    
    if (GeminiErrorHandler.shouldUseFallback(error)) {
      // Generate contextual fallback response
      fallbackText = ContextualResponseService.generateContextualResponse(context.userInput);
    } else {
      // Use error message directly
      fallbackText = errorResponse.userMessage;
    }
    
    const metadata = {
      model: 'fallback',
      timestamp: new Date(),
      processingTime,
      isFromFallback: true
    };
    
    return {
      text: fallbackText,
      sources: [],
      metadata
    };
  }

  /**
   * Formats response text for better display in the UI
   */
  private static formatResponseText(text: string): string {
    // Trim whitespace
    let formatted = text.trim();
    
    // Ensure proper line breaks for better readability
    formatted = formatted.replace(/\n\s*\n/g, '\n\n'); // Normalize multiple line breaks
    
    // Handle bullet points and lists
    formatted = formatted.replace(/^\s*[•·]\s*/gm, '• '); // Normalize bullet points
    formatted = formatted.replace(/^\s*-\s*/gm, '• '); // Convert dashes to bullets
    
    // Handle numbered lists
    formatted = formatted.replace(/^\s*(\d+)\.\s*/gm, '$1. '); // Normalize numbered lists
    
    // Ensure proper spacing around headers (lines that end with :)
    formatted = formatted.replace(/^(.+:)\s*$/gm, '$1\n'); // Add line break after headers
    
    return formatted;
  }

  /**
   * Extracts and validates sources from API response
   */
  private static extractAndValidateSources(response: any): any[] {
    let sources: any[] = [];
    
    // Try different possible source locations in the response
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks;
    } else if (response.sources) {
      sources = response.sources;
    } else if (response.groundingMetadata?.groundingChunks) {
      sources = response.groundingMetadata.groundingChunks;
    }
    
    // Validate and filter sources
    return sources.filter(source => {
      // Ensure source has valid URI
      const hasValidUri = source?.web?.uri || source?.maps?.uri;
      
      // Ensure source has title or can be displayed
      const hasTitle = source?.web?.title || source?.maps?.title || source?.title;
      
      return hasValidUri && hasTitle;
    }).map(source => ({
      // Normalize source structure
      web: source.web || null,
      maps: source.maps || null,
      title: source.web?.title || source.maps?.title || source.title || 'Source',
      uri: source.web?.uri || source.maps?.uri || source.uri
    }));
  }

  /**
   * Validates response completeness according to requirements
   */
  static validateResponseCompleteness(response: ProcessedResponse): {
    isComplete: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check if response has meaningful content
    if (!response.text || response.text.trim().length < 10) {
      issues.push('Response text is too short or empty');
    }
    
    // Check if response is just an error message
    if (response.text.includes('error') || response.text.includes('failed')) {
      issues.push('Response contains error indicators');
    }
    
    // Check metadata completeness
    if (!response.metadata.model) {
      issues.push('Missing model information');
    }
    
    if (!response.metadata.timestamp) {
      issues.push('Missing timestamp');
    }
    
    return {
      isComplete: issues.length === 0,
      issues
    };
  }

  /**
   * Creates a request context for tracking
   */
  static createRequestContext(userInput: string, sessionId?: string): RequestContext {
    return {
      userInput: userInput.trim(),
      timestamp: new Date(),
      sessionId
    };
  }

  /**
   * Logs response metrics for monitoring
   */
  static logResponseMetrics(response: ProcessedResponse, context: RequestContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Response Metrics:', {
        model: response.metadata.model,
        processingTime: response.metadata.processingTime,
        responseLength: response.text.length,
        sourcesCount: response.sources.length,
        isFromFallback: response.metadata.isFromFallback,
        userInputLength: context.userInput.length,
        timestamp: response.metadata.timestamp.toISOString()
      });
    }
  }

  /**
   * Formats response for display with enhanced UI elements
   */
  static formatForDisplay(response: ProcessedResponse): {
    displayText: string;
    displaySources: any[];
    statusIndicator?: string;
  } {
    let statusIndicator: string | undefined;
    
    if (response.metadata.isFromFallback) {
      statusIndicator = '🔄 Fallback Response';
    } else if (response.metadata.processingTime && response.metadata.processingTime > 5000) {
      statusIndicator = '⏱️ Slow Response';
    }
    
    return {
      displayText: response.text,
      displaySources: response.sources,
      statusIndicator
    };
  }
}