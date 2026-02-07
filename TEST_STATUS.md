# 🧪 테스트 현황

## 현재 상태

### ✅ 작성된 테스트
1. **Unit Tests:**
   - `tests/unit/firestore.test.ts` - Firestore CRUD 작업 테스트
   - `tests/unit/firebase-auth.test.ts` - Firebase Auth 토큰 검증 테스트

2. **Integration Tests:**
   - `tests/integration/trpc-auth.test.ts` - tRPC + Firebase Auth 통합 테스트

3. **기존 테스트:**
   - `tests/replicate-api.test.ts` - Replicate API 테스트 (여전히 사용 중)
   - `tests/auth.logout.test.ts` - Manus Auth 테스트 (deprecated, skip됨)

### ⚠️ 테스트 실행 결과

```bash
npm test
```

**에러:** `FIREBASE_PROJECT_ID is not configured`

**원인:** 테스트 실행 시 Firebase 환경 변수가 설정되지 않음

---

## 🔧 테스트를 실행하려면

### 옵션 1: Firebase Emulator 사용 (추천)

**장점:**
- 실제 Firebase 프로젝트 불필요
- 로컬에서 빠르게 테스트
- 무료
- 데이터 격리

**설정:**

1. **Firebase Emulator 설치**
```bash
# Firebase CLI 설치 (이미 설치되어 있으면 스킵)
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 루트에서 초기화
firebase init emulators

# 선택할 에뮬레이터:
# - Authentication (포트: 9099)
# - Firestore (포트: 8080)
# - Storage (포트: 9199)
```

2. **테스트용 환경 변수 파일 생성**
```bash
# .env.test 파일 생성
cat > .env.test << 'EOF'
# Firebase Emulator
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# 테스트용 프로젝트 ID (임의)
FIREBASE_PROJECT_ID=demo-test
FIREBASE_STORAGE_BUCKET=demo-test.appspot.com
GOOGLE_CLOUD_PROJECT=demo-test

# Emulator는 서비스 계정 불필요
# GOOGLE_APPLICATION_CREDENTIALS는 설정하지 않음
EOF
```

3. **Emulator 실행**
```bash
# 새 터미널에서
firebase emulators:start

# 출력 예:
# ┌─────────────┬────────────────┬─────────────────────────────────┐
# │ Emulator    │ Host:Port      │ View in Emulator UI             │
# ├─────────────┼────────────────┼─────────────────────────────────┤
# │ Auth        │ localhost:9099 │ http://localhost:4000/auth      │
# │ Firestore   │ localhost:8080 │ http://localhost:4000/firestore │
# │ Storage     │ localhost:9199 │ http://localhost:4000/storage   │
# └─────────────┴────────────────┴─────────────────────────────────┘
```

4. **테스트 실행**
```bash
# .env.test 환경 변수 로드하여 테스트
dotenv -e .env.test npm test

# 또는 package.json에 스크립트 추가:
# "test:emulator": "dotenv -e .env.test vitest run"
npm run test:emulator
```

### 옵션 2: 실제 Firebase 프로젝트 사용

**주의:** 실제 데이터가 생성/수정될 수 있으므로 테스트 전용 프로젝트 사용 권장

**설정:**

1. **테스트용 Firebase 프로젝트 생성**
   - Firebase Console에서 새 프로젝트 생성 (예: `hairkeeper-test`)
   - Firestore Database 생성 (Native mode)
   - Cloud Storage 버킷 생성
   - Authentication 활성화

2. **서비스 계정 다운로드**
   - Firebase Console → 프로젝트 설정 → 서비스 계정
   - "새 비공개 키 생성" 클릭
   - `firebase-service-account-test.json` 저장

3. **테스트용 환경 변수 설정**
```bash
# .env.test 파일 생성
cat > .env.test << 'EOF'
FIREBASE_PROJECT_ID=hairkeeper-test
FIREBASE_STORAGE_BUCKET=hairkeeper-test.appspot.com
GOOGLE_CLOUD_PROJECT=hairkeeper-test
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account-test.json
EOF
```

4. **테스트 실행**
```bash
dotenv -e .env.test npm test
```

### 옵션 3: Mock 테스트 (가장 빠름)

Firebase 호출을 Mock하여 테스트 (현재 일부 테스트에만 구현됨)

**장점:**
- Firebase 프로젝트 불필요
- 가장 빠름
- CI/CD에 적합

**단점:**
- 실제 Firebase 동작과 다를 수 있음

---

## 📊 테스트 실행 가이드

### 1. Emulator로 전체 테스트

```bash
# 터미널 1: Emulator 실행
firebase emulators:start

# 터미널 2: 테스트 실행
dotenv -e .env.test npm test
```

### 2. 특정 테스트만 실행

```bash
# Firestore 테스트만
dotenv -e .env.test npm test tests/unit/firestore.test.ts

# Firebase Auth 테스트만
dotenv -e .env.test npm test tests/unit/firebase-auth.test.ts

# tRPC 통합 테스트만
dotenv -e .env.test npm test tests/integration/trpc-auth.test.ts
```

