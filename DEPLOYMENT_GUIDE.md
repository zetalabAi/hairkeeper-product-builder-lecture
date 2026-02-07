# 🚀 Firebase/GCP 배포 가이드

## 개요

이 가이드는 Hairkeeper 앱을 Firebase 및 Google Cloud Platform에 배포하는 방법을 설명합니다.

---

## 사전 요구사항

### 1. Firebase CLI 설치

```bash
npm install -g firebase-tools

# 로그인
firebase login

# 프로젝트 초기화 (프로젝트 루트에서 실행)
firebase init
```

### 2. Google Cloud SDK 설치

```bash
# macOS (Homebrew)
brew install google-cloud-sdk

# Ubuntu/Debian
sudo apt-get install google-cloud-sdk

# 로그인
gcloud auth login

# 프로젝트 설정
gcloud config set project YOUR_PROJECT_ID
```

---

## Firestore 배포

### 1. Firestore 인덱스 배포

**파일:** `firestore.indexes.json`

```bash
# 인덱스 배포
firebase deploy --only firestore:indexes

# 배포 확인
firebase firestore:indexes
```

**자동 생성된 인덱스:**
- Firestore는 단일 필드 인덱스를 자동 생성
- 복합 인덱스만 수동으로 정의 필요

**인덱스 목록:**
- `projects`: `userId` + `createdAt` (사용자별 프로젝트 시간순 조회)
- `projects`: `userId` + `status` + `createdAt` (사용자별 프로젝트 상태별 조회)
- `usageLogs`: `userId` + `createdAt` (사용자별 사용 로그)
- `subscriptions`: `userId` + `status` + `expiresAt` (사용자별 구독 관리)
- `facePool`: `nationality` + `gender` + `createdAt` (얼굴 풀 필터링)

### 2. Firestore 보안 규칙 배포

**파일:** `firestore.rules`

```bash
# 보안 규칙 배포
firebase deploy --only firestore:rules

# 로컬 테스트 (선택사항)
firebase emulators:start --only firestore
```

**보안 규칙 요약:**
- **Users**: 본인 데이터만 읽기/수정 가능, 관리자는 모든 데이터 읽기 가능
- **Projects**: 본인 프로젝트만 CRUD 가능
- **Subscriptions**: 읽기만 가능, 서버에서만 쓰기
- **Usage Logs**: 읽기만 가능, 서버에서만 쓰기
- **Face Pool**: 인증된 사용자 읽기 가능, 관리자/서버만 쓰기

### 3. Firestore 데이터 마이그레이션 (선택사항)

기존 데이터가 있다면:

```bash
# Firestore로 데이터 마이그레이션
npm run migrate:firestore

# 또는 수동 실행
npx tsx scripts/migrate-to-firestore.ts
```

---

## Cloud Storage 배포

### 1. Storage Bucket 생성

```bash
# Firebase Console에서:
# 1. Storage 섹션 이동
# 2. "시작하기" 클릭
# 3. 보안 규칙 선택 (프로덕션 모드)
# 4. 위치 선택 (예: asia-northeast3 - Seoul)

# 또는 CLI로:
gcloud storage buckets create gs://YOUR_PROJECT_ID.appspot.com \
  --location=asia-northeast3 \
  --uniform-bucket-level-access
```

### 2. Storage 보안 규칙 (선택사항)

**파일 생성:** `storage.rules`

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 인증된 사용자만 업로드 가능
    match /images/{imageId} {
      allow read: if true; // 공개 읽기
      allow write: if request.auth != null; // 인증된 사용자만 쓰기
    }

    // 사용자별 private 폴더
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 관리자만 접근 가능한 폴더
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null &&
                            firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

**배포:**
```bash
firebase deploy --only storage
```

---

## Cloud Functions 배포 (선택사항)

### 1. Functions 설정

```bash
# Firebase Functions 초기화
firebase init functions

# TypeScript 선택
# ESLint 설정 (선택)
```

### 2. Functions 코드 작성

**파일:** `functions/src/index.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// 사용자 생성 시 Firestore에 자동 추가
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});

// 사용자 삭제 시 Firestore 데이터도 삭제
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  await admin.firestore().collection('users').doc(user.uid).delete();
});
```

### 3. Functions 배포

```bash
cd functions
npm install

cd ..
firebase deploy --only functions
```

---

## API 서버 배포

