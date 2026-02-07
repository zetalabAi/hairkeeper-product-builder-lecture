# 📱 Native Firebase Setup Guide

Firebase Auth가 React Native에서 작동하려면 네이티브 설정 파일이 필요합니다.

## iOS 설정

### 1. GoogleService-Info.plist 다운로드

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. **프로젝트 설정** (톱니바퀴 아이콘) → **일반** 탭
4. **내 앱** 섹션에서 iOS 앱 찾기
   - 없다면: **앱 추가** → **iOS** 선택
   - Bundle ID: `space.manus.hairkeeper_ai.t20260127043711` (또는 `app.json`의 `ios.bundleIdentifier` 값)
5. **GoogleService-Info.plist 다운로드** 버튼 클릭

### 2. 파일 배치

다운로드한 `GoogleService-Info.plist` 파일을:
```bash
# Expo managed workflow의 경우:
# 프로젝트 루트에 배치
/home/user/hairkeeper/GoogleService-Info.plist

# 또는 Xcode 프로젝트가 있다면:
/home/user/hairkeeper/ios/hairkeeper/GoogleService-Info.plist
```

### 3. app.json 업데이트

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### 4. Google Sign-In 설정 (선택사항)

Google Sign-In을 활성화하려면:

1. Firebase Console에서 **Authentication** → **Sign-in method** → **Google** 활성화
2. URL Scheme 추가 (자동으로 `GoogleService-Info.plist`에서 읽어옴)

```bash
# GoogleService-Info.plist에서 REVERSED_CLIENT_ID 찾기:
grep -A 1 "REVERSED_CLIENT_ID" GoogleService-Info.plist
# 예: com.googleusercontent.apps.123456789-abcdefg

# app.json에 추가:
{
  "expo": {
    "ios": {
      "config": {
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_CLIENT_ID"
        }
      }
    }
  }
}
```

---

## Android 설정

### 1. google-services.json 다운로드

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. **프로젝트 설정** (톱니바퀴 아이콘) → **일반** 탭
4. **내 앱** 섹션에서 Android 앱 찾기
   - 없다면: **앱 추가** → **Android** 선택
   - 패키지 이름: `space.manus.hairkeeper_ai.t20260127043711` (또는 `app.json`의 `android.package` 값)
   - SHA-1 인증서 지문: 개발 중에는 선택사항
5. **google-services.json 다운로드** 버튼 클릭

### 2. 파일 배치

다운로드한 `google-services.json` 파일을:
```bash
# Expo managed workflow의 경우:
# 프로젝트 루트에 배치
/home/user/hairkeeper/google-services.json

# 또는 Android 프로젝트가 있다면:
/home/user/hairkeeper/android/app/google-services.json
```

### 3. app.json 업데이트

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 4. Google Sign-In 설정 (선택사항)

Google Sign-In을 활성화하려면:

1. Firebase Console에서 **Authentication** → **Sign-in method** → **Google** 활성화
2. SHA-1 인증서 지문 등록:

```bash
# 디버그 키스토어의 SHA-1 가져오기:
cd android && ./gradlew signingReport

# 또는:
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# 출력된 SHA-1을 Firebase Console → 프로젝트 설정 → Android 앱 → SHA 인증서 지문에 추가
```

---

## 웹 설정 (선택사항)

웹에서는 Firebase SDK가 자동으로 `firebase.config.ts`의 설정을 사용합니다.

추가 설정 필요:
1. Firebase Console → **Authentication** → **설정** 탭
2. **승인된 도메인**에 개발/프로덕션 도메인 추가:
   - `localhost`
   - `yourapp.com`
   - `3000-*.csb.app` (CodeSandbox)

---

## Apple Sign-In 설정 (iOS만 해당)

### 1. Apple Developer 설정

1. [Apple Developer Console](https://developer.apple.com/account/) 접속
2. **Certificates, Identifiers & Profiles** → **Identifiers** → App ID 선택
3. **Sign In with Apple** 체크박스 활성화
4. **Save**

### 2. Firebase Console 설정

1. Firebase Console → **Authentication** → **Sign-in method**
2. **Apple** 활성화
3. **Services ID** 생성 (선택사항, 웹에서 Apple Sign-In 사용 시)

### 3. app.json 업데이트

```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    }
  }
}
```

---

## 설정 확인

### 1. 환경 변수 확인

`.env` 파일에 다음 변수가 설정되어 있는지 확인:

```env
# Firebase 클라이언트 설정
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# API 서버 URL (선택사항)
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com
```

### 2. 빌드 및 테스트

```bash
# iOS
npm run ios

# Android
npm run android

# 웹
npm run web
```

### 3. 로그인 테스트

1. 앱 실행
2. 로그인 화면에서 **Google로 계속하기** 버튼 클릭
3. Google 계정 선택
4. 로그인 성공 확인

---

## 트러블슈팅

### iOS: "No Firebase App '[DEFAULT]' has been created"

**원인:** `GoogleService-Info.plist` 파일이 없거나 경로가 잘못됨

**해결:**
```bash
# 파일 존재 확인
ls -la GoogleService-Info.plist

# app.json 확인
cat app.json | grep googleServicesFile

# Expo 캐시 삭제 후 재빌드
npx expo start -c
```

### Android: "Default FirebaseApp is not initialized"

**원인:** `google-services.json` 파일이 없거나 경로가 잘못됨

**해결:**
```bash
# 파일 존재 확인
ls -la google-services.json

# app.json 확인
cat app.json | grep googleServicesFile

# Android 빌드 캐시 삭제
cd android && ./gradlew clean
cd .. && npx expo start -c
```

### Google Sign-In: "DEVELOPER_ERROR"

**원인:** SHA-1 인증서 지문이 Firebase에 등록되지 않음 (Android)

**해결:**
```bash
# SHA-1 가져오기
cd android && ./gradlew signingReport

# Firebase Console → 프로젝트 설정 → Android 앱 → SHA 인증서 지문에 추가
```

### Apple Sign-In: "Sign in with Apple not configured"

**원인:** Apple Developer Console에서 Sign In with Apple이 활성화되지 않음

**해결:**
1. Apple Developer Console → App ID → Sign In with Apple 체크
2. Provisioning Profile 재생성
3. 앱 재빌드

---

## 다음 단계

네이티브 설정이 완료되면:
1. ✅ 로그인 기능 테스트
2. ✅ Firebase Auth 콘솔에서 사용자 확인
3. ✅ tRPC API 호출 테스트
4. 🔄 Phase 7: 모니터링 및 최적화

질문이나 문제가 있으면 말씀해주세요! 🚀
