
import React from 'react';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedBusinesses from '../components/FeaturedBusinesses';
import ExploreDiscovery from '../components/ExploreDiscovery';
import MapSection from '../components/MapSection';
import { Page } from '../App';

import { Business } from '../types';

interface HomeViewProps {
  onNavigate: (page: Page, id?: string) => void;
  onSelectBusiness: (id: string) => void;
  onSelectBusinessDirect?: (business: Business) => void;
  userCoords: { lat: number; lng: number } | null;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectBusiness, onSelectBusinessDirect, userCoords }) => {
  return (
    <>
      <Hero onNavigate={onNavigate} />
      <CategoryGrid />
      <div className="bg-white dark:bg-black h-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 dark:bg-gray-800"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black px-6">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 flex items-center justify-center text-slate-300 dark:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <FeaturedBusinesses onSelectBusiness={onSelectBusiness} userCoords={userCoords} />
      <MapSection onSelectBusiness={onSelectBusiness} onSelectBusinessDirect={onSelectBusinessDirect} />
      <ExploreDiscovery onNavigate={onNavigate} />
    </>
  );
};

export default HomeView;
