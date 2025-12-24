import { Business, Category, DatabaseBusiness } from '../types';
import { CATEGORIES } from '../constants';
import { db } from '../lib/database';

const API_BASE = '/api';

// Always use Supabase now that we have local data
const USE_MOCK = false; 

// Convert database business to UI business format
const convertDatabaseBusiness = (dbBusiness: DatabaseBusiness): Business => {
  // Generate proper Unsplash URLs based on business category
  const getBusinessImages = (category: string, name: string) => {
    const categoryImageMap: { [key: string]: string[] } = {
      restaurant: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', // restaurant interior
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', // restaurant food
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800'  // restaurant dining
      ],
      cafe: [
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800', // cafe interior
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800', // coffee shop
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800'  // cafe atmosphere
      ],
      services: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', // office space
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800', // coworking
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800'  // modern office
      ],
      fitness: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', // gym equipment
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800', // fitness center
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800'  // gym interior
      ],
      shopping: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800', // bookstore
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', // books
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'  // library/books
      ]
    };

    // Get images for the category, fallback to restaurant if not found
    const images = categoryImageMap[category] || categoryImageMap.restaurant;
    
    // Use business name hash to consistently pick the same image for the same business
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const imageIndex = Math.abs(hash) % images.length;
    return {
      main: images[imageIndex],
      gallery: images
    };
  };

  const businessImages = getBusinessImages(dbBusiness.category, dbBusiness.name);

  return {
    id: dbBusiness.id,
    name: dbBusiness.name,
    category: dbBusiness.category,
    rating: dbBusiness.rating,
    reviews: Math.floor(Math.random() * 200) + 10, // Generate random review count
    image: businessImages.main,
    images: businessImages.gallery,
    description: `Experience the best ${dbBusiness.category} in ${dbBusiness.city}. Quality service and great atmosphere.`,
    featured: dbBusiness.rating >= 4.5,
    address: `${dbBusiness.city}, Near LPU Campus`,
    location: {
      lat: dbBusiness.latitude,
      lng: dbBusiness.longitude
    }
  };
};

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}; 

export const api = {
  getBusinesses: async (): Promise<Business[]> => {
    try {
      const dbBusinesses = await db.getBusinesses();
      return dbBusinesses.map(convertDatabaseBusiness);
    } catch (error) {
      console.error('Failed to fetch businesses from Supabase:', error);
      return []; // Return empty array instead of fallback
    }
  },

  getCategories: async (): Promise<Category[]> => {
    return CATEGORIES; // Categories remain static
  },

  getTopRated: async (userCoords?: { lat: number; lng: number }): Promise<Business[]> => {
    try {
      const dbBusinesses = await db.getBusinesses();
      let businesses = dbBusinesses.map(convertDatabaseBusiness);
      
      // Filter for high-rated businesses
      businesses = businesses.filter(b => b.rating >= 4.0);
      
      // If user coordinates are provided, sort by distance and filter nearby (within 50km)
      if (userCoords) {
        businesses = businesses
          .map(business => ({
            ...business,
            distance: calculateDistance(userCoords.lat, userCoords.lng, business.location.lat, business.location.lng)
          }))
          .filter(business => business.distance <= 50) // Only show businesses within 50km
          .sort((a, b) => {
            // First sort by rating (higher is better), then by distance (closer is better)
            if (Math.abs(a.rating - b.rating) > 0.2) {
              return b.rating - a.rating;
            }
            return a.distance - b.distance;
          })
          .slice(0, 10); // Limit to top 10
      } else {
        // If no coordinates, just sort by rating
        businesses = businesses
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 10);
      }
      
      return businesses;
    } catch (error) {
      console.error('Failed to fetch top rated businesses:', error);
      return []; // Return empty array instead of fallback
    }
  },

  getBusinessById: async (id: string): Promise<Business | null> => {
    try {
      console.log('getBusinessById called with ID:', id);
      const dbBusinesses = await db.getBusinesses();
      console.log('All businesses from DB:', dbBusinesses.map(b => ({ id: b.id, name: b.name })));
      const dbBusiness = dbBusinesses.find(b => b.id === id);
      console.log('Found business:', dbBusiness);
      
      if (dbBusiness) {
        const convertedBusiness = convertDatabaseBusiness(dbBusiness);
        console.log('Converted business:', convertedBusiness);
        return convertedBusiness;
      }
      
      console.warn(`Business with ID ${id} not found`);
      return null;
    } catch (error) {
      console.error('Failed to fetch business by ID:', error);
      return null;
    }
  }
};