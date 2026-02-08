import { Platform } from "react-native";

/**
 * Upload local image to server storage and return public URL
 * This function should be called from a component that has access to trpc hooks
 */
export async function prepareImageForUpload(localUri: string): Promise<{
  base64Data: string;
  filename: string;
}> {
  let base64: string;

  if (Platform.OS === "web") {
    // Web platform: Use fetch to get blob, then convert to base64
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Convert blob to base64
    base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // Native platform: Use expo-file-system
    const FileSystem = require("expo-file-system/legacy");
    base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: "base64",
    });
  }

  // Get filename from URI
  const filename = localUri.split("/").pop() || `upload_${Date.now()}.jpg`;

  return {
    base64Data: base64,
    filename,
  };
}
