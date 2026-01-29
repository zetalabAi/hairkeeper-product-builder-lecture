import Replicate from "replicate";

async function testReplicate() {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  console.log("Testing Replicate API...");
  console.log("API Token exists:", !!apiToken);
  console.log("API Token length:", apiToken?.length || 0);
  
  if (!apiToken) {
    console.error("ERROR: REPLICATE_API_TOKEN not found in environment");
    process.exit(1);
  }
  
  try {
    const replicate = new Replicate({ auth: apiToken });
    
    // Test with public image URLs
    const swapImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663318300561/OHPrpkHcIbEVVgqn.png";
    const inputImage = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663318300561/QejMAWfyFonBSUSX.png"; // Korean female face
    
    console.log("\nCalling Replicate Face Swap API...");
    console.log("Swap image:", swapImage);
    console.log("Input image:", inputImage);
    
    const output = await replicate.run(
      "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
      {
        input: {
          swap_image: swapImage,
          input_image: inputImage,
        },
      }
    );
    
    console.log("\nSuccess! Output:", output);
  } catch (error: any) {
    console.error("\nERROR:", error.message);
    console.error("Status:", error.status);
    console.error("Response:", error.response);
    console.error("Full error:", error);
  }
}

testReplicate();
