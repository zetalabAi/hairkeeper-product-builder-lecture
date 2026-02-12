/**
 * Image Optimization Utility
 *
 * Optimizes images before upload to reduce file size and processing time.
 */

import * as ImageManipulator from "expo-image-manipulator";

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
export function getOptimalDimensions(
  width: number,
  height: number,
  maxWidth: number = 1080
): { width: number; height: number } {
  if (width <= maxWidth) {
    return { width, height };
  }

  const ratio = maxWidth / width;
  return {
    width: maxWidth,
    height: Math.round(height * ratio),
  };
}

/**
 * Optimize image for faster upload and processing
 *
 * @param uri - Image URI to optimize
 * @param options - Optimization options
 * @returns Optimized image URI
 *
 * @example
 * const optimizedUri = await optimizeImage(uri, {
 *   maxWidth: 1080,
 *   quality: 0.85
 * });
 */
export async function optimizeImage(
  uri: string,
  options: OptimizeOptions = {}
): Promise<string> {
  const { maxWidth = 1080, maxHeight = 1440, quality = 0.8 } = options;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error("Failed to optimize image:", error);
    // Return original URI if optimization fails
    return uri;
  }
}