### 3. Watch 모드로 개발

```bash
dotenv -e .env.test npm test -- --watch
```

### 4. 커버리지 리포트

```bash
dotenv -e .env.test npm test -- --coverage
```

---

## ✅ 빠른 시작 (추천)

### Step 1: Firebase Emulator 설치 및 실행

```bash
# 한 번만 실행
firebase init emulators

# 이후 매번 테스트할 때
firebase emulators:start
```

### Step 2: 테스트 환경 변수 설정

```bash
# .env.test 파일 생성 (위의 내용 복사)
cat > .env.test << 'EOF'
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
FIREBASE_PROJECT_ID=demo-test
FIREBASE_STORAGE_BUCKET=demo-test.appspot.com
GOOGLE_CLOUD_PROJECT=demo-test
EOF
```

### Step 3: dotenv-cli 설치

```bash
npm install -g dotenv-cli
```

### Step 4: 테스트 실행

```bash
# 새 터미널에서
dotenv -e .env.test npm test
```

---

## 📝 package.json 스크립트 추가 (권장)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:emulator": "dotenv -e .env.test vitest run",
    "test:emulator:watch": "dotenv -e .env.test vitest",
    "emulator": "firebase emulators:start"
  }
}
```

**사용:**
```bash
# Emulator 실행
npm run emulator

# (새 터미널) 테스트 실행
npm run test:emulator

# Watch 모드
npm run test:emulator:watch
```

---

## 🎯 예상 테스트 결과 (Emulator 사용 시)

```bash
✓ tests/unit/firestore.test.ts (8)
  ✓ Firestore Database Operations (8)
    ✓ User Operations (5)
      ✓ should create a new user
      ✓ should get user by UID
      ✓ should get user by email
      ✓ should return null for non-existent user
      ✓ should update existing user
    ✓ Project Operations (3)
      ✓ should create a new project
      ✓ should get user projects
      ✓ should update project status

✓ tests/unit/firebase-auth.test.ts (4)
  ✓ Firebase Auth Server (3)
    ✓ should reject invalid token
    ✓ should reject empty token
    ✓ should reject malformed token
  ✓ Firebase Auth Server (Mocked) (1)
    ✓ should extract user info from decoded token

✓ tests/integration/trpc-auth.test.ts (6)
  ✓ tRPC Authentication (6)
    ✓ Protected Procedures (2)
      ✓ should allow authenticated user to access protected route
      ✓ should reject unauthenticated user
    ✓ Public Procedures (1)
      ✓ should allow unauthenticated user to access public route
    ✓ User Context (2)
      ✓ should have correct user data in context
      ✓ should handle missing user gracefully
    ✓ Project Operations (1)
      ✓ should allow user to create project

Test Files  3 passed (3)
     Tests  18 passed (18)
  Start at  14:32:15
  Duration  2.35s
```

---

## 🚨 알려진 이슈

### 1. Firebase Emulator 초기화 느림
**증상:** 첫 테스트 실행 시 타임아웃

**해결:**
```typescript
// vitest.config.ts에 타임아웃 설정
export default defineConfig({
  test: {
    testTimeout: 10000, // 10초
  },
});
```

### 2. Emulator 데이터 초기화
**증상:** 이전 테스트 데이터가 남아있음

**해결:**
```bash
# Emulator 데이터 삭제하고 재시작
firebase emulators:start --import=./emulator-data --export-on-exit
```

### 3. tRPC 테스트에서 에러
**증상:** `Cannot find module '@trpc/server'`

**해결:**
```bash
npm install @trpc/server@11.7.2
```

---

## 🎓 다음 단계

### 즉시 실행 가능:
1. ✅ Firebase Emulator 설정
2. ✅ `.env.test` 파일 생성
3. ✅ 테스트 실행

### 추가 작업 (선택):
1. 🔄 E2E 테스트 추가
2. 🔄 CI/CD 통합 (GitHub Actions)
3. 🔄 테스트 커버리지 리포트
4. 🔄 Performance 테스트

---

## 💡 팁

### Firebase Emulator UI
```bash
# Emulator UI는 자동으로 열립니다
http://localhost:4000

# UI에서 확인 가능:
# - Firestore 데이터
# - Auth 사용자 목록
# - Storage 파일
# - 실시간 로그
```

### 테스트 데이터 시드
```typescript
// tests/setup.ts
import { getFirestoreDb } from '../server/_core/firestore';

beforeAll(async () => {
  // 테스트 데이터 삽입
  const db = getFirestoreDb();
  await db.collection('users').doc('test-user').set({
    uid: 'test-user',
    email: 'test@example.com',
    // ...
  });
});
```

---

## 질문 있으면 언제든지!

테스트 설정이나 실행에 문제가 있으면 말씀해주세요. 🚀
