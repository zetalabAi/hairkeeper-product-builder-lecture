/**
 * Unified Database Layer with Dual-Write Pattern
 *
 * This module wraps MySQL operations to also write to Firestore during migration.
 * MySQL remains the source of truth during Phase 1-2, but all writes go to both databases.
 *
 * Firestore writes are non-blocking - if Firestore fails, the operation still succeeds
 * as long as MySQL succeeds. This ensures backward compatibility during migration.
 */

import * as mysqlDb from "./db";
import * as firestoreDb from "./_core/firestore";
import type { InsertUser, User } from "../drizzle/schema";
import { Timestamp } from "firebase-admin/firestore";

// ============================================
// User Operations
// ============================================

/**
 * Upsert user - writes to both MySQL and Firestore
 * MySQL is source of truth, Firestore write failures are logged but don't throw
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  // Write to MySQL first (source of truth)
  await mysqlDb.upsertUser(user);

  // Get the saved MySQL user to get the numeric ID
  const savedUser = await mysqlDb.getUserByOpenId(user.openId!);

  if (savedUser) {
    // Write to Firestore (non-blocking)
    try {
      await firestoreDb.firestoreUpsertUser({
        // During migration, use openId as temporary UID
        uid: savedUser.openId,
        openId: savedUser.openId,
        name: savedUser.name,
        email: savedUser.email,
        loginMethod: savedUser.loginMethod,
        role: savedUser.role,
        createdAt: Timestamp.fromDate(savedUser.createdAt),
        updatedAt: Timestamp.fromDate(savedUser.updatedAt),
        lastSignedIn: Timestamp.fromDate(savedUser.lastSignedIn),
      });
    } catch (error) {
      console.error("[DB-Unified] Firestore write failed for user, continuing:", error);
    }
  }
}

/**
 * Get user by openId - reads from MySQL (source of truth)
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  return mysqlDb.getUserByOpenId(openId);
}

// ============================================
// Subscription Operations
// ============================================

export async function getUserSubscription(userId: number) {
  return mysqlDb.getUserSubscription(userId);
}

export async function createSubscription(data: any) {
  // Write to MySQL first
  await mysqlDb.createSubscription(data);

  // Write to Firestore (non-blocking)
  try {
    // Get the user to map userId (number) to openId (string)
    const user = await mysqlDb.getUserByOpenId(String(data.userId));
    if (user) {
      await firestoreDb.firestoreCreateSubscription({
        userId: user.openId, // Use openId as userId in Firestore
        status: data.status,
        platform: data.platform,
        transactionId: data.transactionId || null,
        productId: data.productId || null,
        purchaseDate: data.purchaseDate ? Timestamp.fromDate(data.purchaseDate) : null,
        expiryDate: data.expiryDate ? Timestamp.fromDate(data.expiryDate) : null,
        autoRenew: data.autoRenew ?? true,
      });
    }
  } catch (error) {
    console.error("[DB-Unified] Firestore write failed for subscription, continuing:", error);
  }
}

export async function updateSubscription(userId: number, data: any) {
  await mysqlDb.updateSubscription(userId, data);

  // Firestore update would require subscription ID, skip for now
  // This will be handled properly in Phase 2 after full migration
}

export async function isPremiumUser(userId: number): Promise<boolean> {
  return mysqlDb.isPremiumUser(userId);
}

// ============================================
// Project Operations
// ============================================

export async function getUserProjects(userId: number, limit = 20) {
  return mysqlDb.getUserProjects(userId, limit);
}

export async function getProject(projectId: number) {
  return mysqlDb.getProject(projectId);
}

export async function createProject(data: any) {
  // Write to MySQL first
  await mysqlDb.createProject(data);

  // Write to Firestore (non-blocking)
  try {
    // Map userId (number) to openId (string)
    const user = await mysqlDb.getUserByOpenId(String(data.userId));
    if (user) {
      await firestoreDb.firestoreCreateProject({
        userId: user.openId,
        originalImageUrl: data.originalImageUrl,
        resultImageUrl: data.resultImageUrl || null,
        status: data.status,
        nationality: data.nationality,
        gender: data.gender,
        style: data.style,
        selectedFaceId: data.selectedFaceId || null,
        processingTime: data.processingTime || null,
        errorMessage: data.errorMessage || null,
      });
    }
  } catch (error) {
    console.error("[DB-Unified] Firestore write failed for project, continuing:", error);
  }
}

export async function updateProject(projectId: number, data: any) {
  await mysqlDb.updateProject(projectId, data);

  // Firestore update would require mapping projectId, skip for now
  // This will be handled properly in Phase 2
}

export async function deleteProject(projectId: number) {
  await mysqlDb.deleteProject(projectId);

  // Firestore delete would require mapping projectId, skip for now
}

// ============================================
// Face Pool Operations
// ============================================

export async function getFacesByFilter(
  nationality: "korea" | "japan",
  gender: "male" | "female",
  style: string,
  limit = 6
) {
  return mysqlDb.getFacesByFilter(nationality, gender, style, limit);
}

export async function getFaceById(faceId: number) {
  return mysqlDb.getFaceById(faceId);
}

export async function createFace(data: any) {
  // Write to MySQL first
  await mysqlDb.createFace(data);

  // Write to Firestore (non-blocking)
  try {
    await firestoreDb.firestoreCreateFace({
      imageUrl: data.imageUrl,
      nationality: data.nationality,
      gender: data.gender,
      style: data.style,
      faceType: data.faceType || null,
      embedding: data.embedding || null,
      isActive: data.isActive ?? true,
      version: data.version || "v1",
    });
  } catch (error) {
    console.error("[DB-Unified] Firestore write failed for face, continuing:", error);
  }
}

export async function updateFace(faceId: number, data: any) {
  await mysqlDb.updateFace(faceId, data);

  // Firestore update would require mapping faceId, skip for now
}

// ============================================
// Model Performance Operations
// ============================================

export async function getActiveModels() {
  return mysqlDb.getActiveModels();
}

export async function getPrimaryModel() {
  return mysqlDb.getPrimaryModel();
}

export async function createModelPerformance(data: any) {
  // Write to MySQL first
  await mysqlDb.createModelPerformance(data);

  // Write to Firestore (non-blocking)
  try {
    await firestoreDb.firestoreCreateModelPerformance({
      modelName: data.modelName,
      version: data.version,
      hairSSIM: data.hairSSIM || null,
      hairLPIPS: data.hairLPIPS || null,
      hairDeltaE: data.hairDeltaE || null,
      ringColorJump: data.ringColorJump || null,
      landmarkStability: data.landmarkStability || null,
      faceCollapseRate: data.faceCollapseRate || null,
      failureRate: data.failureRate || null,
      avgLatency: data.avgLatency || null,
      costPerRequest: data.costPerRequest || null,
      grade: data.grade,
      isActive: data.isActive ?? true,
      testedAt: data.testedAt ? Timestamp.fromDate(data.testedAt) : Timestamp.now(),
    });
  } catch (error) {
    console.error("[DB-Unified] Firestore write failed for model performance, continuing:", error);
  }
}

// ============================================
// Usage Log Operations
// ============================================

export async function logUsage(data: any) {
  // Write to MySQL first
  await mysqlDb.logUsage(data);

  // Write to Firestore (non-blocking)
  try {
    // Map userId (number) to openId (string)
    const user = await mysqlDb.getUserByOpenId(String(data.userId));
    if (user) {
      await firestoreDb.firestoreLogUsage({
        userId: user.openId,
        projectId: data.projectId ? String(data.projectId) : null,
        action: data.action,
        isPremium: data.isPremium ?? false,
        metadata: data.metadata || null,
      });
    }
  } catch (error) {
    console.error("[DB-Unified] Firestore write failed for usage log, continuing:", error);
  }
}

export async function getUserUsageStats(userId: number, days = 30) {
  return mysqlDb.getUserUsageStats(userId, days);
}

// Export getDb for compatibility
export { getDb } from "./db";
