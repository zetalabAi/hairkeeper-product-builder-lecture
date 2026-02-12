import JSZip from "jszip";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",")[1] || "";
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

export async function downloadResultsAsZip(imageUrls: string[], projectId: string): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error("No images provided");
  }

  try {
    const zip = new JSZip();

    const fetchTasks = imageUrls.map(async (url, index) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${url}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `result_${index + 1}.jpg`;
      zip.file(fileName, arrayBuffer);
    });

    await Promise.all(fetchTasks);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipFileName = `hairkeeper_${projectId}.zip`;

    if (Platform.OS === "web") {
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = zipFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      return;
    }

    const base64 = await blobToBase64(zipBlob);
    const fileUri = FileSystem.cacheDirectory + zipFileName;

    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(fileUri);
  } catch (error) {
    console.error("[downloadResultsAsZip] Error:", error);
    throw error;
  }
}
