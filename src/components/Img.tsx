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
  sizes?: string;
}

export default function Img({
  src,
  alt,
  className = "",
  width = 600,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
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
        <Utensils size={28} className="opacity-40" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Luxury Subtle Shimmer Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-sand/20 via-sand/40 to-sand/20 animate-pulse" />
      )}

      <img
        src={optimizedSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        sizes={sizes}
        onLoad={() => {
          setIsLoaded(true);
          markImageCached(src, width);
        }}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover ${
          alreadyCached
            ? "opacity-100"
            : `transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`
        }`}
      />
    </div>
  );
}
