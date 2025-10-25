'use client';

import { useState, memo } from 'react';
import { Eye, Wand2 } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import PreviewModal from './PreviewModal';
import { GridItem } from '@/lib/types';

interface GridCardProps {
  item: GridItem;
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Grid card with hover preview functionality
 * Features:
 * - Smooth hover animations
 * - Preview and Remix action buttons
 * - Fullscreen preview modal
 * - Optimized rendering with content-visibility
 * - React.memo for preventing unnecessary re-renders
 */
function GridCard({ item, width, height, x, y }: GridCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPreviewOpen(true);
  };

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Remix:', item.title);
    // Add your remix logic here
  };

  return (
    <div
      className="absolute rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
      style={{
        left: x,
        top: y,
        width,
        height,
        contentVisibility: 'auto',
        containIntrinsicSize: `auto ${height}px`,
        transform: 'translateZ(0)', // GPU acceleration
        backfaceVisibility: 'hidden',
        perspective: 1000,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <OptimizedImage
        src={item.image}
        alt={item.title}
        blurHash={item.blurHash}
        width={width}
        height={height}
      />

      {/* Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        {/* Category Badge */}
        <div
          className={`self-start transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
          }`}
        >
          <span className="inline-block px-3 py-1 bg-cyan-400 text-black text-xs font-semibold rounded-full">
            {item.category}
          </span>
        </div>

        {/* Bottom Content */}
        <div
          className={`transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Title */}
          <h3 className="text-white font-semibold text-lg mb-4">{item.title}</h3>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-2.5 bg-black/80 hover:bg-black text-white rounded-full text-sm font-medium transition-all hover:scale-105 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleRemix}
              className="flex items-center gap-2 px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black rounded-full text-sm font-semibold transition-all hover:scale-105"
            >
              <Wand2 className="w-4 h-4" />
              Remix
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageSrc={item.image}
        title={item.title}
      />
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export default memo(GridCard);
