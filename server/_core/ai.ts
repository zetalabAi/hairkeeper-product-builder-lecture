/**
 * AI Services Module (Vertex AI & Google Speech Only)
 *
 * 간소화된 AI 모듈 - Google Cloud AI만 사용합니다.
 */

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
// Image Generation (Vertex AI)
// ============================================

/**
 * 이미지 생성 옵션
 */
export type GenerateImageOptions = {
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
 * 이미지 생성 응답
 */
export type GenerateImageResponse = {
  url?: string;
  mimeType?: string;
};

/**
 * Vertex AI를 사용하여 이미지 생성
 *
 * @param options - 이미지 생성 옵션
 * @returns 생성된 이미지 URL
 */
export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  console.log(`[AI] Generating image with Vertex AI`);

  const vertexOptions: GenerateImageVertexOptions = {
    prompt: options.prompt,
    originalImages: options.originalImages,
    negativePrompt: options.negativePrompt,
    aspectRatio: options.aspectRatio,
    guidanceScale: options.guidanceScale,
    seed: options.seed,
  };

  return await generateImageVertexAI(vertexOptions);
}

/**
 * 기존 이미지 편집
 *
 * @param originalImageUrl - 원본 이미지 URL
 * @param prompt - 편집 프롬프트
 * @param options - 추가 옵션
 * @returns 편집된 이미지 URL
 */
export async function editImage(
  originalImageUrl: string,
  prompt: string,
  options: {
    negativePrompt?: string;
    guidanceScale?: number;
  } = {}
): Promise<GenerateImageResponse> {
  return generateImage({
    prompt,
    originalImages: [{ url: originalImageUrl }],
    negativePrompt: options.negativePrompt,
    guidanceScale: options.guidanceScale,
  });
}

// ============================================
// Voice Transcription (Google Speech)
// ============================================

/**
 * 음성 인식 옵션
 */
export type TranscribeOptions = {
  audioUrl: string;
  language?: string;
  prompt?: string;
  enableWordTimeOffsets?: boolean;
};

/**
 * 단어 정보 (타임스탬프)
 */
export type WordInfo = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
};

/**
 * 음성 인식 응답
 */
export type TranscriptionResponse = {
  text: string;
  language: string;
  confidence?: number;
  words?: WordInfo[];
};

/**
 * 음성 인식 에러
 */
export type TranscriptionError = {
  error: string;
  code: string;
  details?: string;
};

/**
 * Google Speech를 사용하여 음성 인식
 *
 * @param options - 음성 인식 옵션
 * @returns 인식 결과 또는 에러
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResponse | TranscriptionError> {
  console.log(`[AI] Transcribing audio with Google Speech`);

  const googleOptions: TranscribeOptionsGoogle = {
    audioUrl: options.audioUrl,
    language: options.language,
    prompt: options.prompt,
    enableWordTimeOffsets: options.enableWordTimeOffsets,
  };

  const result = await transcribeAudioGoogle(googleOptions);

  // Google Speech 응답을 통합 형식으로 변환
  if ("error" in result) {
    return result as TranscriptionError;
  }

  return {
    text: result.text,
    language: result.language,
    confidence: result.confidence,
    words: result.words
      ? result.words.map((word) => ({
          word: word.word,
          start: word.startTime,
          end: word.endTime,
          confidence: word.confidence,
        }))
      : undefined,
  };
}
