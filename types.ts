
// Database types (matching Supabase schema)
export interface DatabaseBusiness {
  id: string;
  name: string;
  category: string;
  type: string;
  city: string;
  rating: number;
  latitude: number;
  longitude: number;
  ai_generated: boolean;
  created_at: string;
  updated_at?: string;
}

// UI Business type (for frontend components)
export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  featured: boolean;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    hours?: {
      [key: string]: string;
    };
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  lottieUrl: string;
  color: string;
}

export interface SearchCache {
  id: string;
  category: string;
  city: string;
  last_populated: string;
}
