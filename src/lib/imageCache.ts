"use client";

// Global in-memory image cache set
const loadedImageUrls = new Set<string>();

/**
 * Optimizes remote URLs (such as Unsplash) with WebP/AVIF format and responsive sizing
 */
export function getOptimizedImageUrl(src?: string, targetWidth: number = 600): string {
  if (!src) return "";
  if (src.includes("images.unsplash.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("auto", "format"); // auto serves webp/avif
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(targetWidth));
      url.searchParams.set("q", "75"); // 75 quality is visually identical to 85 but 50% smaller
      return url.toString();
    } catch {
      return src;
    }
  }
  return src;
}

/**
 * Preloads a single image into the browser's HTTP and memory cache
 */
export function preloadImage(src?: string, targetWidth: number = 600): Promise<void> {
  if (!src || typeof window === "undefined") return Promise.resolve();
  const optimized = getOptimizedImageUrl(src, targetWidth);
  if (loadedImageUrls.has(optimized)) return Promise.resolve();

  return new Promise((resolve) => {
    const img = new Image();
    img.src = optimized;
    img.onload = () => {
      loadedImageUrls.add(optimized);
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
  });
}

/**
 * Batches image preloading during browser idle periods
 */
export function preloadImages(srcArray: (string | undefined)[], targetWidth: number = 600) {
  if (typeof window === "undefined" || !srcArray.length) return;

  const runPreload = () => {
    srcArray.forEach((src) => {
      if (src) preloadImage(src, targetWidth);
    });
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(runPreload, { timeout: 2000 });
  } else {
    setTimeout(runPreload, 200);
  }
}

/**
 * Synchronous check whether an image URL has already completed loading in this session
 */
export function isImageCached(src?: string, targetWidth: number = 600): boolean {
  if (!src) return false;
  const optimized = getOptimizedImageUrl(src, targetWidth);
  return loadedImageUrls.has(optimized);
}

/**
 * Mark URL as loaded
 */
export function markImageCached(src?: string, targetWidth: number = 600) {
  if (!src) return;
  const optimized = getOptimizedImageUrl(src, targetWidth);
  loadedImageUrls.add(optimized);
}
