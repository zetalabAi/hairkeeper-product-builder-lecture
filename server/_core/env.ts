/**
 * 환경 변수 설정
 * Firebase & Google Cloud만 사용합니다.
 */

export const ENV = {
  // 앱 설정
  appId: process.env.VITE_APP_ID ?? process.env.APP_ID ?? "hairkeeper",
  cookieSecret: process.env.JWT_SECRET ?? process.env.COOKIE_SECRET ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Firebase & Google Cloud 설정
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "",
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT ?? "",
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "",
  vertexAiLocation: process.env.VERTEX_AI_LOCATION ?? "us-central1",

  // AI Services
  ONEMIN_AI_API_KEY: process.env.ONEMIN_AI_API_KEY ?? "",
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ?? "",
  DZINE_AI_API_KEY: process.env.DZINE_AI_API_KEY ?? "",
  DZINE_AI_API_SECRET: process.env.DZINE_AI_API_SECRET ?? "",
};
