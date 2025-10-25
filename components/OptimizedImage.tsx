'use client';

import { useState, useEffect, useRef, memo } from 'react';
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
 * PROPERLY optimized with smart lazy loading
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  blurHash,
  width,
  height,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Smart Intersection Observer - balanced approach
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '800px', // Load 800px ahead (balanced)
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
      {/* BlurHash - minimal size for performance */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10">
          <BlurhashCanvas
            hash={blurHash}
            width={16}
            height={16}
            punch={1}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Image - OPTIMIZED by Next.js */}
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          fill
          onLoad={() => setIsLoaded(true)}
          className="object-cover"
          loading="lazy"
          quality={75}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="empty"
        />
      )}
    </div>
  );
});

export default OptimizedImage;
