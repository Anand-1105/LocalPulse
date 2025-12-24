import React, { useEffect, useState, useRef } from 'react';
import { BUSINESSES } from '../constants';
import SectionHeader from './SectionHeader';
import { GoogleGenAI } from "@google/genai";
import { Business } from '../types';

declare const L: any;

interface AIRecommendation {
  text: string;
  sources: { title: string; uri: string }[];
  places?: PlaceData[];
}

interface PlaceData {
  name: string;
  coordinates: [number, number]; // [lng, lat]
  address: string;
  category: string;
  placeId?: string;
}

interface MapSectionProps {
  onSelectBusiness: (id: string) => void;
  onSelectBusinessDirect?: (business: Business) => void;
}

// Function to get images from Unsplash based on business name and category
async function getBusinessImages(businessName: string, category: string): Promise<string[]> {
  // Fallback to category-based Unsplash images (using direct Unsplash URLs)
  const fallbackImages: { [key: string]: string[] } = {
    restaurants: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'
    ],
    fitness: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
    ],
    coffee: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800'
    ],
    shopping: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
      'https://images.unsplash.com/photo-1523381235212-d75f807bb21e?w=800'
    ],
    services: [
      'https://images.unsplash.com/photo-1530046339160-ce3e5b087ea2?w=800',
      'https://images.unsplash.com/photo-1486006396193-471a2abc881e?w=800',
      'https://images.unsplash.com/photo-1517232149123-0c15e4474c60?w=800'
    ]
  };
  
  // Optional: If you want to use Unsplash API for real-time images, uncomment below
  // You'll need to get a free API key from https://unsplash.com/developers
  /*
  const categoryKeywords: { [key: string]: string } = {
    restaurants: 'restaurant food dining',
    fitness: 'gym fitness workout',
    coffee: 'coffee cafe coffee shop',
    shopping: 'shopping store retail',
    services: 'business service office'
  };
  
  const keyword = categoryKeywords[category] || 'business';
  const query = `${businessName} ${keyword}`;
  const unsplashAccessKey = 'YOUR_UNSPLASH_ACCESS_KEY';
  
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&client_id=${unsplashAccessKey}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((photo: any) => photo.urls.regular);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch images from Unsplash:', err);
  }
  */
  
  return fallbackImages[category] || fallbackImages.restaurants;
}

