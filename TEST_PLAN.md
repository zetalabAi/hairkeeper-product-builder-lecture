# 🧪 Firebase/GCP 테스트 계획

## 테스트 전략

### 1. 단위 테스트 (Unit Tests)
개별 함수 및 모듈 테스트

### 2. 통합 테스트 (Integration Tests)
Firebase/GCP 서비스와의 통합 테스트

### 3. E2E 테스트 (End-to-End Tests)
전체 사용자 플로우 테스트

---

## 테스트 우선순위

### 🔴 Priority 1: Critical (Must Test)
- [ ] Firebase Auth: 로그인/로그아웃
- [ ] Firestore: CRUD 작업
- [ ] tRPC Context: Firebase 토큰 검증
- [ ] Storage: 파일 업로드/다운로드

### 🟡 Priority 2: Important (Should Test)
- [ ] AI Services: Vertex AI 이미지 생성
- [ ] AI Services: Google Speech 음성 인식
- [ ] Analytics: 이벤트 로깅
- [ ] Error Tracking: 에러 로깅

### 🟢 Priority 3: Nice to Have (Can Test Later)
- [ ] React Query: 캐싱 동작
- [ ] Monitoring: Cloud Logging
- [ ] Performance: 응답 시간

---

## 테스트 파일 구조

```
tests/
├── unit/
│   ├── firestore.test.ts          # Firestore CRUD
│   ├── storage.test.ts             # GCS 업로드/다운로드
│   ├── ai.test.ts                  # Vertex AI + Google Speech
│   └── auth-provider.test.tsx      # Auth Context (React)
├── integration/
│   ├── trpc-auth.test.ts           # tRPC + Firebase Auth
│   ├── end-to-end-project.test.ts  # 프로젝트 생성 플로우
│   └── analytics.test.ts           # Analytics/Crashlytics
└── e2e/
    └── user-journey.test.ts        # 전체 사용자 플로우
```

---

## 테스트 환경 설정

### 1. Firebase Emulator Suite
로컬에서 Firebase 서비스 에뮬레이션

```bash
# Firebase Emulator 설치
firebase init emulators

# 선택할 에뮬레이터:
# - Authentication
# - Firestore
# - Storage

# 실행
firebase emulators:start
```

### 2. 환경 변수
테스트용 `.env.test` 파일

```env
# Firebase Emulator
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# 테스트용 프로젝트
FIREBASE_PROJECT_ID=demo-test-project
```

### 3. Mock 데이터
일관된 테스트를 위한 mock 데이터

---

## 테스트 체크리스트

### Firestore
- [ ] 사용자 생성 (upsertUser)
- [ ] 사용자 조회 (getUserByUid)
- [ ] 프로젝트 생성 (createProject)
- [ ] 프로젝트 목록 조회 (getUserProjects)
- [ ] 프로젝트 업데이트 (updateProjectStatus)
- [ ] 에러 처리 (잘못된 입력)

### Firebase Auth (서버)
- [ ] Firebase ID 토큰 검증 (verifyFirebaseToken)
- [ ] 유효한 토큰 → 사용자 정보 반환
- [ ] 유효하지 않은 토큰 → 에러
- [ ] 토큰 없음 → null

### Firebase Auth (클라이언트)
- [ ] AuthProvider 초기화
- [ ] 로그인 상태 변경 감지
- [ ] signInWithEmail 호출
- [ ] signOut 호출
- [ ] useAuth hook 사용

### Cloud Storage (GCS)
- [ ] 파일 업로드 (gcsUpload)
- [ ] Signed URL 생성 (gcsGetSignedUrl)
- [ ] 공개 URL 생성
- [ ] 파일 삭제 (gcsDelete)

### AI Services
- [ ] 이미지 생성 (generateImage)
- [ ] 음성 인식 (transcribeAudio)
- [ ] 에러 처리

### tRPC Integration
- [ ] 보호된 프로시저 (protectedProcedure)
- [ ] 공개 프로시저 (publicProcedure)
- [ ] Firebase 토큰으로 인증
- [ ] 인증 실패 시 에러

### Analytics & Error Tracking
- [ ] Analytics 이벤트 로깅
- [ ] Crashlytics 에러 로깅
- [ ] 사용자 식별자 설정

---

## 테스트 명령어

### 전체 테스트 실행
```bash
npm test
```

### 특정 파일 테스트
```bash
npm test tests/unit/firestore.test.ts
```

### Watch 모드
```bash
npm test -- --watch
```

### 커버리지 리포트
```bash
npm test -- --coverage
```

---

## 성공 기준

### 최소 요구사항
- ✅ 모든 Priority 1 테스트 통과
- ✅ Firestore CRUD 작동
- ✅ Firebase Auth 작동
- ✅ tRPC 인증 작동

### 권장 요구사항
- ✅ 테스트 커버리지 > 70%
- ✅ Priority 2 테스트 통과
- ✅ CI/CD 파이프라인 통합

---

## 다음 단계

1. ✅ 테스트 환경 설정
2. ✅ Priority 1 테스트 작성
3. ✅ 테스트 실행 및 디버깅
4. 🔄 Priority 2 테스트 작성
5. 🔄 E2E 테스트 추가
6. 🔄 CI/CD 통합
