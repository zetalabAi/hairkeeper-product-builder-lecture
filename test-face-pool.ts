/**
 * Test Face Pool API
 *
 * This script tests the getFacePool API to verify that:
 * 1. Firestore connection works
 * 2. Face images are retrieved correctly
 * 3. Filtering by nationality/gender works
 */

// Load environment variables FIRST
import dotenv from "dotenv";
dotenv.config();

import { firestoreGetFacesByFilter } from "./server/_core/firestore";

async function main() {
  console.log("=================================================");
  console.log("🧪 Face Pool API Test");
  console.log("=================================================\n");

  try {
    // Test 1: Get all female faces with default style
    console.log("📋 Test 1: Fetching Korean female faces (default style)");
    console.log("   Filters: nationality=korea, gender=female, style=default");
    console.log("");

    const faces = await firestoreGetFacesByFilter("korea", "female", "default", 10);

    console.log(`✅ Found ${faces.length} face(s):\n`);

    faces.forEach((face, index) => {
      console.log(`   ${index + 1}. ${face.id}`);
      console.log(`      URL: ${face.imageUrl}`);
      console.log(`      Nationality: ${face.nationality}`);
      console.log(`      Gender: ${face.gender}`);
      console.log(`      Style: ${face.style}`);
      console.log(`      Active: ${face.isActive}`);
      console.log("");
    });

    if (faces.length === 0) {
      console.error("❌ No faces found! Check:");
      console.error("   1. Firestore database has 'facePool' collection");
      console.error("   2. Documents have correct fields (nationality, gender, style, isActive)");
      console.error("   3. isActive is set to true");
      console.error("");
      process.exit(1);
    }

    console.log("=================================================");
    console.log("✅ FACE POOL API TEST PASSED!");
    console.log("=================================================");
    console.log("");
    console.log("Next step: Test face swap with real images");
    console.log("");
  } catch (error: any) {
    console.error("");
    console.error("=================================================");
    console.error("❌ FACE POOL API TEST FAILED");
    console.error("=================================================");
    console.error("");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("");

    if (error.message.includes("PERMISSION_DENIED")) {
      console.error("💡 Solution: Check Firestore security rules");
      console.error("   Make sure test mode is enabled or rules allow read access");
    } else if (error.message.includes("not configured")) {
      console.error("💡 Solution: Check .env file");
      console.error("   Make sure FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS are set");
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
