/**
 * Google Cloud Speech-to-Text
 *
 * Provides audio transcription using Google Cloud Speech-to-Text API.
 * This replaces the Manus FORGE Whisper API.
 */

import { SpeechClient } from "@google-cloud/speech";
import { ENV } from "./env";

let _speechClient: SpeechClient | null = null;

/**
 * Initialize Google Cloud Speech client
 * Lazily initialized on first use
 */
function getSpeechClient(): SpeechClient {
  if (!_speechClient) {
    if (!ENV.googleApplicationCredentials) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS not configured");
    }

    _speechClient = new SpeechClient({
      projectId: ENV.googleCloudProject,
      keyFilename: ENV.googleApplicationCredentials,
    });

    console.log("[Google Speech] Speech-to-Text client initialized");
  }

  return _speechClient;
}

/**
 * Transcription options
 */
export type TranscribeOptionsGoogle = {
  audioUrl: string;
  language?: string; // Language code (e.g., "en-US", "ko-KR", "ja-JP")
  prompt?: string; // Context hint for better accuracy
  enableWordTimeOffsets?: boolean; // Get timestamp for each word
  enableAutomaticPunctuation?: boolean; // Add punctuation automatically
  model?: "default" | "command_and_search" | "phone_call" | "video" | "medical_dictation";
};

/**
 * Word-level timing information
 */
export type WordInfo = {
  word: string;
  startTime: number; // Seconds
  endTime: number; // Seconds
  confidence: number; // 0-1
};

/**
 * Transcription response
 */
export type TranscriptionResponseGoogle = {
  text: string;
  language: string;
  confidence: number; // Overall confidence 0-1
  words?: WordInfo[]; // Word-level timing (if enableWordTimeOffsets=true)
};

/**
 * Transcription error
 */
export type TranscriptionErrorGoogle = {
  error: string;
  code:
    | "FILE_TOO_LARGE"
    | "INVALID_FORMAT"
    | "TRANSCRIPTION_FAILED"
    | "DOWNLOAD_FAILED"
    | "SERVICE_ERROR";
  details?: string;
};

/**
 * Convert Google Speech duration to seconds
 */
function durationToSeconds(duration: { seconds?: number | string; nanos?: number }): number {
  const seconds = typeof duration.seconds === "string" ? parseInt(duration.seconds) : duration.seconds || 0;
  const nanos = duration.nanos || 0;
  return seconds + nanos / 1e9;
}

/**
 * Transcribe audio using Google Cloud Speech-to-Text
 *
 * @param options - Transcription options
 * @returns Transcription result or error
 */
