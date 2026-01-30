import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { projects, type InsertProject } from "../drizzle/schema";

/**
 * Create a new project (face swap record)
 */
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create project: database not available");
    return null;
  }

  try {
    const result = await db.insert(projects).values(data);
    return result[0]?.insertId || null;
  } catch (error) {
    console.error("[Database] Failed to create project:", error);
    throw error;
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: number,
  data: Partial<InsertProject>
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update project: database not available");
    return;
  }

  try {
    await db.update(projects).set(data).where(eq(projects.id, projectId));
  } catch (error) {
    console.error("[Database] Failed to update project:", error);
    throw error;
  }
}

/**
 * Get all projects for a user, ordered by most recent
 */
export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get projects: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt))
      .limit(100); // 최근 100개만

    return result;
  } catch (error) {
    console.error("[Database] Failed to get projects:", error);
    return [];
  }
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get project: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get project:", error);
    return null;
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete project: database not available");
    return;
  }

  try {
    await db.delete(projects).where(eq(projects.id, projectId));
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
    throw error;
  }
}
