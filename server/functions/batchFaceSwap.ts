import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { swapFaces } from "../_core/dzine-face-swap";

const MAX_BATCH_SIZE = 10;
const BATCH_TIMEOUT_MS = 300000; // 5 minutes

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

type BatchFaceSwapInput = {
  imageUrls: string[];
  targetFaceUrl: string;
};

type BatchResult =
  | { success: true; index: number; resultUrl: string }
  | { success: false; index: number; error: string };

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      reject(new Error("Batch processing timed out"));
    }, ms);
  });
}

export const batchFaceSwap = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" })
  .https.onCall(async (data: BatchFaceSwapInput, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required");
    }

    if (!data || !isStringArray(data.imageUrls)) {
      throw new functions.https.HttpsError("invalid-argument", "imageUrls must be an array of strings");
    }

    if (data.imageUrls.length === 0 || data.imageUrls.length > MAX_BATCH_SIZE) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `imageUrls length must be between 1 and ${MAX_BATCH_SIZE}`
      );
    }

    if (!data.targetFaceUrl || typeof data.targetFaceUrl !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "targetFaceUrl is required");
    }

    const startTime = Date.now();
    const userId = context.auth.uid;

    try {
      const projectRef = db.collection("projects").doc();
      await projectRef.set({
        id: projectRef.id,
        userId,
        originalImageUrls: data.imageUrls,
        selectedFaceUrl: data.targetFaceUrl,
        status: "processing",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const tasks = data.imageUrls.map(async (imageUrl, index): Promise<BatchResult> => {
        try {
          const result = await swapFaces({
            swapImageUrl: data.targetFaceUrl,
            targetImageUrl: imageUrl,
            numOutputs: 1,
            outputFormat: "webp",
          });

          const resultUrl = result.resultUrls[0];
          if (!resultUrl) {
            return { success: false, index, error: "No result URL returned" };
          }

          return { success: true, index, resultUrl };
        } catch (error: any) {
          console.error("[batchFaceSwap] Face swap failed:", error);
          return { success: false, index, error: error?.message || "Unknown error" };
        }
      });

      const results = await Promise.race([
        Promise.all(tasks),
        createTimeoutPromise(BATCH_TIMEOUT_MS),
      ]);

      const successResults = results.filter((item) => item.success) as Array<
        Extract<BatchResult, { success: true }>
      >;

      const resultUrls = successResults
        .sort((a, b) => a.index - b.index)
        .map((item) => item.resultUrl);

      const failedCount = results.length - successResults.length;
      const processingTime = Date.now() - startTime;

      await projectRef.update({
        resultImageUrls: resultUrls,
        status: failedCount === 0 ? "completed" : "partial",
        failedCount,
        processingTime,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        projectId: projectRef.id,
        resultUrls,
        successCount: successResults.length,
        failedCount,
        processingTime,
      };
    } catch (error: any) {
      console.error("[batchFaceSwap] Unexpected error:", error);
      throw new functions.https.HttpsError("internal", error?.message || "Internal error");
    }
  });
