/**
 * Face Pool Upload Script (Korea)
 *
 * Uploads local face images to GCS and registers metadata in Firestore.
 */

import dotenv from "dotenv";
dotenv.config();

import fs from "fs/promises";
import path from "path";
import { storagePut } from "../storage";
import { firestoreCreateFace } from "../_core/firestore";

const ROOT_DIR = path.resolve(__dirname, "../..");
const FACE_POOL_DIR = path.join(ROOT_DIR, "face-pool-temp", "korea");
const GCS_PREFIX = "faces/korea";

const VALID_GENDERS = ["male", "female"] as const;
const VALID_AGE_GROUPS = ["20s", "30s", "40s", "50s", "60s"] as const;
const VALID_SKIN_TONES = ["light", "medium", "dark"] as const;

type Gender = (typeof VALID_GENDERS)[number];
type AgeGroup = (typeof VALID_AGE_GROUPS)[number];
type SkinTone = (typeof VALID_SKIN_TONES)[number];

type ParsedFile = {
  gender: Gender;
  ageGroup: AgeGroup;
  skinTone: SkinTone;
  index: string;
};

function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ext === ".jpg" || ext === ".jpeg" || ext === ".png";
}

function parseFileName(fileName: string): ParsedFile | null {
  const baseName = path.basename(fileName, path.extname(fileName));
  const parts = baseName.split("_");

  if (parts.length !== 4) {
    console.warn(`⚠️  Invalid file name format: ${fileName}`);
    console.warn("   Expected: {gender}_{ageGroup}_{skinTone}_{index}.jpg");
    return null;
  }

  const [gender, ageGroup, skinTone, index] = parts;

  if (!VALID_GENDERS.includes(gender as Gender)) {
    console.warn(`⚠️  Invalid gender: ${gender}`);
    return null;
  }

  if (!VALID_AGE_GROUPS.includes(ageGroup as AgeGroup)) {
    console.warn(`⚠️  Invalid age group: ${ageGroup}`);
    return null;
  }

  if (!VALID_SKIN_TONES.includes(skinTone as SkinTone)) {
    console.warn(`⚠️  Invalid skin tone: ${skinTone}`);
    return null;
  }

  return {
    gender: gender as Gender,
    ageGroup: ageGroup as AgeGroup,
    skinTone: skinTone as SkinTone,
    index,
  };
}

async function collectFiles(): Promise<string[]> {
  const genders = await fs.readdir(FACE_POOL_DIR, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of genders) {
    if (!entry.isDirectory()) continue;
    if (!VALID_GENDERS.includes(entry.name as Gender)) continue;

    const genderDir = path.join(FACE_POOL_DIR, entry.name);
    const genderFiles = await fs.readdir(genderDir);

    for (const file of genderFiles) {
      if (!isImageFile(file)) continue;
      files.push(path.join(genderDir, file));
    }
  }

  return files;
}

async function uploadFace(filePath: string): Promise<void> {
  const fileName = path.basename(filePath);
  const parsed = parseFileName(fileName);

  if (!parsed) {
    console.error(`❌ Skipping ${fileName} (invalid format)`);
    return;
  }

  const ext = path.extname(fileName).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  const imageBuffer = await fs.readFile(filePath);
  const gcsKey = `${GCS_PREFIX}/${parsed.gender}/${fileName}`;

  const uploadResult = await storagePut(gcsKey, imageBuffer, contentType);

  const faceId = `korea-${parsed.gender}-${parsed.ageGroup}-${parsed.skinTone}-${parsed.index}`;

  await firestoreCreateFace({
    id: faceId,
    imageUrl: uploadResult.url,
    nationality: "korea",
    gender: parsed.gender,
    ageGroup: parsed.ageGroup,
    skinTone: parsed.skinTone,
    style: "default",
    faceType: null,
    embedding: null,
    isActive: true,
    version: "1.0",
  });

  console.log(`✅ Uploaded: ${fileName}`);
}

async function main() {
  console.log("=================================================");
  console.log("📸 Face Pool Upload Script (Korea)");
  console.log("=================================================");

  try {
    await fs.access(FACE_POOL_DIR);
  } catch {
    console.error(`❌ Directory not found: ${FACE_POOL_DIR}`);
    process.exit(1);
  }

  const files = await collectFiles();

  if (files.length === 0) {
    console.error("❌ No image files found in face-pool-temp/korea");
    process.exit(1);
  }

  for (const filePath of files) {
    try {
      await uploadFace(filePath);
    } catch (error) {
      console.error(`❌ Failed to upload ${path.basename(filePath)}`);
      throw error;
    }
  }

  console.log("🎉 All faces uploaded successfully!");
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
