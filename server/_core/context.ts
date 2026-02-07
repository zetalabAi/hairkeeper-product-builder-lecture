import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { unifiedAuthMiddleware } from "./auth-migration";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  /** Indicates if user authenticated via Firebase (vs Manus) */
  isFirebaseAuth?: boolean;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  let isFirebaseAuth = false;

  try {
    // Use unified auth middleware that supports both Firebase and Manus
    const authResult = await unifiedAuthMiddleware(opts.req);
    user = authResult.user;
    isFirebaseAuth = authResult.source === "firebase";
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    isFirebaseAuth,
  };
}
