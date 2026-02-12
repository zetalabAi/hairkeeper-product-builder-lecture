/**
 * Dzine AI Direct API Integration
 *
 * This module provides face swapping functionality using Dzine AI's direct API.
 *
 * Process:
 * 1. Face-Detect Stage: Detect faces in both source and target images
 * 2. Face-Select Stage: Select the faces to swap
 * 3. Face-Swap Stage: Perform the actual face swap
 * 4. Poll task status using GET /get_task_progress/{task_id}
 */

import { ENV as env } from "./env.js";

// ==========================================
// Type Definitions
// ==========================================

interface FaceCoordinate {
  bbox: [number, number, number, number];
  kps: [number, number][];
}

interface FaceDetectResponse {
  code: number;
  msg: string;
  data: {
    file_path: string;
    face_list: FaceCoordinate[];
  };
}

interface FaceSwapResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
  };
}

interface TaskProgressResponse {
  code: number;
  msg: string;
  data: {
    task_id: string;
    status: string; // "processing" | "succeeded" | "succeed" | "failed"
    error_reason?: string;
    generate_result_slots?: string[];
  };
}

export interface DzineFaceSwapInput {
  /** URL of the face to swap TO (가상 인물 얼굴 - source) */
  sourceFaceUrl: string;

  /** URL of the original image (고객 원본 사진 - target) */
  targetImageUrl: string;

  /** Output format: "webp" or "jpeg" */
  outputFormat?: "webp" | "jpeg";
}

export interface DzineFaceSwapOutput {
  /** Task ID for tracking */
  taskId: string;

  /** Array of result image URLs */
  resultUrls: string[];

  /** Processing time in milliseconds */
  processingTime: number;
}

// ==========================================
// Configuration
// ==========================================

const BASE_URL = "https://papi.dzine.ai/openapi/v1";
const MAX_POLL_ATTEMPTS = 60; // 60 attempts
const POLL_INTERVAL_MS = 2000; // 2 seconds
const REQUEST_TIMEOUT_MS = {
  detect: 60000,
  create: 60000,
  poll: 15000,
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Validates environment configuration
 */
function validateConfig(): void {
  const apiKey = process.env.DZINE_AI_API_KEY || env.DZINE_AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "DZINE_AI_API_KEY is not configured. Please add it to your .env file."
    );
  }
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  return process.env.DZINE_AI_API_KEY || env.DZINE_AI_API_KEY || "";
}

/**
 * Sleep utility for polling delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with a hard timeout to avoid hanging requests.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==========================================
// API Functions
// ==========================================

/**
 * Step 1: Detect faces in an image
 */
async function detectFaces(imageUrl: string): Promise<FaceCoordinate[]> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/face_detect`;

  console.log("[Dzine Direct] Detecting faces in:", imageUrl);

  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: [
          {
            url: imageUrl,
          },
        ],
      }),
    },
    REQUEST_TIMEOUT_MS.detect
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Dzine face detect failed (${response.status}): ${errorText}`
    );
  }

  const data: FaceDetectResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`Face detection failed: ${data.msg}`);
  }

  if (!data.data.face_list || data.data.face_list.length === 0) {
    throw new Error("No faces detected in the image");
  }

  console.log("[Dzine Direct] Detected", data.data.face_list.length, "face(s)");

  return data.data.face_list;
}

/**
 * Step 2: Create face swap task
 */
async function createFaceSwapTask(
  sourceFaceUrl: string,
  targetImageUrl: string,
  sourceFaceCoordinate: FaceCoordinate,
  targetFaceCoordinate: FaceCoordinate,
  outputFormat: "webp" | "jpeg" = "webp"
): Promise<string> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/create_task_face_swap`;

  console.log("[Dzine Direct] Creating face swap task...");

  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Dzine API: source=원본사진, dest=교체될얼굴
        source_face_image: targetImageUrl,        // 고객 원본 사진
        dest_face_image: sourceFaceUrl,           // 가상 인물 얼굴
        source_face_coordinate: targetFaceCoordinate,  // 고객 사진 좌표
        dest_face_coordinate: sourceFaceCoordinate,    // 가상 인물 좌표
        generate_slots: [1, 1, 1, 1], // Generate all 4 variations
        output_format: outputFormat,
        // NOTE: Dzine API does not support quality/priority fields yet
        // Keeping parameters for future use when API supports them
      }),
    },
    REQUEST_TIMEOUT_MS.create
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Dzine face swap task creation failed (${response.status}): ${errorText}`
    );
  }

  const data: FaceSwapResponse = await response.json();

  if (data.code !== 200) {
    throw new Error(`Face swap task creation failed: ${data.msg}`);
  }

  console.log("[Dzine Direct] Task created:", data.data.task_id);

  return data.data.task_id;
}

