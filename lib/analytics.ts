/**
 * Analytics with Firebase Analytics
 *
 * 사용자 행동 추적 및 앱 사용 패턴 분석
 */

import { Platform } from 'react-native';

// Web에서는 @react-native-firebase/analytics를 사용할 수 없으므로 조건부 import
let analytics: any = null;
if (Platform.OS !== 'web') {
  try {
    analytics = require('@react-native-firebase/analytics').default;
  } catch (error) {
    console.warn('[Analytics] Firebase Analytics not available:', error);
  }
}

/**
 * Analytics 초기화 여부
 */
let isInitialized = false;

/**
 * Analytics 초기화
 */
export async function initializeAnalytics() {
  if (isInitialized) return;

  try {
    // 개발 모드에서는 Analytics 비활성화 (선택사항)
    if (__DEV__) {
      console.log('[Analytics] 개발 모드: Analytics 비활성화');
      await analytics().setAnalyticsCollectionEnabled(false);
    } else {
      console.log('[Analytics] Analytics 활성화');
      await analytics().setAnalyticsCollectionEnabled(true);
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Analytics] 초기화 실패:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export async function setUserProperty(name: string, value: string) {
  try {
    await analytics().setUserProperty(name, value);
    console.log('[Analytics] 사용자 속성 설정:', name, value);
  } catch (error) {
    console.error('[Analytics] 사용자 속성 설정 실패:', error);
  }
}

/**
 * 사용자 ID 설정
 */
export async function setUserId(userId: string | null) {
  try {
    await analytics().setUserId(userId);
    console.log('[Analytics] 사용자 ID 설정:', userId);
  } catch (error) {
    console.error('[Analytics] 사용자 ID 설정 실패:', error);
  }
}

/**
 * 화면 조회 추적
 * expo-router의 각 화면에서 호출
 */
export async function logScreenView(screenName: string, screenClass?: string) {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log('[Analytics] 화면 조회:', screenName);
  } catch (error) {
    console.error('[Analytics] 화면 조회 로그 실패:', error);
  }
}

/**
 * 커스텀 이벤트 로깅
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, any>
) {
  try {
    await analytics().logEvent(eventName, params);
    console.log('[Analytics] 이벤트:', eventName, params);
  } catch (error) {
    console.error('[Analytics] 이벤트 로그 실패:', error);
  }
}

/**
 * 앱별 주요 이벤트
 */

// 로그인 이벤트
export async function logLogin(method: 'google' | 'apple' | 'email') {
  await logEvent('login', {
    method,
  });
}

// 회원가입 이벤트
export async function logSignUp(method: 'google' | 'apple' | 'email') {
  await logEvent('sign_up', {
    method,
  });
}

// 프로젝트 생성 이벤트
export async function logProjectCreated(params: {
  projectId: string;
  nationality: string;
  gender: string;
  style: string;
}) {
  await logEvent('project_created', params);
}

// 프로젝트 완료 이벤트
export async function logProjectCompleted(params: {
  projectId: string;
  processingTime: number; // 초 단위
  success: boolean;
}) {
  await logEvent('project_completed', params);
}

// 이미지 업로드 이벤트
export async function logImageUpload(params: {
  size: number; // 바이트
  mimeType: string;
}) {
  await logEvent('image_upload', params);
}

// 결제 이벤트
export async function logPurchase(params: {
  transactionId: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
  }>;
}) {
  await logEvent('purchase', params);
}

// 구독 시작 이벤트
export async function logSubscriptionStart(params: {
  subscriptionId: string;
  plan: string;
  price: number;
  currency: string;
}) {
  await logEvent('subscription_start', params);
}

// 구독 취소 이벤트
export async function logSubscriptionCancel(params: {
  subscriptionId: string;
  plan: string;
  reason?: string;
}) {
  await logEvent('subscription_cancel', params);
}

// 공유 이벤트
export async function logShare(params: {
  contentType: 'project' | 'result';
  contentId: string;
  method: string; // 'facebook', 'twitter', 'copy_link', etc.
}) {
  await logEvent('share', params);
}

// 에러 이벤트
export async function logAppError(params: {
  errorCode: string;
  errorMessage: string;
  screen?: string;
}) {
  await logEvent('app_error', params);
}

// 검색 이벤트
export async function logSearch(params: {
  searchTerm: string;
  category?: string;
}) {
  await logEvent('search', params);
}

/**
 * 웹 플랫폼용 폴백 (Analytics는 네이티브만 완전 지원)
 */
if (Platform.OS === 'web') {
  console.log('[Analytics] 웹 플랫폼: Analytics 대신 콘솔 로그 사용');

  // 웹에서는 콘솔만 사용 (또는 Google Analytics Web SDK 사용 가능)
  const webLogEvent = (name: string, params?: any) => {
    console.log(`[Analytics] 웹 이벤트: ${name}`, params);
  };

  exports.initializeAnalytics = async () => {
    console.log('[Analytics] 웹 플랫폼: 초기화 건너뜀');
  };

  exports.setUserProperty = async (name: string, value: string) => {
    console.log('[Analytics] 웹 플랫폼: 사용자 속성:', name, value);
  };

  exports.setUserId = async (userId: string | null) => {
    console.log('[Analytics] 웹 플랫폼: 사용자 ID:', userId);
  };

  exports.logScreenView = async (screenName: string) => {
    webLogEvent('screen_view', { screen_name: screenName });
  };

  exports.logEvent = async (eventName: string, params?: any) => {
    webLogEvent(eventName, params);
  };

  // 모든 커스텀 이벤트도 웹 버전으로 대체
  exports.logLogin = async (method: string) => webLogEvent('login', { method });
  exports.logSignUp = async (method: string) => webLogEvent('sign_up', { method });
  exports.logProjectCreated = async (params: any) => webLogEvent('project_created', params);
  exports.logProjectCompleted = async (params: any) => webLogEvent('project_completed', params);
  exports.logImageUpload = async (params: any) => webLogEvent('image_upload', params);
  exports.logPurchase = async (params: any) => webLogEvent('purchase', params);
  exports.logSubscriptionStart = async (params: any) => webLogEvent('subscription_start', params);
  exports.logSubscriptionCancel = async (params: any) => webLogEvent('subscription_cancel', params);
  exports.logShare = async (params: any) => webLogEvent('share', params);
  exports.logAppError = async (params: any) => webLogEvent('app_error', params);
  exports.logSearch = async (params: any) => webLogEvent('search', params);
}
