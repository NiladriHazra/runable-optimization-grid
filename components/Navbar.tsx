'use client';

import { useState } from 'react';

const navItems = [
  { id: 'all', label: 'All' },
  { id: 'slides', label: 'AI Slides' },
  { id: 'website', label: 'AI Website' },
  { id: 'report', label: 'AI Report' },
  { id: 'document', label: 'AI Document' },
  { id: 'spreadsheet', label: 'AI Spreadsheet' },
];

/**
 * Navbar component with smooth skeleton transition
 * Features:
 * - Active state with cyan underline
 * - Skeleton loading on tab switch (150ms)
 * - Smooth transitions
 * - Responsive design
 */
export default function Navbar() {
  const [activeTab, setActiveTab] = useState('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setIsTransitioning(true);
      
      // Very short skeleton duration (150ms)
      setTimeout(() => {
        setActiveTab(tabId);
        setIsTransitioning(false);
      }, 150);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 relative">
      {/* Skeleton loading overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
      )}
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-8 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              disabled={isTransitioning}
              className="relative pb-1 text-sm font-medium transition-all duration-300 group disabled:opacity-50"
            >
              {/* Text */}
              <span
                className={`transition-all duration-300 ${
                  activeTab === item.id
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
              </span>

              {/* Animated Underline */}
              {activeTab === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full animate-slideIn" />
              )}

              {/* Hover underline for inactive items */}
              {activeTab !== item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-400 opacity-0 group-hover:opacity-50 transition-opacity rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
