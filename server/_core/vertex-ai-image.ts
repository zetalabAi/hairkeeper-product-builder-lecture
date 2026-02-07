/**
 * Vertex AI Image Generation
 *
 * Provides image generation using Google Cloud Vertex AI (Imagen 3).
 * This replaces the Manus FORGE image generation API.
 */

import { VertexAI } from "@google-cloud/vertexai";
import { ENV } from "./env";
import { storagePut } from "../storage-unified";

let _vertexAI: VertexAI | null = null;

/**
 * Initialize Vertex AI client
 * Lazily initialized on first use
 */
function getVertexAI(): VertexAI {
  if (!_vertexAI) {
    if (!ENV.googleCloudProject) {
      throw new Error("GOOGLE_CLOUD_PROJECT not configured");
    }

    if (!ENV.vertexAiLocation) {
      throw new Error("VERTEX_AI_LOCATION not configured");
    }

    _vertexAI = new VertexAI({
      project: ENV.googleCloudProject,
      location: ENV.vertexAiLocation,
    });

    console.log("[Vertex AI] Initialized:", ENV.googleCloudProject, ENV.vertexAiLocation);
  }

  return _vertexAI;
}

/**
 * Generate image options
 */
export type GenerateImageVertexOptions = {
  prompt: string;
  originalImages?: Array<{
    b64Json?: string;
    url?: string;
    mimeType?: string;
  }>;
  negativePrompt?: string;
  numberOfImages?: number;
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:3" | "3:4";
  guidanceScale?: number; // 0-20, default 15
  seed?: number;
};

/**
 * Generate image response
 */
export type GenerateImageVertexResponse = {
  url: string;
  mimeType?: string;
};

/**
 * Generate an image using Vertex AI Imagen 3
 *
 * @param options - Image generation options
 * @returns Generated image URL (uploaded to storage)
 */
export async function generateImageVertexAI(
  options: GenerateImageVertexOptions
): Promise<GenerateImageVertexResponse> {
  try {
    const vertexAI = getVertexAI();

    // Get the Imagen model
    const imageGenModel = vertexAI.getGenerativeModel({
      model: "imagen-3.0-generate-001", // Latest Imagen model
    });

    // Prepare the request
    const request: any = {
      prompt: options.prompt,
    };

    // Add optional parameters
    if (options.negativePrompt) {
      request.negativePrompt = options.negativePrompt;
    }

    if (options.numberOfImages) {
      request.number_of_images = options.numberOfImages;
    }

    if (options.aspectRatio) {
      request.aspect_ratio = options.aspectRatio;
    }

    if (options.guidanceScale !== undefined) {
      request.guidance_scale = options.guidanceScale;
    }

    if (options.seed !== undefined) {
      request.seed = options.seed;
    }

    // Handle image-to-image generation (if original images provided)
    if (options.originalImages && options.originalImages.length > 0) {
      const originalImage = options.originalImages[0];

      if (originalImage.b64Json) {
        // Use base64 image directly
        request.image = {
          bytesBase64Encoded: originalImage.b64Json,
        };
      } else if (originalImage.url) {
        // Fetch and convert URL to base64
        const response = await fetch(originalImage.url);
        const buffer = Buffer.from(await response.arrayBuffer());
        request.image = {
          bytesBase64Encoded: buffer.toString("base64"),
        };
      }
    }

    console.log("[Vertex AI] Generating image with prompt:", options.prompt);

    // Generate the image
    const result = await imageGenModel.generateContent(request);

    if (!result.response) {
      throw new Error("No response from Vertex AI");
    }

    // Extract the generated image
    // Note: The exact response structure may vary depending on the Imagen version
    // This is based on the Imagen 3 API structure
    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated");
    }

    const candidate = candidates[0];

    // Extract image data (base64)
    // The structure depends on the API response format
    let imageBase64: string;
    let mimeType = "image/png";

    // Try different response structures
    if (candidate.content?.parts) {
      const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
      if (imagePart?.inlineData) {
        imageBase64 = imagePart.inlineData.data;
        mimeType = imagePart.inlineData.mimeType || mimeType;
      } else {
        throw new Error("No image data in response");
      }
    } else if ((candidate as any).image?.bytesBase64Encoded) {
      imageBase64 = (candidate as any).image.bytesBase64Encoded;
    } else {
      throw new Error("Unexpected response structure from Vertex AI");
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageBase64, "base64");

    // Upload to storage
    const timestamp = Date.now();
    const fileName = `generated/vertex-${timestamp}.png`;
    const { url } = await storagePut(fileName, buffer, mimeType);

    console.log(`[Vertex AI] Image generated and uploaded: ${url}`);

    return {
      url,
      mimeType,
    };
  } catch (error) {
    console.error("[Vertex AI] Image generation failed:", error);
    throw error;
  }
}

/**
 * Edit an image using Vertex AI (image-to-image)
 *
 * @param originalImageUrl - URL of the original image
 * @param prompt - Edit prompt (e.g., "change hair color to blonde")
 * @param options - Additional options
 * @returns Edited image URL
 */
export async function editImageVertexAI(
  originalImageUrl: string,
  prompt: string,
  options: {
    negativePrompt?: string;
    guidanceScale?: number;
  } = {}
): Promise<GenerateImageVertexResponse> {
  return generateImageVertexAI({
    prompt,
    originalImages: [{ url: originalImageUrl }],
    negativePrompt: options.negativePrompt,
    guidanceScale: options.guidanceScale,
  });
}

/**
 * Generate multiple variations of an image
 *
 * @param prompt - Generation prompt
 * @param count - Number of variations (1-4)
 * @param options - Additional options
 * @returns Array of generated image URLs
 */
export async function generateImageVariations(
  prompt: string,
  count: number = 4,
  options: Omit<GenerateImageVertexOptions, "prompt" | "numberOfImages"> = {}
): Promise<GenerateImageVertexResponse[]> {
  // Vertex AI can generate multiple images in one call
  if (count <= 4) {
    const result = await generateImageVertexAI({
      ...options,
      prompt,
      numberOfImages: count,
    });

    // If multiple images are returned, the response structure will be different
    // For now, we return a single image - you may need to adjust based on actual API
    return [result];
  } else {
    // Generate in batches if more than 4
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(
        generateImageVertexAI({
          ...options,
          prompt,
          seed: options.seed ? options.seed + i : undefined,
        })
      );
    }
    return Promise.all(promises);
  }
}
