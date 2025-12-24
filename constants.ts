import { Business, Category } from './types';

export const CATEGORIES: Category[] = [
  { 
    id: '1', 
    name: 'Restaurants', 
    icon: '🍽️', 
    lottieUrl: 'https://lottie.host/8024225d-4958-4560-8456-4299388c33f2/oV3A8QnN9G.json',
    color: 'bg-orange-100 text-orange-600' 
  },
  { 
    id: '2', 
    name: 'Fitness', 
    icon: '💪', 
    lottieUrl: 'https://lottie.host/86d4e177-380d-4081-80a2-25e98f06649d/1X6G69zS5V.json',
    color: 'bg-blue-100 text-blue-600' 
  },
  { 
    id: '3', 
    name: 'Coffee', 
    icon: '☕', 
    lottieUrl: 'https://lottie.host/174d9e5d-1f63-4702-861c-52643a758712/fR8tG3N9Z6.json',
    color: 'bg-amber-100 text-amber-800' 
  },
  { 
    id: '4', 
    name: 'Nightlife', 
    icon: '🍹', 
    lottieUrl: 'https://lottie.host/6e033878-0e7b-40f4-8071-897c4e7f8e7a/zGfI9O3K6N.json',
    color: 'bg-purple-100 text-purple-600' 
  },
  { 
    id: '5', 
    name: 'Shopping', 
    icon: '🛍️', 
    lottieUrl: 'https://lottie.host/286f059c-7e61-4603-9e6e-30f5b9087f9d/p7QG9M3O6N.json',
    color: 'bg-pink-100 text-pink-600' 
  },
  { 
    id: '6', 
    name: 'Services', 
    icon: '🔧', 
    lottieUrl: 'https://lottie.host/79013c7a-97c7-4384-9382-3d86f76c5b96/XpG9L3I0O6.json',
    color: 'bg-emerald-100 text-emerald-600' 
  },
];

