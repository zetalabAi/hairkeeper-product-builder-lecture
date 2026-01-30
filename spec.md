# 머리보존 AI - 기능 명세서

**버전**: 1.0.0 (현재 구현 상태)  
**마지막 업데이트**: 2026-01-30  
**작성자**: Manus AI

이 문서는 **현재 실제로 동작하는 기능만** 명시합니다. 이상적인 기능이나 미래 계획은 포함하지 않습니다.

---

## 1. 개요

머리보존 AI는 사용자가 업로드한 사진에서 얼굴을 감지하고, 선택한 한국인 얼굴로 교체하는 모바일 앱입니다. Replicate API의 Face Swap 모델을 사용하여 실시간 얼굴 합성을 제공합니다.

### 핵심 기술 스택

| 계층 | 기술 |
|------|------|
| 모바일 | React Native 0.81.5, Expo 54 |
| 라우팅 | Expo Router 6 |
| 스타일링 | NativeWind 4 (Tailwind CSS) |
| 상태관리 | React Query 5, Context API |
| API | tRPC 11.7.2 |
| 백엔드 | Express.js, Node.js |
| 데이터베이스 | MySQL 8.0, Drizzle ORM |
| 외부 API | Replicate (Face Swap), Manus LLM (이미지 분석) |
| 저장소 | S3 호환 스토리지 |

---

## 2. 현재 구현된 기능

### 2.1 사용자 인증

**상태**: 기본 구현 완료

- OAuth 기반 로그인 (Manus 플랫폼)
- 세션 쿠키 관리
- 로그아웃 기능
- 프로필 화면 (사용자 정보 표시)

**구현 위치**:
- `app/login.tsx` - 로그인 화면
- `app/profile.tsx` - 프로필 화면
- `lib/_core/auth.ts` - 인증 로직
- `server/_core/oauth.ts` - OAuth 처리

**제한사항**:
- 현재 데모 인증 컨텍스트 사용 (실제 OAuth는 별도 설정 필요)
- 사용자 정보는 세션에만 저장 (DB 저장 미구현)

---

### 2.2 사진 선택 및 편집

**상태**: 기본 구현 완료

사용자가 카메라 또는 갤러리에서 사진을 선택하고 편집할 수 있습니다.

**기능 목록**:

| 기능 | 상태 | 설명 |
|------|------|------|
| 카메라 촬영 | 완료 | `expo-image-picker` 사용, 3:4 비율 강제 |
| 갤러리 선택 | 완료 | 기존 사진 불러오기, 3:4 비율 강제 |
| 이미지 자르기 | 완료 | 선택 시 자동 편집 모드 진입 |
| 이미지 회전 | 완료 | 사진 편집 화면에서 회전 기능 |
| 이미지 필터 | 미구현 | - |

**구현 위치**:
- `app/photo-select.tsx` - 사진 선택 화면
- `app/photo-edit.tsx` - 사진 편집 화면

**데이터 흐름**:
```
사진 선택 → 이미지 URI 저장 → 편집 화면 → 스타일 선택 화면으로 이동
```

---

### 2.3 스타일 선택

**상태**: 기본 구현 완료

사용자가 얼굴 교체 스타일을 선택합니다.

**선택 옵션**:

| 항목 | 옵션 | 설명 |
|------|------|------|
| 국적 | 한국인 | 고정값 (현재 한국인만 지원) |
| 성별 | 남성 / 여성 | 선택 필수 |
| 스타일 | 자연스러운 / 세련된 / 화려한 | 선택 필수 |

**구현 위치**:
- `app/photo-edit.tsx` - 스타일 선택 UI 포함

**데이터 흐름**:
```
스타일 선택 → 얼굴 선택 화면으로 이동 (선택값 전달)
```

---

### 2.4 얼굴 선택

**상태**: 기본 구현 완료

선택한 성별에 맞는 한국인 얼굴 6개 중 하나를 선택합니다.

**얼굴 풀**:

| 성별 | 개수 | 저장 위치 |
|------|------|----------|
| 남성 | 6개 | S3 (URL 기반) |
| 여성 | 6개 | S3 (URL 기반) |

**얼굴 URL 관리**:
- `shared/face-urls.ts` - 모든 얼굴 URL 중앙 관리
- 각 얼굴은 `id`, `url` (S3), `localSource` (로컬 참조) 포함

**구현 위치**:
- `app/face-select.tsx` - 얼굴 선택 화면
- `shared/face-urls.ts` - 얼굴 URL 데이터

**데이터 흐름**:
```
얼굴 선택 → 합성 시작 버튼 → Face Swap API 호출
```

---

### 2.5 얼굴 합성 (Face Swap)

**상태**: 기본 구현 완료 (Expo Go 앱에서만 작동)

