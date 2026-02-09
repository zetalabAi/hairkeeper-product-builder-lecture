/**
 * tRPC React Client (Firebase 버전)
 *
 * Firebase ID 토큰을 사용하여 API를 호출합니다.
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { Platform } from "react-native";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";

// Firebase Auth 비활성화 (웹에서 인증 불필요)
// publicProcedure를 사용하므로 Firebase 토큰이 필요 없음

/**
 * tRPC React client for type-safe API calls.
 *
 * IMPORTANT (tRPC v11): The `transformer` must be inside `httpBatchLink`,
 * NOT at the root createClient level. This ensures client and server
 * use the same serialization format (superjson).
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Firebase ID 토큰 가져오기
 *
 * Firebase disabled on web - return null to allow unauthenticated requests
 */
async function getFirebaseIdToken(): Promise<string | null> {
  // Firebase disabled on web - skip authentication
  return null;
}

/**
 * Creates the tRPC client with Firebase authentication.
 * Call this once in your app's root layout.
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        // tRPC v11: transformer MUST be inside httpBatchLink, not at root
        transformer: superjson,
        async headers() {
          // Firebase ID 토큰을 Authorization 헤더에 추가
          const token = await getFirebaseIdToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        // Custom fetch with extended timeout for face synthesis (40-60 seconds)
        fetch(url, options) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds

          return fetch(url, {
            ...options,
            credentials: "include",
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId));
        },
      }),
    ],
  });
}
