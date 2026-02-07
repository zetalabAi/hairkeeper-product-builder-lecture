/**
 * tRPC Context (Firebase Auth Only)
 *
 * Firebase 인증만 사용합니다.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyFirebaseToken } from "./firebase-auth";
import { firestoreGetUserByUid } from "./firestore";
import { Timestamp } from "firebase-admin/firestore";

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Authorization 헤더에서 Firebase ID 토큰 추출
 */
function extractFirebaseToken(req: CreateExpressContextOptions["req"]): string | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (typeof authHeader !== "string") {
    return null;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

/**
 * Firebase 토큰으로 사용자 인증
 */
async function authenticateWithFirebase(
  req: CreateExpressContextOptions["req"]
): Promise<User | null> {
  const idToken = extractFirebaseToken(req);
  if (!idToken) {
    return null;
  }

  try {
    // Firebase ID 토큰 검증
    const decodedToken = await verifyFirebaseToken(idToken);
    if (!decodedToken) {
      return null;
    }

    const firebaseUid = decodedToken.uid;

    // Firestore에서 사용자 조회
    let user = await firestoreGetUserByUid(firebaseUid);

    if (!user) {
      // Firebase Auth에는 있지만 Firestore에 없는 경우
      // 새 사용자로 등록 (회원가입)
      const now = Timestamp.now();
      const { firestoreUpsertUser } = await import("./firestore");

      await firestoreUpsertUser({
        uid: firebaseUid,
        openId: firebaseUid, // Firebase 사용자는 openId = uid
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
      console.error("[Auth] Firebase 인증 후 사용자 생성/조회 실패");
      return null;
    }

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
  } catch (error) {
    console.error("[Auth] Firebase 인증 실패:", error);
    return null;
  }
}

/**
 * tRPC 컨텍스트 생성
 */
export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Firebase 인증 시도
    user = await authenticateWithFirebase(opts.req);
  } catch (error) {
    // 인증은 선택사항 (public procedures는 인증 없이도 작동)
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
