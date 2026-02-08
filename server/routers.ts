import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { swapFaces } from "./_core/dzine-face-swap";
import { storagePut, storageGet } from "./storage";
import { firestoreGetFacesByFilter } from "./_core/firestore";
import * as db from "./db";

export const appRouter = router({
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  ai: router({
    // Analyze face in image using LLM vision
    analyzeFace: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
        })
      )
      .query(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert at analyzing faces in images. Provide detailed analysis in JSON format.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this image and detect the face." },
                { type: "image_url", image_url: { url: input.imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        const analysis = JSON.parse(typeof content === 'string' ? content : '');
        return analysis;
      }),

    // Generate face swap with selected style using Dzine AI
    synthesizeFace: publicProcedure
      .input(
        z.object({
          originalImageBase64: z.string(), // Base64 encoded image data
          selectedFaceUrl: z.string().url(), // Selected Korean face URL (from face pool)
          nationality: z.string(),
          gender: z.string(),
          style: z.string(),
          userId: z.number().optional(), // Optional: user ID for saving to DB
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Step 1: Create project record in DB (status: processing)
        let projectId: number | null = null;
        const userId = input.userId || ctx.user?.id || 1; // Default to 1 if no user

        try {
          projectId = await createProject({
            userId,
            originalImageUrl: "base64-encoded", // Placeholder since we're using Base64
            status: "processing",
            nationality: input.nationality === "한국인" ? "korea" : "japan",
            gender: input.gender === "남성" ? "male" : "female",
            style: input.style,
          });
        } catch (dbError) {
          console.warn("[DB] Failed to create project record:", dbError);
        }

        try {
          // Step 1: Convert Base64 to Buffer
          const base64Data = input.originalImageBase64.replace(/^data:image\/\w+;base64,/, "");
          const imageBuffer = Buffer.from(base64Data, "base64");
          console.log("[synthesizeFace] Original image buffer size:", imageBuffer.length, "bytes");

          // Step 2: Upload original image to GCS (Dzine API requires public URLs)
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(7);
          const originalImageKey = `uploads/${userId}/${timestamp}-${randomId}.jpg`;

          const uploadResult = await storagePut(
            originalImageKey,
            imageBuffer,
            "image/jpeg"
          );

          console.log("[synthesizeFace] Original image uploaded:", uploadResult.url);

          // Step 3: Call Dzine AI Face Swap
          console.log("[synthesizeFace] Calling Dzine AI Face Swap...");
          console.log("[synthesizeFace] Swap image (가상 인물):", input.selectedFaceUrl);
          console.log("[synthesizeFace] Target image (고객 사진):", uploadResult.url);

          const faceSwapResult = await swapFaces({
            swapImageUrl: input.selectedFaceUrl,    // 가상 인물 얼굴
            targetImageUrl: uploadResult.url,        // 고객 원본 사진
            numOutputs: 1,
            outputFormat: "webp",
          });

          console.log("[synthesizeFace] Face swap completed!");
          console.log("[synthesizeFace] Result URLs:", faceSwapResult.resultUrls);

          const resultImageUrl = faceSwapResult.resultUrls[0];

          // Step 4: Update project record with result (status: completed)
          if (projectId) {
            try {
              await updateProject(projectId, {
                originalImageUrl: uploadResult.url,
                resultImageUrl,
                status: "completed",
              });
            } catch (dbError) {
              console.warn("[DB] Failed to update project record:", dbError);
            }
          }

          return {
            projectId,
            resultImageUrl,
            originalImageUrl: uploadResult.url,
            description: `Face swapped successfully with ${input.gender} ${input.style} style using Dzine AI`,
            preservedElements: ["hair", "background", "accessories"],
            modifiedElements: ["face", "skin tone", "facial features"],
            processingTime: faceSwapResult.processingTime,
          };
        } catch (error: any) {
          // Step 5: Update project record with error (status: failed)
          if (projectId) {
            try {
              await updateProject(projectId, {
                status: "failed",
                errorMessage: error?.message || "Unknown error",
              });
            } catch (dbError) {
              console.warn("[DB] Failed to update project error:", dbError);
            }
          }

          console.error("\n========== FACE SWAP ERROR ==========");
          console.error("Error message:", error?.message);
          console.error("Error name:", error?.name);
          console.error("Input params:", {
            selectedFaceUrl: input.selectedFaceUrl,
            nationality: input.nationality,
            gender: input.gender,
            style: input.style,
            imageBufferSize: input.originalImageBase64.length,
          });
          console.error("Full error object:", JSON.stringify(error, null, 2));
          console.error("Error stack:", error?.stack);
          console.error("====================================\n");
          throw new Error(`Failed to swap face: ${error?.message || 'Unknown error'}`);
        }
      }),

    // Get available faces from face pool
    getFacePool: publicProcedure
      .input(
        z.object({
          nationality: z.enum(["korea", "japan"]),
          gender: z.enum(["male", "female"]),
          style: z.string().optional(),
          limit: z.number().min(1).max(20).optional(),
        })
      )
      .query(async ({ input }) => {
        try {
          console.log("[getFacePool] Fetching faces with filters:", input);

          // Default style if not provided
          const style = input.style || "default";
          const limit = input.limit || 6;

          // Query Firestore for matching faces
          const faces = await firestoreGetFacesByFilter(
            input.nationality,
            input.gender,
            style,
            limit
          );

          console.log("[getFacePool] Found", faces.length, "faces");

          // Return faces with necessary information
          return faces.map((face) => ({
            id: face.id,
            imageUrl: face.imageUrl,
            nationality: face.nationality,
            gender: face.gender,
            style: face.style,
            faceType: face.faceType,
          }));
        } catch (error: any) {
          console.error("[getFacePool] Error:", error);
          throw new Error(`Failed to fetch face pool: ${error?.message || 'Unknown error'}`);
        }
      }),

    // Get user's project history
    getHistory: publicProcedure
      .input(
        z.object({
          userId: z.number().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        const userId = input.userId || ctx.user?.id || 1;
        const projects = await getUserProjects(userId);
        return projects;
      }),
  }),
});

export type AppRouter = typeof appRouter;
