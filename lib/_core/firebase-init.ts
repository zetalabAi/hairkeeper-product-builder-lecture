/**
 * Firebase Web SDK Initialization
 *
 * This file MUST be imported before any other Firebase-related code.
 * It ensures Firebase is initialized once and only once.
 *
 * ES import를 사용하여 Firebase 모듈이 올바르게 등록되도록 합니다.
 */

import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { firebaseConfig } from '../../firebase.config';

let firebaseInitialized = false;
let firebaseApp: any = null;
let firebaseAuth: any = null;

/**
 * Initialize Firebase Web SDK (only on web platform)
 * This function is idempotent - safe to call multiple times
 */
export function initializeFirebaseWeb(): void {
  if (Platform.OS !== 'web') {
    return;
  }

  if (firebaseInitialized) {
    return;
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      firebaseApp = apps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }

    // Auth 초기화
    try {
      firebaseAuth = getAuth(firebaseApp);
    } catch {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: [browserLocalPersistence, browserSessionPersistence],
      });
    }

    firebaseInitialized = true;
    console.log('[Firebase Init] Firebase Web SDK initialized successfully');
  } catch (error) {
    console.error('[Firebase Init] Failed to initialize Firebase:', error);
    throw error;
  }
}

/**
 * Get the initialized Firebase app
 */
export function getFirebaseApp(): any {
  if (!firebaseInitialized && Platform.OS === 'web') {
    initializeFirebaseWeb();
  }
  return firebaseApp;
}

/**
 * Get the initialized Firebase Auth instance
 */
export function getFirebaseAuth(): any {
  if (!firebaseInitialized && Platform.OS === 'web') {
    initializeFirebaseWeb();
  }
  return firebaseAuth;
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseInitialized;
}

// Auto-initialize on web platform when this module is imported
if (Platform.OS === 'web') {
  initializeFirebaseWeb();
}