async function performDiscovery(category: string): Promise<AIRecommendation> {
  let lat, lng;
  let locationText = "your area";
  
  // Use Lovely Professional University (LPU) coordinates
  lat = 31.2556;
  lng = 75.7029;
  locationText = "Lovely Professional University";
  console.log('Using Lovely Professional University coordinates for better business data coverage');

  // Fetch businesses using Geoapify Places API
  const categoryMap = {
    restaurants: 'catering',
    fitness: 'sport',
    coffee: 'catering.cafe',
    shopping: 'commercial',
    services: 'service'
  };

  const categories = categoryMap[category as keyof typeof categoryMap] || categoryMap.restaurants;
  const apiKey = '38ef205f4ebb4cab8cf0a347951b4ac6';
  
  try {
    const response = await fetch(`https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lng},${lat},10000&limit=20&apiKey=${apiKey}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.features || data.features.length === 0) {
      return {
        text: `No ${category} found in ${locationText}. Try a different category.`,
        sources: [],
        places: []
      };
    }
    
    // Store place data for markers and images
    const places: PlaceData[] = [];
    
    // Take first 5 results without shuffling, filter out invalid coordinates
    const validPlaces = data.features.filter((place: any) => {
      const coords = place.geometry?.coordinates;
      return coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
    }).slice(0, 5);
    
    const businesses = validPlaces.map((place: any, i: number) => {
      const name = place.properties.name || place.properties.address_line1 || `${category.slice(0, -1)} ${i + 1}`;
      const type = place.properties.categories?.[0]?.split('.')?.[1] || category.slice(0, -1);
      const businessCity = place.properties.city || place.properties.town || place.properties.village || "Unknown";
      const coordinates = place.geometry.coordinates; // [lng, lat]
      const address = place.properties.formatted || place.properties.address_line1 || `${name}, ${businessCity}`;
      
      // Verify coordinates are valid
      const [placeLng, placeLat] = coordinates;
      if (isNaN(placeLat) || isNaN(placeLng)) {
        console.warn(`Invalid coordinates for ${name}, skipping`);
        return null;
      }
      
      // Store place data
      places.push({
        name,
        coordinates: [placeLng, placeLat], // Ensure [lng, lat] format
        address,
        category: type,
        placeId: place.properties.place_id
      });
      
      console.log(`Business ${i+1}: ${name} in ${businessCity} - Coordinates: lat=${placeLat}, lng=${placeLng}`);
      return `${i + 1}. **${name}** - ${type} in ${locationText}`;
    }).filter(Boolean); // Remove any null entries
    
    return {
      text: businesses.join('\n\n'),
      sources: [],
      places
    };
  } catch (err) {
    console.error('Failed to fetch business data:', err);
    return {
      text: `Unable to fetch ${category} data for ${locationText}. Please try again later.`,
      sources: [],
      places: []
    };
  }
}

const MapSection: React.FC<MapSectionProps> = ({ onSelectBusiness, onSelectBusinessDirect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('restaurants');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null); // Store reference to tile layer
  const onSelectBusinessRef = useRef(onSelectBusiness);
  const aiMarkersRef = useRef<any[]>([]); // Store AI-discovered markers

  const categories = [
    { id: 'restaurants', label: 'Restaurants', emoji: '🍽️' },
    { id: 'fitness', label: 'Fitness', emoji: '💪' },
    { id: 'coffee', label: 'Coffee', emoji: '☕' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'services', label: 'Services', emoji: '🔧' }
  ];

  const centerOnUser = () => {
    if (!mapRef.current || typeof L === 'undefined') return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!mapRef.current) return;
        const { latitude, longitude } = position.coords;
        mapRef.current.flyTo([latitude, longitude], 13, { duration: 2.5, ease: 'power3.inOut' });
      },
      (err) => console.warn("User location access denied."),
      { timeout: 8000 }
    );
  };

  // Keep the callback ref updated
  useEffect(() => {
    onSelectBusinessRef.current = onSelectBusiness;
  }, [onSelectBusiness]);

  // Listen for theme changes and update map tiles
  useEffect(() => {
    const updateMapTheme = () => {
      if (!mapRef.current || !tileLayerRef.current || typeof L === 'undefined') return;
      
      const isDarkMode = document.documentElement.classList.contains('dark');
      const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
      // Remove old tile layer and add new one
      mapRef.current.removeLayer(tileLayerRef.current);
      const newTileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(mapRef.current);
      
      tileLayerRef.current = newTileLayer;
    };

    // Listen for class changes on document element (theme changes)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateMapTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const initMap = () => {
      if (typeof L === 'undefined') {
        setTimeout(initMap, 200);
        return;
      }

      const mapElement = document.getElementById('leaflet-map-mount');
      if (!mapElement || (mapElement as any)._leaflet_id) return;

      // Lovely Professional University (LPU) coordinates: [lat, lng]
      const map = L.map('leaflet-map-mount', {
        zoomControl: false,
        scrollWheelZoom: true
      }).setView([31.2556, 75.7029], 13);
      
      mapRef.current = map;
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
      // Use dark tiles for dark mode, light tiles for light mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      const tileUrl = isDarkMode 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      
      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);
      
      tileLayerRef.current = tileLayer;

      // Don't auto-center on user - keep LPU as default
      // User can click the location button to center on their location

      BUSINESSES.forEach((business) => {
        const markerHtml = `
          <div class="marker-container custom-marker w-10 h-10 group" id="marker-${business.id}">
            <div class="marker-inner w-10 h-10 bg-slate-900 rounded-full border-[3px] border-white shadow-xl flex items-center justify-center text-white cursor-pointer transition-transform duration-500 group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
        `;

        const markerIcon = L.divIcon({
          className: 'custom-marker-wrapper',
          html: markerHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });

        const leafletMarker = L.marker([business.location.lat, business.location.lng], { icon: markerIcon }).addTo(map);

        leafletMarker.on('click', () => {
          console.log('Map marker clicked:', business.id);
          onSelectBusinessRef.current(business.id);
          map.flyTo([business.location.lat, business.location.lng], 15, { duration: 1.5 });
        });
      });
    };

    initMap();

    return () => {
      // Clean up AI markers
      aiMarkersRef.current.forEach(marker => {
        if (marker && mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      aiMarkersRef.current = [];
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      
      tileLayerRef.current = null;
    };
  }, []);

  // Function to add markers for AI-discovered places
  const addAIMarkers = (places: PlaceData[]) => {
    if (!mapRef.current || typeof L === 'undefined' || !places || places.length === 0) return;
    
    // Clear existing AI markers
    aiMarkersRef.current.forEach(marker => {
      if (marker && mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    aiMarkersRef.current = [];
    
    // Add new markers with numbers and labels
    places.forEach((place, index) => {
      const [lng, lat] = place.coordinates;
      const markerNumber = index + 1;
      
      // Debug: Log coordinates to verify they're different
      console.log(`Marker ${markerNumber} - ${place.name}:`, { lat, lng, coordinates: place.coordinates });
      
      const markerHtml = `
        <div class="marker-container custom-marker group" id="ai-marker-${place.name}" style="position: relative;">
          <div class="marker-inner w-12 h-12 bg-indigo-600 rounded-full border-[3px] border-white shadow-2xl flex items-center justify-center text-white cursor-pointer transition-all duration-300 group-hover:scale-125 group-hover:shadow-indigo-500/50" style="font-weight: bold; font-size: 16px;">
            ${markerNumber}
          </div>
          <div class="marker-label absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style="z-index: 1000;">
            ${place.name}
          </div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-marker-wrapper ai-marker',
        html: markerHtml,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
      });

      // Ensure coordinates are valid numbers
      if (isNaN(lat) || isNaN(lng)) {
        console.error(`Invalid coordinates for ${place.name}:`, { lat, lng });
        return;
      }

      const leafletMarker = L.marker([lat, lng], { icon: markerIcon })
        .addTo(mapRef.current)
        .bindPopup(`<div style="font-weight: bold; margin-bottom: 4px;">${place.name}</div><div style="font-size: 12px; color: #666;">${place.address}</div>`, {
          className: 'custom-popup',
          closeButton: true
        });
      
      leafletMarker.on('click', () => {
        console.log('AI marker clicked:', place.name, 'at', lat, lng);
        handleBusinessClickFromPlace(place);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
        }
      });
      
      // Add hover effect
      leafletMarker.on('mouseover', function() {
        this.openPopup();
      });
      
      aiMarkersRef.current.push(leafletMarker);
    });
    
    // Fit map to show all markers if there are any
    if (places.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(places.map(p => [p.coordinates[1], p.coordinates[0]]));
      mapRef.current.flyToBounds(bounds, { padding: [80, 80], duration: 1.5 });
    }
  };

  const handleAISearch = async () => {
    setIsLoading(true);
    setAiResult(null);
    // Clear existing markers
    aiMarkersRef.current.forEach(marker => {
      if (marker && mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    aiMarkersRef.current = [];
    
    try {
      const result = await performDiscovery(selectedCategory);
      setAiResult(result);
      
      // Add markers for discovered places
      if (result.places && result.places.length > 0) {
        addAIMarkers(result.places);
      }
    } catch (err) {
      console.error("Discovery Search Failure:", err);
      setAiResult({ text: "Discovery currently unavailable. Please try again later.", sources: [], places: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessClickFromPlace = async (place: PlaceData) => {
    if (!onSelectBusinessDirect) {
      console.warn('onSelectBusinessDirect not provided');
      return;
    }
    
    // Get images for this business
    const images = await getBusinessImages(place.name, selectedCategory);
    
    // Generate mock contact information
    const phoneNumbers = [
      '+91 98765 43220', '+91 98765 43221', '+91 98765 43222', '+91 98765 43223', '+91 98765 43224'
    ];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'business.com'];
    const businessName = place.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    
    const mockContact = {
      phone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
      email: `${businessName}@${randomDomain}`,
      website: `https://${businessName}.com`,
      hours: selectedCategory === 'fitness' ? {
        'Monday': '5:00 AM - 10:00 PM',
        'Tuesday': '5:00 AM - 10:00 PM',
        'Wednesday': '5:00 AM - 10:00 PM',
        'Thursday': '5:00 AM - 10:00 PM',
        'Friday': '5:00 AM - 10:00 PM',
        'Saturday': '6:00 AM - 9:00 PM',
        'Sunday': '6:00 AM - 9:00 PM'
      } : selectedCategory === 'coffee' ? {
        'Monday': '7:00 AM - 11:00 PM',
        'Tuesday': '7:00 AM - 11:00 PM',
        'Wednesday': '7:00 AM - 11:00 PM',
        'Thursday': '7:00 AM - 11:00 PM',
        'Friday': '7:00 AM - 12:00 AM',
        'Saturday': '7:00 AM - 12:00 AM',
        'Sunday': '8:00 AM - 11:00 PM'
      } : selectedCategory === 'restaurants' ? {
        'Monday': '11:00 AM - 11:00 PM',
        'Tuesday': '11:00 AM - 11:00 PM',
        'Wednesday': '11:00 AM - 11:00 PM',
        'Thursday': '11:00 AM - 11:00 PM',
        'Friday': '11:00 AM - 11:30 PM',
        'Saturday': '11:00 AM - 11:30 PM',
        'Sunday': '11:00 AM - 11:00 PM'
      } : {
        'Monday': '9:00 AM - 9:00 PM',
        'Tuesday': '9:00 AM - 9:00 PM',
        'Wednesday': '9:00 AM - 9:00 PM',
        'Thursday': '9:00 AM - 9:00 PM',
        'Friday': '9:00 AM - 9:00 PM',
        'Saturday': '9:00 AM - 10:00 PM',
        'Sunday': '10:00 AM - 8:00 PM'
      }
    };
    
    const aiBusiness: Business = {
      id: place.placeId || `ai-${Date.now()}-${place.name}`,
      name: place.name,
      category: place.category.charAt(0).toUpperCase() + place.category.slice(1),
      rating: 4.2 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 200) + 50,
      description: `Discover ${place.name}, a popular ${place.category} destination near Lovely Professional University. Known for quality service and great atmosphere.`,
      address: place.address,
      location: { lat: place.coordinates[1], lng: place.coordinates[0] },
      image: images[0],
      images: images,
      featured: false,
      contact: mockContact
    };
    console.log('Opening business modal:', aiBusiness);
    onSelectBusinessDirect(aiBusiness);
  };

  const handleBusinessClick = async (businessName: string) => {
    console.log('Business clicked:', businessName);
    if (!onSelectBusinessDirect) {
      console.warn('onSelectBusinessDirect not provided');
      return;
    }
    
    // Find the place data from the current results
    const place = aiResult?.places?.find(p => p.name === businessName);
    
    if (place) {
      // Use real place data
      await handleBusinessClickFromPlace(place);
    } else {
      // Fallback if place data not found
      const images = await getBusinessImages(businessName, selectedCategory);
      
      // Generate mock contact information for fallback
      const phoneNumbers = [
        '+91 98765 43225', '+91 98765 43226', '+91 98765 43227', '+91 98765 43228', '+91 98765 43229'
      ];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'business.com'];
      const businessNameForEmail = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      
      const mockContact = {
        phone: phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)],
        email: `${businessNameForEmail}@${randomDomain}`,
        website: `https://${businessNameForEmail}.com`,
        hours: {
          'Monday': '9:00 AM - 9:00 PM',
          'Tuesday': '9:00 AM - 9:00 PM',
          'Wednesday': '9:00 AM - 9:00 PM',
          'Thursday': '9:00 AM - 9:00 PM',
          'Friday': '9:00 AM - 10:00 PM',
          'Saturday': '9:00 AM - 10:00 PM',
          'Sunday': '10:00 AM - 8:00 PM'
        }
      };
      
      const aiBusiness: Business = {
        id: `ai-${Date.now()}`,
        name: businessName,
        category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
        rating: 4.2 + Math.random() * 0.6,
        reviews: Math.floor(Math.random() * 200) + 50,
        description: `Discover ${businessName}, a popular ${selectedCategory.slice(0, -1)} destination near Lovely Professional University. Known for quality service and great atmosphere.`,
        address: `${businessName}, Phagwara, Punjab, India`,
        location: { lat: 31.2556 + (Math.random() - 0.5) * 0.02, lng: 75.7029 + (Math.random() - 0.5) * 0.02 },
        image: images[0],
        images: images,
        featured: false,
        contact: mockContact
      };
      console.log('Opening business modal:', aiBusiness);
      onSelectBusinessDirect(aiBusiness);
    }
  };

  return (
    <section className="py-32 bg-white dark:bg-black px-8">
      <div className="max-w-7xl mx-auto">
        <SectionHeader title="Geographic Discovery" subtitle="Advanced Interactive Map" />
        <div className="relative h-[800px] w-full bg-slate-50 dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 dark:border-gray-800 flex flex-col md:flex-row animate-in fade-in duration-1000">
          <div id="leaflet-map-mount" className="flex-grow h-full relative z-0" />
          <div className="absolute top-8 left-8 z-20 w-[340px] pointer-events-none space-y-4">
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl pointer-events-auto border border-white/50 dark:border-gray-800/50">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 flex items-center justify-between">
                Smart Discovery
                <button onClick={centerOnUser} className="p-2 text-slate-400 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </button>
              </h4>
              <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">Explore neighborhood gems with AI.</p>
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 dark:text-gray-300 mb-3 uppercase tracking-widest">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                  ))}
                </select>
              </div>
              
              <button onClick={handleAISearch} disabled={isLoading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div> : "Fetch AI Insights"}
              </button>
            </div>
            {aiResult && (
              <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl pointer-events-auto border border-white/50 dark:border-gray-800/50 animate-in fade-in slide-in-from-top-4 duration-700 max-h-[440px] overflow-y-auto custom-scrollbar">
                <div className="text-[14px] leading-[1.6] text-slate-700 dark:text-gray-300 mb-8 font-medium">
                  {aiResult.text.split('\n\n').map((business, index) => {
                    const match = business.match(/\*\*(.*?)\*\*/);
                    if (match) {
                      const businessName = match[1];
                      const beforeName = business.substring(0, business.indexOf('**'));
                      const afterName = business.substring(business.indexOf('**', business.indexOf('**') + 2) + 2);
                      return (
                        <div key={index} className="mb-3">
                          {beforeName}
                          <button 
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer underline"
                            onClick={() => handleBusinessClick(businessName)}
                          >
                            {businessName}
                          </button>
                          {afterName}
                        </div>
                      );
                    }
                    return <div key={index} className="mb-3">{business}</div>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;