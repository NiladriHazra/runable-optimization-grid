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

// Detect mobile for optimized settings
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const BUFFER = isMobile ? 1500 : 1200; // Balanced buffer - not excessive
const SCROLL_THROTTLE = 0; // Zero throttle for instant response
const MIN_VISIBLE_ITEMS = isMobile ? 50 : 80; // Reasonable minimum

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
  const scrollTopRef = useRef(0); // Use ref instead of state for sync access
  const [, forceUpdate] = useState({}); // Force re-render when needed
  const [viewportHeight, setViewportHeight] = useState(800);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();
  const renderRAF = useRef<number | null>(null);

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

  // Calculate visible range synchronously using ref
  const getVisibleRange = useCallback(() => {
    const scrollStart = scrollTopRef.current - BUFFER;
    const scrollEnd = scrollTopRef.current + viewportHeight + BUFFER;
    return { start: scrollStart, end: scrollEnd };
  }, [viewportHeight]);

  // Calculate visible items synchronously - called on every render
  const getVisibleItems = useCallback((): GridItem[] => {
    const { start: scrollStart, end: scrollEnd } = getVisibleRange();
    
    // Balanced overscan - not excessive
    const overscan = BUFFER * 0.5; // 50% extra buffer
    const extendedStart = scrollStart - overscan;
    const extendedEnd = scrollEnd + overscan;
    
    const visible: GridItem[] = [];
    const len = items.length;
    
    for (let i = 0; i < len; i++) {
      const pos = positions[i];
      if (!pos) continue;
      
      const itemTop = pos.y;
      const itemBottom = pos.y + pos.height;
      
      // Extended range check
      if (itemTop > extendedEnd) break;
      if (itemBottom < extendedStart) continue;
      
      visible.push(items[i]);
    }

    // AGGRESSIVE FALLBACK: Always guarantee content
    if (visible.length < MIN_VISIBLE_ITEMS && items.length >= MIN_VISIBLE_ITEMS) {
      const scrollPercent = totalHeight > 0 ? scrollTopRef.current / totalHeight : 0;
      const estimatedIndex = Math.floor(scrollPercent * items.length);
      const startIndex = Math.max(0, estimatedIndex - Math.floor(MIN_VISIBLE_ITEMS * 0.5));
      const endIndex = Math.min(items.length, startIndex + MIN_VISIBLE_ITEMS);
      return items.slice(startIndex, endIndex);
    }

    return visible;
  }, [items, positions, getVisibleRange, totalHeight]);

  // Synchronous scroll handler - updates ref and forces re-render
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    
    // Update ref immediately (synchronous)
    scrollTopRef.current = target.scrollTop;
    
    // Cancel any pending RAF
    if (renderRAF.current) {
      cancelAnimationFrame(renderRAF.current);
    }
    
    // Force re-render on next frame
    renderRAF.current = requestAnimationFrame(() => {
      forceUpdate({});
    });

    // Infinite scroll check
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
      if (renderRAF.current) {
        cancelAnimationFrame(renderRAF.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      onScroll={handleScroll}
      style={{
        height: viewportHeight,
        willChange: 'scroll-position',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'auto', // Remove smooth for instant response
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden',
        background: '#0a0a0a', // Dark background matches theme
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
        {/* Render visible items - calculated synchronously on every render */}
        {getVisibleItems().map((item: GridItem) => {
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
