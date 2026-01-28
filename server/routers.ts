import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

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

    // Generate face swap with selected style
    synthesizeFace: publicProcedure
      .input(
        z.object({
          originalImageUrl: z.string().url(),
          nationality: z.string(),
          gender: z.string(),
          style: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // For MVP, we'll use LLM to generate a description and return a placeholder
        // In production, this would integrate with image generation APIs like Replicate or Stability AI
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a face synthesis expert. Based on the original image and user preferences, describe how the face should be modified while preserving hair and background perfectly. Return JSON with: description (string), preservedElements (array of strings), modifiedElements (array of strings).",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Generate a face swap description for this image. Target: ${input.nationality} ${input.gender}, Style: ${input.style}. The hair and background must remain 100% unchanged.`,
                },
                {
                  type: "image_url",
                  image_url: { url: input.originalImageUrl },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        const synthesis = JSON.parse(typeof content === 'string' ? content : '');
        
        // TODO: Integrate with actual image generation API
        // For now, return the original image URL as a placeholder
        return {
          resultImageUrl: input.originalImageUrl,
          description: synthesis.description,
          preservedElements: synthesis.preservedElements,
          modifiedElements: synthesis.modifiedElements,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
