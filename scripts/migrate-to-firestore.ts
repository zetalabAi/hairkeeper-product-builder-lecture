/**
 * Migration Script: MySQL → Firestore
 *
 * This script migrates all data from MySQL to Firestore while preserving
 * relationships and data integrity.
 *
 * Usage:
 *   tsx scripts/migrate-to-firestore.ts [--dry-run] [--tables users,projects]
 *
 * Options:
 *   --dry-run: Preview migration without writing to Firestore
 *   --tables: Comma-separated list of tables to migrate (default: all)
 */

import "dotenv/config";
import * as mysqlDb from "../server/db";
import * as firestoreDb from "../server/_core/firestore";
import { Timestamp } from "firebase-admin/firestore";

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const tablesArg = args.find((arg) => arg.startsWith("--tables="));
const tablesToMigrate = tablesArg
  ? tablesArg.split("=")[1].split(",")
  : ["users", "subscriptions", "projects", "facePool", "modelPerformance", "usageLogs"];

// Statistics
const stats = {
  users: { total: 0, migrated: 0, errors: 0 },
  subscriptions: { total: 0, migrated: 0, errors: 0 },
  projects: { total: 0, migrated: 0, errors: 0 },
  facePool: { total: 0, migrated: 0, errors: 0 },
  modelPerformance: { total: 0, migrated: 0, errors: 0 },
  usageLogs: { total: 0, migrated: 0, errors: 0 },
};

/**
 * Helper to safely convert MySQL date to Firestore Timestamp
 */
function toTimestamp(date: Date | null | undefined): Timestamp | null {
  if (!date) return null;
  return Timestamp.fromDate(date);
}

/**
 * Migrate users table
 */