### 옵션 1: Google Cloud Run (추천)

**장점:**
- 자동 스케일링
- 사용한 만큼만 과금
- HTTPS 자동 설정

**배포:**

```bash
# 1. Dockerfile 생성 (프로젝트 루트)
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 앱 코드 복사
COPY . .

# 빌드 (필요한 경우)
RUN npm run build

# 포트 노출
EXPOSE 3000

# 서버 시작
CMD ["npm", "run", "start"]
EOF

# 2. .dockerignore 생성
cat > .dockerignore << 'EOF'
node_modules
.git
.env
*.log
EOF

# 3. Docker 이미지 빌드
docker build -t gcr.io/YOUR_PROJECT_ID/hairkeeper-api .

# 4. Container Registry에 푸시
docker push gcr.io/YOUR_PROJECT_ID/hairkeeper-api

# 5. Cloud Run에 배포
gcloud run deploy hairkeeper-api \
  --image gcr.io/YOUR_PROJECT_ID/hairkeeper-api \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars "FIREBASE_PROJECT_ID=YOUR_PROJECT_ID" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID" \
  --service-account YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 옵션 2: Firebase Hosting + Cloud Functions

```bash
# Express 앱을 Cloud Function으로 배포
firebase init hosting
firebase init functions

# functions/src/index.ts에 Express 앱 통합
# firebase deploy
```

### 옵션 3: Compute Engine / GKE

자세한 내용은 Google Cloud 문서 참고.

---

## 모니터링 설정

### 1. Cloud Logging

**자동 활성화:**
- Cloud Run 배포 시 자동으로 로그 수집
- Firestore 작업도 자동 로깅

**로그 확인:**
```bash
# API 로그 조회
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=hairkeeper-api" --limit 50

# 에러 로그만 조회
gcloud logging read "severity>=ERROR" --limit 20
```

### 2. Firebase Crashlytics

**자동 활성화:**
- `@react-native-firebase/crashlytics` 설치 시 자동 활성화
- 네이티브 설정 파일 필요 (GoogleService-Info.plist, google-services.json)

**테스트:**
```typescript
import * as ErrorTracking from '@/lib/error-tracking';

// 개발 중 테스트
ErrorTracking.testCrash();
```

**확인:**
- Firebase Console → Crashlytics 섹션

### 3. Firebase Analytics

**자동 활성화:**
- `@react-native-firebase/analytics` 설치 시 자동 활성화

**대시보드:**
- Firebase Console → Analytics 섹션
- 이벤트, 사용자 속성, 전환 추적

### 4. Cloud Monitoring (구 Stackdriver)

**대시보드 생성:**

```bash
# Cloud Console에서:
# 1. Monitoring → Dashboards
# 2. "Create Dashboard" 클릭
# 3. 위젯 추가:
#    - Cloud Run: Request count, Latency, Error rate
#    - Firestore: Read/Write operations, Document count
#    - Cloud Storage: Request count, Bandwidth
```

**알림 설정:**

```bash
# Cloud Console에서:
# 1. Monitoring → Alerting
# 2. "Create Policy" 클릭
# 3. 조건 설정:
#    - Cloud Run error rate > 5%
#    - Firestore read/write operations > threshold
#    - API latency > 5s
# 4. 알림 채널 설정 (이메일, Slack, etc.)
```

---

## 성능 최적화

### 1. Firestore 최적화

```typescript
// 페이지네이션 사용
const pageSize = 20;
const lastDoc = await getLastVisibleDocument();

const query = firestore()
  .collection('projects')
  .where('userId', '==', userId)
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(pageSize);
```

### 2. Cloud Storage 최적화

```typescript
// Signed URL 캐싱 (1시간)
const signedUrl = await storageGet('images/photo.jpg', {
  expiresIn: 3600,
});

