/**
 * Firebase 클라이언트 설정
 *
 * React Native Firebase SDK에서 사용하는 설정입니다.
 */

import Constants from 'expo-constants';

/**
 * Firebase 설정 객체
 * 환경 변수에서 값을 가져옵니다.
 */
export const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    Constants.expoConfig?.extra?.firebaseProjectId ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId ||
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Firebase 설정 유효성 검증
 */
export function validateFirebaseConfig(): boolean {
  const required = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const key of required) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.error(`[Firebase Config] 필수 설정 누락: ${key}`);
      return false;
    }
  }

  return true;
}

/**
 * Firebase 설정 정보 출력 (디버깅용)
 */
export function logFirebaseConfig() {
  console.log('[Firebase Config] 설정:');
  console.log('  Project ID:', firebaseConfig.projectId);
  console.log('  Auth Domain:', firebaseConfig.authDomain);
  console.log('  Storage Bucket:', firebaseConfig.storageBucket);
  console.log('  API Key:', firebaseConfig.apiKey ? '설정됨 ✓' : '누락 ✗');
  console.log('  App ID:', firebaseConfig.appId ? '설정됨 ✓' : '누락 ✗');
}
