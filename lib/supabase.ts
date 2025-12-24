import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Business {
  id: string
  name: string
  category: string
  type: string
  city: string
  rating: number
  latitude: number
  longitude: number
  ai_generated: boolean
  created_at: string
}

export interface SearchCache {
  id: string
  category: string
  city: string
  last_populated: string
}