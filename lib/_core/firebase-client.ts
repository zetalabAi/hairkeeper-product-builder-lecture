/**
 * Firebase Client Authentication
 *
 * Client-side Firebase Auth implementation for React Native.
 * Supports Google Sign-In, Apple Sign-In, and Email/Password auth.
 *
 * Note: This uses React Native Firebase SDKs which require native configuration:
 * - iOS: GoogleService-Info.plist
 * - Android: google-services.json
 */

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const FIREBASE_TOKEN_KEY = "firebase_id_token";
const FIREBASE_USER_KEY = "firebase_user";

// 플랫폼별 Firebase Auth 가져오기
let auth: any = null;
let FirebaseAuthTypes: any = null;
let webAuthModule: any = null;

if (Platform.OS === 'web') {
  try {
    const { getAuth } = require('firebase/auth');
    webAuthModule = require('firebase/auth');
    auth = () => getAuth();
    console.log('[Firebase Client] Firebase Web SDK 사용');
  } catch (error) {
    console.warn('[Firebase Client] Firebase Web SDK not available:', error);
  }
} else {
  try {
    auth = require('@react-native-firebase/auth').default;
    FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
    console.log('[Firebase Client] React Native Firebase 사용');
  } catch (error) {
    console.warn('[Firebase Client] React Native Firebase not available:', error);
  }
}

export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};

/**
 * Get current Firebase user
 */
export function getCurrentUser(): any {
  if (!auth) return null;
  return auth().currentUser;
}

/**
 * Get Firebase ID token for API authentication
 * This token should be sent in Authorization header
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  try {
    const user = getCurrentUser();
    if (!user) {
      return null;
    }

    const token = await user.getIdToken(forceRefresh);

    // Store token for offline access (optional)
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(FIREBASE_TOKEN_KEY, token);
    } else {
      localStorage.setItem(FIREBASE_TOKEN_KEY, token);
    }

    return token;
  } catch (error) {
    console.error("[Firebase Client] Failed to get ID token:", error);
    return null;
  }
}

/**
 * Get cached Firebase ID token
 * Useful for offline mode or when user object is not available
 */
export async function getCachedFirebaseIdToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      return await SecureStore.getItemAsync(FIREBASE_TOKEN_KEY);
    } else {
      return localStorage.getItem(FIREBASE_TOKEN_KEY);
    }
  } catch (error) {
    console.error("[Firebase Client] Failed to get cached token:", error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<any> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    let credential: any;
    if (Platform.OS === 'web' && webAuthModule) {
      credential = await webAuthModule.signInWithEmailAndPassword(auth(), email, password);
    } else {
      credential = await auth().signInWithEmailAndPassword(email, password);
    }
    console.log("[Firebase Client] Email sign-in successful:", credential.user.uid);
    return credential;
  } catch (error) {
    console.error("[Firebase Client] Email sign-in failed:", error);
    throw error;
  }
}

/**
 * Create account with email and password
 */
export async function createAccountWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<any> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    let credential: any;
    if (Platform.OS === 'web' && webAuthModule) {
      credential = await webAuthModule.createUserWithEmailAndPassword(auth(), email, password);

      // Update profile with display name
      if (displayName && credential.user) {
        await webAuthModule.updateProfile(credential.user, { displayName });
      }

      // Send email verification
      if (credential.user) {
        await webAuthModule.sendEmailVerification(credential.user);
      }
    } else {
      credential = await auth().createUserWithEmailAndPassword(email, password);

      // Update profile with display name
      if (displayName && credential.user) {
        await credential.user.updateProfile({ displayName });
      }

      // Send email verification
      await credential.user?.sendEmailVerification();
    }

    console.log("[Firebase Client] Account created:", credential.user.uid);
    return credential;
  } catch (error) {
    console.error("[Firebase Client] Account creation failed:", error);
    throw error;
  }
}

/**
 * Sign in with Google
 * Note: Requires @react-native-google-signin/google-signin package
 */
export async function signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    // Google Sign-In flow
    // This requires additional setup in native code and google-signin package
    // For now, return a placeholder - full implementation depends on native setup

    // const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    // await GoogleSignin.hasPlayServices();
    // const { idToken } = await GoogleSignin.signIn();
    // const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // return auth().signInWithCredential(googleCredential);

    throw new Error(
      "Google Sign-In requires @react-native-google-signin/google-signin package and native configuration"
    );
  } catch (error) {
    console.error("[Firebase Client] Google sign-in failed:", error);
    throw error;
  }
}

