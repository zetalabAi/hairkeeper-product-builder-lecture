/**
 * Database Module (Firestore Only)
 *
 * 간소화된 데이터베이스 모듈 - Firestore만 사용합니다.
 */

import * as firestoreDb from "./_core/firestore";
import { Timestamp } from "firebase-admin/firestore";

// Firestore 타입을 앱 전체에서 사용할 수 있도록 re-export
export type { FirestoreUser as User } from "../shared/firestore-schema";

// ============================================
// User Operations
// ============================================

export async function upsertUser(user: {
  openId: string;
  uid?: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin";
  lastSignedIn?: Date;
}): Promise<void> {
  const uid = user.uid || user.openId; // uid 우선, 없으면 openId 사용

  await firestoreDb.firestoreUpsertUser({
    uid,
    openId: user.openId,
    name: user.name || null,
    email: user.email || null,
    loginMethod: user.loginMethod || null,
    role: user.role || "user",
    lastSignedIn: user.lastSignedIn ? Timestamp.fromDate(user.lastSignedIn) : Timestamp.now(),
  });
}

export async function getUserByOpenId(openId: string) {
  const user = await firestoreDb.firestoreGetUserByOpenId(openId);
  if (!user) return undefined;

  // Firestore User를 앱 User 타입으로 변환
  return {
    id: 0, // 더미 ID (이전 MySQL 호환성)
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    createdAt: user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt as any),
    updatedAt: user.updatedAt instanceof Timestamp ? user.updatedAt.toDate() : new Date(user.updatedAt as any),
    lastSignedIn: user.lastSignedIn instanceof Timestamp ? user.lastSignedIn.toDate() : new Date(user.lastSignedIn as any),
  };
}

export async function getUserByUid(uid: string) {
  const user = await firestoreDb.firestoreGetUserByUid(uid);
  if (!user) return undefined;

  return {
    id: 0,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    createdAt: user.createdAt instanceof Timestamp ? user.createdAt.toDate() : new Date(user.createdAt as any),
    updatedAt: user.updatedAt instanceof Timestamp ? user.updatedAt.toDate() : new Date(user.updatedAt as any),
    lastSignedIn: user.lastSignedIn instanceof Timestamp ? user.lastSignedIn.toDate() : new Date(user.lastSignedIn as any),
  };
}

// ============================================
// Subscription Operations
// ============================================

export async function getUserSubscription(userId: string) {
  return firestoreDb.firestoreGetUserSubscription(userId);
}

export async function createSubscription(data: any) {
  return firestoreDb.firestoreCreateSubscription(data);
}

export async function updateSubscription(subscriptionId: string, data: any) {
  return firestoreDb.firestoreUpdateSubscription(subscriptionId, data);
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  return firestoreDb.firestoreIsPremiumUser(userId);
}

// ============================================
// Project Operations
// ============================================

export async function getUserProjects(userId: string, limit = 20) {
  return firestoreDb.firestoreGetUserProjects(userId, limit);
}

export async function getProject(projectId: string) {
  return firestoreDb.firestoreGetProject(projectId);
}

export async function createProject(data: any) {
  return firestoreDb.firestoreCreateProject(data);
}

export async function updateProject(projectId: string, data: any) {
  return firestoreDb.firestoreUpdateProject(projectId, data);
}

export async function deleteProject(projectId: string) {
  return firestoreDb.firestoreDeleteProject(projectId);
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
  return firestoreDb.firestoreGetFacesByFilter(nationality, gender, style, limit);
}

export async function getFaceById(faceId: string) {
  return firestoreDb.firestoreGetFaceById(faceId);
}

export async function createFace(data: any) {
  return firestoreDb.firestoreCreateFace(data);
}

export async function updateFace(faceId: string, data: any) {
  return firestoreDb.firestoreUpdateFace(faceId, data);
}

// ============================================
// Model Performance Operations
// ============================================

export async function getActiveModels() {
  return firestoreDb.firestoreGetActiveModels();
}

export async function getPrimaryModel() {
  return firestoreDb.firestoreGetPrimaryModel();
}

export async function createModelPerformance(data: any) {
  return firestoreDb.firestoreCreateModelPerformance(data);
}

// ============================================
// Usage Log Operations
// ============================================

export async function logUsage(data: any) {
  return firestoreDb.firestoreLogUsage(data);
}

export async function getUserUsageStats(userId: string, days = 30) {
  return firestoreDb.firestoreGetUserUsageStats(userId, days);
}

// DB 인스턴스 가져오기 (호환성)
export function getDb() {
  return firestoreDb.getFirestoreDb();
}
