import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  subscriptions,
  projects,
  facePool,
  modelPerformance,
  usageLogs,
  type InsertSubscription,
  type InsertProject,
  type InsertFacePool,
  type InsertModelPerformance,
  type InsertUsageLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Subscription Queries
// ============================================

export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(subscriptions).values(data);
}

export async function updateSubscription(
  userId: number,
  data: Partial<InsertSubscription>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(subscriptions)
    .set(data)
    .where(eq(subscriptions.userId, userId));
}

export async function isPremiumUser(userId: number): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  if (subscription.status === "premium" && subscription.expiryDate) {
    return new Date(subscription.expiryDate) > new Date();
  }

  return false;
}

// ============================================
// Project Queries
// ============================================

export async function getUserProjects(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(limit);
}

export async function getProject(projectId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return result[0] || null;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(projects).values(data);
}

export async function updateProject(
  projectId: number,
  data: Partial<InsertProject>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(projects).set(data).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(projects).where(eq(projects.id, projectId));
}

// ============================================
// Face Pool Queries
// ============================================

export async function getFacesByFilter(
  nationality: "korea" | "japan",
  gender: "male" | "female",
  style: string,
  limit = 6
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(facePool)
    .where(
      and(
        eq(facePool.nationality, nationality),
        eq(facePool.gender, gender),
        eq(facePool.style, style),
        eq(facePool.isActive, true)
      )
    )
    .limit(limit);
}

export async function getFaceById(faceId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(facePool)
    .where(eq(facePool.id, faceId))
    .limit(1);

  return result[0] || null;
}

export async function createFace(data: InsertFacePool) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(facePool).values(data);
}

export async function updateFace(faceId: number, data: Partial<InsertFacePool>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(facePool).set(data).where(eq(facePool.id, faceId));
}

// ============================================
// Model Performance Queries
// ============================================

export async function getActiveModels() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(modelPerformance)
    .where(eq(modelPerformance.isActive, true))
    .orderBy(desc(modelPerformance.grade));
}

export async function getPrimaryModel() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(modelPerformance)
    .where(
      and(
        eq(modelPerformance.isActive, true),
        eq(modelPerformance.grade, "S")
      )
    )
    .orderBy(desc(modelPerformance.testedAt))
    .limit(1);

  return result[0] || null;
}

export async function createModelPerformance(data: InsertModelPerformance) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(modelPerformance).values(data);
}

// ============================================
// Usage Log Queries
// ============================================

export async function logUsage(data: InsertUsageLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(usageLogs).values(data);
}

export async function getUserUsageStats(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db
    .select()
    .from(usageLogs)
    .where(eq(usageLogs.userId, userId))
    .orderBy(desc(usageLogs.createdAt));
}