export const BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'LPU Food Court',
    category: 'Restaurants',
    rating: 4.8,
    reviews: 1240,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Multi-cuisine food court with diverse options including North Indian, South Indian, Chinese, and Continental.',
    featured: true,
    address: 'Main Food Court, LPU Campus',
    location: { lat: 31.2535, lng: 75.7035 }, // About 0.1 km from Block 34
    contact: {
      phone: '+91 98765 43210',
      email: 'foodcourt@lpu.co.in',
      website: 'https://lpu.in/dining',
      hours: {
        'Monday': '7:00 AM - 11:00 PM',
        'Tuesday': '7:00 AM - 11:00 PM',
        'Wednesday': '7:00 AM - 11:00 PM',
        'Thursday': '7:00 AM - 11:00 PM',
        'Friday': '7:00 AM - 11:00 PM',
        'Saturday': '7:00 AM - 11:00 PM',
        'Sunday': '7:00 AM - 11:00 PM'
      }
    }
  },
  {
    id: 'b2',
    name: 'LPU Fitness Center',
    category: 'Fitness',
    rating: 4.9,
    reviews: 850,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'State-of-the-art fitness center with modern equipment, swimming pool, and professional trainers.',
    featured: true,
    address: 'Sports Complex, LPU, Phagwara',
    location: { lat: 31.2520, lng: 75.7060 }, // LPU Sports Complex
    contact: {
      phone: '+91 98765 43211',
      email: 'fitness@lpu.co.in',
      website: 'https://lpu.in/sports',
      hours: {
        'Monday': '5:00 AM - 10:00 PM',
        'Tuesday': '5:00 AM - 10:00 PM',
        'Wednesday': '5:00 AM - 10:00 PM',
        'Thursday': '5:00 AM - 10:00 PM',
        'Friday': '5:00 AM - 10:00 PM',
        'Saturday': '6:00 AM - 9:00 PM',
        'Sunday': '6:00 AM - 9:00 PM'
      }
    }
  },
  {
    id: 'b3',
    name: 'Cafe Coffee Day Block 34',
    category: 'Coffee',
    rating: 4.7,
    reviews: 2100,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Popular coffee outlet in Block 34 LPU campus - your current location. Perfect for study sessions and quick coffee breaks.',
    featured: true,
    address: 'Block 34, LPU Campus, Phagwara (Your Location)',
    location: { lat: 31.2540, lng: 75.7030 }, // Block 34 LPU - Reference Point (0.0 km)
    contact: {
      phone: '+91 98765 43212',
      email: 'ccd.block34@cafecoffeeday.com',
      website: 'https://cafecoffeeday.com',
      hours: {
        'Monday': '7:00 AM - 11:00 PM',
        'Tuesday': '7:00 AM - 11:00 PM',
        'Wednesday': '7:00 AM - 11:00 PM',
        'Thursday': '7:00 AM - 11:00 PM',
        'Friday': '7:00 AM - 12:00 AM',
        'Saturday': '7:00 AM - 12:00 AM',
        'Sunday': '8:00 AM - 11:00 PM'
      }
    }
  },
  {
    id: 'b4',
    name: 'The Hangout Lounge',
    category: 'Nightlife',
    rating: 4.5,
    reviews: 630,
    image: 'https://images.unsplash.com/photo-1514525253361-bee8d4884c8c?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1514525253361-bee8d4884c8c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Student-friendly hangout spot near LPU with music, games, and evening entertainment.',
    featured: false,
    address: 'Near LPU Gate, Phagwara, Punjab',
    location: { lat: 31.2500, lng: 75.7080 }, // Near LPU Main Gate
    contact: {
      phone: '+91 98765 43213',
      email: 'info@hangoutlounge.com',
      website: 'https://hangoutlounge.com',
      hours: {
        'Monday': '4:00 PM - 1:00 AM',
        'Tuesday': '4:00 PM - 1:00 AM',
        'Wednesday': '4:00 PM - 1:00 AM',
        'Thursday': '4:00 PM - 1:00 AM',
        'Friday': '4:00 PM - 2:00 AM',
        'Saturday': '2:00 PM - 2:00 AM',
        'Sunday': '2:00 PM - 12:00 AM'
      }
    }
  },
  {
    id: 'b5',
    name: 'LPU Shopping Complex',
    category: 'Shopping',
    rating: 4.6,
    reviews: 420,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523381235212-d75f807bb21e?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'On-campus shopping complex with clothing stores, electronics, books, and daily essentials.',
    featured: false,
    address: 'Shopping Complex, LPU Campus',
    location: { lat: 31.2545, lng: 75.7040 }, // LPU Shopping area
    contact: {
      phone: '+91 98765 43214',
      email: 'shopping@lpu.co.in',
      website: 'https://lpu.in/shopping',
      hours: {
        'Monday': '9:00 AM - 9:00 PM',
        'Tuesday': '9:00 AM - 9:00 PM',
        'Wednesday': '9:00 AM - 9:00 PM',
        'Thursday': '9:00 AM - 9:00 PM',
        'Friday': '9:00 AM - 9:00 PM',
        'Saturday': '9:00 AM - 10:00 PM',
        'Sunday': '10:00 AM - 8:00 PM'
      }
    }
  },
  {
    id: 'b6',
    name: 'LPU Medical Center',
    category: 'Services',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e5b087ea2?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1530046339160-ce3e5b087ea2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1486006396193-471a2abc881e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=800'
    ],
    description: '24/7 medical facility with qualified doctors, emergency services, and pharmacy.',
    featured: false,
    address: 'Medical Block, LPU Campus',
    location: { lat: 31.2525, lng: 75.7055 }, // LPU Medical Center
    contact: {
      phone: '+91 98765 43215',
      email: 'medical@lpu.co.in',
      website: 'https://lpu.in/medical',
      hours: {
        'Monday': '24 Hours',
        'Tuesday': '24 Hours',
        'Wednesday': '24 Hours',
        'Thursday': '24 Hours',
        'Friday': '24 Hours',
        'Saturday': '24 Hours',
        'Sunday': '24 Hours'
      }
    }
  },
  {
    id: 'b7',
    name: 'Punjabi Tadka Restaurant',
    category: 'Restaurants',
    rating: 4.8,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Authentic Punjabi restaurant near LPU serving traditional dal makhani, butter chicken, and fresh rotis.',
    featured: true,
    address: 'Phagwara-Jalandhar Road, Near LPU',
    location: { lat: 31.2480, lng: 75.7100 }, // Near LPU on main road
    contact: {
      phone: '+91 98765 43216',
      email: 'info@punjabitadka.com',
      website: 'https://punjabitadka.com',
      hours: {
        'Monday': '11:00 AM - 11:00 PM',
        'Tuesday': '11:00 AM - 11:00 PM',
        'Wednesday': '11:00 AM - 11:00 PM',
        'Thursday': '11:00 AM - 11:00 PM',
        'Friday': '11:00 AM - 11:30 PM',
        'Saturday': '11:00 AM - 11:30 PM',
        'Sunday': '11:00 AM - 11:00 PM'
      }
    }
  },
  {
    id: 'b8',
    name: 'Anytime Fitness LPU',
    category: 'Fitness',
    rating: 4.7,
    reviews: 650,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800'
    ],
    description: '24/7 fitness center near LPU with modern equipment, group classes, and personal training.',
    featured: true,
    address: 'Near LPU Main Gate, Phagwara',
    location: { lat: 31.2510, lng: 75.7070 }, // Near LPU entrance
    contact: {
      phone: '+91 98765 43217',
      email: 'lpu@anytimefitness.com',
      website: 'https://anytimefitness.com',
      hours: {
        'Monday': '24 Hours',
        'Tuesday': '24 Hours',
        'Wednesday': '24 Hours',
        'Thursday': '24 Hours',
        'Friday': '24 Hours',
        'Saturday': '24 Hours',
        'Sunday': '24 Hours'
      }
    }
  },
  {
    id: 'b9',
    name: 'Starbucks Block 40',
    category: 'Coffee',
    rating: 4.6,
    reviews: 1200,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Premium coffee experience in Block 40, just a short walk from Block 34. Perfect study spot with WiFi.',
    featured: true,
    address: 'Block 40, LPU Campus (Near Block 34)',
    location: { lat: 31.2545, lng: 75.7025 }, // Block 40 - about 0.08 km from Block 34
    contact: {
      phone: '+91 98765 43218',
      email: 'block40@starbucks.co.in',
      website: 'https://starbucks.in',
      hours: {
        'Monday': '6:30 AM - 11:00 PM',
        'Tuesday': '6:30 AM - 11:00 PM',
        'Wednesday': '6:30 AM - 11:00 PM',
        'Thursday': '6:30 AM - 11:00 PM',
        'Friday': '6:30 AM - 12:00 AM',
        'Saturday': '7:00 AM - 12:00 AM',
        'Sunday': '7:00 AM - 11:00 PM'
      }
    }
  },
  {
    id: 'b10',
    name: 'LPU Book Store',
    category: 'Shopping',
    rating: 4.4,
    reviews: 780,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Campus bookstore with textbooks, stationery, LPU merchandise, and academic supplies.',
    featured: false,
    address: 'Academic Block, LPU Campus',
    location: { lat: 31.2528, lng: 75.7050 }, // LPU Academic area
    contact: {
      phone: '+91 98765 43219',
      email: 'bookstore@lpu.co.in',
      website: 'https://lpu.in/bookstore',
      hours: {
        'Monday': '8:00 AM - 8:00 PM',
        'Tuesday': '8:00 AM - 8:00 PM',
        'Wednesday': '8:00 AM - 8:00 PM',
        'Thursday': '8:00 AM - 8:00 PM',
        'Friday': '8:00 AM - 8:00 PM',
        'Saturday': '9:00 AM - 7:00 PM',
        'Sunday': '10:00 AM - 6:00 PM'
      }
    }
  }
];