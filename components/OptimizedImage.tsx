'use client';

import { useState, useEffect, useRef } from 'react';
import { BlurhashCanvas } from 'react-blurhash';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  blurHash: string;
  width: number;
  height: number;
}

/**
 * Optimized image component with:
 * - BlurHash placeholder for instant visual feedback
 * - Intersection Observer for lazy loading
 * - Progressive loading strategy
 * - Next.js Image optimization
 */
export default function OptimizedImage({
  src,
  alt,
  blurHash,
  width,
  height,
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      className="relative w-full h-full overflow-hidden"
      style={{ width, height }}
    >
      {/* BlurHash Placeholder - shows immediately */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <BlurhashCanvas
          hash={blurHash}
          width={width}
          height={height}
          punch={1}
          className="w-full h-full"
        />
      </div>

      {/* Actual Image - loads when in view */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill
          onLoad={() => setIsLoaded(true)}
          className={`object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          quality={90}
          sizes={`(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`}
        />
      )}
    </div>
  );
}
