'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import GridCard from './GridCard';
import { GridItem } from '@/lib/types';
import {
  calculateMasonryLayout,
  getColumnCount,
  getColumnWidth,
} from '@/lib/masonryLayout';

interface MasonryGridProps {
  items: GridItem[];
}

/**
 * High-performance masonry grid with advanced optimizations
 * 
 * Optimizations Applied:
 * 1. Pre-calculated absolute positions (eliminates layout thrashing)
 * 2. CSS content-visibility for automatic rendering optimization
 * 3. Memoized layout calculations
 * 4. Debounced resize handling (300ms)
 * 5. Intersection Observer in child components for lazy loading
 * 6. BlurHash placeholders for instant visual feedback
 * 7. Explicit container height (prevents CLS)
 * 
 * Performance targets:
 * - Handles 1000+ items smoothly
 * - 60fps scrolling
 * - < 100ms layout calculation
 */
export default function MasonryGrid({ items }: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const GAP = 20;

  // Debounced resize handler - prevents excessive recalculations
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 300); // 300ms debounce
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized layout calculation - only recalculates when data or width changes
  const { positions, totalHeight } = useMemo(() => {
    const columns = getColumnCount(containerWidth);
    const columnWidth = getColumnWidth(containerWidth, columns, GAP);

    return calculateMasonryLayout(items, {
      columnWidth,
      gap: GAP,
      columns,
    });
  }, [items, containerWidth]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto">
      {/* 
        Masonry container with pre-calculated positions
        - Uses absolute positioning for zero layout recalculation
        - Explicit height prevents Cumulative Layout Shift (CLS)
        - content-visibility handled at card level
      */}
      <div 
        className="relative w-full" 
        style={{ 
          height: totalHeight,
          // Hint to browser about content
          contain: 'layout style paint'
        }}
      >
        {positions.map((pos) => (
          <GridCard
            key={pos.item.id}
            item={pos.item}
            width={pos.width}
            height={pos.height}
            x={pos.x}
            y={pos.y}
          />
        ))}
      </div>
    </div>
  );
}
