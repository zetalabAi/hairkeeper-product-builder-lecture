/**
 * tRPC React Client (Firebase 버전)
 *
 * Firebase ID 토큰을 사용하여 API를 호출합니다.
 */

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import auth from "@react-native-firebase/auth";
import type { AppRouter } from "@/server/routers";
import { getApiBaseUrl } from "@/constants/oauth";

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
 */
async function getFirebaseIdToken(): Promise<string | null> {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log('[tRPC] 로그인하지 않은 사용자');
      return null;
    }

    // Firebase ID 토큰 가져오기 (자동 갱신)
    const token = await currentUser.getIdToken();
    console.log('[tRPC] Firebase ID 토큰 가져오기 성공');
    return token;
  } catch (error) {
    console.error('[tRPC] Firebase ID 토큰 가져오기 실패:', error);
    return null;
  }
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
        // Custom fetch to include credentials for cookie-based auth
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
}
