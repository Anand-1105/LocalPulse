// Enhanced Contextual Response Service for LocalPulse AI
import { CATEGORIES, BUSINESSES } from '../constants';
import { Business, Category } from '../types';

export interface SystemInstructionConfig {
  baseInstruction: string;
  locationContext: string;
  businessCategories: string[];
  responseGuidelines: string[];
}

export class ContextualResponseService {
  
  /**
   * Generates enhanced system instructions for better local business guidance
   */
  static generateSystemInstruction(isVoiceMode: boolean = false): string {
    const config = this.getSystemInstructionConfig();
    const modeSpecific = isVoiceMode ? this.getVoiceModeInstructions() : this.getTextModeInstructions();
    
    return [
      config.baseInstruction,
      config.locationContext,
      this.formatBusinessCategories(config.businessCategories),
      this.formatResponseGuidelines(config.responseGuidelines),
      modeSpecific
    ].join('\n\n');
  }

  /**
   * Gets the core system instruction configuration
   */
  private static getSystemInstructionConfig(): SystemInstructionConfig {
    return {
      baseInstruction: "You are the LocalPulse Assistant, an expert local guide for Lovely Professional University (LPU) and the Phagwara area in Punjab, India. Your primary role is to help students, faculty, and visitors discover the best local businesses and navigate the area effectively.",
      
      locationContext: `**Location Context:**
You specialize in the LPU campus area and surrounding Phagwara region. This includes:
- On-campus facilities and nearby student-friendly businesses
- Local restaurants popular with the university community  
- Fitness centers and recreational facilities accessible to students
- Coffee shops and study-friendly cafes
- Shopping areas and essential services
- Transportation options and connectivity`,

      businessCategories: [
        "🍽️ **Restaurants** - Student-friendly dining, local cuisine, quick meals, group dining options",
        "💪 **Fitness** - Gyms, sports facilities, yoga studios, outdoor activities", 
        "☕ **Coffee** - Study-friendly cafes, coffee shops, tea houses, quiet work spaces",
        "🛍️ **Shopping** - Local markets, essential stores, student supplies, fashion outlets",
        "🍹 **Nightlife** - Safe entertainment venues, student hangouts, social spaces",
        "🔧 **Services** - Essential services, repairs, healthcare, academic support"
      ],

      responseGuidelines: [
        "Always provide specific, actionable recommendations with clear directions",
        "Mention the Geographic Discovery map feature for visual exploration", 
        "Include practical details like operating hours, price ranges, and accessibility",
        "Consider student budgets and preferences in recommendations",
        "Highlight businesses that are walking distance or easily accessible from LPU",
        "Provide context about local culture and customs when relevant",
        "Suggest group-friendly options for students traveling together",
        "Include safety and transportation considerations for evening activities"
      ]
    };
  }

  /**
   * Gets voice mode specific instructions
   */
  private static getVoiceModeInstructions(): string {
    return `**Voice Interaction Guidelines:**
- Keep responses conversational and concise (30-45 seconds max)
- Use natural, friendly language as if talking to a friend
- Provide 2-3 top recommendations rather than exhaustive lists
- Include clear next steps or follow-up suggestions
- Mention specific business names when possible
- Use directional language ("head towards", "just past", "near the")`;
  }

  /**
   * Gets text mode specific instructions  
   */
  private static getTextModeInstructions(): string {
    return `**Text Interaction Guidelines:**
- Provide detailed, well-structured responses with clear sections
- Include specific business names, addresses, and key details
- Use bullet points and formatting for easy scanning
- Offer multiple options with brief descriptions
- Include relevant tips and local insights
- Always end with a suggestion to use the Geographic Discovery map`;
  }

  /**
   * Formats business categories for system instruction
   */
  private static formatBusinessCategories(categories: string[]): string {
    return `**Available Business Categories:**\n${categories.join('\n')}`;
  }

  /**
   * Formats response guidelines for system instruction
   */
  private static formatResponseGuidelines(guidelines: string[]): string {
    return `**Response Guidelines:**\n${guidelines.map(g => `• ${g}`).join('\n')}`;
  }

