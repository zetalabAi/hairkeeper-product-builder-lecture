/**
 * Google Cloud Storage Operations
 *
 * Provides functions for uploading, downloading, and managing files in GCS.
 * This module replaces the Manus FORGE storage API.
 */

import { Storage, type Bucket } from "@google-cloud/storage";
import { ENV } from "./env";

let _storage: Storage | null = null;
let _bucket: Bucket | null = null;

/**
 * Initialize Google Cloud Storage client
 * Lazily initialized on first use
 */
function getStorage(): Storage {
  if (!_storage) {
    if (!ENV.googleApplicationCredentials) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS not configured");
    }

    _storage = new Storage({
      projectId: ENV.googleCloudProject,
      keyFilename: ENV.googleApplicationCredentials,
    });

    console.log("[GCS] Google Cloud Storage client initialized");
  }

  return _storage;
}

/**
 * Get the default GCS bucket
 */
function getBucket(): Bucket {
  if (!_bucket) {
    if (!ENV.firebaseStorageBucket) {
      throw new Error("FIREBASE_STORAGE_BUCKET not configured");
    }

    const storage = getStorage();
    _bucket = storage.bucket(ENV.firebaseStorageBucket);
    console.log("[GCS] Using bucket:", ENV.firebaseStorageBucket);
  }

  return _bucket;
}

/**
 * Upload a file to GCS
 *
 * @param fileName - Path/name of the file in the bucket (e.g., "users/123/avatar.jpg")
 * @param data - File content as Buffer, Uint8Array, or string
 * @param contentType - MIME type of the file (e.g., "image/jpeg")
 * @param options - Additional options
 * @returns Object with key and public URL
 */
export async function gcsUpload(
  fileName: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
  options: {
    public?: boolean;
    metadata?: Record<string, string>;
  } = {}
): Promise<{ key: string; url: string }> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    // Convert data to Buffer if needed
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

    // Upload file
    await file.save(buffer, {
      contentType,
      metadata: options.metadata,
      // Make public if requested
      predefinedAcl: options.public ? "publicRead" : undefined,
    });

    // Get public URL
    let url: string;
    if (options.public) {
      url = file.publicUrl();
    } else {
      // For private files, generate a signed URL valid for 1 hour
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      url = signedUrl;
    }

    console.log(`[GCS] Uploaded ${fileName} (${buffer.length} bytes)`);

    return {
      key: fileName,
      url,
    };
  } catch (error) {
    console.error("[GCS] Upload failed:", error);
    throw error;
  }
}

/**
 * Get a signed URL for a private file
 *
 * @param fileName - Path/name of the file in the bucket
 * @param expiresIn - Expiration time in milliseconds (default: 1 hour)
 * @returns Signed URL that allows temporary access
 */
export async function gcsGetSignedUrl(
  fileName: string,
  expiresIn = 60 * 60 * 1000 // 1 hour
): Promise<string> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("[GCS] Get signed URL failed:", error);
    throw error;
  }
}

/**
 * Get a public URL for a public file
 *
 * @param fileName - Path/name of the file in the bucket
 * @returns Public URL
 */
export function gcsGetPublicUrl(fileName: string): string {
  const bucket = getBucket();
  const file = bucket.file(fileName);
  return file.publicUrl();
}

/**
 * Download a file from GCS
 *
 * @param fileName - Path/name of the file in the bucket
 * @returns File content as Buffer
 */
export async function gcsDownload(fileName: string): Promise<Buffer> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    const [contents] = await file.download();
    console.log(`[GCS] Downloaded ${fileName} (${contents.length} bytes)`);

    return contents;
  } catch (error) {
    console.error("[GCS] Download failed:", error);
    throw error;
  }
}

/**
 * Delete a file from GCS
 *
 * @param fileName - Path/name of the file in the bucket
 */
export async function gcsDelete(fileName: string): Promise<void> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    await file.delete();
    console.log(`[GCS] Deleted ${fileName}`);
  } catch (error) {
    console.error("[GCS] Delete failed:", error);
    throw error;
  }
}

/**
 * Check if a file exists in GCS
 *
 * @param fileName - Path/name of the file in the bucket
 * @returns true if file exists, false otherwise
 */
export async function gcsExists(fileName: string): Promise<boolean> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error("[GCS] Exists check failed:", error);
    return false;
  }
}

/**
 * Get file metadata
 *
 * @param fileName - Path/name of the file in the bucket
 * @returns File metadata including size, contentType, timeCreated, etc.
 */
export async function gcsGetMetadata(fileName: string) {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    const [metadata] = await file.getMetadata();
    return metadata;
  } catch (error) {
    console.error("[GCS] Get metadata failed:", error);
    throw error;
  }
}

/**
 * List files in a directory
 *
 * @param prefix - Directory prefix (e.g., "users/123/")
 * @param options - Listing options
 * @returns Array of file names
 */
export async function gcsList(
  prefix?: string,
  options: {
    maxResults?: number;
    delimiter?: string;
  } = {}
): Promise<string[]> {
  try {
    const bucket = getBucket();

    const [files] = await bucket.getFiles({
      prefix,
      maxResults: options.maxResults,
      delimiter: options.delimiter,
    });

    return files.map((file) => file.name);
  } catch (error) {
    console.error("[GCS] List files failed:", error);
    throw error;
  }
}

/**
 * Copy a file within GCS
 *
 * @param sourceFileName - Source file path
 * @param destFileName - Destination file path
 */
export async function gcsCopy(sourceFileName: string, destFileName: string): Promise<void> {
  try {
    const bucket = getBucket();
    const sourceFile = bucket.file(sourceFileName);
    const destFile = bucket.file(destFileName);

    await sourceFile.copy(destFile);
    console.log(`[GCS] Copied ${sourceFileName} to ${destFileName}`);
  } catch (error) {
    console.error("[GCS] Copy failed:", error);
    throw error;
  }
}

/**
 * Move a file within GCS (copy then delete)
 *
 * @param sourceFileName - Source file path
 * @param destFileName - Destination file path
 */
export async function gcsMove(sourceFileName: string, destFileName: string): Promise<void> {
  try {
    await gcsCopy(sourceFileName, destFileName);
    await gcsDelete(sourceFileName);
    console.log(`[GCS] Moved ${sourceFileName} to ${destFileName}`);
  } catch (error) {
    console.error("[GCS] Move failed:", error);
    throw error;
  }
}

/**
 * Make a file public
 *
 * @param fileName - Path/name of the file in the bucket
 */
export async function gcsMakePublic(fileName: string): Promise<void> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    await file.makePublic();
    console.log(`[GCS] Made ${fileName} public`);
  } catch (error) {
    console.error("[GCS] Make public failed:", error);
    throw error;
  }
}

/**
 * Make a file private
 *
 * @param fileName - Path/name of the file in the bucket
 */
export async function gcsMakePrivate(fileName: string): Promise<void> {
  try {
    const bucket = getBucket();
    const file = bucket.file(fileName);

    await file.makePrivate();
    console.log(`[GCS] Made ${fileName} private`);
  } catch (error) {
    console.error("[GCS] Make private failed:", error);
    throw error;
  }
}
