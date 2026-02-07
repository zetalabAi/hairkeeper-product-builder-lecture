/**
 * Firebase Authentication Module
 *
 * Provides server-side Firebase Auth operations using Firebase Admin SDK.
 * This module handles:
 * - Firebase ID token verification
 * - User creation and management
 * - openId to Firebase UID mapping during migration
 */

import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestoreDb } from "./firestore";
import type { OpenIdMapping } from "../../shared/firestore-schema";
import { Timestamp } from "firebase-admin/firestore";

let _auth: Auth | null = null;

/**
 * Get Firebase Auth instance
 * Lazily initialized with Firebase Admin SDK
 */
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth();
  }
  return _auth;
}

/**
 * Verify Firebase ID token
 * Returns the decoded token with user information
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("[Firebase Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Get Firebase user by UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    const auth = getFirebaseAuth();
    return await auth.getUser(uid);
  } catch (error) {
    console.error("[Firebase Auth] Get user failed:", error);
    return null;
  }
}

/**
 * Get Firebase user by email
 */
export async function getFirebaseUserByEmail(email: string) {
  try {
    const auth = getFirebaseAuth();
    return await auth.getUserByEmail(email);
  } catch (error) {
    // User not found is expected, don't log as error
    if ((error as any)?.code === "auth/user-not-found") {
      return null;
    }
    console.error("[Firebase Auth] Get user by email failed:", error);
    return null;
  }
}

/**
 * Create Firebase user with email/password
 * Used for migrating users from Manus to Firebase
 */
export async function createFirebaseUser(options: {
  email?: string;
  password?: string;
  displayName?: string;
  emailVerified?: boolean;
}): Promise<{ uid: string; email: string | undefined } | null> {
  try {
    const auth = getFirebaseAuth();

    const userRecord = await auth.createUser({
      email: options.email,
      password: options.password,
      displayName: options.displayName,
      emailVerified: options.emailVerified ?? false,
    });

    console.log("[Firebase Auth] User created:", userRecord.uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
    };
  } catch (error) {
    console.error("[Firebase Auth] Create user failed:", error);
    return null;
  }
}

/**
 * Update Firebase user profile
 */
export async function updateFirebaseUser(
  uid: string,
  update: {
    email?: string;
    displayName?: string;
    emailVerified?: boolean;
    password?: string;
  }
) {
  try {
    const auth = getFirebaseAuth();
    await auth.updateUser(uid, update);
    return true;
  } catch (error) {
    console.error("[Firebase Auth] Update user failed:", error);
    return false;
  }
}

/**
 * Delete Firebase user
 */
export async function deleteFirebaseUser(uid: string) {
  try {
    const auth = getFirebaseAuth();
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error("[Firebase Auth] Delete user failed:", error);
    return false;
  }
}

/**
 * Link Manus openId to Firebase UID
 * Creates a mapping document in Firestore for migration tracking
 */
export async function linkOpenIdToFirebaseUid(openId: string, firebaseUid: string): Promise<void> {
  try {
    const db = getFirestoreDb();
    const mapping: OpenIdMapping = {
      openId,
      firebaseUid,
      createdAt: Timestamp.now(),
    };

    await db.collection("openIdMapping").doc(openId).set(mapping);
    console.log(`[Firebase Auth] Linked openId ${openId} to Firebase UID ${firebaseUid}`);
  } catch (error) {
    console.error("[Firebase Auth] Failed to link openId:", error);
    throw error;
  }
}

/**
 * Get Firebase UID from legacy Manus openId
 * Returns null if mapping doesn't exist
 */
export async function getFirebaseUidFromOpenId(openId: string): Promise<string | null> {
  try {
    const db = getFirestoreDb();
    const doc = await db.collection("openIdMapping").doc(openId).get();

    if (!doc.exists) {
      return null;
    }

    const mapping = doc.data() as OpenIdMapping;
    return mapping.firebaseUid;
  } catch (error) {
    console.error("[Firebase Auth] Failed to get Firebase UID from openId:", error);
    return null;
  }
}

/**
 * Generate a custom token for a user
 * Useful for testing or server-initiated auth
 */
export async function createCustomToken(
  uid: string,
  additionalClaims?: Record<string, any>
): Promise<string | null> {
  try {
    const auth = getFirebaseAuth();
    return await auth.createCustomToken(uid, additionalClaims);
  } catch (error) {
    console.error("[Firebase Auth] Create custom token failed:", error);
    return null;
  }
}

/**
 * Set custom user claims (e.g., role: admin)
 */
export async function setCustomUserClaims(
  uid: string,
  claims: Record<string, any>
): Promise<boolean> {
  try {
    const auth = getFirebaseAuth();
    await auth.setCustomUserClaims(uid, claims);
    return true;
  } catch (error) {
    console.error("[Firebase Auth] Set custom claims failed:", error);
    return false;
  }
}

/**
 * Revoke refresh tokens for a user (force re-authentication)
 */
export async function revokeRefreshTokens(uid: string): Promise<boolean> {
  try {
    const auth = getFirebaseAuth();
    await auth.revokeRefreshTokens(uid);
    return true;
  } catch (error) {
    console.error("[Firebase Auth] Revoke refresh tokens failed:", error);
    return false;
  }
}
