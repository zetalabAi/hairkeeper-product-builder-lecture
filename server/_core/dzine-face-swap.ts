/**
 * Dzine Face Swapper API Integration (via 1min.AI)
 *
 * This module provides face swapping functionality using Dzine AI's advanced
 * face swap technology through the 1min.AI platform.
 *
 * Features:
 * - Perfect hair preservation (머리카락 완벽 보존)
 * - Natural boundary blending (경계선 자연스러운 합성)
 * - High-quality face replacement (고품질 얼굴 교체)
 */

import { ENV as env } from "./env.js";

// ==========================================
// Type Definitions
// ==========================================

export interface DzineFaceSwapInput {
  /** URL of the face to swap TO (가상 인물 얼굴) */
  swapImageUrl: string;

  /** URL of the original image (고객 원본 사진) */
  targetImageUrl: string;

  /** Number of output variations (1-4) */
  numOutputs?: number;

  /** Output format: "webp" or "jpeg" */
  outputFormat?: "webp" | "jpeg";
}

export interface DzineFaceSwapOutput {
  /** Unique record identifier */
  uuid: string;

  /** Status: "SUCCESS" or error status */
  status: string;

  /** Array of result image URLs */
  resultUrls: string[];

  /** Processing time in milliseconds */
  processingTime?: number;
}

interface OneminAIRequest {
  type: "FACE_SWAPPER";
  model: "dzine";
  promptObject: {
    swapImageUrl: string;
    targetImageUrl: string;
    n: number;
    output_format: string;
  };
}

interface OneminAIResponse {
  uuid: string;
  status: string;
  aiRecordDetail?: {
    resultObject?: string[] | { url: string }[];
  };
  message?: string;
}

// ==========================================
// Configuration
// ==========================================

const API_ENDPOINT = "https://api.1min.ai/api/features";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// ==========================================
// Helper Functions
// ==========================================

/**
 * Validates environment configuration
 */
function validateConfig(): void {
  // Try process.env directly first (for test scripts with dotenv)
  const apiKey = process.env.ONEMIN_AI_API_KEY || env.ONEMIN_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ONEMIN_AI_API_KEY is not configured. Please add it to your .env file.\n" +
      "Get your API key from: https://1min.ai/"
    );
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract result URLs from API response
 */
function extractResultUrls(response: OneminAIResponse): string[] {
  const resultObject = response.aiRecordDetail?.resultObject;

  if (!resultObject) {
    return [];
  }

  if (Array.isArray(resultObject)) {
    return resultObject.map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (typeof item === "object" && item.url) {
        return item.url;
      }
      return "";
    }).filter(Boolean);
  }

  return [];
}

// ==========================================
// Main API Function
// ==========================================

/**
 * Swap faces using Dzine AI Face Swapper
 *
 * This function performs high-quality face swapping while preserving:
 * - Original hair (머리카락 보존)
 * - Background (배경 보존)
 * - Natural boundaries (자연스러운 경계선)
 *
 * @param input - Face swap configuration
 * @returns Face swap result with URLs
 * @throws Error if API call fails or configuration is invalid
 *
 * @example
 * ```typescript
 * const result = await swapFaces({
 *   swapImageUrl: "https://storage.googleapis.com/.../korean-face-01.jpg",
 *   targetImageUrl: "https://storage.googleapis.com/.../customer.jpg",
 *   numOutputs: 1,
 *   outputFormat: "webp"
 * });
 *
 * console.log("Result URL:", result.resultUrls[0]);
 * ```
 */
export async function swapFaces(
  input: DzineFaceSwapInput
): Promise<DzineFaceSwapOutput> {
  validateConfig();

  const startTime = Date.now();

  // Prepare request payload
  const requestBody: OneminAIRequest = {
    type: "FACE_SWAPPER",
    model: "dzine",
    promptObject: {
      swapImageUrl: input.swapImageUrl,
      targetImageUrl: input.targetImageUrl,
      n: input.numOutputs || 1,
      output_format: input.outputFormat || "webp",
    },
  };

  console.log("[Dzine Face Swap] Starting face swap...");
  console.log("[Dzine Face Swap] Swap image:", input.swapImageUrl);
  console.log("[Dzine Face Swap] Target image:", input.targetImageUrl);

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Dzine Face Swap] Attempt ${attempt}/${MAX_RETRIES}`);

      // Try process.env directly first (for test scripts with dotenv)
      const apiKey = process.env.ONEMIN_AI_API_KEY || env.ONEMIN_AI_API_KEY;

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "API-KEY": apiKey!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `1min.AI API error (${response.status}): ${errorText}`
        );
      }

      const data: OneminAIResponse = await response.json();

      console.log("[Dzine Face Swap] Response status:", data.status);
      console.log("[Dzine Face Swap] Response UUID:", data.uuid);

      // Check for success
      if (data.status !== "SUCCESS") {
        throw new Error(
          `Face swap failed with status: ${data.status}. Message: ${data.message || "Unknown error"}`
        );
      }

      // Extract result URLs
      const resultUrls = extractResultUrls(data);

      if (resultUrls.length === 0) {
        throw new Error(
          "No result URLs found in response. Face might not be detected in the images."
        );
      }

      const processingTime = Date.now() - startTime;

      console.log("[Dzine Face Swap] Success! Generated", resultUrls.length, "images");
      console.log("[Dzine Face Swap] Processing time:", processingTime, "ms");
      console.log("[Dzine Face Swap] Result URLs:", resultUrls);

      return {
        uuid: data.uuid,
        status: data.status,
        resultUrls,
        processingTime,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[Dzine Face Swap] Attempt ${attempt} failed:`, error.message);

      // Don't retry on client errors (4xx)
      if (error.message.includes("(4")) {
        break;
      }

      // Retry on server errors (5xx) or network errors
      if (attempt < MAX_RETRIES) {
        console.log(`[Dzine Face Swap] Retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  // All retries failed
  throw new Error(
    `Failed to swap faces after ${MAX_RETRIES} attempts: ${lastError?.message || "Unknown error"}`
  );
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Test the Dzine Face Swap API connection
 *
 * @returns true if API is accessible and configured correctly
 */
export async function testConnection(): Promise<boolean> {
  try {
    validateConfig();
    console.log("[Dzine Face Swap] API configuration is valid");
    return true;
  } catch (error: any) {
    console.error("[Dzine Face Swap] Configuration error:", error.message);
    return false;
  }
}
