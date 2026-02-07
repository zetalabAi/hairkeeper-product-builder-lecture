/**
 * Authentication Migration Module
 *
 * Handles the gradual migration from Manus OAuth to Firebase Auth.
 * Supports both authentication methods during the transition period.
 *
 * Flow:
 * 1. Try Firebase Auth first (if Authorization header has Firebase token)
 * 2. Fall back to Manus OAuth (if session cookie has Manus token)
 * 3. Auto-migrate Manus users to Firebase on first login
 */

import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import {
  verifyFirebaseToken,
  getFirebaseUserByEmail,
  createFirebaseUser,
  linkOpenIdToFirebaseUid,
  getFirebaseUidFromOpenId,
} from "./firebase-auth";
import { firestoreGetUserByUid, firestoreGetUserByOpenId, firestoreUpsertUser } from "./firestore";
import { getUserByOpenId, upsertUser } from "../db";
import { Timestamp } from "firebase-admin/firestore";
import { ForbiddenError } from "../../shared/_core/errors";

export type AuthResult = {
  user: User;
  source: "firebase" | "manus";
  migrated?: boolean;
};

/**
 * Extract Firebase ID token from Authorization header
 */
function extractFirebaseToken(req: Request): string | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (typeof authHeader !== "string") {
    return null;
  }

  // Firebase tokens are longer than Manus tokens
  // Check for "Bearer " prefix and length > 500 chars as heuristic
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    // Firebase ID tokens are typically 800-1000+ characters (JWT format)
    // Manus session tokens are typically < 300 characters
    if (token.length > 500) {
      return token;
    }
  }

  return null;
}

/**
 * Authenticate with Firebase Auth
 * Returns user if token is valid, null otherwise
 */
async function authenticateWithFirebase(req: Request): Promise<AuthResult | null> {
  const idToken = extractFirebaseToken(req);
  if (!idToken) {
    return null;
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      return null;
    }

    const firebaseUid = decodedToken.uid;

    // Get user from Firestore
    let user = await firestoreGetUserByUid(firebaseUid);

    if (!user) {
      // User exists in Firebase Auth but not in Firestore
      // This can happen if user signed up but never completed onboarding
      // Create user record in Firestore
      const now = Timestamp.now();
      await firestoreUpsertUser({
        uid: firebaseUid,
        openId: firebaseUid, // No legacy openId for new Firebase users
        name: decodedToken.name || null,
        email: decodedToken.email || null,
        loginMethod: decodedToken.firebase.sign_in_provider || null,
        role: "user",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      });

      user = await firestoreGetUserByUid(firebaseUid);
    }

    if (!user) {
      console.error("[Auth Migration] Failed to get/create user after Firebase auth");
      return null;
    }

    // Convert Firestore user to MySQL User format for compatibility
    const mysqlUser: User = {
      id: 0, // Placeholder - will be removed in Phase 6
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      role: user.role,
      createdAt: user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt as any),
      updatedAt: user.updatedAt instanceof Timestamp ? user.updatedAt.toDate() : new Date(user.updatedAt as any),
      lastSignedIn: user.lastSignedIn instanceof Timestamp ? user.lastSignedIn.toDate() : new Date(user.lastSignedIn as any),
    };

    return {
      user: mysqlUser,
      source: "firebase",
    };
  } catch (error) {
    console.error("[Auth Migration] Firebase authentication failed:", error);
    return null;
  }
}

/**
 * Authenticate with Manus OAuth (legacy)
 * Returns user if session is valid, throws if invalid
 */
async function authenticateWithManus(req: Request): Promise<AuthResult> {
  // Use existing Manus SDK authentication
  const user = await sdk.authenticateRequest(req);

  return {
    user,
    source: "manus",
  };
}

/**
 * Auto-migrate a Manus user to Firebase Auth
 * Creates Firebase user and links openId mapping
 */
export async function autoMigrateManusUser(
  openId: string,
  email: string | null,
  name: string | null
): Promise<{ firebaseUid: string; migrated: boolean }> {
  try {
    // Check if already migrated
    const existingMapping = await getFirebaseUidFromOpenId(openId);
    if (existingMapping) {
      console.log(`[Auth Migration] User ${openId} already migrated to ${existingMapping}`);
      return {
        firebaseUid: existingMapping,
        migrated: false, // Already done
      };
    }

    // Check if Firebase user already exists with this email
    let firebaseUser = null;
    if (email) {
      firebaseUser = await getFirebaseUserByEmail(email);
    }

    let firebaseUid: string;

    if (firebaseUser) {
      // User already exists in Firebase (maybe signed up directly)
      firebaseUid = firebaseUser.uid;
      console.log(`[Auth Migration] Found existing Firebase user for ${email}: ${firebaseUid}`);
    } else {
      // Create new Firebase user
      // Note: We can't migrate the password, so create without password
      // User will need to reset password or use OAuth on first Firebase login
      const result = await createFirebaseUser({
        email: email || undefined,
        displayName: name || undefined,
        emailVerified: false, // Require email verification
      });

      if (!result) {
        throw new Error("Failed to create Firebase user");
      }

      firebaseUid = result.uid;
      console.log(`[Auth Migration] Created new Firebase user: ${firebaseUid}`);
    }

    // Link openId to Firebase UID
    await linkOpenIdToFirebaseUid(openId, firebaseUid);

    // Update Firestore user record
    const now = Timestamp.now();
    await firestoreUpsertUser({
      uid: firebaseUid,
      openId: openId,
      name: name,
      email: email,
      loginMethod: "migrated_from_manus",
      role: "user",
      lastSignedIn: now,
    });

    console.log(`[Auth Migration] Successfully migrated user ${openId} to Firebase ${firebaseUid}`);

    return {
      firebaseUid,
      migrated: true,
    };
  } catch (error) {
    console.error(`[Auth Migration] Failed to migrate user ${openId}:`, error);
    throw error;
  }
}

/**
 * Unified authentication middleware
 * Tries Firebase first, falls back to Manus, auto-migrates if needed
 */
export async function unifiedAuthMiddleware(req: Request): Promise<AuthResult> {
  // Step 1: Try Firebase Auth
  const firebaseResult = await authenticateWithFirebase(req);
  if (firebaseResult) {
    return firebaseResult;
  }

  // Step 2: Fall back to Manus OAuth
  try {
    const manusResult = await authenticateWithManus(req);

    // Step 3: Auto-migrate Manus user to Firebase (non-blocking)
    // We do this in the background so login isn't delayed
    const { openId, email, name } = manusResult.user;
    if (openId && email) {
      // Trigger migration asynchronously (don't await)
      autoMigrateManusUser(openId, email, name).catch((error) => {
        console.error("[Auth Migration] Background migration failed:", error);
      });
    }

    return manusResult;
  } catch (error) {
    // Both Firebase and Manus auth failed
    throw ForbiddenError("Authentication required");
  }
}

/**
 * Check if user is authenticated with Firebase
 * Used to show migration prompts or different UI
 */
export async function isFirebaseAuthenticated(req: Request): Promise<boolean> {
  const token = extractFirebaseToken(req);
  if (!token) {
    return false;
  }

  const decodedToken = await verifyFirebaseToken(token);
  return decodedToken !== null;
}

/**
 * Get migration status for a user
 * Returns whether user has been migrated to Firebase
 */
export async function getUserMigrationStatus(openId: string): Promise<{
  isMigrated: boolean;
  firebaseUid: string | null;
}> {
  const firebaseUid = await getFirebaseUidFromOpenId(openId);

  return {
    isMigrated: firebaseUid !== null,
    firebaseUid,
  };
}
