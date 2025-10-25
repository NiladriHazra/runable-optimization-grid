'use client';

import { useState, useEffect, useMemo, useCallback, useRef, useTransition } from 'react';
import GridCard from './GridCard';
import { GridItem } from '@/lib/types';
import {
  getColumnCount,
  getColumnWidth,
  calculateMasonryLayout,
  MasonryConfig,
} from '@/lib/masonryLayout';

interface VirtualizedMasonryGridProps {
  items: GridItem[];
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const GAP = 20;
const BUFFER = 1200; // px buffer above/below viewport (increased for fast scrolling)
const SCROLL_THROTTLE = 16; // ~60fps throttling

/**
 * Virtualized Masonry Grid with custom windowing
 * Optimized for large datasets (15,000+ items)
 * Features:
 * - Only renders items in viewport + buffer
 * - Infinite scroll support
 * - Maintains all masonry layout optimizations
 * - Uses absolute positioning (no layout shifts)
 */
export default function VirtualizedMasonryGrid({
  items,
  onLoadMore,
  hasMore = false,
}: VirtualizedMasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastScrollTime = useRef(0);
  const scrollRAF = useRef<number | null>(null);

  // Update container width and viewport height
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setViewportHeight(window.innerHeight - 80);
      }
    };

    updateDimensions();
    
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Calculate layout
  const columns = getColumnCount(containerWidth);
  const columnWidth = getColumnWidth(containerWidth, columns, GAP);
  
  const config: MasonryConfig = {
    columnWidth,
    gap: GAP,
    columns,
  };

  const { positions, totalHeight } = useMemo(() => {
    return calculateMasonryLayout(items, config);
  }, [items, containerWidth]);

  // Create a Map for O(1) index lookup instead of O(n) indexOf
  const itemIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    items.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  }, [items]);

  // Optimized visible range calculation with binary search approach
  const visibleRange = useMemo(() => {
    const scrollStart = scrollTop - BUFFER;
    const scrollEnd = scrollTop + viewportHeight + BUFFER;
    return { start: scrollStart, end: scrollEnd };
  }, [scrollTop, viewportHeight]);

  // Filter visible items based on scroll position - optimized
  const visibleItems = useMemo(() => {
    const { start: scrollStart, end: scrollEnd } = visibleRange;
    
    // Fast path: use Array indices for better performance
    const visible: GridItem[] = [];
    const len = items.length;
    
    for (let i = 0; i < len; i++) {
      const pos = positions[i];
      if (!pos) continue;
      
      const itemTop = pos.y;
      const itemBottom = pos.y + pos.height;
      
      // Early exit if we've passed the visible range
      if (itemTop > scrollEnd) break;
      
      // Skip if before visible range
      if (itemBottom < scrollStart) continue;
      
      visible.push(items[i]);
    }

    // Always render at least 50 items to prevent blank screens during fast scrolling
    if (visible.length < 50 && items.length >= 50) {
      const startIndex = Math.max(0, Math.floor((scrollTop / totalHeight) * items.length) - 25);
      return items.slice(startIndex, startIndex + 50);
    }

    return visible;
  }, [items, positions, visibleRange, scrollTop, totalHeight]);

  // Optimized scroll handler with throttling and RAF
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const now = Date.now();
    
    // Throttle scroll updates to ~60fps
    if (now - lastScrollTime.current < SCROLL_THROTTLE) {
      // Cancel previous RAF if it exists
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
      }
      
      // Schedule update for next frame
      scrollRAF.current = requestAnimationFrame(() => {
        setScrollTop(target.scrollTop);
        lastScrollTime.current = now;
      });
      return;
    }
    
    // Immediate update for smooth experience
    setScrollTop(target.scrollTop);
    lastScrollTime.current = now;

    // Use transition for infinite scroll (non-urgent)
    if (
      hasMore &&
      onLoadMore &&
      !isLoadingMore &&
      target.scrollTop + target.clientHeight >= totalHeight - 1500
    ) {
      startTransition(() => {
        setIsLoadingMore(true);
        onLoadMore();
        setTimeout(() => setIsLoadingMore(false), 1000);
      });
    }
  }, [hasMore, onLoadMore, isLoadingMore, totalHeight, startTransition]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (scrollRAF.current) {
        cancelAnimationFrame(scrollRAF.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden"
      onScroll={handleScroll}
      style={{
        height: viewportHeight,
        willChange: 'scroll-position',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      {/* Container with explicit height */}
      <div
        className="relative w-full"
        style={{
          height: totalHeight,
          contain: 'layout style paint',
          willChange: 'contents',
        }}
      >
        {/* Render only visible items - optimized with Map lookup */}
        {visibleItems.map((item) => {
          const index = itemIndexMap.get(item.id);
          if (index === undefined) return null;
          
          const pos = positions[index];
          if (!pos) return null;

          return (
            <GridCard
              key={`card-${item.id}`}
              item={item}
              width={pos.width}
              height={pos.height}
              x={pos.x}
              y={pos.y}
            />
          );
        })}

        {/* Loading indicator with transition */}
        {(isLoadingMore || isPending) && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-opacity">
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}
