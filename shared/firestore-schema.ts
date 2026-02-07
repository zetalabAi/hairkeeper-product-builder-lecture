/**
 * Firestore Schema Definitions for Hairkeeper
 *
 * This file defines TypeScript interfaces for all Firestore collections
 * and their document structures. These types are shared between server
 * and client code.
 */

import type { Timestamp as FirestoreTimestamp } from "firebase-admin/firestore";

/**
 * Timestamp type that works with both Firebase Admin SDK and Client SDK
 * On server: firebase-admin Timestamp
 * On client: @firebase/firestore Timestamp
 */
export type Timestamp = FirestoreTimestamp | Date;

// ============================================
// Users Collection: /users/{uid}
// ============================================

export interface FirestoreUser {
  /** Firebase UID (or temporary Manus openId during migration) */
  uid: string;

  /** Legacy Manus openId for mapping during migration */
  openId: string;

  /** User's display name */
  name: string | null;

  /** User's email address */
  email: string | null;

  /** Login method used (google, apple, email, etc.) */
  loginMethod: string | null;

  /** User role */
  role: "user" | "admin";

  /** Account creation timestamp */
  createdAt: Timestamp;

  /** Last update timestamp */
  updatedAt: Timestamp;

  /** Last sign-in timestamp */
  lastSignedIn: Timestamp;
}

export type CreateFirestoreUser = Omit<FirestoreUser, "createdAt" | "updatedAt" | "lastSignedIn"> & {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  lastSignedIn?: Timestamp;
};

export type UpdateFirestoreUser = Partial<Omit<FirestoreUser, "uid" | "openId">>;

// ============================================
// OpenId Mapping Collection: /openIdMapping/{openId}
// ============================================

export interface OpenIdMapping {
  /** Manus openId (document ID) */
  openId: string;

  /** Firebase UID this openId maps to */
  firebaseUid: string;

  /** When this mapping was created */
  createdAt: Timestamp;
}

// ============================================
// Subscriptions Collection: /subscriptions/{subscriptionId}
// ============================================

export interface FirestoreSubscription {
  /** Subscription ID */
  id: string;

  /** Firebase UID of the user */
  userId: string;

  /** Subscription status */
  status: "free" | "premium" | "expired";

  /** Purchase platform */
  platform: "google" | "apple";

  /** Platform transaction ID */
  transactionId: string | null;

  /** Product ID purchased */
  productId: string | null;

  /** Purchase date */
  purchaseDate: Timestamp | null;

  /** Expiry date */
  expiryDate: Timestamp | null;

  /** Auto-renewal enabled */
  autoRenew: boolean;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Last update timestamp */
  updatedAt: Timestamp;
}

export type CreateFirestoreSubscription = Omit<FirestoreSubscription, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UpdateFirestoreSubscription = Partial<Omit<FirestoreSubscription, "id" | "userId">>;

// ============================================
// Projects Collection: /projects/{projectId}
// ============================================

export interface FirestoreProject {
  /** Project ID */
  id: string;

  /** Firebase UID of the user */
  userId: string;

  /** URL of the original uploaded image */
  originalImageUrl: string;

  /** URL of the result image (null if not completed) */
  resultImageUrl: string | null;

  /** Processing status */
  status: "pending" | "processing" | "completed" | "failed";

  /** Target nationality */
  nationality: "korea" | "japan";

  /** Target gender */
  gender: "male" | "female";

  /** Hair style */
  style: string;

  /** Selected face ID from face pool */
  selectedFaceId: number | null;

  /** Processing time in milliseconds */
  processingTime: number | null;

  /** Error message if failed */
  errorMessage: string | null;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Last update timestamp */
  updatedAt: Timestamp;
}

export type CreateFirestoreProject = Omit<FirestoreProject, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UpdateFirestoreProject = Partial<Omit<FirestoreProject, "id" | "userId">>;

// ============================================
// Face Pool Collection: /facePool/{faceId}
// ============================================

export interface FirestoreFacePool {
  /** Face ID */
  id: string;

  /** URL of the face image */
  imageUrl: string;

  /** Nationality category */
  nationality: "korea" | "japan";

  /** Gender category */
  gender: "male" | "female";

  /** Style category */
  style: string;

  /** Face type (optional) */
  faceType: "cat" | "dog" | "horse" | "rabbit" | null;

  /** Face embedding vector (for similarity matching) */
  embedding: number[] | null;

  /** Whether this face is active/available */
  isActive: boolean;

  /** Version identifier */
  version: string;

  /** Creation timestamp */
  createdAt: Timestamp;

  /** Last update timestamp */
  updatedAt: Timestamp;
}

export type CreateFirestoreFacePool = Omit<FirestoreFacePool, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type UpdateFirestoreFacePool = Partial<Omit<FirestoreFacePool, "id">>;

// ============================================
// Model Performance Collection: /modelPerformance/{modelId}
// ============================================

export interface FirestoreModelPerformance {
  /** Model performance ID */
  id: string;

  /** Model name */
  modelName: string;

  /** Model version */
  version: string;

  /** Hair SSIM metric */
  hairSSIM: number | null;

  /** Hair LPIPS metric */
  hairLPIPS: number | null;

  /** Hair Delta-E metric */
  hairDeltaE: number | null;

  /** Ring color jump metric */
  ringColorJump: number | null;

  /** Landmark stability metric */
  landmarkStability: number | null;

  /** Face collapse rate */
  faceCollapseRate: number | null;

  /** Failure rate */
  failureRate: number | null;

  /** Average latency in milliseconds */
  avgLatency: number | null;

  /** Cost per request */
  costPerRequest: number | null;

  /** Performance grade */
  grade: "S" | "A" | "B" | "F";

  /** Whether this model is active */
  isActive: boolean;

  /** When the model was tested */
  testedAt: Timestamp;

  /** Creation timestamp */
  createdAt: Timestamp;
}

export type CreateFirestoreModelPerformance = Omit<FirestoreModelPerformance, "id" | "createdAt"> & {
  id?: string;
  createdAt?: Timestamp;
};

export type UpdateFirestoreModelPerformance = Partial<Omit<FirestoreModelPerformance, "id">>;

// ============================================
// Usage Logs Collection: /usageLogs/{logId}
// ============================================

export interface FirestoreUsageLog {
  /** Log ID */
  id: string;

  /** Firebase UID of the user */
  userId: string;

  /** Project ID (optional) */
  projectId: string | null;

  /** Action performed */
  action: "upload" | "process" | "download" | "share";

  /** Whether user was premium at time of action */
  isPremium: boolean;

  /** Additional metadata */
  metadata: Record<string, any> | null;

  /** Timestamp of the action */
  createdAt: Timestamp;
}

export type CreateFirestoreUsageLog = Omit<FirestoreUsageLog, "id" | "createdAt"> & {
  id?: string;
  createdAt?: Timestamp;
};

// ============================================
// Helper Types
// ============================================

/**
 * Firestore document reference type
 */
export type DocumentReference = {
  id: string;
  path: string;
};

/**
 * Query filter operators
 */
export type WhereFilterOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "array-contains-any"
  | "in"
  | "not-in";

/**
 * Order direction
 */
export type OrderByDirection = "asc" | "desc";
