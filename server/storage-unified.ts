/**
 * Unified Storage Interface
 *
 * Provides a single interface for storage operations that can use either
 * Manus FORGE or Google Cloud Storage based on the STORAGE_BACKEND env var.
 *
 * Feature flag: STORAGE_BACKEND=manus|gcs
 *
 * This allows for gradual migration and easy rollback if issues occur.
 */

import { ENV } from "./_core/env";
import { storagePut as forgeStoragePut, storageGet as forgeStorageGet } from "./storage";
import { gcsUpload, gcsGetSignedUrl, gcsGetPublicUrl, gcsDelete, gcsExists } from "./_core/gcs-storage";

/**
 * Upload a file to storage
 *
 * @param relKey - Relative path/key for the file (e.g., "generated/image.png")
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file
 * @returns Object with key and URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const backend = ENV.storageBackend;

  console.log(`[Storage Unified] Using ${backend} backend for upload: ${relKey}`);

  if (backend === "gcs") {
    // Use Google Cloud Storage
    return gcsUpload(relKey, data, contentType, { public: true });
  } else {
    // Use Manus FORGE storage (default)
    return forgeStoragePut(relKey, data, contentType);
  }
}

/**
 * Get a URL for a file in storage
 *
 * @param relKey - Relative path/key for the file
 * @returns Object with key and URL
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const backend = ENV.storageBackend;

  console.log(`[Storage Unified] Using ${backend} backend for get: ${relKey}`);

  if (backend === "gcs") {
    // For GCS, check if file is public or needs signed URL
    // For simplicity, we'll use signed URLs for all files
    // In production, you might want to track which files are public
    const url = await gcsGetSignedUrl(relKey);
    return { key: relKey, url };
  } else {
    // Use Manus FORGE storage (default)
    return forgeStorageGet(relKey);
  }
}

/**
 * Get a public URL for a file (GCS only)
 * For FORGE, falls back to storageGet
 *
 * @param relKey - Relative path/key for the file
 * @returns Public URL
 */
export async function storageGetPublicUrl(relKey: string): Promise<string> {
  const backend = ENV.storageBackend;

  if (backend === "gcs") {
    return gcsGetPublicUrl(relKey);
  } else {
    const result = await forgeStorageGet(relKey);
    return result.url;
  }
}

/**
 * Delete a file from storage
 * Note: FORGE doesn't support delete, so this only works with GCS
 *
 * @param relKey - Relative path/key for the file
 */
export async function storageDelete(relKey: string): Promise<void> {
  const backend = ENV.storageBackend;

  console.log(`[Storage Unified] Using ${backend} backend for delete: ${relKey}`);

  if (backend === "gcs") {
    await gcsDelete(relKey);
  } else {
    console.warn("[Storage Unified] FORGE storage does not support delete operation");
    // FORGE doesn't support delete, silently ignore
  }
}

/**
 * Check if a file exists in storage
 * Note: FORGE doesn't support exists check, so this only works with GCS
 *
 * @param relKey - Relative path/key for the file
 * @returns true if file exists, false otherwise
 */
export async function storageExists(relKey: string): Promise<boolean> {
  const backend = ENV.storageBackend;

  if (backend === "gcs") {
    return gcsExists(relKey);
  } else {
    console.warn("[Storage Unified] FORGE storage does not support exists check");
    // FORGE doesn't support exists, assume true
    return true;
  }
}

/**
 * Get current storage backend
 */
export function getStorageBackend(): "manus" | "gcs" {
  return ENV.storageBackend;
}

/**
 * Check if using GCS backend
 */
export function isUsingGCS(): boolean {
  return ENV.storageBackend === "gcs";
}

/**
 * Check if using FORGE backend
 */
export function isUsingFORGE(): boolean {
  return ENV.storageBackend === "manus";
}
