/**
 * Firestore Database Operations
 *
 * This module provides high-level functions for interacting with Firestore.
 * All functions handle Firebase Admin SDK initialization and error handling.
 */

import { getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { initializeApp, cert, type App } from "firebase-admin/app";
import { ENV } from "./env";
import type {
  FirestoreUser,
  CreateFirestoreUser,
  UpdateFirestoreUser,
  FirestoreSubscription,
  CreateFirestoreSubscription,
  UpdateFirestoreSubscription,
  FirestoreProject,
  CreateFirestoreProject,
  UpdateFirestoreProject,
  FirestoreFacePool,
  CreateFirestoreFacePool,
  UpdateFirestoreFacePool,
  FirestoreModelPerformance,
  CreateFirestoreModelPerformance,
  UpdateFirestoreModelPerformance,
  FirestoreUsageLog,
  CreateFirestoreUsageLog,
  OpenIdMapping,
} from "../../shared/firestore-schema";

let _firebaseApp: App | null = null;
let _firestore: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 * Only initializes once, subsequent calls return the existing instance
 */
function initializeFirebase(): App {
  if (_firebaseApp) {
    return _firebaseApp;
  }

  try {
    // Check if credentials are configured
    if (!ENV.firebaseProjectId) {
      throw new Error("FIREBASE_PROJECT_ID is not configured");
    }

    if (!ENV.googleApplicationCredentials) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not configured");
    }

    // Initialize with service account credentials
    _firebaseApp = initializeApp({
      credential: cert(ENV.googleApplicationCredentials),
      projectId: ENV.firebaseProjectId,
      storageBucket: ENV.firebaseStorageBucket,
    });

    console.log("[Firestore] Firebase Admin SDK initialized successfully");
    return _firebaseApp;
  } catch (error) {
    console.error("[Firestore] Failed to initialize Firebase:", error);
    throw error;
  }
}

/**
 * Get Firestore database instance
 * Lazily initializes Firebase Admin SDK on first call
 */
export function getFirestoreDb(): Firestore {
  if (!_firestore) {
    const app = initializeFirebase();
    _firestore = getFirestore(app);
  }
  return _firestore;
}

// ============================================
// User Operations
// ============================================

/**
 * Get user by Firebase UID
 */
export async function firestoreGetUserByUid(uid: string): Promise<FirestoreUser | null> {
  try {
    const db = getFirestoreDb();
    const doc = await db.collection("users").doc(uid).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as FirestoreUser;
  } catch (error) {
    console.error("[Firestore] Error getting user by UID:", error);
    throw error;
  }
}

/**
 * Get user by legacy Manus openId
 * Used during migration period
 */
export async function firestoreGetUserByOpenId(openId: string): Promise<FirestoreUser | null> {
  try {
    const db = getFirestoreDb();

    // First check the mapping collection
    const mappingDoc = await db.collection("openIdMapping").doc(openId).get();
    if (mappingDoc.exists) {
      const mapping = mappingDoc.data() as OpenIdMapping;
      return firestoreGetUserByUid(mapping.firebaseUid);
    }

    // Fallback: query users collection by openId
    const querySnapshot = await db.collection("users").where("openId", "==", openId).limit(1).get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as FirestoreUser;
  } catch (error) {
    console.error("[Firestore] Error getting user by openId:", error);
    throw error;
  }
}

/**
 * Create or update user in Firestore
 */
export async function firestoreUpsertUser(user: CreateFirestoreUser): Promise<void> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const userData: FirestoreUser = {
      ...user,
      createdAt: user.createdAt || now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn || now,
    };

    await db.collection("users").doc(user.uid).set(userData, { merge: true });

    // If openId exists and is different from uid, create/update mapping
    if (user.openId && user.openId !== user.uid) {
      const mapping: OpenIdMapping = {
        openId: user.openId,
        firebaseUid: user.uid,
        createdAt: now,
      };
      await db.collection("openIdMapping").doc(user.openId).set(mapping);
    }
  } catch (error) {
    console.error("[Firestore] Error upserting user:", error);
    // Don't throw - allow dual-write to continue even if Firestore fails
  }
}

/**
 * Update user fields
 */
export async function firestoreUpdateUser(uid: string, update: UpdateFirestoreUser): Promise<void> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    await db
      .collection("users")
      .doc(uid)
      .update({
        ...update,
        updatedAt: now,
      });
  } catch (error) {
    console.error("[Firestore] Error updating user:", error);
    throw error;
  }
}

