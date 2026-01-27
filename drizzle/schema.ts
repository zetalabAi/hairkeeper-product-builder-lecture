import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// Subscriptions Table (구독 정보)
// ============================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["free", "premium", "expired"]).default("free").notNull(),
  platform: mysqlEnum("platform", ["google", "apple"]).notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  productId: varchar("productId", { length: 100 }),
  purchaseDate: timestamp("purchaseDate"),
  expiryDate: timestamp("expiryDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// Projects Table (작업 히스토리)
// ============================================
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  originalImageUrl: varchar("originalImageUrl", { length: 500 }).notNull(),
  resultImageUrl: varchar("resultImageUrl", { length: 500 }),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  nationality: mysqlEnum("nationality", ["korea", "japan"]).notNull(),
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  selectedFaceId: int("selectedFaceId"),
  processingTime: int("processingTime"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// Face Pool Table (AI 생성 얼굴 풀)
// ============================================
export const facePool = mysqlTable("face_pool", {
  id: int("id").autoincrement().primaryKey(),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  nationality: mysqlEnum("nationality", ["korea", "japan"]).notNull(),
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  style: varchar("style", { length: 50 }).notNull(),
  faceType: mysqlEnum("faceType", ["cat", "dog", "horse", "rabbit"]),
  embedding: json("embedding"),
  isActive: boolean("isActive").default(true).notNull(),
  version: varchar("version", { length: 20 }).default("v1").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============================================
// Model Performance Table (모델 성능 평가)
// ============================================
export const modelPerformance = mysqlTable("model_performance", {
  id: int("id").autoincrement().primaryKey(),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  hairSSIM: decimal("hairSSIM", { precision: 5, scale: 4 }),
  hairLPIPS: decimal("hairLPIPS", { precision: 5, scale: 4 }),
  hairDeltaE: decimal("hairDeltaE", { precision: 4, scale: 2 }),
  ringColorJump: decimal("ringColorJump", { precision: 4, scale: 2 }),
  landmarkStability: decimal("landmarkStability", { precision: 4, scale: 3 }),
  faceCollapseRate: decimal("faceCollapseRate", { precision: 4, scale: 3 }),
  failureRate: decimal("failureRate", { precision: 4, scale: 3 }),
  avgLatency: int("avgLatency"),
  costPerRequest: decimal("costPerRequest", { precision: 6, scale: 4 }),
  grade: mysqlEnum("grade", ["S", "A", "B", "F"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  testedAt: timestamp("testedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// Usage Logs Table (사용 로그)
// ============================================
export const usageLogs = mysqlTable("usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  action: mysqlEnum("action", ["upload", "process", "download", "share"]).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================
// Type Exports
// ============================================
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type FacePool = typeof facePool.$inferSelect;
export type InsertFacePool = typeof facePool.$inferInsert;

export type ModelPerformance = typeof modelPerformance.$inferSelect;
export type InsertModelPerformance = typeof modelPerformance.$inferInsert;

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;
