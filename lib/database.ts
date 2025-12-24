import { supabase, Business, SearchCache } from './supabase'

export class DatabaseService {
  // Get businesses by category and city
  async getBusinesses(category?: string, city?: string): Promise<Business[]> {
    let query = supabase.from('businesses').select('*')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (city) {
      query = query.eq('city', city)
    }
    
    const { data, error } = await query.order('rating', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to fetch businesses: ${error.message}`)
    }
    
    return data || []
  }

  // Add a new business
  async addBusiness(business: Omit<Business, 'id' | 'created_at'>): Promise<Business> {
    const { data, error } = await supabase
      .from('businesses')
      .insert([business])
      .select()
      .single()
    
    if (error) {
      throw new Error(`Failed to add business: ${error.message}`)
    }
    
    return data
  }

  // Add multiple businesses (for AI-generated ones)
  async addBusinesses(businesses: Omit<Business, 'id' | 'created_at'>[]): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .insert(businesses)
      .select()
    
    if (error) {
      throw new Error(`Failed to add businesses: ${error.message}`)
    }
    
    return data || []
  }

  // Check if we have recent AI-generated businesses for a category/city
  async getSearchCache(category: string, city: string): Promise<SearchCache | null> {
    const { data, error } = await supabase
      .from('search_cache')
      .select('*')
      .eq('category', category)
      .eq('city', city)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to check search cache: ${error.message}`)
    }
    
    return data
  }

  // Update search cache after generating AI businesses
  async updateSearchCache(category: string, city: string): Promise<void> {
    const { error } = await supabase
      .from('search_cache')
      .upsert([{ category, city, last_populated: new Date().toISOString() }])
    
    if (error) {
      throw new Error(`Failed to update search cache: ${error.message}`)
    }
  }

  // Get businesses by location (for map view)
  async getBusinessesByLocation(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
  ): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
    
    if (error) {
      throw new Error(`Failed to fetch businesses by location: ${error.message}`)
    }
    
    return data || []
  }

  // Get featured businesses (highest rated)
  async getFeaturedBusinesses(limit: number = 6): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('rating', { ascending: false })
      .limit(limit)
    
    if (error) {
      throw new Error(`Failed to fetch featured businesses: ${error.message}`)
    }
    
    return data || []
  }

  // Search businesses by name or category
  async searchBusinesses(searchTerm: string): Promise<Business[]> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('rating', { ascending: false })
    
    if (error) {
      throw new Error(`Failed to search businesses: ${error.message}`)
    }
    
    return data || []
  }
}

// Export a singleton instance
export const db = new DatabaseService()