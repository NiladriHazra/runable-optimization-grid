import { memo } from 'react';

interface SkeletonCardProps {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Skeleton loading card for smooth loading experience
 * Shows while real content is loading to prevent blank spaces
 */
function SkeletonCard({ width, height, x, y }: SkeletonCardProps) {
  return (
    <div
      className="absolute rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"
      style={{
        left: x,
        top: y,
        width,
        height,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="w-full h-full relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        {/* Content placeholder */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="h-3 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default memo(SkeletonCard);
