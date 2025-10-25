'use client';

import { useState, useCallback } from 'react';
import VirtualizedMasonryGrid from '@/components/VirtualizedMasonryGrid';
import Navbar from '@/components/Navbar';
import { generateSampleData, generateDataChunk } from '@/lib/generateData';

const INITIAL_LOAD = 500; // Start with 500 items
const LOAD_MORE_COUNT = 200; // Load 200 more each time
const MAX_ITEMS = 15000; // Maximum 15,000 items

export default function Home() {
  const [items, setItems] = useState(() => generateSampleData(INITIAL_LOAD));
  const [hasMore, setHasMore] = useState(true);

  const handleLoadMore = useCallback(() => {
    if (items.length >= MAX_ITEMS) {
      setHasMore(false);
      return;
    }

    const newItems = generateDataChunk(items.length, LOAD_MORE_COUNT);
    setItems((prev) => [...prev, ...newItems]);

    if (items.length + newItems.length >= MAX_ITEMS) {
      setHasMore(false);
    }
  }, [items.length]);

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              90deg, 
              transparent 0%,
              transparent 30%,
              rgba(138, 43, 226, 0.4) 50%,
              transparent 70%,
              transparent 100%
            ),
            linear-gradient(
              to bottom,
              #1a1a2e 0%,
              #2d1b69 50%,
              #0f0f23 100%
            )
          `,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 79px,
              rgba(255, 255, 255, 0.05) 80px,
              rgba(255, 255, 255, 0.05) 81px
            )
          `,
        }}
      />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <VirtualizedMasonryGrid
          items={items}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
        />
      </main>
    </div>
  );
}
