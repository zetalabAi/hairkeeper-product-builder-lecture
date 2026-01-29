import * as FileSystem from "expo-file-system/legacy";

/**
 * Upload local image to server storage and return public URL
 * This function should be called from a component that has access to trpc hooks
 */
export async function prepareImageForUpload(localUri: string): Promise<{
  base64Data: string;
  filename: string;
}> {
  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: "base64",
  });

  // Get filename from URI
  const filename = localUri.split("/").pop() || `upload_${Date.now()}.jpg`;

  return {
    base64Data: base64,
    filename,
  };
}