/**
 * Sign in with Apple
 * Note: iOS only, requires additional configuration
 */
export async function signInWithApple(): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign-In is only available on iOS");
    }

    // Apple Sign-In flow
    // This requires additional setup in native code and apple-authentication package
    // For now, return a placeholder - full implementation depends on native setup

    // const appleAuth = require('@invertase/react-native-apple-authentication');
    // const appleAuthRequestResponse = await appleAuth.performRequest({
    //   requestedOperation: appleAuth.Operation.LOGIN,
    //   requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    // });
    // const { identityToken, nonce } = appleAuthRequestResponse;
    // const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
    // return auth().signInWithCredential(appleCredential);

    throw new Error(
      "Apple Sign-In requires @invertase/react-native-apple-authentication package and native configuration"
    );
  } catch (error) {
    console.error("[Firebase Client] Apple sign-in failed:", error);
    throw error;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.signOut(auth());
    } else {
      await auth().signOut();
    }

    // Clear cached tokens
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(FIREBASE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(FIREBASE_USER_KEY);
    } else {
      localStorage.removeItem(FIREBASE_TOKEN_KEY);
      localStorage.removeItem(FIREBASE_USER_KEY);
    }

    console.log("[Firebase Client] Sign out successful");
  } catch (error) {
    console.error("[Firebase Client] Sign out failed:", error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.sendPasswordResetEmail(auth(), email);
    } else {
      await auth().sendPasswordResetEmail(email);
    }
    console.log("[Firebase Client] Password reset email sent to:", email);
  } catch (error) {
    console.error("[Firebase Client] Send password reset email failed:", error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(update: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.updateProfile(user, update);
    } else {
      await user.updateProfile(update);
    }
    console.log("[Firebase Client] Profile updated");
  } catch (error) {
    console.error("[Firebase Client] Update profile failed:", error);
    throw error;
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.updateEmail(user, newEmail);
      await webAuthModule.sendEmailVerification(user);
    } else {
      await user.updateEmail(newEmail);
      await user.sendEmailVerification();
    }
    console.log("[Firebase Client] Email updated and verification sent");
  } catch (error) {
    console.error("[Firebase Client] Update email failed:", error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.updatePassword(user, newPassword);
    } else {
      await user.updatePassword(newPassword);
    }
    console.log("[Firebase Client] Password updated");
  } catch (error) {
    console.error("[Firebase Client] Update password failed:", error);
    throw error;
  }
}

/**
 * Re-authenticate user (required before sensitive operations)
 */
export async function reauthenticateWithEmail(
  email: string,
  password: string
): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    let credential: any;
    if (Platform.OS === 'web' && webAuthModule) {
      credential = webAuthModule.EmailAuthProvider.credential(email, password);
      await webAuthModule.reauthenticateWithCredential(user, credential);
    } else {
      credential = auth.EmailAuthProvider.credential(email, password);
      await user.reauthenticateWithCredential(credential);
    }
    console.log("[Firebase Client] Re-authentication successful");
  } catch (error) {
    console.error("[Firebase Client] Re-authentication failed:", error);
    throw error;
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth not available');
  }

  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    if (Platform.OS === 'web' && webAuthModule) {
      await webAuthModule.deleteUser(user);
    } else {
      await user.delete();
    }
    console.log("[Firebase Client] Account deleted");
  } catch (error) {
    console.error("[Firebase Client] Delete account failed:", error);
    throw error;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: any) => void
): () => void {
  if (!auth) {
    console.warn('[Firebase Client] Auth not available for onAuthStateChanged');
    return () => {};
  }

  if (Platform.OS === 'web' && webAuthModule) {
    return webAuthModule.onAuthStateChanged(auth(), callback);
  } else {
    return auth().onAuthStateChanged(callback);
  }
}

/**
 * Listen to ID token changes (for refreshing tokens)
 */
export function onIdTokenChanged(
  callback: (user: any) => void
): () => void {
  if (!auth) {
    console.warn('[Firebase Client] Auth not available for onIdTokenChanged');
    return () => {};
  }

  if (Platform.OS === 'web' && webAuthModule) {
    return webAuthModule.onIdTokenChanged(auth(), callback);
  } else {
    return auth().onIdTokenChanged(callback);
  }
}

/**
 * Convert Firebase user to app user format
 */
export function toAppUser(firebaseUser: any): FirebaseUser | null {
  if (!firebaseUser) {
    return null;
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}
