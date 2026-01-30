import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import Replicate from "replicate";
import { storagePut } from "./storage";
import { createProject, updateProject, getUserProjects } from "./db-projects";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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

  // AI Image Synthesis API
  ai: router({
    // Analyze uploaded image and detect face
    analyzeFace: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a face analysis expert. Analyze the image and provide detailed information about the face, hair, and background. Return JSON with: hasFace (boolean), facePosition (object with x, y, width, height as percentages), hairColor (string), skinTone (string), age (number), gender (string), ethnicity (string).",
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
          originalImageUrl: z.string().url(),
          selectedFaceUrl: z.string().url(),
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
            originalImageUrl: input.originalImageUrl,
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

          // Run face swap model
          const output = await replicate.run(
            "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
            {
              input: {
                swap_image: input.selectedFaceUrl, // The face to swap in (selected Korean face)
                input_image: input.originalImageUrl, // The original image
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
            originalImageUrl: input.originalImageUrl,
            selectedFaceUrl: input.selectedFaceUrl,
            nationality: input.nationality,
            gender: input.gender,
            style: input.style,
          });
          console.error("Full error object:", JSON.stringify(error, null, 2));
          console.error("Error stack:", error?.stack);
          console.error("====================================\n");
          throw new Error(`Failed to swap face: ${error?.message || 'Unknown error'}`);
        }
      }),

    // Upload image to storage and return public URL
    uploadImage: publicProcedure
      .input(
        z.object({
          base64Data: z.string(),
          filename: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Remove data URL prefix if present
          const base64 = input.base64Data.replace(/^data:image\/\w+;base64,/, "");
          
          // Convert base64 to buffer
          const buffer = Buffer.from(base64, "base64");
          
          // Upload to storage
          const result = await storagePut(
            `uploads/${Date.now()}_${input.filename}`,
            buffer,
            "image/jpeg"
          );
          
          return {
            url: result.url,
          };
        } catch (error) {
          console.error("Image upload error:", error);
          throw new Error("Failed to upload image. Please try again.");
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
        const userId = input.userId || ctx.user?.id || 1; // Default to 1 if no user
        const projects = await getUserProjects(userId);
        return projects;
      }),
  }),
});

export type AppRouter = typeof appRouter;