async function migrateUsers() {
  console.log("\n[Users] Starting migration...");

  try {
    // Get all users from MySQL
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const users = await db.select().from(require("../drizzle/schema").users);
    stats.users.total = users.length;

    console.log(`[Users] Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        if (!isDryRun) {
          await firestoreDb.firestoreUpsertUser({
            // Use openId as temporary UID during migration
            uid: user.openId,
            openId: user.openId,
            name: user.name,
            email: user.email,
            loginMethod: user.loginMethod,
            role: user.role,
            createdAt: toTimestamp(user.createdAt)!,
            updatedAt: toTimestamp(user.updatedAt)!,
            lastSignedIn: toTimestamp(user.lastSignedIn)!,
          });
        }

        stats.users.migrated++;
        if (stats.users.migrated % 100 === 0) {
          console.log(`[Users] Migrated ${stats.users.migrated}/${stats.users.total}`);
        }
      } catch (error) {
        console.error(`[Users] Failed to migrate user ${user.id}:`, error);
        stats.users.errors++;
      }
    }

    console.log(
      `[Users] Complete: ${stats.users.migrated} migrated, ${stats.users.errors} errors`
    );
  } catch (error) {
    console.error("[Users] Migration failed:", error);
    throw error;
  }
}

/**
 * Migrate subscriptions table
 */
async function migrateSubscriptions() {
  console.log("\n[Subscriptions] Starting migration...");

  try {
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const subscriptions = await db.select().from(require("../drizzle/schema").subscriptions);
    stats.subscriptions.total = subscriptions.length;

    console.log(`[Subscriptions] Found ${subscriptions.length} subscriptions to migrate`);

    for (const subscription of subscriptions) {
      try {
        // Get user to map userId (number) to openId (string)
        const users = await db
          .select()
          .from(require("../drizzle/schema").users)
          .where(require("drizzle-orm").eq(require("../drizzle/schema").users.id, subscription.userId))
          .limit(1);

        if (users.length === 0) {
          console.warn(`[Subscriptions] User ${subscription.userId} not found, skipping subscription ${subscription.id}`);
          stats.subscriptions.errors++;
          continue;
        }

        const user = users[0];

        if (!isDryRun) {
          await firestoreDb.firestoreCreateSubscription({
            id: String(subscription.id),
            userId: user.openId,
            status: subscription.status,
            platform: subscription.platform,
            transactionId: subscription.transactionId,
            productId: subscription.productId,
            purchaseDate: toTimestamp(subscription.purchaseDate),
            expiryDate: toTimestamp(subscription.expiryDate),
            autoRenew: subscription.autoRenew,
            createdAt: toTimestamp(subscription.createdAt)!,
            updatedAt: toTimestamp(subscription.updatedAt)!,
          });
        }

        stats.subscriptions.migrated++;
      } catch (error) {
        console.error(`[Subscriptions] Failed to migrate subscription ${subscription.id}:`, error);
        stats.subscriptions.errors++;
      }
    }

    console.log(
      `[Subscriptions] Complete: ${stats.subscriptions.migrated} migrated, ${stats.subscriptions.errors} errors`
    );
  } catch (error) {
    console.error("[Subscriptions] Migration failed:", error);
    throw error;
  }
}

/**
 * Migrate projects table
 */
async function migrateProjects() {
  console.log("\n[Projects] Starting migration...");

  try {
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const projects = await db.select().from(require("../drizzle/schema").projects);
    stats.projects.total = projects.length;

    console.log(`[Projects] Found ${projects.length} projects to migrate`);

    for (const project of projects) {
      try {
        // Get user to map userId (number) to openId (string)
        const users = await db
          .select()
          .from(require("../drizzle/schema").users)
          .where(require("drizzle-orm").eq(require("../drizzle/schema").users.id, project.userId))
          .limit(1);

        if (users.length === 0) {
          console.warn(`[Projects] User ${project.userId} not found, skipping project ${project.id}`);
          stats.projects.errors++;
          continue;
        }

        const user = users[0];

        if (!isDryRun) {
          await firestoreDb.firestoreCreateProject({
            id: String(project.id),
            userId: user.openId,
            originalImageUrl: project.originalImageUrl,
            resultImageUrl: project.resultImageUrl,
            status: project.status,
            nationality: project.nationality,
            gender: project.gender,
            style: project.style,
            selectedFaceId: project.selectedFaceId,
            processingTime: project.processingTime,
            errorMessage: project.errorMessage,
            createdAt: toTimestamp(project.createdAt)!,
            updatedAt: toTimestamp(project.updatedAt)!,
          });
        }

        stats.projects.migrated++;
        if (stats.projects.migrated % 100 === 0) {
          console.log(`[Projects] Migrated ${stats.projects.migrated}/${stats.projects.total}`);
        }
      } catch (error) {
        console.error(`[Projects] Failed to migrate project ${project.id}:`, error);
        stats.projects.errors++;
      }
    }

    console.log(
      `[Projects] Complete: ${stats.projects.migrated} migrated, ${stats.projects.errors} errors`
    );
  } catch (error) {
    console.error("[Projects] Migration failed:", error);
    throw error;
  }
}

/**
 * Migrate face pool table
 */
async function migrateFacePool() {
  console.log("\n[FacePool] Starting migration...");

  try {
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const faces = await db.select().from(require("../drizzle/schema").facePool);
    stats.facePool.total = faces.length;

    console.log(`[FacePool] Found ${faces.length} faces to migrate`);

    for (const face of faces) {
      try {
        if (!isDryRun) {
          await firestoreDb.firestoreCreateFace({
            id: String(face.id),
            imageUrl: face.imageUrl,
            nationality: face.nationality,
            gender: face.gender,
            style: face.style,
            faceType: face.faceType,
            embedding: face.embedding as number[] | null,
            isActive: face.isActive,
            version: face.version,
            createdAt: toTimestamp(face.createdAt)!,
            updatedAt: toTimestamp(face.updatedAt)!,
          });
        }

        stats.facePool.migrated++;
      } catch (error) {
        console.error(`[FacePool] Failed to migrate face ${face.id}:`, error);
        stats.facePool.errors++;
      }
    }

    console.log(
      `[FacePool] Complete: ${stats.facePool.migrated} migrated, ${stats.facePool.errors} errors`
    );
  } catch (error) {
    console.error("[FacePool] Migration failed:", error);
    throw error;
  }
}

/**
 * Migrate model performance table
 */
async function migrateModelPerformance() {
  console.log("\n[ModelPerformance] Starting migration...");

  try {
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const models = await db.select().from(require("../drizzle/schema").modelPerformance);
    stats.modelPerformance.total = models.length;

    console.log(`[ModelPerformance] Found ${models.length} models to migrate`);

    for (const model of models) {
      try {
        if (!isDryRun) {
          await firestoreDb.firestoreCreateModelPerformance({
            id: String(model.id),
            modelName: model.modelName,
            version: model.version,
            hairSSIM: model.hairSSIM ? Number(model.hairSSIM) : null,
            hairLPIPS: model.hairLPIPS ? Number(model.hairLPIPS) : null,
            hairDeltaE: model.hairDeltaE ? Number(model.hairDeltaE) : null,
            ringColorJump: model.ringColorJump ? Number(model.ringColorJump) : null,
            landmarkStability: model.landmarkStability ? Number(model.landmarkStability) : null,
            faceCollapseRate: model.faceCollapseRate ? Number(model.faceCollapseRate) : null,
            failureRate: model.failureRate ? Number(model.failureRate) : null,
            avgLatency: model.avgLatency,
            costPerRequest: model.costPerRequest ? Number(model.costPerRequest) : null,
            grade: model.grade,
            isActive: model.isActive,
            testedAt: toTimestamp(model.testedAt)!,
            createdAt: toTimestamp(model.createdAt)!,
          });
        }

        stats.modelPerformance.migrated++;
      } catch (error) {
        console.error(`[ModelPerformance] Failed to migrate model ${model.id}:`, error);
        stats.modelPerformance.errors++;
      }
    }

    console.log(
      `[ModelPerformance] Complete: ${stats.modelPerformance.migrated} migrated, ${stats.modelPerformance.errors} errors`
    );
  } catch (error) {
    console.error("[ModelPerformance] Migration failed:", error);
    throw error;
  }
}

/**
 * Migrate usage logs table
 */
async function migrateUsageLogs() {
  console.log("\n[UsageLogs] Starting migration...");

  try {
    const db = await mysqlDb.getDb();
    if (!db) {
      throw new Error("MySQL database not available");
    }

    const logs = await db.select().from(require("../drizzle/schema").usageLogs);
    stats.usageLogs.total = logs.length;

    console.log(`[UsageLogs] Found ${logs.length} logs to migrate`);

    for (const log of logs) {
      try {
        // Get user to map userId (number) to openId (string)
        const users = await db
          .select()
          .from(require("../drizzle/schema").users)
          .where(require("drizzle-orm").eq(require("../drizzle/schema").users.id, log.userId))
          .limit(1);

        if (users.length === 0) {
          console.warn(`[UsageLogs] User ${log.userId} not found, skipping log ${log.id}`);
          stats.usageLogs.errors++;
          continue;
        }

        const user = users[0];

        if (!isDryRun) {
          await firestoreDb.firestoreLogUsage({
            id: String(log.id),
            userId: user.openId,
            projectId: log.projectId ? String(log.projectId) : null,
            action: log.action,
            isPremium: log.isPremium,
            metadata: log.metadata as Record<string, any> | null,
            createdAt: toTimestamp(log.createdAt)!,
          });
        }

        stats.usageLogs.migrated++;
        if (stats.usageLogs.migrated % 1000 === 0) {
          console.log(`[UsageLogs] Migrated ${stats.usageLogs.migrated}/${stats.usageLogs.total}`);
        }
      } catch (error) {
        console.error(`[UsageLogs] Failed to migrate log ${log.id}:`, error);
        stats.usageLogs.errors++;
      }
    }

    console.log(
      `[UsageLogs] Complete: ${stats.usageLogs.migrated} migrated, ${stats.usageLogs.errors} errors`
    );
  } catch (error) {
    console.error("[UsageLogs] Migration failed:", error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log("=".repeat(60));
  console.log("MySQL → Firestore Migration");
  console.log("=".repeat(60));
  console.log(`Mode: ${isDryRun ? "DRY RUN (no writes)" : "LIVE MIGRATION"}`);
  console.log(`Tables: ${tablesToMigrate.join(", ")}`);
  console.log("=".repeat(60));

  if (isDryRun) {
    console.log("\n⚠️  DRY RUN MODE - No data will be written to Firestore\n");
  }

  const startTime = Date.now();

  try {
    // Migrate in dependency order
    if (tablesToMigrate.includes("users")) {
      await migrateUsers();
    }

    if (tablesToMigrate.includes("subscriptions")) {
      await migrateSubscriptions();
    }

    if (tablesToMigrate.includes("projects")) {
      await migrateProjects();
    }

    if (tablesToMigrate.includes("facePool")) {
      await migrateFacePool();
    }

    if (tablesToMigrate.includes("modelPerformance")) {
      await migrateModelPerformance();
    }

    if (tablesToMigrate.includes("usageLogs")) {
      await migrateUsageLogs();
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(60));
    console.log("Migration Summary");
    console.log("=".repeat(60));
    console.log(`Duration: ${duration}s`);
    console.log("\nResults:");

    for (const [table, stat] of Object.entries(stats)) {
      if (stat.total > 0) {
        console.log(
          `  ${table}: ${stat.migrated}/${stat.total} migrated, ${stat.errors} errors`
        );
      }
    }

    console.log("=".repeat(60));

    if (isDryRun) {
      console.log("\n✅ Dry run complete - review results above");
      console.log("Run without --dry-run to perform actual migration");
    } else {
      console.log("\n✅ Migration complete!");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrate();
