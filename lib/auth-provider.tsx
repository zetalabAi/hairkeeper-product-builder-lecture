/**
 * Firebase Auth Provider
 *
 * React Context를 사용하여 앱 전체에서 인증 상태를 관리합니다.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { firebaseConfig, validateFirebaseConfig } from '../firebase.config';
import * as Analytics from './analytics';
import * as ErrorTracking from './error-tracking';

// Firebase 초기화는 네이티브에서 자동으로 처리됩니다.
// GoogleService-Info.plist (iOS) 및 google-services.json (Android) 필요

/**
 * 사용자 타입
 */
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};

/**
 * Auth Context 타입
 */
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;

  // 로그인 메서드
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;

  // 기타
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (update: { displayName?: string; photoURL?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Firebase User를 앱 User 타입으로 변환
 */
function toAppUser(firebaseUser: FirebaseAuthTypes.User | null): User | null {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}

/**
 * Auth Provider 컴포넌트
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase 설정 검증
  useEffect(() => {
    if (!validateFirebaseConfig()) {
      setError('Firebase 설정이 올바르지 않습니다. .env 파일을 확인해주세요.');
      setLoading(false);
      return;
    }
  }, []);

  // 인증 상태 변경 리스너
  useEffect(() => {
    console.log('[Auth Provider] 인증 상태 리스너 등록');

    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      console.log('[Auth Provider] 인증 상태 변경:', firebaseUser?.uid || 'null');
      setUser(toAppUser(firebaseUser));
      setLoading(false);

      // Analytics 및 Error Tracking 설정
      if (firebaseUser) {
        // 사용자 식별자 설정
        await Analytics.setUserId(firebaseUser.uid);
        ErrorTracking.setUserIdentifier(firebaseUser.uid);

        // 사용자 속성 설정
        await Analytics.setUserProperty('email_verified', firebaseUser.emailVerified ? 'true' : 'false');
        if (firebaseUser.email) {
          ErrorTracking.setUserAttributes({
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified ? 'true' : 'false',
          });
        }

        console.log('[Auth Provider] Analytics 및 Crashlytics 사용자 설정 완료');
      } else {
        // 로그아웃 시 사용자 정보 제거
        await Analytics.setUserId(null);
      }
    });

    return unsubscribe;
  }, []);

  // 이메일/비밀번호로 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await auth().signInWithEmailAndPassword(email, password);
      console.log('[Auth] 이메일 로그인 성공');

      // Analytics 이벤트 기록
      await Analytics.logLogin('email');
    } catch (err: any) {
      console.error('[Auth] 이메일 로그인 실패:', err);
      setError(err.message || '로그인에 실패했습니다.');

      // 에러 추적
      ErrorTracking.logError(err, {
        context: 'signInWithEmail',
        email,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 이메일/비밀번호로 회원가입
  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName?: string) => {
      try {
        setError(null);
        setLoading(true);
        const credential = await auth().createUserWithEmailAndPassword(email, password);

        // 프로필 업데이트
        if (displayName && credential.user) {
          await credential.user.updateProfile({ displayName });
        }

        // 이메일 인증 발송
        await credential.user?.sendEmailVerification();

        console.log('[Auth] 회원가입 성공:', credential.user.uid);

        // Analytics 이벤트 기록
        await Analytics.logSignUp('email');
      } catch (err: any) {
        console.error('[Auth] 회원가입 실패:', err);
        setError(err.message || '회원가입에 실패했습니다.');

        // 에러 추적
        ErrorTracking.logError(err, {
          context: 'signUpWithEmail',
          email,
        });

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Google 로그인
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Google Sign-In은 추가 패키지 필요
      // @react-native-google-signin/google-signin
      console.warn(
        '[Auth] Google Sign-In은 @react-native-google-signin/google-signin 패키지가 필요합니다.'
      );
      throw new Error('Google Sign-In은 아직 구현되지 않았습니다. 네이티브 설정이 필요합니다.');
    } catch (err: any) {
      console.error('[Auth] Google 로그인 실패:', err);
      setError(err.message || 'Google 로그인에 실패했습니다.');

      // 에러 추적
      ErrorTracking.logError(err, {
        context: 'signInWithGoogle',
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apple 로그인
  const signInWithApple = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Apple Sign-In은 추가 패키지 필요
      // @invertase/react-native-apple-authentication
      console.warn(
        '[Auth] Apple Sign-In은 @invertase/react-native-apple-authentication 패키지가 필요합니다.'
      );
      throw new Error('Apple Sign-In은 아직 구현되지 않았습니다. 네이티브 설정이 필요합니다.');
    } catch (err: any) {
      console.error('[Auth] Apple 로그인 실패:', err);
      setError(err.message || 'Apple 로그인에 실패했습니다.');

      // 에러 추적
      ErrorTracking.logError(err, {
        context: 'signInWithApple',
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    try {
      setError(null);
      await auth().signOut();
      console.log('[Auth] 로그아웃 성공');
    } catch (err: any) {
      console.error('[Auth] 로그아웃 실패:', err);
      setError(err.message || '로그아웃에 실패했습니다.');
      throw err;
    }
  }, []);

  // 비밀번호 재설정 이메일 발송
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      setError(null);
      await auth().sendPasswordResetEmail(email);
      console.log('[Auth] 비밀번호 재설정 이메일 발송:', email);
    } catch (err: any) {
      console.error('[Auth] 비밀번호 재설정 실패:', err);
      setError(err.message || '비밀번호 재설정에 실패했습니다.');
      throw err;
    }
  }, []);

  // 프로필 업데이트
  const updateProfile = useCallback(
    async (update: { displayName?: string; photoURL?: string }) => {
      try {
        setError(null);
        const currentUser = auth().currentUser;
        if (!currentUser) {
          throw new Error('로그인이 필요합니다.');
        }

        await currentUser.updateProfile(update);
        console.log('[Auth] 프로필 업데이트 성공');

        // 로컬 상태 업데이트
        setUser(toAppUser(currentUser));
      } catch (err: any) {
        console.error('[Auth] 프로필 업데이트 실패:', err);
        setError(err.message || '프로필 업데이트에 실패했습니다.');
        throw err;
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    sendPasswordReset,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Auth Context Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