// ============================================
// Subscription Operations
// ============================================

/**
 * Get user's subscription
 */
export async function firestoreGetUserSubscription(
  userId: string
): Promise<FirestoreSubscription | null> {
  try {
    const db = getFirestoreDb();
    const querySnapshot = await db
      .collection("subscriptions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as FirestoreSubscription;
  } catch (error) {
    console.error("[Firestore] Error getting user subscription:", error);
    throw error;
  }
}

/**
 * Create subscription
 */
export async function firestoreCreateSubscription(
  subscription: CreateFirestoreSubscription
): Promise<string> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const docRef = subscription.id
      ? db.collection("subscriptions").doc(subscription.id)
      : db.collection("subscriptions").doc();

    const subscriptionData: FirestoreSubscription = {
      id: docRef.id,
      ...subscription,
      createdAt: subscription.createdAt || now,
      updatedAt: subscription.updatedAt || now,
    };

    await docRef.set(subscriptionData);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error creating subscription:", error);
    throw error;
  }
}

/**
 * Update subscription
 */
export async function firestoreUpdateSubscription(
  subscriptionId: string,
  update: UpdateFirestoreSubscription
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    await db
      .collection("subscriptions")
      .doc(subscriptionId)
      .update({
        ...update,
        updatedAt: now,
      });
  } catch (error) {
    console.error("[Firestore] Error updating subscription:", error);
    throw error;
  }
}

/**
 * Check if user is premium
 */
export async function firestoreIsPremiumUser(userId: string): Promise<boolean> {
  try {
    const subscription = await firestoreGetUserSubscription(userId);
    if (!subscription) return false;

    if (subscription.status === "premium" && subscription.expiryDate) {
      // Convert Firestore Timestamp to Date for comparison
      const expiryDate =
        subscription.expiryDate instanceof Timestamp
          ? subscription.expiryDate.toDate()
          : new Date(subscription.expiryDate);
      return expiryDate > new Date();
    }

    return false;
  } catch (error) {
    console.error("[Firestore] Error checking premium status:", error);
    return false;
  }
}

// ============================================
// Project Operations
// ============================================

/**
 * Get user's projects
 */
export async function firestoreGetUserProjects(
  userId: string,
  limit = 20
): Promise<FirestoreProject[]> {
  try {
    const db = getFirestoreDb();
    const querySnapshot = await db
      .collection("projects")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => doc.data() as FirestoreProject);
  } catch (error) {
    console.error("[Firestore] Error getting user projects:", error);
    throw error;
  }
}

/**
 * Get project by ID
 */
export async function firestoreGetProject(projectId: string): Promise<FirestoreProject | null> {
  try {
    const db = getFirestoreDb();
    const doc = await db.collection("projects").doc(projectId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as FirestoreProject;
  } catch (error) {
    console.error("[Firestore] Error getting project:", error);
    throw error;
  }
}

/**
 * Create project
 */
export async function firestoreCreateProject(project: CreateFirestoreProject): Promise<string> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const docRef = project.id
      ? db.collection("projects").doc(project.id)
      : db.collection("projects").doc();

    const projectData: FirestoreProject = {
      id: docRef.id,
      ...project,
      createdAt: project.createdAt || now,
      updatedAt: project.updatedAt || now,
    };

    await docRef.set(projectData);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error creating project:", error);
    throw error;
  }
}

/**
 * Update project
 */
export async function firestoreUpdateProject(
  projectId: string,
  update: UpdateFirestoreProject
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    await db
      .collection("projects")
      .doc(projectId)
      .update({
        ...update,
        updatedAt: now,
      });
  } catch (error) {
    console.error("[Firestore] Error updating project:", error);
    throw error;
  }
}

/**
 * Delete project
 */
export async function firestoreDeleteProject(projectId: string): Promise<void> {
  try {
    const db = getFirestoreDb();
    await db.collection("projects").doc(projectId).delete();
  } catch (error) {
    console.error("[Firestore] Error deleting project:", error);
    throw error;
  }
}

// ============================================
// Face Pool Operations
// ============================================

/**
 * Get faces by filter
 */
