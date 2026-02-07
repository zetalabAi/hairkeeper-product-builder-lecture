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

import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const FIREBASE_TOKEN_KEY = "firebase_id_token";
const FIREBASE_USER_KEY = "firebase_user";

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
export function getCurrentUser(): FirebaseAuthTypes.User | null {
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
): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    const credential = await auth().signInWithEmailAndPassword(email, password);
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
): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    const credential = await auth().createUserWithEmailAndPassword(email, password);

    // Update profile with display name
    if (displayName && credential.user) {
      await credential.user.updateProfile({ displayName });
    }

    // Send email verification
    await credential.user?.sendEmailVerification();

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
  try {
    await auth().signOut();

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
  try {
    await auth().sendPasswordResetEmail(email);
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
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    await user.updateProfile(update);
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
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    await user.updateEmail(newEmail);
    await user.sendEmailVerification();
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
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    await user.updatePassword(newPassword);
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
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    const credential = auth.EmailAuthProvider.credential(email, password);
    await user.reauthenticateWithCredential(credential);
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
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error("No user signed in");
    }

    await user.delete();
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
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * Listen to ID token changes (for refreshing tokens)
 */
export function onIdTokenChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onIdTokenChanged(callback);
}

/**
 * Convert Firebase user to app user format
 */
export function toAppUser(firebaseUser: FirebaseAuthTypes.User | null): FirebaseUser | null {
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
