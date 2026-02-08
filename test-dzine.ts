/**
 * Dzine AI Face Swap Integration Test
 *
 * This script tests the Dzine AI face swap integration with actual images.
 *
 * Usage:
 *   1. Set ONEMIN_AI_API_KEY in .env file
 *   2. Replace the test image URLs with your own GCS URLs
 *   3. Run: npx tsx test-dzine.ts
 */

// Load environment variables FIRST (before any imports that use them)
import dotenv from "dotenv";
dotenv.config();

import { swapFaces, testConnection } from "./server/_core/dzine-face-swap";

async function main() {
  console.log("=================================================");
  console.log("🧪 Dzine AI Face Swap Integration Test");
  console.log("=================================================\n");

  // Step 1: Test API configuration
  console.log("📋 Step 1: Testing API configuration...");
  const configValid = await testConnection();

  if (!configValid) {
    console.error("❌ API configuration is invalid. Please check your .env file.");
    console.error("   Make sure ONEMIN_AI_API_KEY is set correctly.");
    process.exit(1);
  }

  console.log("✅ API configuration is valid!\n");

  // Step 2: Prepare test images
  console.log("📋 Step 2: Preparing test images...");
  console.log("⚠️  NOTE: You need to replace these URLs with actual GCS URLs");
  console.log("   1. Upload a test face image to GCS (Korean face)");
  console.log("   2. Upload a customer photo to GCS");
  console.log("   3. Make sure both images are publicly accessible\n");

  // Use actual face pool images for testing
  const swapImageUrl = "https://storage.googleapis.com/hairkeeper-f0df0.firebasestorage.app/face-pool%2Fkorea%2Ffemale%2Fkorea-female-default-01.png";
  const targetImageUrl = "https://storage.googleapis.com/hairkeeper-f0df0.firebasestorage.app/face-pool%2Fkorea%2Ffemale%2Fkorea-female-default-02.png";

  console.log("   Swap Image (가상 인물):", swapImageUrl);
  console.log("   Target Image (고객 사진):", targetImageUrl);
  console.log("");

  if (swapImageUrl.includes("YOUR_BUCKET") || targetImageUrl.includes("YOUR_BUCKET")) {
    console.log("⚠️  SKIPPING FACE SWAP TEST");
    console.log("   Please update the image URLs in test-dzine.ts first.");
    console.log("");
    console.log("=================================================");
    console.log("✅ Configuration test completed successfully!");
    console.log("=================================================");
    return;
  }

  // Step 3: Call Dzine AI Face Swap
  console.log("📋 Step 3: Calling Dzine AI Face Swap API...");
  console.log("   This may take 10-30 seconds...\n");

  try {
    const startTime = Date.now();

    const result = await swapFaces({
      swapImageUrl,
      targetImageUrl,
      numOutputs: 1,
      outputFormat: "webp",
    });

    const duration = Date.now() - startTime;

    console.log("✅ Face swap completed successfully!");
    console.log("");
    console.log("📊 Results:");
    console.log("   UUID:", result.uuid);
    console.log("   Status:", result.status);
    console.log("   Processing Time:", result.processingTime, "ms");
    console.log("   Total Duration:", duration, "ms");
    console.log("   Number of Results:", result.resultUrls.length);
    console.log("");
    console.log("🖼️  Result URLs:");
    result.resultUrls.forEach((url, index) => {
      console.log(`   [${index + 1}]`, url);
    });
    console.log("");

    // Step 4: Validation
    console.log("📋 Step 4: Validating results...");

    let allValid = true;

    // Check if result URLs are accessible
    for (const url of result.resultUrls) {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (response.ok) {
          console.log("   ✅ URL is accessible:", url);
        } else {
          console.error("   ❌ URL returned error:", response.status, url);
          allValid = false;
        }
      } catch (error) {
        console.error("   ❌ Failed to access URL:", url);
        allValid = false;
      }
    }

    console.log("");

    if (allValid) {
      console.log("=================================================");
      console.log("✅ ALL TESTS PASSED!");
      console.log("=================================================");
      console.log("");
      console.log("🎉 Dzine AI integration is working correctly!");
      console.log("");
      console.log("Next steps:");
      console.log("   1. Add face pool images to Firestore");
      console.log("   2. Test the full flow with the mobile app");
      console.log("   3. Verify hair preservation quality");
      console.log("");
    } else {
      console.log("=================================================");
      console.log("⚠️  SOME TESTS FAILED");
      console.log("=================================================");
      console.log("");
      console.log("Please check the error messages above.");
    }
  } catch (error: any) {
    console.error("");
    console.error("=================================================");
    console.error("❌ FACE SWAP FAILED");
    console.error("=================================================");
    console.error("");
    console.error("Error message:", error.message);
    console.error("");

    if (error.message.includes("ONEMIN_AI_API_KEY")) {
      console.error("💡 Solution: Add ONEMIN_AI_API_KEY to your .env file");
      console.error("   Get your API key from: https://1min.ai/");
    } else if (error.message.includes("403") || error.message.includes("401")) {
      console.error("💡 Solution: Check your API key is correct and has sufficient credits");
    } else if (error.message.includes("404")) {
      console.error("💡 Solution: Verify the image URLs are correct and publicly accessible");
    } else if (error.message.includes("No result URLs")) {
      console.error("💡 Solution: The API couldn't detect faces in the images");
      console.error("   - Make sure both images contain clear, frontal faces");
      console.error("   - Images should be high resolution (at least 512x512)");
      console.error("   - Faces should be well-lit and not obscured");
    }

    console.error("");
    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