export async function transcribeAudioGoogle(
  options: TranscribeOptionsGoogle
): Promise<TranscriptionResponseGoogle | TranscriptionErrorGoogle> {
  try {
    // Step 1: Validate configuration
    if (!ENV.googleCloudProject) {
      return {
        error: "Google Cloud Speech-to-Text is not configured",
        code: "SERVICE_ERROR",
        details: "GOOGLE_CLOUD_PROJECT is not set",
      };
    }

    // Step 2: Download audio from URL
    let audioBuffer: Buffer;
    let mimeType: string;

    try {
      const response = await fetch(options.audioUrl);
      if (!response.ok) {
        return {
          error: "Failed to download audio file",
          code: "DOWNLOAD_FAILED",
          details: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      audioBuffer = Buffer.from(await response.arrayBuffer());
      mimeType = response.headers.get("content-type") || "audio/mpeg";

      // Check file size (10MB limit for synchronous recognition)
      const sizeMB = audioBuffer.length / (1024 * 1024);
      if (sizeMB > 10) {
        return {
          error: "Audio file exceeds maximum size limit for synchronous recognition",
          code: "FILE_TOO_LARGE",
          details: `File size is ${sizeMB.toFixed(2)}MB, maximum allowed is 10MB. Consider using asynchronous recognition for larger files.`,
        };
      }
    } catch (error) {
      return {
        error: "Failed to fetch audio file",
        code: "DOWNLOAD_FAILED",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Step 3: Determine audio encoding from MIME type
    let encoding: any = "LINEAR16"; // Default
    let sampleRateHertz = 16000; // Default

    if (mimeType.includes("webm")) {
      encoding = "WEBM_OPUS";
      sampleRateHertz = 48000;
    } else if (mimeType.includes("ogg")) {
      encoding = "OGG_OPUS";
      sampleRateHertz = 48000;
    } else if (mimeType.includes("flac")) {
      encoding = "FLAC";
    } else if (mimeType.includes("wav")) {
      encoding = "LINEAR16";
    } else if (mimeType.includes("mp3") || mimeType.includes("mpeg")) {
      encoding = "MP3";
    } else if (mimeType.includes("m4a") || mimeType.includes("mp4")) {
      encoding = "MP3"; // Google Speech treats M4A as MP3
    }

    // Step 4: Prepare recognition request
    const client = getSpeechClient();

    const request: any = {
      audio: {
        content: audioBuffer.toString("base64"),
      },
      config: {
        encoding,
        sampleRateHertz,
        languageCode: options.language || "en-US",
        enableWordTimeOffsets: options.enableWordTimeOffsets ?? false,
        enableAutomaticPunctuation: options.enableAutomaticPunctuation ?? true,
        model: options.model || "default",
      },
    };

    // Add speech context hints if prompt provided
    if (options.prompt) {
      request.config.speechContexts = [
        {
          phrases: [options.prompt],
        },
      ];
    }

    console.log(`[Google Speech] Transcribing audio (${sizeMB.toFixed(2)}MB, ${mimeType})`);

    // Step 5: Perform recognition
    const [response] = await client.recognize(request);

    if (!response.results || response.results.length === 0) {
      return {
        error: "No transcription results",
        code: "TRANSCRIPTION_FAILED",
        details: "The audio may be too short or contain no speech",
      };
    }

    // Step 6: Extract transcription and metadata
    const result = response.results[0];
    const alternative = result.alternatives?.[0];

    if (!alternative || !alternative.transcript) {
      return {
        error: "No transcript in response",
        code: "TRANSCRIPTION_FAILED",
        details: "Speech recognition returned empty transcript",
      };
    }

    const transcription: TranscriptionResponseGoogle = {
      text: alternative.transcript,
      language: options.language || "en-US",
      confidence: alternative.confidence || 0,
    };

    // Add word-level timing if requested
    if (options.enableWordTimeOffsets && alternative.words) {
      transcription.words = alternative.words.map((word) => ({
        word: word.word || "",
        startTime: word.startTime ? durationToSeconds(word.startTime) : 0,
        endTime: word.endTime ? durationToSeconds(word.endTime) : 0,
        confidence: word.confidence || 0,
      }));
    }

    console.log(`[Google Speech] Transcription successful: "${transcription.text.substring(0, 50)}..."`);

    return transcription;
  } catch (error) {
    console.error("[Google Speech] Transcription failed:", error);
    return {
      error: "Voice transcription failed",
      code: "SERVICE_ERROR",
      details: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Transcribe long audio file using asynchronous recognition
 * For audio files > 10MB or > 1 minute
 *
 * @param audioUrl - URL to the audio file (must be accessible from Google Cloud)
 * @param options - Transcription options
 * @returns Operation that can be polled for results
 */
export async function transcribeLongAudioGoogle(
  audioUrl: string,
  options: Omit<TranscribeOptionsGoogle, "audioUrl"> = {}
): Promise<any> {
  try {
    const client = getSpeechClient();

    const request: any = {
      audio: {
        uri: audioUrl, // Must be a gs:// URL (Google Cloud Storage)
      },
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: options.language || "en-US",
        enableWordTimeOffsets: options.enableWordTimeOffsets ?? false,
        enableAutomaticPunctuation: options.enableAutomaticPunctuation ?? true,
        model: options.model || "default",
      },
    };

    console.log("[Google Speech] Starting long audio transcription");

    // Start long-running operation
    const [operation] = await client.longRunningRecognize(request);

    // Wait for operation to complete
    const [response] = await operation.promise();

    // Process results similar to synchronous recognition
    if (!response.results || response.results.length === 0) {
      throw new Error("No transcription results");
    }

    // Combine all results into one transcript
    const fullTranscript = response.results
      .map((result) => result.alternatives?.[0]?.transcript || "")
      .join(" ");

    const avgConfidence =
      response.results.reduce(
        (sum, result) => sum + (result.alternatives?.[0]?.confidence || 0),
        0
      ) / response.results.length;

    return {
      text: fullTranscript,
      language: options.language || "en-US",
      confidence: avgConfidence,
    };
  } catch (error) {
    console.error("[Google Speech] Long audio transcription failed:", error);
    throw error;
  }
}

/**
 * Get supported languages for Speech-to-Text
 */
export function getSupportedLanguages(): string[] {
  return [
    "en-US", // English (US)
    "en-GB", // English (UK)
    "ko-KR", // Korean
    "ja-JP", // Japanese
    "zh-CN", // Chinese (Simplified)
    "zh-TW", // Chinese (Traditional)
    "es-ES", // Spanish (Spain)
    "es-US", // Spanish (US)
    "fr-FR", // French
    "de-DE", // German
    "it-IT", // Italian
    "pt-BR", // Portuguese (Brazil)
    "ru-RU", // Russian
    "ar-SA", // Arabic
    "hi-IN", // Hindi
    "th-TH", // Thai
    "vi-VN", // Vietnamese
    "id-ID", // Indonesian
    "nl-NL", // Dutch
    "pl-PL", // Polish
    "tr-TR", // Turkish
    "sv-SE", // Swedish
    // ... many more languages supported
  ];
}
