// Fallback Response Generator for when Gemini API is unavailable
export interface BusinessCategory {
  name: string;
  keywords: string[];
  response: string;
}

export class LocalBusinessFallback {
  private static readonly BUSINESS_CATEGORIES: BusinessCategory[] = [
    {
      name: 'restaurants',
      keywords: ['restaurant', 'food', 'eat', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'cuisine', 'menu'],
      response: "Try using the 'Geographic Discovery' section to find restaurants. You can search by category and get AI-powered recommendations with real locations on the map. Each restaurant shows detailed information including ratings, hours, and exact location."
    },
    {
      name: 'fitness',
      keywords: ['gym', 'fitness', 'workout', 'exercise', 'sports', 'training', 'health', 'yoga', 'pilates', 'crossfit'],
      response: "Check out fitness centers using the map discovery feature. Select 'Fitness' category to see gyms and sports facilities near you. You'll find detailed information about equipment, classes, and membership options."
    },
    {
      name: 'coffee',
      keywords: ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'tea', 'barista', 'brew', 'roast', 'beans'],
      response: "Discover coffee shops by selecting the 'Coffee' category in the Geographic Discovery section. Each place shows on the map with its exact location, hours, and specialty drinks. Perfect for finding your next favorite spot!"
    },
    {
      name: 'shopping',
      keywords: ['shop', 'store', 'buy', 'purchase', 'mall', 'retail', 'market', 'boutique', 'outlet', 'shopping'],
      response: "Find shopping destinations using the 'Shopping' category. The map will show you all nearby stores with their locations, hours, and specialties. From local boutiques to major retailers, discover it all!"
    },
    {
      name: 'entertainment',
      keywords: ['movie', 'cinema', 'theater', 'entertainment', 'fun', 'activity', 'event', 'show', 'concert', 'performance'],
      response: "Explore entertainment venues through the Geographic Discovery map. Find theaters, cinemas, and entertainment centers with showtimes, events, and booking information all in one place."
    },
    {
      name: 'services',
      keywords: ['service', 'repair', 'fix', 'maintenance', 'salon', 'spa', 'beauty', 'barber', 'clinic', 'medical'],
      response: "Locate service providers using the map feature. Whether you need personal care, repairs, or professional services, the Geographic Discovery section shows verified businesses with contact details and reviews."
    },
    {
      name: 'education',
      keywords: ['school', 'education', 'learning', 'course', 'class', 'training', 'university', 'college', 'study', 'tutor'],
      response: "Find educational institutions and training centers through the map discovery. Locate schools, colleges, training centers, and tutoring services with detailed information about programs and contact details."
    },
    {
      name: 'transportation',
      keywords: ['transport', 'bus', 'taxi', 'uber', 'travel', 'station', 'airport', 'parking', 'fuel', 'gas'],
      response: "Discover transportation options and related services using the Geographic Discovery map. Find bus stations, parking areas, fuel stations, and travel services with real-time information and directions."
    }
  ];

  private static readonly HELP_KEYWORDS = ['help', 'how', 'what', 'guide', 'tutorial', 'instructions', 'use', 'work'];
  
  private static readonly LOCATION_KEYWORDS = ['lpu', 'lovely professional university', 'phagwara', 'punjab', 'near', 'around', 'local', 'nearby'];

  /**
   * Generates contextual fallback responses based on user input
   */
  static generateContextualResponse(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // Check for help requests
    if (this.containsAnyKeyword(lowerInput, this.HELP_KEYWORDS)) {
      return this.getHelpResponse();
    }
    
    // Check for location-specific queries
    if (this.containsAnyKeyword(lowerInput, this.LOCATION_KEYWORDS)) {
      return this.getLocationResponse();
    }
    
    // Check for business category matches
    const matchedCategory = this.categorizeUserIntent(lowerInput);
    if (matchedCategory) {
      return this.getBusinessTypeResponse(matchedCategory);
    }
    
    // Default response for unmatched queries
    return this.getDefaultResponse();
  }

  /**
   * Categorizes user intent based on keywords
   */
  private static categorizeUserIntent(input: string): string | null {
    for (const category of this.BUSINESS_CATEGORIES) {
      if (this.containsAnyKeyword(input, category.keywords)) {
        return category.name;
      }
    }
    return null;
  }

  /**
   * Gets business category-specific response
   */
  private static getBusinessTypeResponse(category: string): string {
    const categoryData = this.BUSINESS_CATEGORIES.find(c => c.name === category);
    if (!categoryData) {
      return this.getDefaultResponse();
    }
    
    return `I'm here to help you discover local businesses near Lovely Professional University! ${categoryData.response}`;
  }

  /**
   * Gets help response with usage instructions
   */
  private static getHelpResponse(): string {
    return `I'm here to help you discover local businesses near Lovely Professional University! Here's how to use LocalPulse:

• **Geographic Discovery**: Use the map to find businesses by category
• **Category Search**: Select from Restaurants, Fitness, Coffee, Shopping, and more
• **Business Details**: Click on map markers to see detailed business information
• **Real Locations**: All businesses show exact locations with directions

Try asking about restaurants, fitness centers, coffee shops, or shopping areas. The Geographic Discovery map has everything you need to explore your local area!`;
  }

  /**
   * Gets location-specific response
   */
  private static getLocationResponse(): string {
    return `I'm your local guide for the Lovely Professional University area and Phagwara, Punjab! 

The Geographic Discovery map shows businesses specifically around LPU and the surrounding area. You can:

• Find restaurants popular with students and faculty
• Locate fitness centers and sports facilities
• Discover coffee shops perfect for studying
• Explore shopping areas and local markets
• Get directions to any business location

Use the category filters to find exactly what you're looking for in your local area!`;
  }

  /**
   * Gets default response for unmatched queries
   */
  private static getDefaultResponse(): string {
    return `I'm here to help you discover local businesses near Lovely Professional University! 

You can explore businesses by category using the Geographic Discovery map. Try asking about:
• **Restaurants** - Find great places to eat
• **Fitness** - Locate gyms and sports facilities  
• **Coffee** - Discover coffee shops and cafes
• **Shopping** - Find stores and markets
• **Entertainment** - Explore fun activities
• **Services** - Locate professional services

For full AI assistance, please configure a Gemini API key. In the meantime, the Geographic Discovery map has everything you need!`;
  }

  /**
   * Checks if input contains any of the specified keywords
   */
  private static containsAnyKeyword(input: string, keywords: string[]): boolean {
    return keywords.some(keyword => input.includes(keyword));
  }

  /**
   * Gets a random business category for variety in responses
   */
  static getRandomCategoryExample(): BusinessCategory {
    const randomIndex = Math.floor(Math.random() * this.BUSINESS_CATEGORIES.length);
    return this.BUSINESS_CATEGORIES[randomIndex];
  }

  /**
   * Gets all available business categories
   */
  static getAllCategories(): BusinessCategory[] {
    return [...this.BUSINESS_CATEGORIES];
  }

  /**
   * Checks if a query is about a specific business category
   */
  static isBusinessCategoryQuery(input: string): boolean {
    const lowerInput = input.toLowerCase();
    return this.BUSINESS_CATEGORIES.some(category =>
      this.containsAnyKeyword(lowerInput, category.keywords)
    );
  }

  /**
   * Gets enhanced response with multiple suggestions
   */
  static generateEnhancedResponse(userInput: string, includeAlternatives: boolean = true): string {
    const baseResponse = this.generateContextualResponse(userInput);
    
    if (!includeAlternatives) {
      return baseResponse;
    }
    
    const alternatives = [
      "\n\n**Alternative Options:**",
      "• Browse all categories in Geographic Discovery",
      "• Use the map to explore nearby areas", 
      "• Click on any business marker for detailed info",
      "• Save favorite locations for quick access"
    ].join('\n');
    
    return baseResponse + alternatives;
  }
}