Replicate API를 사용하여 선택한 얼굴로 원본 이미지의 얼굴을 교체합니다.

**프로세스**:

1. **이미지 업로드**: 로컬 이미지 → Base64 변환 → S3 업로드
2. **Face Swap 실행**: Replicate API 호출 (약 27초 소요)
3. **결과 반환**: 합성된 이미지 URL 반환

**API 정보**:

| 항목 | 값 |
|------|-----|
| 모델 | `codeplugtech/face-swap` |
| 버전 | `278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34` |
| 실행 시간 | 약 27초 |
| 비용 | $0.0027/회 |
| 현재 크레딧 | $10 (약 3,700회 실행 가능) |

**입력 파라미터**:

```typescript
{
  originalImageUrl: string;      // 사용자가 업로드한 원본 이미지 URL
  selectedFaceUrl: string;       // 선택한 한국인 얼굴 이미지 URL
  nationality: string;           // "한국인" (고정)
  gender: string;                // "남성" | "여성"
  style: string;                 // "자연스러운" | "세련된" | "화려한"
}
```

**출력 데이터**:

```typescript
{
  resultImageUrl: string;        // 합성된 이미지 URL
  description: string;           // "Face swapped successfully with ..."
  preservedElements: string[];   // ["face shape", "hair", "background"]
  modifiedElements: string[];    // ["eyes", "nose", "mouth", "eyebrows"]
}
```

**구현 위치**:
- `app/face-select.tsx` - 합성 로직
- `server/routers.ts` - `ai.synthesizeFace` API
- `lib/upload-image.ts` - 이미지 업로드 유틸

**제한사항**:
- **웹 브라우저에서 작동하지 않음**: `expo-file-system` 네이티브 API 사용으로 인한 제한
- **Expo Go 앱에서만 테스트 가능**: iOS/Android 네이티브 환경 필요
- 이미지 크기 제한 없음 (Replicate API 기준)

---

### 2.6 결과 화면

**상태**: 기본 구현 완료

합성된 이미지와 원본 이미지를 비교 표시합니다.

**기능 목록**:

| 기능 | 상태 | 설명 |
|------|------|------|
| 결과 이미지 표시 | 완료 | 합성된 이미지 표시 |
| 원본 이미지 표시 | 완료 | 원본 이미지 표시 |
| 이미지 공유 | 완료 | `expo-sharing` 사용 |
| 다시 시작 | 완료 | 홈 화면으로 이동 |
| 이미지 저장 | 미구현 | - |

**구현 위치**:
- `app/result.tsx` - 결과 화면

**데이터 흐름**:
```
합성 완료 → 결과 화면 표시 → 공유 또는 다시 시작
```

---

### 2.7 히스토리 화면

**상태**: UI 구현 완료, 데이터베이스 연동 미구현

사용자의 이전 작업 기록을 표시합니다.

**현재 상태**:
- 더미 데이터로 UI 표시 (실제 데이터 미연동)
- 2열 그리드 레이아웃
- 각 항목에 결과 이미지, 성별, 스타일, 날짜 표시

**구현 위치**:
- `app/history.tsx` - 히스토리 화면

**미구현 기능**:
- 데이터베이스에서 실제 히스토리 조회
- 히스토리 항목 클릭 시 상세 보기
- 히스토리 항목 삭제

---

### 2.8 설정 화면

**상태**: UI 구현 완료, 기능 미구현

사용자 설정 및 앱 정보를 표시합니다.

**구현 위치**:
- `app/settings.tsx` - 설정 화면

**현재 기능**:
- 화면 레이아웃만 구현
- 실제 설정 기능 미구현

---

### 2.9 온보딩 화면

**상태**: UI 구현 완료

앱 첫 실행 시 사용자에게 앱의 기본 정보를 설명합니다.

**구현 위치**:
- `app/onboarding.tsx` - 온보딩 화면

---

## 3. 데이터베이스 스키마

**상태**: 스키마 정의 완료, 실제 사용 미구현

### 3.1 Users 테이블

사용자 정보 저장 (OAuth 기반)

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**현재 사용**: 미구현 (세션 기반만 작동)

### 3.2 Projects 테이블

사용자의 얼굴 합성 작업 기록

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  originalImageUrl VARCHAR(500) NOT NULL,
  resultImageUrl VARCHAR(500),
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' NOT NULL,
  nationality ENUM('korea', 'japan') NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  style VARCHAR(50) NOT NULL,
  selectedFaceId INT,
  processingTime INT,
  errorMessage TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**현재 사용**: 미구현 (히스토리 화면이 더미 데이터 사용)

### 3.3 Face Pool 테이블

AI 생성 얼굴 풀 관리

