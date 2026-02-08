/**
 * API URL Configuration
 *
 * Firebase/GCP 전용 버전으로 간소화됨.
 * OAuth 관련 코드는 모두 제거됨.
 */

import * as ReactNative from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

/**
 * Get the API base URL, deriving from current hostname if not set.
 * Metro runs on 8081, API server runs on 3000.
 * URL pattern: https://PORT-sandboxid.region.domain
 */
export function getApiBaseUrl(): string {
  // If API_BASE_URL is set, use it
  if (API_BASE_URL) {
    return API_BASE_URL.replace(/\/$/, "");
  }

  // On web, derive from current hostname
  if (ReactNative.Platform.OS === "web" && typeof window !== "undefined" && window.location) {
    const { protocol, hostname, port } = window.location;

    // For localhost development: localhost:8081 -> localhost:3000
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:3000`;
    }

    // For cloud IDEs: Pattern: 8081-sandboxid.region.domain -> 3000-sandboxid.region.domain
    const apiHostname = hostname.replace(/^8081-/, "3000-");
    if (apiHostname !== hostname) {
      return `${protocol}//${apiHostname}`;
    }
  }

  // Fallback to localhost:3000 for development
  return "http://localhost:3000";
}
