/**
 * Storage Module (Google Cloud Storage Only)
 *
 * 간소화된 스토리지 모듈 - GCS만 사용합니다.
 */

import { gcsUpload, gcsGetSignedUrl, gcsDelete, gcsExists } from "./_core/gcs-storage";

/**
 * 파일 업로드
 *
 * @param relKey - 파일 경로 (예: "generated/image.png")
 * @param data - 파일 내용
 * @param contentType - MIME 타입
 * @returns 업로드된 파일의 키와 URL
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  console.log(`[Storage] Uploading: ${relKey}`);
  return gcsUpload(relKey, data, contentType, { public: true });
}

/**
 * 파일 URL 가져오기
 *
 * @param relKey - 파일 경로
 * @returns 파일의 키와 URL (Signed URL)
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  console.log(`[Storage] Getting URL for: ${relKey}`);
  const url = await gcsGetSignedUrl(relKey);
  return { key: relKey, url };
}

/**
 * 파일 삭제
 *
 * @param relKey - 파일 경로
 */
export async function storageDelete(relKey: string): Promise<void> {
  console.log(`[Storage] Deleting: ${relKey}`);
  await gcsDelete(relKey);
}

/**
 * 파일 존재 여부 확인
 *
 * @param relKey - 파일 경로
 * @returns 파일이 존재하면 true
 */
export async function storageExists(relKey: string): Promise<boolean> {
  return gcsExists(relKey);
}