```sql
CREATE TABLE face_pool (
  id INT PRIMARY KEY AUTO_INCREMENT,
  imageUrl VARCHAR(500) NOT NULL,
  nationality ENUM('korea', 'japan') NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  style VARCHAR(50) NOT NULL,
  faceType ENUM('cat', 'dog', 'horse', 'rabbit'),
  embedding JSON,
  isActive BOOLEAN DEFAULT TRUE NOT NULL,
  version VARCHAR(20) DEFAULT 'v1' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**현재 사용**: 미구현 (하드코딩된 URL 사용)

### 3.4 Subscriptions 테이블

사용자 구독 정보 (미사용)

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  status ENUM('free', 'premium', 'expired') DEFAULT 'free' NOT NULL,
  platform ENUM('google', 'apple') NOT NULL,
  transactionId VARCHAR(255),
  productId VARCHAR(100),
  purchaseDate TIMESTAMP,
  expiryDate TIMESTAMP,
  autoRenew BOOLEAN DEFAULT TRUE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**현재 사용**: 미구현

---

## 4. API 엔드포인트

모든 API는 tRPC를 통해 제공되며, `/api/trpc` 경로로 라우팅됩니다.

### 4.1 인증 API

#### `auth.me`
현재 로그인한 사용자 정보 조회

**타입**: Query  
**입력**: 없음  
**출력**:
```typescript
{
  openId: string;
  name?: string;
  email?: string;
  role: 'user' | 'admin';
}
```

#### `auth.logout`
사용자 로그아웃

**타입**: Mutation  
**입력**: 없음  
**출력**:
```typescript
{ success: true }
```

---

### 4.2 AI API

#### `ai.analyzeFace`
업로드된 이미지에서 얼굴 감지 및 분석

**타입**: Mutation  
**입력**:
```typescript
{ imageUrl: string }
```

**출력**:
```typescript
{
  hasFace: boolean;
  facePosition: { x: number; y: number; width: number; height: number };
  hairColor: string;
  skinTone: string;
  age: number;
  gender: string;
  ethnicity: string;
}
```

**구현**: Manus LLM 사용 (이미지 분석)

**현재 사용**: 미구현 (UI에서 호출하지 않음)

---

#### `ai.synthesizeFace`
선택한 얼굴로 원본 이미지의 얼굴 교체

**타입**: Mutation  
**입력**:
```typescript
{
  originalImageUrl: string;
  selectedFaceUrl: string;
  nationality: string;
  gender: string;
  style: string;
}
```

**출력**:
```typescript
{
  resultImageUrl: string;
  description: string;
  preservedElements: string[];
  modifiedElements: string[];
}
```

**구현**: Replicate Face Swap API  
**현재 사용**: 완전히 구현됨 (Expo Go 앱에서 작동)

---

#### `ai.uploadImage`
이미지를 S3에 업로드하고 공개 URL 반환

**타입**: Mutation  
**입력**:
```typescript
{
  base64Data: string;
  filename: string;
}
```

**출력**:
```typescript
{ url: string }
```

**구현**: S3 호환 스토리지  
**현재 사용**: 완전히 구현됨

---

## 5. 네비게이션 구조

```
RootLayout (_layout.tsx)
├── (tabs) - 탭 기반 네비게이션
│   └── index.tsx - 홈 화면
├── photo-select.tsx - 사진 선택
├── photo-edit.tsx - 사진 편집 및 스타일 선택
├── face-select.tsx - 얼굴 선택 및 합성
├── result.tsx - 결과 화면
├── history.tsx - 히스토리
├── profile.tsx - 프로필
├── settings.tsx - 설정
├── login.tsx - 로그인
├── onboarding.tsx - 온보딩
└── oauth/callback.tsx - OAuth 콜백
```

---

## 6. 상태 관리

### 6.1 전역 상태

| 상태 | 관리 도구 | 위치 | 설명 |
|------|----------|------|------|
| 사용자 인증 | Context API | `lib/demo-auth-context.tsx` | 현재 로그인 사용자 |
| 테마 | Context API | `lib/theme-provider.tsx` | 라이트/다크 모드 |
| 색상 | Context API | `hooks/use-colors.ts` | 테마 색상 팔레트 |

### 6.2 로컬 상태

| 상태 | 관리 도구 | 위치 | 설명 |
|------|----------|------|------|
| 선택한 사진 | useState | `app/photo-select.tsx` | 이미지 URI |
| 선택한 스타일 | useState | `app/photo-edit.tsx` | 성별, 스타일 |
| 선택한 얼굴 | useState | `app/face-select.tsx` | 얼굴 ID |
| 합성 진행 상태 | useState | `app/face-select.tsx` | 로딩 상태 |

### 6.3 서버 상태

| 상태 | 관리 도구 | 설명 |
|------|----------|------|
| API 응답 | React Query | tRPC 쿼리/뮤테이션 캐싱 |
| 에러 처리 | React Query | 자동 재시도, 에러 상태 |

---

## 7. 외부 서비스 의존성

### 7.1 Replicate API

**용도**: Face Swap 모델 실행  
**모델**: `codeplugtech/face-swap`  
**인증**: API 키 (`REPLICATE_API_TOKEN` 환경 변수)  
**비용**: $0.0027/회  
**현재 크레딧**: $10 (약 3,700회 실행 가능)

**설정**:
```bash
REPLICATE_API_TOKEN=r8_ah9hQNkMgsBj0pnf9uMHEXxGgq7lcqv1cJdlY
```

### 7.2 Manus LLM

**용도**: 이미지 분석 (얼굴 감지)  
**인증**: 자동 (Manus 플랫폼)  
**현재 사용**: 미구현

### 7.3 S3 호환 스토리지

**용도**: 이미지 업로드 및 호스팅  
**인증**: 자동 (Manus 플랫폼)  
**현재 사용**: 완전히 구현됨

---

## 8. 성능 특성

### 8.1 응답 시간

| 작업 | 예상 시간 | 비고 |
|------|----------|------|
| 사진 선택 | <1초 | 로컬 작업 |
| 이미지 업로드 | 2-5초 | 이미지 크기에 따라 |
| Face Swap 실행 | 약 27초 | Replicate API |
| 결과 표시 | <1초 | 로컬 작업 |

### 8.2 데이터 크기

| 항목 | 크기 | 비고 |
|------|------|------|
| 사진 (3:4 비율) | 1-5MB | JPEG 압축 |
| 한국인 얼굴 이미지 | 약 100KB | 각각 |
| 합성 결과 이미지 | 1-5MB | 원본과 유사 |

---

## 9. 보안 고려사항

### 9.1 현재 구현된 보안

- **세션 쿠키**: HTTP-only 쿠키로 세션 관리
- **CORS**: 신뢰할 수 있는 도메인만 허용
- **입력 검증**: Zod 스키마로 API 입력 검증

### 9.2 미구현된 보안

- 사용자 인증 (현재 데모 모드)
- 이미지 악성 콘텐츠 필터링
- 속도 제한 (Rate Limiting)
- 사용자 데이터 암호화

---

## 10. 알려진 제한사항

### 10.1 기술적 제한

| 제한 | 원인 | 해결 방법 |
|------|------|----------|
| 웹 브라우저에서 작동 불가 | `expo-file-system` 네이티브 API | Expo Go 앱 사용 필수 |
| 한국인 얼굴만 지원 | 하드코딩된 얼굴 풀 | 데이터베이스 연동 필요 |
| 히스토리 미작동 | 데이터베이스 연동 미구현 | DB 연동 구현 필요 |
| 이미지 저장 불가 | 미구현 | `expo-media-library` 통합 필요 |

### 10.2 기능적 제한

- 일괄 처리 미지원 (한 번에 1개 이미지만)
- 실시간 미리보기 미지원
- 얼굴 선택 후 변경 불가 (다시 시작해야 함)

---

## 11. 테스트 환경

### 11.1 테스트 방법

**Expo Go 앱 사용** (권장):
1. Expo Go 앱 설치 (iOS App Store / Android Play Store)
2. QR 코드 스캔 또는 URL 입력: `exp://8081-iwkruup8mqy84i18ubaq9-9a09581d.sg1.manus.computer`
3. 사진 선택 → 스타일 선택 → 얼굴 선택 → 합성 시작

