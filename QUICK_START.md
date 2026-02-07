# 🚀 빠른 시작 가이드

## 현재 상태

### ✅ 작동하는 것
- **서버:** 포트 3001에서 실행 중
- **기본 API:** Health check 엔드포인트
- **tRPC:** API 라우팅
- **코드:** Firebase/GCP 마이그레이션 완료

### ⚠️  제한 사항 (데모 모드)
- **Firebase 서비스:** 실제 Firebase 프로젝트가 없어 작동하지 않음
  - ❌ Firestore 데이터베이스
  - ❌ Firebase Authentication
  - ❌ Cloud Storage
  - ❌ Vertex AI
  - ❌ Google Speech

### 💡 해결 방법
실제 Firebase 프로젝트를 생성하거나 Firebase Emulator를 사용하세요.

---

## 🎯 지금 바로 테스트하기

### 1. 서버 확인

**서버가 실행 중인지 확인:**
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

**예상 응답:**
\`\`\`json
{"ok":true,"timestamp":1234567890}
\`\`\`

**성공!** 서버가 정상 작동 중입니다.

### 2. 앱 실행 (선택사항)

\`\`\`bash
# 새 터미널에서
npm run dev:metro

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
\`\`\`

**주의:** Firebase 서비스가 없어 로그인/데이터 저장은 작동하지 않습니다.

---

## 🔥 Firebase 프로젝트 설정 (권장)

### 옵션 A: Firebase Emulator (빠름 - 5분)

**장점:**
- 실제 Firebase 프로젝트 불필요
- 로컬에서만 작동
- 무료

**단계:**
\`\`\`bash
# 1. Firebase CLI 설치
npm install -g firebase-tools

# 2. 로그인
firebase login

# 3. Emulator 초기화
firebase init emulators
# 선택: Authentication, Firestore, Storage

# 4. .env 파일 업데이트
cat >> .env << 'EOF'

# Firebase Emulator 설정
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
EOF

# 5. Emulator 실행 (새 터미널)
firebase emulators:start

# 6. 서버 재시작
npm run dev:server
\`\`\`

**확인:**
- Emulator UI: http://localhost:4000
- Firestore 데이터 확인 가능
- Auth 사용자 목록 확인 가능

### 옵션 B: 실제 Firebase 프로젝트 (완전 - 20분)

**장점:**
- 모든 기능 사용 가능
- 프로덕션 준비
- 실제 사용자 테스트 가능

**단계:**

1. **Firebase Console에서 프로젝트 생성**
   - https://console.firebase.google.com/
   - "프로젝트 추가" 클릭
   - 프로젝트 이름: `hairkeeper-test`

2. **필수 서비스 활성화**
   - Authentication: Google, Apple, Email/Password
   - Firestore Database (Native mode)
   - Cloud Storage

3. **서비스 계정 생성**
   - 프로젝트 설정 → 서비스 계정
   - "새 비공개 키 생성" 클릭
   - JSON 다운로드 → `firebase-service-account.json`으로 저장

4. **클라이언트 설정 다운로드**
   - iOS: `GoogleService-Info.plist` 다운로드
   - Android: `google-services.json` 다운로드
   - 프로젝트 루트에 배치

5. **.env 파일 업데이트**
\`\`\`bash
# .env 파일 편집
# FIREBASE_PROJECT_ID, EXPO_PUBLIC_FIREBASE_* 값 입력
# 실제 Firebase Console 값 사용
\`\`\`

6. **서버 재시작**
\`\`\`bash
npm run dev:server
\`\`\`

**상세 가이드:** `DEPLOYMENT_GUIDE.md` 참고

---

## 📱 앱 기능 테스트

### 1. 로그인 (Firebase 설정 후)

\`\`\`bash
# 앱 실행
npm run ios  # 또는 android/web

# 로그인 화면에서:
# - "Google로 계속하기" 클릭
# - Google 계정 선택
# - 로그인 성공 → 메인 화면
\`\`\`

**확인사항:**
- Firebase Console → Authentication → Users에 사용자 추가됨
- Firestore → users 컬렉션에 사용자 문서 생성됨

### 2. 프로젝트 생성 (Firestore 설정 후)

\`\`\`bash
# 앱에서:
# 1. 새 프로젝트 버튼 클릭
# 2. 이미지 선택
# 3. 스타일 옵션 선택
# 4. "생성" 버튼 클릭
\`\`\`

**확인사항:**
- Firestore → projects 컬렉션에 문서 추가
- `status`: "pending"
- `userId`: 현재 사용자 UID

### 3. 데이터 조회

\`\`\`bash
# 프로젝트 목록 화면
# - 본인 프로젝트만 표시
# - 최신순 정렬
# - 5분 이내 재방문 시 캐시 사용 (빠름)
\`\`\`

---

## 🧪 API 테스트 (curl)

### Health Check
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

### tRPC Query (로그인 필요)
\`\`\`bash
# 유효한 Firebase ID 토큰 필요
curl -X POST http://localhost:3001/api/trpc/user.getProfile \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
\`\`\`

---

## 🐛 문제 해결

### 서버가 시작되지 않음

**증상:** `Cannot find module` 에러

**해결:**
\`\`\`bash
# 의존성 재설치
npm install

# 서버 재시작
npm run dev:server
\`\`\`

### Firebase 에러

**증상:** `FIREBASE_PROJECT_ID is not configured`

**해결:**
\`\`\`bash
# 1. .env 파일 확인
cat .env

# 2. Firebase Emulator 사용
firebase emulators:start

# 3. 또는 실제 Firebase 프로젝트 설정
\`\`\`

### 포트 충돌

**증상:** `Port 3000 is busy`

**해결:**
서버가 자동으로 다른 포트 (3001, 3002, ...)를 사용합니다.

### 로그인 실패

**증상:** "Google Sign-In은 아직 구현되지 않았습니다"

**해결:**
\`\`\`bash
# 1. 네이티브 설정 파일 추가
# iOS: GoogleService-Info.plist
# Android: google-services.json

# 2. NATIVE_SETUP_GUIDE.md 참고
\`\`\`

---

## 📚 추가 문서

- **MANUAL_TEST_GUIDE.md** - 상세한 수동 테스트 체크리스트
- **TEST_STATUS.md** - 자동화 테스트 실행 방법
- **DEPLOYMENT_GUIDE.md** - 프로덕션 배포 가이드
- **NATIVE_SETUP_GUIDE.md** - iOS/Android 네이티브 설정

---

## 🎯 다음 단계

### 현재 완료된 것
1. ✅ 코드 마이그레이션 (Manus → Firebase/GCP)
2. ✅ 서버 시작
3. ✅ 기본 API 작동

### 다음 할 것
1. ⏭️ Firebase 프로젝트 설정 (Emulator 또는 실제)
2. ⏭️ 앱에서 로그인 테스트
3. ⏭️ 프로젝트 생성/조회 테스트
4. ⏭️ Firestore 인덱스/보안 규칙 배포
5. ⏭️ 프로덕션 배포

---

## 💡 빠른 팁

### 개발 모드로 작업하기

\`\`\`bash
# 터미널 1: 서버
npm run dev:server

# 터미널 2: Emulator (선택)
firebase emulators:start

# 터미널 3: 앱
npm run ios
\`\`\`

### 로그 확인

\`\`\`bash
# 서버 로그
npm run dev:server

# Firestore 로그
firebase emulators:start

# 앱 로그
npm run ios  # Xcode에서 확인
npm run android  # Logcat에서 확인
\`\`\`

### 데이터베이스 확인

\`\`\`bash
# Emulator UI
http://localhost:4000

# Firebase Console
https://console.firebase.google.com/
\`\`\`

---

## 🎉 성공!

서버가 정상적으로 작동합니다! Firebase 설정만 완료하면 모든 기능을 테스트할 수 있습니다.

**추천 순서:**
1. Firebase Emulator 설정 (5분)
2. 앱 실행 및 로그인 테스트
3. 데이터 CRUD 테스트
4. (나중에) 실제 Firebase 프로젝트로 전환

질문이나 도움이 필요하면 말씀해주세요! 🚀
