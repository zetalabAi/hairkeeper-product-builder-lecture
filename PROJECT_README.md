# 머리보존 AI - 프로젝트 개요

## 프로젝트 소개

**머리보존 AI**는 한국의 헤어디자이너와 헤어모델 간의 초상권 논쟁을 해결하기 위한 모바일 앱입니다. 실제 고객의 헤어 스타일 사진에서 **머리는 절대 변형하지 않고**, **얼굴만 AI로 비식별 처리**하여 SNS 홍보용 이미지를 생성합니다.

### 핵심 가치

> **"AI지만, 머리는 진짜."**

이 앱의 성공 기준은 단 하나입니다. 헤어 스타일은 100% 실제 시술 결과를 보존하면서, 얼굴만 자연스러운 AI 얼굴로 교체하는 것입니다.

## 주요 기능

### 1. 사용자 인증
- **소셜 로그인**: Google, Naver, Kakao 지원
- Manus OAuth 기반 인증 시스템

### 2. 사진 처리 플로우
1. **사진 업로드**: 카메라 촬영 또는 앨범에서 선택
2. **옵션 선택**:
   - 국적: 한국 / 일본
   - 성별: 남성 / 여성
   - 스타일: 성별에 따라 다른 옵션 제공
     - 여성: 청순, 귀여움, 아름다움, 도도, 섹시
     - 남성: 늠름, 섹시, 남성적, 강한 인상
3. **얼굴 선택**: AI가 추천하는 얼굴 후보 중 선택
4. **결과 확인**: Before/After 슬라이더로 비교
5. **저장 및 공유**: 시스템 공유 기능 활용

### 3. 구독 시스템
- **무료 사용자**:
  - 워터마크 삽입
  - 다운로드 시 광고 표시
  - 합성 횟수 제한
- **프리미엄 구독** (월 11,900원):
  - 워터마크 제거
  - 광고 제거
  - 고화질 저장
  - 무제한 합성

## 기술 스택

### Frontend (Mobile App)
- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript 5.9
- **Navigation**: Expo Router 6
- **Styling**: NativeWind 4 (Tailwind CSS)
- **State Management**: React Context + TanStack Query
- **Image Handling**: expo-image-picker

### Backend
- **Runtime**: Node.js 22
- **API**: tRPC 11
- **Database**: MySQL (Drizzle ORM)
- **Authentication**: Manus OAuth
- **Storage**: S3-compatible storage
- **AI Integration**: Built-in LLM support

### Database Schema

#### 주요 테이블
1. **users**: 사용자 정보
2. **subscriptions**: 구독 상태 및 결제 정보
3. **projects**: 작업 히스토리 (원본/결과 이미지, 처리 상태)
4. **facePool**: AI 생성 얼굴 풀 (국적/성별/스타일별 분류)
5. **modelPerformance**: AI 모델 성능 평가 지표
6. **usageLogs**: 사용자 행동 로그

## 프로젝트 구조

```
hairkeeper_ai/
├── app/                      # 앱 화면
│   ├── (tabs)/              # 탭 네비게이션
│   │   └── index.tsx        # 홈 화면
│   ├── onboarding.tsx       # 온보딩 화면
│   ├── login.tsx            # 로그인 화면
│   ├── photo-select.tsx     # 사진 선택 화면
│   ├── photo-edit.tsx       # 사진 편집 화면
│   └── face-select.tsx      # 얼굴 선택 화면 (미구현)
├── components/              # 재사용 가능한 컴포넌트
│   ├── screen-container.tsx
│   └── ui/
├── server/                  # 백엔드 코드
│   ├── db.ts               # 데이터베이스 쿼리
│   ├── routers.ts          # tRPC API 라우터
│   └── storage.ts          # S3 스토리지
├── drizzle/                # 데이터베이스 스키마
│   ├── schema.ts
│   └── migrations/
├── assets/                 # 이미지 및 리소스
│   └── images/
│       └── icon.png        # 앱 로고
├── design.md              # 디자인 계획 문서
└── todo.md                # 작업 목록
```

## 개발 가이드

### 환경 설정

1. **의존성 설치**:
   ```bash
   pnpm install
   ```

2. **데이터베이스 마이그레이션**:
   ```bash
   pnpm db:push
   ```

3. **개발 서버 실행**:
   ```bash
   pnpm dev
   ```

### 주요 명령어

- `pnpm dev`: 개발 서버 시작 (Metro + API 서버)
- `pnpm dev:metro`: Metro bundler만 실행
- `pnpm dev:server`: API 서버만 실행
- `pnpm check`: TypeScript 타입 체크
- `pnpm lint`: ESLint 실행
- `pnpm test`: Vitest 테스트 실행
- `pnpm db:push`: 데이터베이스 스키마 마이그레이션

