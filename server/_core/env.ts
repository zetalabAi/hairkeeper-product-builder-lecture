export const ENV = {
  // Existing Manus configuration
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Firebase & Google Cloud configuration
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT ?? "",
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
  vertexAiLocation: process.env.VERTEX_AI_LOCATION ?? "us-central1",

  // Migration feature flags
  storageBackend: (process.env.STORAGE_BACKEND ?? "manus") as "manus" | "gcs",
  aiBackend: (process.env.AI_BACKEND ?? "forge") as "forge" | "vertex",
};
