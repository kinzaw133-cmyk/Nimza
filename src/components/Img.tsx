"use client";

import React, { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import { getOptimizedImageUrl, isImageCached, markImageCached } from "@/lib/imageCache";

interface ImgProps {
  src?: string;
  alt: string;
  className?: string;
  width?: number;
  priority?: boolean;
}

export default function Img({
  src,
  alt,
  className = "",
  width = 600,
  priority = false,
}: ImgProps) {
  const optimizedSrc = getOptimizedImageUrl(src, width);
  const alreadyCached = isImageCached(src, width);

  const [isLoaded, setIsLoaded] = useState<boolean>(alreadyCached);
  const [hasError, setHasError] = useState<boolean>(!src);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      return;
    }
    setHasError(false);
    if (isImageCached(src, width)) {
      setIsLoaded(true);
    }
  }, [src, width]);

  if (hasError || !optimizedSrc) {
    return (
      <div
        className={`grid place-items-center bg-[#1F241F]/10 border border-sand/40 text-gold/70 ${className}`}
        aria-label={alt}
      >
        <Utensils size={28} className="opacity-50" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-sand/20 animate-pulse flex items-center justify-center">
          <Utensils size={20} className="text-sand/40 opacity-40 animate-spin" />
        </div>
      )}

      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => {
          setIsLoaded(true);
          markImageCached(src, width);
        }}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
