import { describe, it, expect } from "vitest";
import Replicate from "replicate";

describe("Replicate API", () => {
  it("should validate API token", async () => {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Test by listing models (lightweight API call)
    try {
      const models = await replicate.models.list();
      expect(models).toBeDefined();
      expect(Array.isArray(models.results)).toBe(true);
    } catch (error: any) {
      if (error.message?.includes("Unauthorized") || error.message?.includes("401")) {
        throw new Error("Invalid Replicate API token. Please check your credentials.");
      }
      throw error;
    }
  }, 30000); // 30 second timeout
});
