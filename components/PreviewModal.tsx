'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
}

/**
 * Fullscreen preview modal for images
 * Features:
 * - Renders as portal at document root
 * - Fullscreen overlay centered on screen
 * - Close button (X)
 * - Escape key to close
 * - Click outside to close
 * - Smooth animations
 */
export default function PreviewModal({
  isOpen,
  onClose,
  imageSrc,
  title,
}: PreviewModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      style={{ margin: 0, padding: 0 }}
    >
      {/* Modal Content - Centered */}
      <div
        className="relative w-[90vw] h-[90vh] max-w-7xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-110"
            aria-label="Close preview"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/50">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-contain"
            quality={100}
            priority
            sizes="100vw"
          />
        </div>
      </div>
    </div>
  );

  // Render as portal to document body to break out of any positioned parents
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