  /**
   * Generates context-aware responses based on user input and available businesses
   */
  static generateContextualResponse(userInput: string, availableBusinesses: Business[] = BUSINESSES): string {
    const lowerInput = userInput.toLowerCase();
    const matchedCategory = this.identifyBusinessCategory(lowerInput);
    
    if (matchedCategory) {
      return this.generateCategorySpecificResponse(matchedCategory, userInput, availableBusinesses);
    }
    
    // Check for location-specific queries
    if (this.isLocationQuery(lowerInput)) {
      return this.generateLocationResponse(userInput);
    }
    
    // Check for general help queries
    if (this.isHelpQuery(lowerInput)) {
      return this.generateHelpResponse();
    }
    
    return this.generateDefaultResponse(userInput);
  }

  /**
   * Identifies the business category from user input
   */
  private static identifyBusinessCategory(input: string): Category | null {
    const categoryKeywords = {
      'Restaurants': ['restaurant', 'food', 'eat', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'cuisine', 'hungry', 'snack'],
      'Fitness': ['gym', 'fitness', 'workout', 'exercise', 'sports', 'training', 'health', 'yoga', 'pilates', 'run'],
      'Coffee': ['coffee', 'cafe', 'espresso', 'latte', 'cappuccino', 'tea', 'study', 'work', 'wifi'],
      'Shopping': ['shop', 'store', 'buy', 'purchase', 'mall', 'market', 'clothes', 'supplies'],
      'Nightlife': ['night', 'evening', 'party', 'drinks', 'entertainment', 'fun', 'hangout'],
      'Services': ['service', 'repair', 'fix', 'salon', 'medical', 'bank', 'atm', 'pharmacy']
    };

    for (const [categoryName, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return CATEGORIES.find(cat => cat.name === categoryName) || null;
      }
    }
    
    return null;
  }
  /**
   * Generates category-specific response with relevant businesses
   */
  private static generateCategorySpecificResponse(category: Category, userInput: string, businesses: Business[]): string {
    const categoryBusinesses = businesses.filter(b => b.category === category.name);
    const topRated = categoryBusinesses.sort((a, b) => b.rating - a.rating).slice(0, 3);
    
    let response = `Great question about ${category.name.toLowerCase()} near LPU! Here are some excellent options:\n\n`;
    
    if (topRated.length > 0) {
      response += `**Top Recommendations:**\n`;
      topRated.forEach((business, index) => {
        response += `${index + 1}. **${business.name}** (${business.rating}⭐)\n`;
        response += `   ${business.description}\n`;
        response += `   📍 ${business.address}\n\n`;
      });
    }
    
    response += this.getCategorySpecificTips(category.name);
    response += `\n\n💡 **Pro Tip:** Use the Geographic Discovery map to see all ${category.name.toLowerCase()} locations with exact directions and real-time information!`;
    
    return response;
  }

  /**
   * Gets category-specific tips and insights
   */
  private static getCategorySpecificTips(categoryName: string): string {
    const tips = {
      'Restaurants': '🍽️ **Student Tips:** Look for places offering student discounts or group deals. Many restaurants near LPU offer special lunch combos perfect for sharing!',
      'Fitness': '💪 **Fitness Tips:** Many gyms offer student memberships. Consider group classes for motivation and social connections with fellow students.',
      'Coffee': '☕ **Study Tips:** Look for cafes with reliable WiFi and quiet corners. Many offer student-friendly pricing and extended hours during exam periods.',
      'Shopping': '🛍️ **Shopping Tips:** Local markets often have better prices than malls. Don\'t forget to bargain respectfully - it\'s part of the local culture!',
      'Nightlife': '🍹 **Safety Tips:** Always travel in groups and use reliable transportation. Many venues offer student nights with special pricing.',
      'Services': '🔧 **Service Tips:** Ask fellow students for recommendations. Many service providers near universities understand student needs and budgets.'
    };
    
    return tips[categoryName] || '';
  }

