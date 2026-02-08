/**
 * Firebase Auth Provider
 *
 * React Context를 사용하여 앱 전체에서 인증 상태를 관리합니다.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { firebaseConfig, validateFirebaseConfig } from '../firebase.config';
import * as Analytics from './analytics';
import * as ErrorTracking from './error-tracking';

// 플랫폼별 Firebase Auth 가져오기
let auth: any = null;
let FirebaseAuthTypes: any = null;

if (Platform.OS === 'web') {
  // 웹: Firebase Web SDK 사용
  try {
    const { initializeApp, getApps } = require('firebase/app');
    const {
      getAuth,
      onAuthStateChanged,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut: firebaseSignOut,
      sendPasswordResetEmail,
      updateProfile: firebaseUpdateProfile,
      sendEmailVerification,
    } = require('firebase/auth');

    // Firebase 앱 초기화 (중복 초기화 방지)
    if (getApps().length === 0) {
      initializeApp(firebaseConfig);
      console.log('[Auth Provider] Firebase Web SDK 초기화 완료');
    }

    // Web SDK용 auth wrapper
    const webAuth = getAuth();
    auth = () => webAuth;
    auth.signInWithEmailAndPassword = signInWithEmailAndPassword;
    auth.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    auth.signOut = firebaseSignOut;
    auth.sendPasswordResetEmail = sendPasswordResetEmail;
    auth.updateProfile = firebaseUpdateProfile;
    auth.sendEmailVerification = sendEmailVerification;
    auth.onAuthStateChanged = onAuthStateChanged;
  } catch (error) {
    console.warn('[Auth Provider] Firebase Web SDK not available:', error);
  }
} else {
  // 네이티브: React Native Firebase 사용
  try {
    auth = require('@react-native-firebase/auth').default;
    FirebaseAuthTypes = require('@react-native-firebase/auth').FirebaseAuthTypes;
    console.log('[Auth Provider] React Native Firebase 사용');
  } catch (error) {
    console.warn('[Auth Provider] React Native Firebase not available:', error);
  }
}

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
function toAppUser(firebaseUser: any): User | null {
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
    if (!auth) {
      console.warn('[Auth Provider] Firebase Auth not available');
      setLoading(false);
      return;
    }

    console.log('[Auth Provider] 인증 상태 리스너 등록');

    let unsubscribe: any;

    if (Platform.OS === 'web') {
      // Web SDK: onAuthStateChanged(auth, callback)
      unsubscribe = auth.onAuthStateChanged(auth(), async (firebaseUser: any) => {
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
    } else {
      // Native SDK: auth().onAuthStateChanged(callback)
      unsubscribe = auth().onAuthStateChanged(async (firebaseUser: any) => {
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
    }

    return unsubscribe;
  }, []);

  // 이메일/비밀번호로 로그인
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      setError(null);
      setLoading(true);

      if (Platform.OS === 'web') {
        // Web SDK: signInWithEmailAndPassword(auth, email, password)
        await auth.signInWithEmailAndPassword(auth(), email, password);
      } else {
        // Native SDK: auth().signInWithEmailAndPassword(email, password)
        await auth().signInWithEmailAndPassword(email, password);
      }

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
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }

      try {
        setError(null);
        setLoading(true);

        let credential: any;
        if (Platform.OS === 'web') {
          // Web SDK: createUserWithEmailAndPassword(auth, email, password)
          credential = await auth.createUserWithEmailAndPassword(auth(), email, password);

          // 프로필 업데이트
          if (displayName && credential.user) {
            await auth.updateProfile(credential.user, { displayName });
          }

          // 이메일 인증 발송
          if (credential.user) {
            await auth.sendEmailVerification(credential.user);
          }
        } else {
          // Native SDK: auth().createUserWithEmailAndPassword(email, password)
          credential = await auth().createUserWithEmailAndPassword(email, password);

          // 프로필 업데이트
          if (displayName && credential.user) {
            await credential.user.updateProfile({ displayName });
          }

          // 이메일 인증 발송
          await credential.user?.sendEmailVerification();
        }

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
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      setError(null);

      if (Platform.OS === 'web') {
        // Web SDK: signOut(auth)
        await auth.signOut(auth());
      } else {
        // Native SDK: auth().signOut()
        await auth().signOut();
      }

      console.log('[Auth] 로그아웃 성공');
    } catch (err: any) {
      console.error('[Auth] 로그아웃 실패:', err);
      setError(err.message || '로그아웃에 실패했습니다.');
      throw err;
    }
  }, []);

  // 비밀번호 재설정 이메일 발송
  const sendPasswordReset = useCallback(async (email: string) => {
    if (!auth) {
      throw new Error('Firebase Auth not available');
    }

    try {
      setError(null);

      if (Platform.OS === 'web') {
        // Web SDK: sendPasswordResetEmail(auth, email)
        await auth.sendPasswordResetEmail(auth(), email);
      } else {
        // Native SDK: auth().sendPasswordResetEmail(email)
        await auth().sendPasswordResetEmail(email);
      }

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
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }

      try {
        setError(null);

        let currentUser: any;
        if (Platform.OS === 'web') {
          // Web SDK: auth().currentUser
          currentUser = auth().currentUser;
          if (!currentUser) {
            throw new Error('로그인이 필요합니다.');
          }

          await auth.updateProfile(currentUser, update);
        } else {
          // Native SDK: auth().currentUser
          currentUser = auth().currentUser;
          if (!currentUser) {
            throw new Error('로그인이 필요합니다.');
          }

          await currentUser.updateProfile(update);
        }

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