### Expo 앱 실행

- **웹**: 자동으로 브라우저에서 열림
- **iOS**: `pnpm ios` (macOS + Xcode 필요)
- **Android**: `pnpm android` (Android Studio 필요)
- **Expo Go**: QR 코드 스캔하여 실행

## 디자인 원칙

### UI/UX 철학
- **B612 셀카 앱** 스타일의 직관적 인터페이스
- **한 손 조작** 최적화 (모바일 세로 방향 9:16)
- **텍스트 입력 없음** - 사용자는 선택만 함
- **Apple HIG** 준수 (iOS 네이티브 앱 느낌)

### 색상 팔레트
- **Primary**: `#FF6B9D` (핑크 - 뷰티 산업)
- **Secondary**: `#4A90E2` (블루 - 신뢰감)
- **Accent**: `#FFD700` (골드 - 프리미엄)

### 성능 목표
- 합성 처리: **2.5~6초** (최악 10초)
- 앱 시작: **1초 이내**
- 화면 전환: **250ms 이내**

## AI 이미지 합성 엔진

### 요구사항
- **헤어 보존 최우선**: 머리 영역은 절대 변형 금지
- **얼굴만 교체**: 자연스러운 경계 블렌딩
- **품질 게이트**:
  - Hair-SSIM ≥ 0.985
  - Hair-LPIPS ≤ 0.030
  - Hair-ΔE ≤ 1.5
  - Ring Color Jump ≤ 2.0%

### 처리 파이프라인
1. 입력 정규화
2. 얼굴/헤어 세그멘테이션
3. 헤어 마스크 고정 (Hair Lock)
4. 얼굴 풀에서 후보 검색 + 유사도 추천
5. AI 얼굴 합성 (Nano Banana 또는 최고 성능 모델)
6. 경계 국소 블렌딩 (헤어 침범 금지)
7. 자동 QA 게이트
8. 결과 출력 (워터마크/광고 정책 적용)

### 모델 라우터
- **Primary (S등급)**: 기본 사용
- **Secondary (A등급)**: 특수 조건 (앞머리, 탈색, 강한 조명 등)
- 헤어 보존 게이트 실패 모델은 즉시 탈락

## 구현 상태

### ✅ 완료
- [x] 프로젝트 초기화 및 구조 설계
- [x] 데이터베이스 스키마 설계 (6개 테이블)
- [x] 앱 브랜딩 및 로고 생성
- [x] 온보딩 화면 (3개 슬라이드)
- [x] 로그인 화면 (소셜 로그인)
- [x] 홈 화면
- [x] 사진 선택 화면 (카메라/앨범)
- [x] 사진 편집 화면 (국적/성별/스타일)

### 🚧 진행 중 / 미완성
- [ ] 얼굴 선택 화면
- [ ] AI 이미지 합성 API 통합
- [ ] 결과 확인 화면 (Before/After 슬라이더)
- [ ] 저장 완료 화면
- [ ] 설정 화면
- [ ] 구독/결제 시스템
- [ ] 광고 통합 (AdMob)
- [ ] 워터마크 로직

## 다음 단계

### 1. AI 합성 엔진 통합
- Nano Banana API 또는 유사한 이미지 합성 서비스 연동
- 얼굴/헤어 세그멘테이션 모델 통합
- 서버 API 엔드포인트 구현

### 2. 얼굴 풀 생성
- 국적/성별/스타일별 AI 얼굴 생성 (약 700장)
- 실존 인물 비유사성 검증
- 데이터베이스에 임베딩 벡터 저장

### 3. 결제 시스템
- Google Play Billing 통합 (Android)
- App Store In-App Purchase 통합 (iOS)
- 구독 상태 관리 및 검증

### 4. 광고 통합
- Google AdMob 설정
- 무료 사용자 대상 전면 광고 표시

### 5. 테스트 및 최적화
- 전체 사용자 플로우 테스트
- 성능 최적화 (로딩 시간)
- 접근성 검증 (VoiceOver/TalkBack)

## 배포

### 준비 사항
1. **환경 변수 설정**: `.env` 파일에 필요한 API 키 추가
2. **앱 아이콘 및 스플래시**: `assets/images/` 확인
3. **빌드 설정**: `app.config.ts` 검토

### 빌드 명령어
- **Android**: `eas build --platform android`
- **iOS**: `eas build --platform ios`

### 스토어 제출
- Google Play Console
- Apple App Store Connect

## 라이선스

이 프로젝트는 Manus 플랫폼에서 생성되었습니다.

## 문의

프로젝트 관련 문의는 [Manus Help Center](https://help.manus.im)를 통해 제출해주세요.
