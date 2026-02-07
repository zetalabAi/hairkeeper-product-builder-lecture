/**
 * Error Tracking with Firebase Crashlytics
 *
 * React Native 앱에서 에러를 추적하고 Firebase Crashlytics에 보고합니다.
 */

import crashlytics from '@react-native-firebase/crashlytics';
import { Platform } from 'react-native';

/**
 * Crashlytics 초기화 여부 확인
 */
let isInitialized = false;

/**
 * Crashlytics 초기화
 */
export function initializeCrashlytics() {
  if (isInitialized) return;

  try {
    // 개발 모드에서는 Crashlytics 비활성화 (선택사항)
    if (__DEV__) {
      console.log('[Crashlytics] 개발 모드: Crashlytics 비활성화');
      crashlytics().setCrashlyticsCollectionEnabled(false);
    } else {
      console.log('[Crashlytics] Crashlytics 활성화');
      crashlytics().setCrashlyticsCollectionEnabled(true);
    }

    isInitialized = true;
  } catch (error) {
    console.error('[Crashlytics] 초기화 실패:', error);
  }
}

/**
 * 사용자 식별자 설정
 * 로그인 후 호출하여 사용자별 에러 추적
 */
export function setUserIdentifier(userId: string) {
  try {
    crashlytics().setUserId(userId);
    console.log('[Crashlytics] 사용자 ID 설정:', userId);
  } catch (error) {
    console.error('[Crashlytics] 사용자 ID 설정 실패:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export function setUserAttributes(attributes: Record<string, string>) {
  try {
    Object.entries(attributes).forEach(([key, value]) => {
      crashlytics().setAttribute(key, value);
    });
    console.log('[Crashlytics] 사용자 속성 설정:', attributes);
  } catch (error) {
    console.error('[Crashlytics] 사용자 속성 설정 실패:', error);
  }
}

/**
 * 에러 로깅
 * 치명적이지 않은 에러를 Crashlytics에 보고
 */
export function logError(error: Error, context?: Record<string, any>) {
  try {
    // 컨텍스트 정보를 Crashlytics 로그에 추가
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().log(`${key}: ${JSON.stringify(value)}`);
      });
    }

    // 에러 기록
    crashlytics().recordError(error);
    console.error('[Crashlytics] 에러 기록:', error.message, context);
  } catch (err) {
    console.error('[Crashlytics] 에러 기록 실패:', err);
  }
}

/**
 * 커스텀 로그 메시지
 * Crashlytics에 로그 메시지를 추가 (에러 발생 시 함께 표시됨)
 */
export function log(message: string) {
  try {
    crashlytics().log(message);
    console.log('[Crashlytics]', message);
  } catch (error) {
    console.error('[Crashlytics] 로그 실패:', error);
  }
}

/**
 * 강제 크래시 (테스트용)
 * 개발 중에만 사용 - Crashlytics가 제대로 작동하는지 확인
 */
export function testCrash() {
  if (__DEV__) {
    console.warn('[Crashlytics] 테스트 크래시 실행...');
    crashlytics().crash();
  } else {
    console.warn('[Crashlytics] 테스트 크래시는 개발 모드에서만 실행됩니다.');
  }
}

/**
 * 웹 플랫폼용 폴백 (Crashlytics는 네이티브만 지원)
 */
if (Platform.OS === 'web') {
  console.log('[Crashlytics] 웹 플랫폼: Crashlytics 대신 콘솔 로그 사용');

  // 웹에서는 콘솔만 사용
  exports.initializeCrashlytics = () => {
    console.log('[Crashlytics] 웹 플랫폼: 초기화 건너뜀');
  };

  exports.setUserIdentifier = (userId: string) => {
    console.log('[Crashlytics] 웹 플랫폼: 사용자 ID:', userId);
  };

  exports.setUserAttributes = (attributes: Record<string, string>) => {
    console.log('[Crashlytics] 웹 플랫폼: 사용자 속성:', attributes);
  };

  exports.logError = (error: Error, context?: Record<string, any>) => {
    console.error('[Crashlytics] 웹 플랫폼: 에러:', error, context);
  };

  exports.log = (message: string) => {
    console.log('[Crashlytics] 웹 플랫폼:', message);
  };

  exports.testCrash = () => {
    console.warn('[Crashlytics] 웹 플랫폼: 테스트 크래시 지원 안함');
  };
}