**웹 브라우저** (미지원):
- 현재 웹 환경에서는 작동하지 않음
- 향후 웹 호환성 개선 필요

### 11.2 테스트 데이터

- 한국인 남성 얼굴 6개 (S3 호스팅)
- 한국인 여성 얼굴 6개 (S3 호스팅)
- 테스트용 사진 (사용자가 직접 선택)

---

## 12. 배포 및 환경 설정

### 12.1 필수 환경 변수

```bash
# Replicate API
REPLICATE_API_TOKEN=r8_ah9hQNkMgsBj0pnf9uMHEXxGgq7lcqv1cJdlY

# 데이터베이스 (선택사항, 현재 미사용)
DATABASE_URL=mysql://user:password@host:3306/hairkeeper_ai

# API 기본 URL
VITE_API_BASE_URL=https://3000-iwkruup8mqy84i18ubaq9-9a09581d.sg1.manus.computer
```

### 12.2 빌드 및 실행

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

---

## 13. 변경 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| 1.0.0 | 2026-01-30 | 초기 명세서 작성 (현재 구현 상태) |

---

## 14. 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [tRPC 공식 문서](https://trpc.io/)
- [Replicate API 문서](https://replicate.com/docs)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)
- [NativeWind 공식 문서](https://www.nativewind.dev/)

