import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import Replicate from "replicate";
import { storagePut, storageGet } from "./storage";
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

    // Generate face swap with selected style using Replicate API
    synthesizeFace: publicProcedure
      .input(
        z.object({
          originalImageBase64: z.string(), // Base64 encoded image data
          selectedFaceUrl: z.string().url(), // Selected Korean face URL (already on Replicate-accessible storage)
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
          // Initialize Replicate client
          const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
          });

          // Convert Base64 to Buffer for Replicate to handle upload
          const base64Data = input.originalImageBase64.replace(/^data:image\/\w+;base64,/, "");
          const imageBuffer = Buffer.from(base64Data, "base64");
          console.log("[synthesizeFace] Original image buffer size:", imageBuffer.length, "bytes");

          // Run face swap model
          // Replicate will automatically upload the Buffer to its own storage
          const output = await replicate.run(
            "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
            {
              input: {
                swap_image: input.selectedFaceUrl,
                input_image: imageBuffer,
              },
            }
          ) as any;

          // Extract result URL
          const resultImageUrl = typeof output === 'string' ? output : output.url?.() || output;

          // Step 2: Update project record with result (status: completed)
          if (projectId) {
            try {
              await updateProject(projectId, {
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
            description: `Face swapped successfully with ${input.gender} ${input.style} style`,
            preservedElements: ["face shape", "hair", "background"],
            modifiedElements: ["eyes", "nose", "mouth", "eyebrows"],
          };
        } catch (error: any) {
          // Step 3: Update project record with error (status: failed)
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
          console.error("Error status:", error?.status);
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
