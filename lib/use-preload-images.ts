/**
 * Image Preloading Hook
 *
 * Preloads images to improve user experience by eliminating loading delays
 */

import { useEffect, useState } from "react";
import { Image } from "react-native";

export interface PreloadResult {
  loaded: boolean;
  progress: number;
}

/**
 * Preload multiple images and track progress
 *
 * @param urls - Array of image URLs to preload
 * @returns Object with loaded status and progress (0-1)
 *
 * @example
 * const { loaded, progress } = usePreloadImages(imageUrls);
 * if (!loaded) {
 *   return <LoadingView progress={Math.round(progress * 100)} />;
 * }
 */
export function usePreloadImages(urls: string[]): PreloadResult {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // If no URLs, mark as loaded immediately
    if (!urls || urls.length === 0) {
      setLoaded(true);
      setProgress(1);
      return;
    }

    let isMounted = true;
    let loadedCount = 0;

    const preloadImages = async () => {
      try {
        console.log(`[Preload] Starting preload of ${urls.length} images...`);

        // Create prefetch promises for all images
        const prefetchPromises = urls.map(async (url) => {
          try {
            await Image.prefetch(url);
            if (isMounted) {
              loadedCount++;
              const currentProgress = loadedCount / urls.length;
              setProgress(currentProgress);
              console.log(`[Preload] Progress: ${Math.round(currentProgress * 100)}%`);
            }
          } catch (error) {
            console.warn(`[Preload] Failed to prefetch image: ${url}`, error);
            // Don't throw, just increment count to continue
            if (isMounted) {
              loadedCount++;
              setProgress(loadedCount / urls.length);
            }
          }
        });

        // Wait for all images to complete (or fail)
        await Promise.all(prefetchPromises);

        if (isMounted) {
          console.log("[Preload] All images preloaded successfully");
          setLoaded(true);
          setProgress(1);
        }
      } catch (error) {
        console.error("[Preload] Error during preload:", error);
        // Even on error, mark as loaded to avoid blocking UI
        if (isMounted) {
          setLoaded(true);
          setProgress(1);
        }
      }
    };

    preloadImages();

    return () => {
      isMounted = false;
    };
  }, [urls]);

  return { loaded, progress };
}
