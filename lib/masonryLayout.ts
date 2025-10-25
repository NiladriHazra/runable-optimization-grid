import { GridItem, CalculatedPosition } from './types';

interface MasonryConfig {
  columnWidth: number;
  gap: number;
  columns: number;
}

/**
 * Pre-calculate masonry layout positions for optimal performance
 * This runs once when data loads, eliminating layout thrashing
 */
export function calculateMasonryLayout(
  items: GridItem[],
  config: MasonryConfig
): { positions: CalculatedPosition[]; totalHeight: number } {
  const { columnWidth, gap, columns } = config;
  const columnHeights = new Array(columns).fill(0);
  const positions: CalculatedPosition[] = [];

  items.forEach((item) => {
    // Find shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    const x = shortestColumnIndex * (columnWidth + gap);
    const y = columnHeights[shortestColumnIndex];
    
    positions.push({
      item,
      x,
      y,
      width: columnWidth,
      height: item.height,
    });

    // Update column height
    columnHeights[shortestColumnIndex] += item.height + gap;
  });

  const totalHeight = Math.max(...columnHeights);

  return { positions, totalHeight };
}

/**
 * Determine optimal column count based on viewport width
 */
export function getColumnCount(containerWidth: number): number {
  if (containerWidth >= 1536) return 4; // 2xl
  if (containerWidth >= 1024) return 3; // lg
  if (containerWidth >= 640) return 2; // sm
  return 1; // mobile
}

/**
 * Calculate column width based on container and columns
 */
export function getColumnWidth(containerWidth: number, columns: number, gap: number): number {
  return Math.floor((containerWidth - gap * (columns - 1)) / columns);
}