export async function firestoreGetFacesByFilter(
  nationality: "korea" | "japan",
  gender: "male" | "female",
  style: string,
  limit = 6
): Promise<FirestoreFacePool[]> {
  try {
    const db = getFirestoreDb();
    const querySnapshot = await db
      .collection("facePool")
      .where("nationality", "==", nationality)
      .where("gender", "==", gender)
      .where("style", "==", style)
      .where("isActive", "==", true)
      .limit(limit)
      .get();

    return querySnapshot.docs.map((doc) => doc.data() as FirestoreFacePool);
  } catch (error) {
    console.error("[Firestore] Error getting faces by filter:", error);
    throw error;
  }
}

/**
 * Get face by ID
 */
export async function firestoreGetFaceById(faceId: string): Promise<FirestoreFacePool | null> {
  try {
    const db = getFirestoreDb();
    const doc = await db.collection("facePool").doc(faceId).get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as FirestoreFacePool;
  } catch (error) {
    console.error("[Firestore] Error getting face by ID:", error);
    throw error;
  }
}

/**
 * Create face
 */
export async function firestoreCreateFace(face: CreateFirestoreFacePool): Promise<string> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const docRef = face.id ? db.collection("facePool").doc(face.id) : db.collection("facePool").doc();

    const faceData: FirestoreFacePool = {
      id: docRef.id,
      ...face,
      createdAt: face.createdAt || now,
      updatedAt: face.updatedAt || now,
    };

    await docRef.set(faceData);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error creating face:", error);
    throw error;
  }
}

/**
 * Update face
 */
export async function firestoreUpdateFace(
  faceId: string,
  update: UpdateFirestoreFacePool
): Promise<void> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    await db
      .collection("facePool")
      .doc(faceId)
      .update({
        ...update,
        updatedAt: now,
      });
  } catch (error) {
    console.error("[Firestore] Error updating face:", error);
    throw error;
  }
}

// ============================================
// Model Performance Operations
// ============================================

/**
 * Get active models
 */
export async function firestoreGetActiveModels(): Promise<FirestoreModelPerformance[]> {
  try {
    const db = getFirestoreDb();
    const querySnapshot = await db
      .collection("modelPerformance")
      .where("isActive", "==", true)
      .orderBy("grade", "desc")
      .get();

    return querySnapshot.docs.map((doc) => doc.data() as FirestoreModelPerformance);
  } catch (error) {
    console.error("[Firestore] Error getting active models:", error);
    throw error;
  }
}

/**
 * Get primary model (grade S, most recent)
 */
export async function firestoreGetPrimaryModel(): Promise<FirestoreModelPerformance | null> {
  try {
    const db = getFirestoreDb();
    const querySnapshot = await db
      .collection("modelPerformance")
      .where("isActive", "==", true)
      .where("grade", "==", "S")
      .orderBy("testedAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as FirestoreModelPerformance;
  } catch (error) {
    console.error("[Firestore] Error getting primary model:", error);
    throw error;
  }
}

/**
 * Create model performance record
 */
export async function firestoreCreateModelPerformance(
  model: CreateFirestoreModelPerformance
): Promise<string> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const docRef = model.id
      ? db.collection("modelPerformance").doc(model.id)
      : db.collection("modelPerformance").doc();

    const modelData: FirestoreModelPerformance = {
      id: docRef.id,
      ...model,
      createdAt: model.createdAt || now,
    };

    await docRef.set(modelData);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error creating model performance:", error);
    throw error;
  }
}

// ============================================
// Usage Log Operations
// ============================================

/**
 * Log usage
 */
export async function firestoreLogUsage(log: CreateFirestoreUsageLog): Promise<string> {
  try {
    const db = getFirestoreDb();
    const now = Timestamp.now();

    const docRef = log.id ? db.collection("usageLogs").doc(log.id) : db.collection("usageLogs").doc();

    const logData: FirestoreUsageLog = {
      id: docRef.id,
      ...log,
      createdAt: log.createdAt || now,
    };

    await docRef.set(logData);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error logging usage:", error);
    throw error;
  }
}

/**
 * Get user usage stats
 */
export async function firestoreGetUserUsageStats(
  userId: string,
  days = 30
): Promise<FirestoreUsageLog[]> {
  try {
    const db = getFirestoreDb();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const querySnapshot = await db
      .collection("usageLogs")
      .where("userId", "==", userId)
      .where("createdAt", ">=", Timestamp.fromDate(startDate))
      .orderBy("createdAt", "desc")
      .get();

    return querySnapshot.docs.map((doc) => doc.data() as FirestoreUsageLog);
  } catch (error) {
    console.error("[Firestore] Error getting user usage stats:", error);
    throw error;
  }
}