// CDN 사용 (공개 파일)
const publicUrl = `https://storage.googleapis.com/YOUR_BUCKET/images/photo.jpg`;
```

### 3. API 캐싱

```typescript
// React Query 캐싱
const { data } = trpc.user.getProfile.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000, // 10분
});
```

### 4. 이미지 최적화

```bash
# Cloud Storage에서 자동 이미지 최적화 (Cloud Functions 사용)
firebase deploy --only functions:optimizeImage
```

---

## 비용 최적화

### 1. Firestore

- 인덱스 최소화 (필요한 것만)
- 쿼리 최적화 (limit 사용)
- 불필요한 읽기 방지 (캐싱)

**예상 비용 (한국 리전):**
- 읽기: $0.06 / 100,000건
- 쓰기: $0.18 / 100,000건
- 삭제: $0.02 / 100,000건
- 저장: $0.18 / GB

### 2. Cloud Storage

- 압축된 이미지 저장
- 불필요한 파일 정기 삭제
- Lifecycle 정책 설정

**예상 비용:**
- 저장: $0.020 / GB (Standard)
- 다운로드: $0.12 / GB (아시아)

### 3. Cloud Run

- 최소 인스턴스 수 설정 (0-1)
- CPU always allocated 비활성화
- 메모리 제한 설정

**예상 비용:**
- vCPU: $0.00002400 / vCPU-초
- 메모리: $0.00000250 / GB-초
- 요청: $0.40 / 백만 요청

### 4. Vertex AI

- 배치 처리 사용 (가능한 경우)
- 모델 선택 최적화

**예상 비용:**
- Imagen 3: $0.02-0.04 / 이미지

---

## 보안 체크리스트

### Firebase

- [ ] Firestore 보안 규칙 배포 및 테스트
- [ ] Storage 보안 규칙 배포
- [ ] Firebase Auth 설정 확인 (승인된 도메인)
- [ ] API 키 제한 설정 (Firebase Console)

### Google Cloud

- [ ] 서비스 계정 권한 최소화
- [ ] VPC 네트워크 설정 (필요시)
- [ ] Cloud Armor (DDoS 방어, 필요시)
- [ ] Secret Manager 사용 (민감한 환경 변수)

### 환경 변수

- [ ] `.env` 파일을 `.gitignore`에 추가
- [ ] 프로덕션 환경 변수 설정 (Cloud Run / Functions)
- [ ] API 키 로테이션 계획

---

## 배포 체크리스트

### 초기 배포

- [ ] Firebase 프로젝트 생성
- [ ] Firestore Database 생성 (Native mode)
- [ ] Cloud Storage Bucket 생성
- [ ] Authentication 활성화 (Google, Apple, Email)
- [ ] Vertex AI API 활성화
- [ ] Speech-to-Text API 활성화
- [ ] 서비스 계정 생성 및 키 다운로드
- [ ] Firestore 인덱스 배포
- [ ] Firestore 보안 규칙 배포
- [ ] API 서버 배포 (Cloud Run)
- [ ] 환경 변수 설정

### 네이티브 앱 배포

- [ ] iOS: GoogleService-Info.plist 추가
- [ ] Android: google-services.json 추가
- [ ] iOS: Apple Developer 설정 (Sign In with Apple)
- [ ] Android: SHA-1 인증서 등록
- [ ] 앱 빌드 및 테스트
- [ ] App Store / Play Store 배포

### 모니터링 설정

- [ ] Cloud Logging 확인
- [ ] Firebase Crashlytics 활성화
- [ ] Firebase Analytics 활성화
- [ ] Cloud Monitoring 대시보드 생성
- [ ] 알림 정책 설정

---

## 문제 해결

### Firestore 인덱스 에러

**증상:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**해결:**
1. 에러 메시지의 링크 클릭
2. 인덱스 자동 생성
3. 또는 `firestore.indexes.json`에 수동 추가 후 재배포

### Cloud Run 배포 실패

**증상:**
```
ERROR: (gcloud.run.deploy) The user-provided container failed to start and listen on the port defined in the PORT environment variable.
```

**해결:**
1. Dockerfile의 `EXPOSE` 포트 확인
2. 앱이 `process.env.PORT` 사용하는지 확인
3. 로그 확인: `gcloud logging read --limit 20`

### Firebase Auth 에러

**증상:**
```
auth/invalid-api-key
```

**해결:**
1. `.env` 파일의 `EXPO_PUBLIC_FIREBASE_API_KEY` 확인
2. Firebase Console에서 API 키 확인
3. API 키 제한 설정 확인

---

## 다음 단계

배포 완료 후:

1. ✅ 프로덕션 테스트
2. ✅ 성능 모니터링
3. ✅ 비용 추적
4. 🔄 사용자 피드백 수집
5. 🔄 기능 개선 및 최적화

질문이나 문제가 있으면 언제든지 말씀해주세요! 🚀