/**
 * Step 3: Poll task status until completion
 * IMPORTANT: Uses GET request with task_id in URL path
 */
async function pollTaskStatus(taskId: string): Promise<string[]> {
  const apiKey = getApiKey();
  // Use GET with task_id in URL path
  const url = `${BASE_URL}/get_task_progress/${taskId}`;

  console.log("[Dzine Direct] Polling task status:", taskId);

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    try {
      // GET request (not POST!)
      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: {
            "Authorization": apiKey,
          },
        },
        REQUEST_TIMEOUT_MS.poll
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Dzine Direct] Poll attempt ${attempt} failed:`, errorText);

        if (attempt < MAX_POLL_ATTEMPTS) {
          await sleep(POLL_INTERVAL_MS);
          continue;
        }

        throw new Error(
          `Failed to poll task status (${response.status}): ${errorText}`
        );
      }

      const data: TaskProgressResponse = await response.json();

      if (data.code !== 200) {
        throw new Error(`Task status check failed: ${data.msg}`);
      }

      console.log(`[Dzine Direct] Task status (attempt ${attempt}/${MAX_POLL_ATTEMPTS}):`, data.data.status);

      // Check for success (handle both "succeeded" and "succeed")
      if (data.data.status === "succeeded" || data.data.status === "succeed") {
        if (!data.data.generate_result_slots || data.data.generate_result_slots.length === 0) {
          throw new Error("Task succeeded but no result URLs returned");
        }

        console.log("[Dzine Direct] Task completed! Result URLs:", data.data.generate_result_slots);
        return data.data.generate_result_slots;
      }

      if (data.data.status === "failed") {
        throw new Error(`Face swap task failed: ${data.data.error_reason || "Unknown error"}`);
      }

      // Status is "processing", wait and retry
      if (attempt < MAX_POLL_ATTEMPTS) {
        await sleep(POLL_INTERVAL_MS);
      }
    } catch (error: any) {
      console.error(`[Dzine Direct] Poll attempt ${attempt} error:`, error.message);

      if (attempt >= MAX_POLL_ATTEMPTS) {
        throw error;
      }

      await sleep(POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    `Task did not complete after ${MAX_POLL_ATTEMPTS} attempts (${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s)`
  );
}

// ==========================================
// Main API Function
// ==========================================

/**
 * Swap faces using Dzine AI Direct API
 *
 * This function performs high-quality face swapping in 4 stages:
 * 1. Detect faces in source and target images
 * 2. Select the first face from each image
 * 3. Create face swap task
 * 4. Poll for results using GET /get_task_progress/{task_id}
 *
 * @param input - Face swap configuration
 * @returns Face swap result with URLs
 * @throws Error if API call fails or configuration is invalid
 */
export async function swapFaces(
  input: DzineFaceSwapInput
): Promise<DzineFaceSwapOutput> {
  validateConfig();

  const startTime = Date.now();

  console.log("[Dzine Direct] Starting face swap...");
  console.log("[Dzine Direct] Source face:", input.sourceFaceUrl);
  console.log("[Dzine Direct] Target image:", input.targetImageUrl);

  try {
    // Step 1: Detect faces in source image (face pool face)
    console.log("[Dzine Direct] Step 1: Detecting source face...");
    const sourceFaces = await detectFaces(input.sourceFaceUrl);
    const sourceFaceCoordinate = sourceFaces[0]; // Use first detected face

    // Step 2: Detect faces in target image (customer's photo)
    console.log("[Dzine Direct] Step 2: Detecting target face...");
    const targetFaces = await detectFaces(input.targetImageUrl);
    const targetFaceCoordinate = targetFaces[0]; // Use first detected face

    // Step 3: Create face swap task
    console.log("[Dzine Direct] Step 3: Creating face swap task...");
    const taskId = await createFaceSwapTask(
      input.sourceFaceUrl,
      input.targetImageUrl,
      sourceFaceCoordinate,
      targetFaceCoordinate,
      input.outputFormat || "webp"
    );

    // Step 4: Poll for results using GET request
    console.log("[Dzine Direct] Step 4: Waiting for results...");
    const resultUrls = await pollTaskStatus(taskId);

    const processingTime = Date.now() - startTime;

    console.log("[Dzine Direct] Success! Generated", resultUrls.length, "images");
    console.log("[Dzine Direct] Processing time:", processingTime, "ms");

    return {
      taskId,
      resultUrls,
      processingTime,
    };
  } catch (error: any) {
    console.error("[Dzine Direct] Face swap failed:", error.message);
    throw error;
  }
}

/**
 * Test the Dzine Direct API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    validateConfig();
    console.log("[Dzine Direct] API configuration is valid");
    return true;
  } catch (error: any) {
    console.error("[Dzine Direct] Configuration error:", error.message);
    return false;
  }
}
