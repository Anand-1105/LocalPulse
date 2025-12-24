import React, { useState, useEffect } from 'react';
import { Page } from '../App';

interface ExploreDiscoveryProps {
  onNavigate: (page: Page) => void;
  onSearch?: (query: string, filter?: string) => void;
}

const ExploreDiscovery: React.FC<ExploreDiscoveryProps> = ({ onNavigate, onSearch }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const phrases = [
    'Ready to find your next favorite spot?',
    'Ready to discover hidden gems?',
    'Ready to explore local treasures?',
    'Ready to find amazing places?',
    'Ready to uncover the city\'s best?'
  ];

  useEffect(() => {
    const currentPhrase = phrases[currentIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 1000 : 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting && currentText === currentPhrase) {
        // Finished typing, pause then start deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && currentText === '') {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      } else {
        // Continue typing or deleting
        setCurrentText(prev => 
          isDeleting 
            ? prev.slice(0, -1)
            : currentPhrase.slice(0, prev.length + 1)
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isDeleting, phrases]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter === activeFilter ? null : filter);
    if (onSearch) {
      onSearch('', filter === activeFilter ? undefined : filter);
    }
    // Navigate to explore page with filter applied
    onNavigate('explore');
  };

  return (
    <section className="relative py-48 overflow-hidden bg-white dark:bg-black">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-50/30 dark:bg-indigo-900/20 rounded-full blur-[160px]"></div>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="text-slate-900 dark:text-white text-5xl md:text-[85px] font-[800] tracking-[-0.04em] leading-[0.95] min-h-[200px] md:min-h-[300px] flex items-center justify-center">
            <span>
              {currentText.split(' ').map((word, index) => {
                const isHighlighted = ['next', 'hidden', 'local', 'amazing', 'city\'s'].some(highlight => word.toLowerCase().includes(highlight.toLowerCase()));
                return (
                  <span key={index} className={isHighlighted ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                    {word}{index < currentText.split(' ').length - 1 ? ' ' : ''}
                  </span>
                );
              })}
              <span className={`inline-block w-1 bg-slate-900 dark:bg-white ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} style={{ height: '0.8em' }}></span>
            </span>
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {['Hot & New', 'Near Me', 'Open Now', 'Highly Rated'].map((filter, index) => (
            <button 
              key={filter} 
              onClick={() => handleFilterClick(filter)}
              className={`border px-10 py-5 rounded-[24px] font-bold transition-all text-[15px] shadow-sm active:scale-95 hover:-translate-y-1 ${
                activeFilter === filter 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-slate-900 dark:border-white' 
                  : 'bg-white dark:bg-gray-900 border-slate-100 dark:border-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800'
              }`}
              style={{ animationDelay: `${500 + index * 100}ms` }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreDiscovery;
