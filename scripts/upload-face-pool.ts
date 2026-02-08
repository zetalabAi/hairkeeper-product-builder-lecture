/**
 * Face Pool Upload Script
 *
 * 로컬 폴더의 얼굴 이미지들을 자동으로:
 * 1. Google Cloud Storage에 업로드
 * 2. Firestore facePool 컬렉션에 메타데이터 저장
 * 3. 공개 URL 생성
 *
 * 사용법:
 *   1. faces/ 폴더에 이미지 파일 준비:
 *      - faces/korean-male-modern-01.jpg
 *      - faces/korean-female-modern-01.jpg
 *      등등
 *
 *   2. 파일명 형식: {nationality}-{gender}-{style}-{number}.jpg
 *      예: korea-male-modern-01.jpg
 *          korea-female-elegant-02.jpg
 *          japan-male-casual-01.jpg
 *
 *   3. 실행: npx tsx scripts/upload-face-pool.ts
 */

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { storagePut } from "../server/storage";
import { firestoreCreateFace } from "../server/_core/firestore";

// ==========================================
// Configuration
// ==========================================

const FACES_DIR = "./faces"; // 얼굴 이미지가 있는 로컬 폴더
const GCS_PREFIX = "face-pool"; // GCS에 저장할 경로 prefix

// ==========================================
// Helper Functions
// ==========================================

/**
 * 파일명에서 메타데이터 추출
 * 예: "korea-male-modern-01.jpg" -> { nationality: "korea", gender: "male", style: "modern", number: "01" }
 */
function parseFileName(fileName: string): {
  nationality: "korea" | "japan";
  gender: "male" | "female";
  style: string;
  number: string;
} | null {
  const baseName = path.basename(fileName, path.extname(fileName));
  const parts = baseName.split("-");

  if (parts.length < 4) {
    console.warn(`⚠️  Invalid file name format: ${fileName}`);
    console.warn(`   Expected format: {nationality}-{gender}-{style}-{number}.jpg`);
    return null;
  }

  const [nationality, gender, style, number] = parts;

  // Validate nationality
  if (nationality !== "korea" && nationality !== "japan") {
    console.warn(`⚠️  Invalid nationality: ${nationality} (must be "korea" or "japan")`);
    return null;
  }

  // Validate gender
  if (gender !== "male" && gender !== "female") {
    console.warn(`⚠️  Invalid gender: ${gender} (must be "male" or "female")`);
    return null;
  }

  return {
    nationality: nationality as "korea" | "japan",
    gender: gender as "male" | "female",
    style,
    number,
  };
}

/**
 * 이미지 파일을 GCS에 업로드하고 Firestore에 메타데이터 저장
 */
async function uploadFaceImage(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  const metadata = parseFileName(fileName);

  if (!metadata) {
    console.error(`❌ Skipping ${fileName} (invalid format)`);
    return;
  }

  try {
    console.log(`\n📤 Uploading: ${fileName}`);
    console.log(`   Nationality: ${metadata.nationality}`);
    console.log(`   Gender: ${metadata.gender}`);
    console.log(`   Style: ${metadata.style}`);

    // Step 1: Read image file
    const imageBuffer = fs.readFileSync(filePath);
    const fileExt = path.extname(fileName);
    const contentType = fileExt === ".jpg" || fileExt === ".jpeg" ? "image/jpeg" : "image/png";

    console.log(`   File size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

    // Step 2: Upload to GCS
    const gcsKey = `${GCS_PREFIX}/${metadata.nationality}/${metadata.gender}/${fileName}`;
    const uploadResult = await storagePut(gcsKey, imageBuffer, contentType);

    console.log(`   ✅ Uploaded to GCS: ${gcsKey}`);
    console.log(`   🌐 Public URL: ${uploadResult.url}`);

    // Step 3: Save metadata to Firestore
    const faceId = `${metadata.nationality}-${metadata.gender}-${metadata.style}-${metadata.number}`;

    await firestoreCreateFace({
      id: faceId,
      imageUrl: uploadResult.url,
      nationality: metadata.nationality,
      gender: metadata.gender,
      style: metadata.style,
      faceType: null,
      embedding: null,
      isActive: true,
      version: "1.0",
    });

    console.log(`   ✅ Saved to Firestore: facePool/${faceId}`);
    console.log(`   🎉 Success!`);
  } catch (error: any) {
    console.error(`   ❌ Error uploading ${fileName}:`, error.message);
    throw error;
  }
}

// ==========================================
// Main Function
// ==========================================

async function main() {
  console.log("=================================================");
  console.log("📸 Face Pool Upload Script");
  console.log("=================================================\n");

  // Step 1: Check if faces directory exists
  if (!fs.existsSync(FACES_DIR)) {
    console.error(`❌ Faces directory not found: ${FACES_DIR}`);
    console.error("");
    console.error("Please create the directory and add face images:");
    console.error("   mkdir faces");
    console.error("   # Add images to faces/ folder");
    console.error("");
    console.error("File naming format:");
    console.error("   {nationality}-{gender}-{style}-{number}.jpg");
    console.error("");
    console.error("Examples:");
    console.error("   faces/korea-male-modern-01.jpg");
    console.error("   faces/korea-female-elegant-01.jpg");
    console.error("   faces/japan-male-casual-01.jpg");
    console.error("");
    process.exit(1);
  }

  // Step 2: Get all image files
  const files = fs.readdirSync(FACES_DIR).filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return ext === ".jpg" || ext === ".jpeg" || ext === ".png";
  });

  if (files.length === 0) {
    console.error("❌ No image files found in faces/ directory");
    console.error("");
    console.error("Please add face images with the correct naming format:");
    console.error("   {nationality}-{gender}-{style}-{number}.jpg");
    console.error("");
    process.exit(1);
  }

  console.log(`📋 Found ${files.length} image(s) to upload:\n`);
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log("");

  // Step 3: Confirm before upload
  console.log("⚠️  This will upload all images to GCS and create Firestore records.");
  console.log("   Make sure your Firebase credentials are configured correctly.");
  console.log("");

  // Step 4: Upload each image
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(FACES_DIR, file);

    try {
      await uploadFaceImage(filePath);
      successCount++;
    } catch (error) {
      errorCount++;
    }
  }

  // Step 5: Summary
  console.log("");
  console.log("=================================================");
  console.log("📊 Upload Summary");
  console.log("=================================================");
  console.log(`   Total files: ${files.length}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log("");

  if (errorCount === 0) {
    console.log("🎉 All images uploaded successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("   1. Verify images in Firebase Console:");
    console.log("      - Storage: https://console.firebase.google.com/project/_/storage");
    console.log("      - Firestore: https://console.firebase.google.com/project/_/firestore");
    console.log("   2. Test the getFacePool API");
    console.log("   3. Test face swap with real images");
  } else {
    console.error("⚠️  Some uploads failed. Please check the errors above.");
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