  /**
   * Checks if the query is location-specific
   */
  private static isLocationQuery(input: string): boolean {
    const locationKeywords = ['lpu', 'lovely professional university', 'phagwara', 'punjab', 'campus', 'near', 'around', 'local', 'nearby', 'direction', 'how to get'];
    return locationKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Checks if the query is asking for help
   */
  private static isHelpQuery(input: string): boolean {
    const helpKeywords = ['help', 'how', 'what', 'guide', 'tutorial', 'instructions', 'use', 'work', 'explain'];
    return helpKeywords.some(keyword => input.includes(keyword));
  }

  /**
   * Generates location-specific response
   */
  private static generateLocationResponse(userInput: string): string {
    return `🎓 **Welcome to the LPU Area Guide!**

I'm here to help you navigate Lovely Professional University and the surrounding Phagwara area. Here's what you can discover:

**On-Campus & Nearby:**
• Student-friendly restaurants with affordable meals
• Fitness centers and sports facilities  
• Coffee shops perfect for studying and group work
• Essential services and shopping areas
• Safe entertainment and social venues

**Getting Around:**
• Most popular spots are within walking distance or a short auto-rickshaw ride
• The Geographic Discovery map shows exact locations and directions
• Local transportation options include buses, autos, and ride-sharing

**Local Culture:**
• Phagwara offers authentic Punjabi cuisine and culture
• Many businesses understand student needs and offer special pricing
• The community is welcoming to university students and visitors

Use the Geographic Discovery map to explore specific areas and get real-time directions to any location!`;
  }

  /**
   * Generates help response
   */
  private static generateHelpResponse(): string {
    return `🤖 **LocalPulse AI - Your LPU Area Guide**

I'm here to help you discover the best local businesses around Lovely Professional University! Here's how I can assist:

**What I Can Help With:**
• 🍽️ Restaurant recommendations and dining options
• 💪 Fitness centers and recreational activities  
• ☕ Coffee shops and study-friendly spaces
• 🛍️ Shopping areas and essential services
• 🍹 Safe entertainment and social venues
• 📍 Directions and local area navigation

**How to Use:**
• Ask specific questions like "Where can I find good coffee near LPU?"
• Request category recommendations: "Show me fitness centers"
• Get local insights: "What's popular with students?"
• Find directions: "How do I get to the nearest market?"

**Pro Features:**
• 🗺️ **Geographic Discovery Map** - Visual exploration with exact locations
• 🎯 **Category Filters** - Browse by business type
• ⭐ **Ratings & Reviews** - See what other students recommend
• 📱 **Real-time Info** - Current hours, contact details, and directions

Try asking about any type of business or service you're looking for!`;
  }

  /**
   * Generates default response for unmatched queries
   */
  private static generateDefaultResponse(userInput: string): string {
    return `I'd love to help you explore the LPU area! While I didn't catch exactly what you're looking for, here are some popular options:

**Quick Suggestions:**
• 🍽️ **Hungry?** Try asking about restaurants or specific cuisines
• ☕ **Need to study?** Ask about coffee shops with WiFi
• 💪 **Want to stay active?** Look for fitness centers and sports facilities  
• 🛍️ **Need supplies?** Find shopping areas and essential services

**Better Results:**
Try being more specific, like:
• "Where can I find good Indian food near LPU?"
• "Show me gyms with student discounts"
• "Coffee shops open late for studying"

🗺️ **Don't forget:** Use the Geographic Discovery map to visually explore all available businesses with exact locations and real-time information!

What specific type of business or service are you looking for?`;
  }

  /**
   * Gets enhanced system instruction with business data context
   */
  static getEnhancedSystemInstruction(includeBusinessData: boolean = false): string {
    let instruction = this.generateSystemInstruction(false);
    
    if (includeBusinessData) {
      const businessContext = this.generateBusinessDataContext();
      instruction += `\n\n${businessContext}`;
    }
    
    return instruction;
  }

  /**
   * Generates business data context for system instruction
   */
  private static generateBusinessDataContext(): string {
    const categoryStats = CATEGORIES.map(cat => {
      const count = BUSINESSES.filter(b => b.category === cat.name).length;
      const avgRating = BUSINESSES
        .filter(b => b.category === cat.name)
        .reduce((sum, b) => sum + b.rating, 0) / count || 0;
      
      return `• ${cat.icon} ${cat.name}: ${count} businesses (avg ${avgRating.toFixed(1)}⭐)`;
    }).join('\n');

    return `**Current Business Database:**
${categoryStats}

**Featured Businesses:** ${BUSINESSES.filter(b => b.featured).length} premium locations
**Total Reviews:** ${BUSINESSES.reduce((sum, b) => sum + b.reviews, 0).toLocaleString()} community reviews

Use this data to provide informed recommendations and accurate business counts.`;
  }
}