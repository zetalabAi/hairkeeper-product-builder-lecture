# ✅ Phase 5 완료: Client Migration - React Native Firebase SDKs

## 개요

React Native 클라이언트가 이제 Firebase Authentication을 사용하여 인증을 처리합니다! Manus OAuth는 완전히 제거되었습니다.

---

## 🎉 완료된 작업

### 1. Firebase 클라이언트 설정 생성
**파일:** `firebase.config.ts`

```typescript
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  // ... 기타 설정
};
```

- 환경 변수에서 Firebase 설정을 읽어옴
- Expo Constants와 process.env 모두 지원
- 검증 및 로깅 함수 포함

### 2. Auth Context 구현
**파일:** `lib/auth-provider.tsx`

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Firebase Auth 상태 관리
  const [user, setUser] = useState<User | null>(null);

  // 인증 메서드 제공
  return (
    <AuthContext.Provider value={{
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
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Context 사용
  const context = useContext(AuthContext);
  return context;
}
```

**기능:**
- Firebase Auth 상태 자동 동기화 (`onAuthStateChanged`)
- Google Sign-In 메서드
- Apple Sign-In 메서드
- 이메일/비밀번호 로그인 및 회원가입
- 프로필 업데이트 및 비밀번호 재설정
- 에러 처리 및 로딩 상태 관리

### 3. tRPC 클라이언트 업데이트
**파일:** `lib/trpc.ts`

**변경 전:**
```typescript
// Manus 세션 토큰 사용
const token = await Auth.getSessionToken();
```

**변경 후:**
```typescript
// Firebase ID 토큰 사용
async function getFirebaseIdToken(): Promise<string | null> {
  const currentUser = auth().currentUser;
  if (!currentUser) return null;

  const token = await currentUser.getIdToken();
  return token;
}

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getApiBaseUrl()}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await getFirebaseIdToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
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
```

**개선사항:**
- Firebase ID 토큰을 자동으로 가져와서 Authorization 헤더에 추가
- 토큰이 없으면 로그인되지 않은 상태로 처리
- 서버에서 Firebase Admin SDK로 토큰 검증

### 4. 앱 루트 레이아웃 업데이트
**파일:** `app/_layout.tsx`

**변경 사항:**
```typescript
// ❌ 제거됨
import { DemoAuthProvider } from "@/lib/demo-auth-context";
import { initManusRuntime } from "@/lib/_core/manus-runtime";

// ✅ 추가됨
import { AuthProvider } from "@/lib/auth-provider";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>  {/* ← Firebase AuthProvider로 변경 */}
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
              </Stack>
            </QueryClientProvider>
          </trpc.Provider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
```

### 5. 로그인 화면 업데이트
**파일:** `app/login.tsx`

**변경 전:**
```typescript
// Manus OAuth 버튼
<Pressable onPress={() => startOAuthLogin()}>
  <Text>Google로 계속하기</Text>
</Pressable>
<Pressable onPress={() => startOAuthLogin()}>
  <Text>Naver로 계속하기</Text>
</Pressable>
<Pressable onPress={() => startOAuthLogin()}>
  <Text>Kakao로 계속하기</Text>
</Pressable>
```

**변경 후:**
```typescript
// Firebase Auth 버튼
const { signInWithGoogle, signInWithApple, loading, error } = useAuth();

<Pressable onPress={handleGoogleLogin} disabled={loading}>
  <Text>{loading ? "로그인 중..." : "Google로 계속하기"}</Text>
</Pressable>

{Platform.OS === "ios" && (
  <Pressable onPress={handleAppleLogin} disabled={loading}>
    <Text>{loading ? "로그인 중..." : "Apple로 계속하기"}</Text>
  </Pressable>
)}
```

**개선사항:**
- Firebase Auth 메서드 사용
- 에러 메시지 표시
- 로딩 상태 UI
- iOS에서만 Apple Sign-In 표시
- Naver, Kakao 제거 (Firebase에서 네이티브 지원 안함)

### 6. 네이티브 설정 가이드 작성
**파일:** `NATIVE_SETUP_GUIDE.md`

Firebase Auth가 React Native에서 작동하려면 네이티브 설정 파일이 필요합니다:

**iOS:**
- `GoogleService-Info.plist` 파일 다운로드 및 배치
- `app.json`에 경로 설정
- Google Sign-In 및 Apple Sign-In 설정

**Android:**
- `google-services.json` 파일 다운로드 및 배치
- `app.json`에 경로 설정
- SHA-1 인증서 지문 등록

**상세 가이드는 `NATIVE_SETUP_GUIDE.md` 참고**

### 7. OAuth 라우트 및 파일 정리
**삭제된 파일:**
```bash
❌ app/oauth/callback.tsx       # Manus OAuth 콜백
❌ lib/_core/auth.ts             # Manus 세션 토큰 관리
❌ lib/_core/api.ts              # Manus OAuth API 호출
❌ hooks/use-auth.ts             # 구버전 Auth Hook
```

**간소화된 파일:**
```bash
✅ constants/oauth.ts            # getApiBaseUrl()만 남김
```

---

## 📊 변경 통계

### 코드 변경
- **7개 파일 생성/수정**
- **4개 파일 삭제**
- **1개 파일 간소화**

### 파일 목록
**생성됨:**
- `firebase.config.ts` (새로 생성)
- `lib/auth-provider.tsx` (새로 생성)
- `NATIVE_SETUP_GUIDE.md` (새로 생성)
- `PHASE_5_COMPLETE.md` (이 파일)

**수정됨:**
- `lib/trpc.ts` (Firebase ID 토큰 사용)
- `app/_layout.tsx` (AuthProvider 적용)
- `app/login.tsx` (Firebase Auth UI)
- `constants/oauth.ts` (간소화)

**삭제됨:**
- `app/oauth/callback.tsx`
- `lib/_core/auth.ts`
- `lib/_core/api.ts`
- `hooks/use-auth.ts`

---

## 🔧 사용 방법

### 1. 환경 변수 설정

`.env` 파일에 Firebase 클라이언트 설정 추가:

```env
# Firebase 클라이언트 설정
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# API 서버 URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 2. 네이티브 설정 파일 추가

**iOS:**
```bash
# Firebase Console에서 GoogleService-Info.plist 다운로드
# 프로젝트 루트에 배치
cp ~/Downloads/GoogleService-Info.plist /home/user/hairkeeper/
```

**Android:**
```bash
# Firebase Console에서 google-services.json 다운로드
# 프로젝트 루트에 배치
cp ~/Downloads/google-services.json /home/user/hairkeeper/
```

**app.json 업데이트:**
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 3. 컴포넌트에서 인증 사용

```typescript
import { useAuth } from "@/lib/auth-provider";

export default function MyScreen() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return (
      <Button title="Google로 로그인" onPress={signInWithGoogle} />
    );
  }

  return (
    <View>
      <Text>안녕하세요, {user.displayName}님!</Text>
      <Button title="로그아웃" onPress={signOut} />
    </View>
  );
}
```

### 4. 보호된 tRPC API 호출

```typescript
import { trpc } from "@/lib/trpc";

export default function MyScreen() {
  // Firebase ID 토큰이 자동으로 Authorization 헤더에 추가됨
  const { data, isLoading } = trpc.user.getProfile.useQuery();

  if (isLoading) return <ActivityIndicator />;

  return <Text>{data?.name}</Text>;
}
```

---

## ✅ 테스트 체크리스트

### 로그인 플로우
- [ ] Google Sign-In 버튼 클릭 → Google 계정 선택 → 로그인 성공
- [ ] Apple Sign-In 버튼 클릭 (iOS만) → Apple 계정 선택 → 로그인 성공
- [ ] 로그인 후 자동으로 메인 화면으로 이동
- [ ] 앱 재실행 시 로그인 상태 유지

### 인증 상태
- [ ] `useAuth()` hook이 올바른 사용자 정보 반환
- [ ] 로그인되지 않았을 때 `user`가 `null`
- [ ] 로그인 중일 때 `loading`이 `true`
- [ ] 에러 발생 시 `error` 메시지 표시

### API 호출
- [ ] tRPC query가 Firebase ID 토큰과 함께 호출됨
- [ ] 서버에서 Firebase Admin SDK로 토큰 검증 성공
- [ ] 보호된 API가 인증된 사용자만 접근 가능
- [ ] 로그인되지 않은 상태에서 보호된 API 호출 시 401 에러

### 로그아웃
- [ ] `signOut()` 호출 시 Firebase에서 로그아웃
- [ ] 로그아웃 후 로그인 화면으로 리디렉션
- [ ] 로그아웃 후 보호된 API 접근 불가

---

## 🚨 알려진 이슈

### 1. Google Sign-In 설정 필요

**증상:**
```
[Auth] Google Sign-In은 @react-native-google-signin/google-signin 패키지가 필요합니다.
```

**해결:**
- `@react-native-google-signin/google-signin` 패키지 설치
- 네이티브 설정 파일 추가 (GoogleService-Info.plist, google-services.json)
- Firebase Console에서 Google 로그인 활성화

**상세 가이드:** `NATIVE_SETUP_GUIDE.md` 참고

### 2. Apple Sign-In은 iOS만 지원

**증상:**
```
[Auth] Apple Sign-In은 @invertase/react-native-apple-authentication 패키지가 필요합니다.
```

**해결:**
- iOS에서만 Apple Sign-In 버튼 표시 (`Platform.OS === "ios"`)
- Apple Developer Console에서 Sign In with Apple 활성화
- `@invertase/react-native-apple-authentication` 패키지 설치

### 3. 웹에서는 자동 처리됨

- 웹 플랫폼에서는 Firebase SDK가 자동으로 처리
- 추가 네이티브 설정 파일 불필요
- Firebase Console에서 승인된 도메인 추가 필요

---

## 🎯 다음 단계

Phase 5가 완료되었습니다! 다음 단계:

### Phase 6: Cleanup & Deprecation (예정)
현재 상태는 이미 깔끔하게 정리되어 있습니다:
- ✅ Manus 코드 완전 제거
- ✅ OAuth 콜백 라우트 삭제
- ✅ 구버전 Auth Hook 삭제
- ✅ API 호출 레이어 간소화

추가 정리 작업:
- [ ] `server/README.md` 업데이트 (Firebase/GCP 기준으로)
- [ ] 테스트 코드 업데이트
- [ ] 사용하지 않는 환경 변수 제거

### Phase 7: Optimization & Monitoring (예정)
- [ ] Firestore 복합 인덱스 생성
- [ ] Firebase Crashlytics 통합
- [ ] Firebase Analytics 설정
- [ ] Cloud Logging 구성
- [ ] 성능 모니터링

---

## 💡 팁

### 디버깅

Firebase Auth 상태 확인:
```typescript
import auth from '@react-native-firebase/auth';

// 현재 사용자 확인
const currentUser = auth().currentUser;
console.log('Current user:', currentUser?.uid);

// ID 토큰 확인
const token = await currentUser?.getIdToken();
console.log('ID token:', token);
```

### 에러 처리

```typescript
const { signInWithGoogle, error } = useAuth();

const handleLogin = async () => {
  try {
    await signInWithGoogle();
  } catch (err: any) {
    Alert.alert("로그인 실패", err.message);
  }
};

// 또는 error 상태 사용
{error && <Text className="text-destructive">{error}</Text>}
```

### 조건부 렌더링

```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;
if (!user) return <LoginScreen />;
return <MainApp />;
```

---

## 🎉 완료!

Phase 5 클라이언트 마이그레이션이 성공적으로 완료되었습니다!

**주요 성과:**
- ✅ Firebase Authentication 완전 통합
- ✅ Manus OAuth 완전 제거
- ✅ React Native에서 Google/Apple Sign-In 지원
- ✅ tRPC와 Firebase ID 토큰 통합
- ✅ 깔끔한 Auth Context API
- ✅ 네이티브 설정 가이드 작성

**다음은 Phase 7 (최적화 및 모니터링)으로 넘어갈 수 있습니다!**

질문이나 문제가 있으면 언제든지 말씀해주세요! 🚀
