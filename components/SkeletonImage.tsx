'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface SkeletonImageProps extends ImageProps {
  containerClassName?: string;
  fallbackSrc?: string;
}

export function SkeletonImage({ 
  containerClassName = '', 
  className = '', 
  alt = '', 
  src, 
  fallbackSrc = '',
  ...props 
}: SkeletonImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className={`relative w-full h-full overflow-hidden ${isLoading ? 'animate-pulse bg-slate-200' : 'bg-transparent'} ${containerClassName}`}>
      <Image
        alt={alt}
        src={imgSrc}
        {...props}
        className={`${className} transition-opacity duration-700 ease-in-out ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          } else {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
