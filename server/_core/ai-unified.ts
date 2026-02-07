/**
 * Unified AI Interface
 *
 * Provides a single interface for AI operations that can use either
 * Manus FORGE or Google Cloud AI services based on the AI_BACKEND env var.
 *
 * Feature flag: AI_BACKEND=forge|vertex
 *
 * This allows for gradual migration and easy rollback if issues occur.
 */

import { ENV } from "./env";
import {
  generateImage as forgeGenerateImage,
  type GenerateImageOptions as ForgeGenerateImageOptions,
  type GenerateImageResponse as ForgeGenerateImageResponse,
} from "./imageGeneration";
import {
  transcribeAudio as forgeTranscribeAudio,
  type TranscribeOptions as ForgeTranscribeOptions,
  type TranscriptionResponse as ForgeTranscriptionResponse,
  type TranscriptionError as ForgeTranscriptionError,
} from "./voiceTranscription";
import {
  generateImageVertexAI,
  type GenerateImageVertexOptions,
  type GenerateImageVertexResponse,
} from "./vertex-ai-image";
import {
  transcribeAudioGoogle,
  type TranscribeOptionsGoogle,
  type TranscriptionResponseGoogle,
  type TranscriptionErrorGoogle,
} from "./google-speech";

// ============================================
// Image Generation
// ============================================

/**
 * Unified image generation options
 * Compatible with both FORGE and Vertex AI
 */
export type UnifiedGenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "9:16" | "16:9" | "4:3" | "3:4";
  guidanceScale?: number;
  seed?: number;
};

/**
 * Unified image generation response
 */
export type UnifiedGenerateImageResponse = {
  url?: string;
  mimeType?: string;
};

/**
 * Generate an image using the configured AI backend
 *
 * @param options - Image generation options
 * @returns Generated image URL
 */
export async function generateImage(
  options: UnifiedGenerateImageOptions
): Promise<UnifiedGenerateImageResponse> {
  const backend = ENV.aiBackend;

  console.log(`[AI Unified] Using ${backend} backend for image generation`);

  if (backend === "vertex") {
    // Use Google Cloud Vertex AI
    const vertexOptions: GenerateImageVertexOptions = {
      prompt: options.prompt,
      originalImages: options.originalImages,
      negativePrompt: options.negativePrompt,
      aspectRatio: options.aspectRatio,
      guidanceScale: options.guidanceScale,
      seed: options.seed,
    };

    const result = await generateImageVertexAI(vertexOptions);
    return {
      url: result.url,
      mimeType: result.mimeType,
    };
  } else {
    // Use Manus FORGE (default)
    const forgeOptions: ForgeGenerateImageOptions = {
      prompt: options.prompt,
      originalImages: options.originalImages,
    };

    const result = await forgeGenerateImage(forgeOptions);
    return {
      url: result.url,
    };
  }
}

/**
 * Edit an existing image
 *
 * @param originalImageUrl - URL of the original image
 * @param prompt - Edit prompt
 * @param options - Additional options
 * @returns Edited image URL
 */
export async function editImage(
  originalImageUrl: string,
  prompt: string,
  options: {
    negativePrompt?: string;
    guidanceScale?: number;
  } = {}
): Promise<UnifiedGenerateImageResponse> {
  return generateImage({
    prompt,
    originalImages: [{ url: originalImageUrl }],
    negativePrompt: options.negativePrompt,
    guidanceScale: options.guidanceScale,
  });
}

// ============================================
// Voice Transcription
// ============================================

/**
 * Unified transcription options
 * Compatible with both FORGE Whisper and Google Speech
 */
export type UnifiedTranscribeOptions = {
  audioUrl: string;
  language?: string;
  prompt?: string;
  enableWordTimeOffsets?: boolean;
};

/**
 * Unified word info (for word-level timing)
 */
export type UnifiedWordInfo = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
};

/**
 * Unified transcription response
 */
export type UnifiedTranscriptionResponse = {
  text: string;
  language: string;
  confidence?: number;
  words?: UnifiedWordInfo[];
};

/**
 * Unified transcription error
 */
export type UnifiedTranscriptionError = {
  error: string;
  code: string;
  details?: string;
};

/**
 * Convert FORGE Whisper response to unified format
 */
function convertForgeToUnified(
  response: ForgeTranscriptionResponse | ForgeTranscriptionError
): UnifiedTranscriptionResponse | UnifiedTranscriptionError {
  if ("error" in response) {
    return response as UnifiedTranscriptionError;
  }

  return {
    text: response.text,
    language: response.language,
    confidence: undefined, // FORGE doesn't provide confidence
    words: response.segments
      ? response.segments.map((segment) => ({
          word: segment.text,
          start: segment.start,
          end: segment.end,
          confidence: undefined,
        }))
      : undefined,
  };
}

/**
 * Convert Google Speech response to unified format
 */
function convertGoogleToUnified(
  response: TranscriptionResponseGoogle | TranscriptionErrorGoogle
): UnifiedTranscriptionResponse | UnifiedTranscriptionError {
  if ("error" in response) {
    return response as UnifiedTranscriptionError;
  }

  return {
    text: response.text,
    language: response.language,
    confidence: response.confidence,
    words: response.words
      ? response.words.map((word) => ({
          word: word.word,
          start: word.startTime,
          end: word.endTime,
          confidence: word.confidence,
        }))
      : undefined,
  };
}

/**
 * Transcribe audio using the configured AI backend
 *
 * @param options - Transcription options
 * @returns Transcription result or error
 */
export async function transcribeAudio(
  options: UnifiedTranscribeOptions
): Promise<UnifiedTranscriptionResponse | UnifiedTranscriptionError> {
  const backend = ENV.aiBackend;

  console.log(`[AI Unified] Using ${backend} backend for audio transcription`);

  if (backend === "vertex") {
    // Use Google Cloud Speech-to-Text
    const googleOptions: TranscribeOptionsGoogle = {
      audioUrl: options.audioUrl,
      language: options.language,
      prompt: options.prompt,
      enableWordTimeOffsets: options.enableWordTimeOffsets,
    };

    const result = await transcribeAudioGoogle(googleOptions);
    return convertGoogleToUnified(result);
  } else {
    // Use Manus FORGE Whisper (default)
    const forgeOptions: ForgeTranscribeOptions = {
      audioUrl: options.audioUrl,
      language: options.language,
      prompt: options.prompt,
    };

    const result = await forgeTranscribeAudio(forgeOptions);
    return convertForgeToUnified(result);
  }
}

// ============================================
// Backend Info
// ============================================

/**
 * Get current AI backend
 */
export function getAIBackend(): "forge" | "vertex" {
  return ENV.aiBackend;
}

/**
 * Check if using Vertex AI backend
 */
export function isUsingVertexAI(): boolean {
  return ENV.aiBackend === "vertex";
}

/**
 * Check if using FORGE backend
 */
export function isUsingFORGE(): boolean {
  return ENV.aiBackend === "forge";
}

/**
 * Get backend capabilities
 */
export function getBackendCapabilities() {
  const backend = ENV.aiBackend;

  if (backend === "vertex") {
    return {
      imageGeneration: {
        supported: true,
        models: ["imagen-3.0"],
        features: [
          "text-to-image",
          "image-to-image",
          "negative-prompts",
          "aspect-ratio-control",
          "guidance-scale",
        ],
      },
      voiceTranscription: {
        supported: true,
        models: ["default", "command_and_search", "phone_call", "video"],
        features: ["word-timestamps", "automatic-punctuation", "speaker-diarization"],
      },
    };
  } else {
    return {
      imageGeneration: {
        supported: true,
        models: ["forge-default"],
        features: ["text-to-image", "image-to-image"],
      },
      voiceTranscription: {
        supported: true,
        models: ["whisper-1"],
        features: ["word-timestamps", "verbose-json"],
      },
    };
  }
}
