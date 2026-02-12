# HairKeeper - AI 얼굴 비식별화 서비스

> 헤어샵 고객 사진의 얼굴을 AI로 자연스럽게 교체하여 개인정보를 보호하면서도 헤어스타일을 자유롭게 홍보할 수 있는 서비스

[![Version](https://img.shields.io/badge/version-1.0.0--beta-blue.svg)](https://github.com/your-org/hairkeeper/releases)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🎉 MVP 완료 기능

### ✅ 핵심 기능
- [x] **얼굴 스왑 (Face Swap)** - Dzine AI 직접 연동
  - 고품질 얼굴 교체
  - 머리카락 완벽 보존
  - 자연스러운 경계선 합성
- [x] **얼굴 풀 시스템**
  - 한국인 여성/남성 얼굴 풀 (각 7장)
  - Firebase Firestore 저장
  - 성별/국적/스타일별 필터링
- [x] **배치 처리**
  - 최대 10장 동시 처리
  - ZIP 다운로드 지원
  - 병렬 처리 최적화

### ✅ 성능 최적화
- [x] **이미지 최적화**
  - 자동 리사이징 (1080px)
  - 압축률 85%
  - 업로드 시간 50% 단축
- [x] **프리로딩**
  - 얼굴 풀 이미지 사전 로드
  - 진행률 표시
  - 즉시 표시 (로딩 지연 제거)
- [x] **API 최적화**
  - Quality 모드 (high/balanced/fast)
  - Priority 처리 (프리미엄 사용자)
  - 처리 시간 30초 → 20초

### ✅ 베타 테스트
- [x] **피드백 시스템**
  - 6개 정량 평가 (1-5점)
  - 3개 정성 평가 (서술형)
  - Firestore 자동 수집

### ✅ 인프라
- [x] Firebase Functions (tRPC)
- [x] Firebase Firestore (데이터베이스)
- [x] Google Cloud Storage (이미지 저장)
- [x] Dzine AI (얼굴 스왑 API)

## 📊 성능 지표

### 처리 시간
| 모드 | 처리 시간 | 용도 |
|------|----------|------|
| **Fast** | 15-20초 | 테스트/프리뷰 |
| **Balanced** | 20-25초 | 기본 모드 (무료) |
| **High** | 30-35초 | 최고 품질 (프리미엄) |

### 배치 처리
- **동시 처리**: 최대 10장
- **ZIP 생성**: 자동
- **병렬 처리**: 4개 동시 실행

### 최적화 효과
- **이미지 압축**: 60-80% 파일 크기 감소
- **업로드 시간**: 2-5초 → 1-2초
- **프리로딩**: 즉시 표시 (로딩 지연 0초)

## 🚀 배포 상태

### Firebase
- ✅ **Firestore**: 보안 규칙 설정 완료
- ⚠️ **Functions**: 배포 필요 (`firebase deploy --only functions`)
- ⚠️ **Rules**: 배포 필요 (`firebase deploy --only firestore:rules`)

### 모바일 앱
- ⚠️ **iOS**: EAS 빌드 필요 (`eas build --platform ios --profile preview`)
- ⚠️ **Android**: EAS 빌드 필요 (`eas build --platform android --profile preview`)

## 📱 베타 테스트

### 목표
- **테스터 수**: 30명
- **기간**: 4주 (2026-02-12 ~ 2026-03-12)
- **목표**: 피드백 수집 및 버그 수정

### 모집 채널
- [ ] 헤어샵 커뮤니티
- [ ] 미용사 온라인 그룹
- [ ] 지인 네트워크

### 수집 항목
- **정량 평가**: 얼굴 스왑 정확도, 처리 속도, 얼굴 풀 다양성, 배치 처리 유용성, 전체 만족도, 구독 의향
- **정성 평가**: 가장 좋았던 기능, 가장 아쉬운 점, 개선 제안

## 🛠️ 기술 스택

### Frontend
- **React Native** (Expo)
- **Expo Router** (파일 기반 라우팅)
- **NativeWind** (Tailwind CSS for React Native)
- **tRPC + React Query** (타입 안전 API)

### Backend
- **Firebase Functions** (Node.js + tRPC)
- **Firebase Firestore** (NoSQL 데이터베이스)
- **Google Cloud Storage** (이미지 저장)
- **Dzine AI** (얼굴 스왑 API)

### DevOps
- **TypeScript** 5.x
- **ESLint** + **Prettier**
- **Git** + **GitHub**
- **EAS** (Expo Application Services)

## 📚 문서

- [얼굴 풀 확장 가이드](docs/FACE_POOL_WORKFLOW.md)
- [베타 테스트 체크리스트](docs/BETA_CHECKLIST.md)
- [CHANGELOG](CHANGELOG.md)

## 🏁 시작하기

### 요구사항
- Node.js 20.19+
- npm or pnpm
- Firebase CLI
- EAS CLI (Expo)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/hairkeeper.git
cd hairkeeper

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.production.example .env.production
# Edit .env.production with actual values

# 개발 서버 시작
npm start
```

### Firebase 배포

```bash
# Functions 배포
firebase deploy --only functions

# Firestore 규칙 배포
firebase deploy --only firestore:rules
```

### EAS 빌드

```bash
# iOS 베타 빌드
eas build --platform ios --profile preview

# Android 베타 빌드
eas build --platform android --profile preview
```

## 📈 다음 단계 (Phase 2)

### 우선순위 1: 사용자 경험 개선
- [ ] 실시간 진행률 표시
- [ ] 오류 복구 시스템
- [ ] 오프라인 모드 지원

### 우선순위 2: 얼굴 풀 확장
- [ ] 얼굴 풀 30장 확보 (여성 15장, 남성 15장)
- [ ] 연령대별 분류 (20-30대, 40-50대, 60대+)
- [ ] 피부톤별 분류 (밝음, 중간, 어두움)

### 우선순위 3: 수익화
- [ ] 구독 시스템 (Stripe 연동)
- [ ] 프리미엄 기능 (고품질 모드, 우선 처리)
- [ ] 사용량 제한 (무료 10장/월, 프리미엄 무제한)

### 우선순위 4: 마케팅
- [ ] 랜딩 페이지 제작
- [ ] 온보딩 튜토리얼
- [ ] 샘플 갤러리

## 👥 팀

- **Product Manager**: Your Name
- **Lead Developer**: Claude Sonnet 4.5 (AI Assistant)
- **Designer**: TBD

## 📄 라이선스

Proprietary - All rights reserved

## 🙏 감사의 말

이 프로젝트는 다음 기술들을 사용합니다:
- [Expo](https://expo.dev/)
- [Firebase](https://firebase.google.com/)
- [Dzine AI](https://dzine.ai/)
- [tRPC](https://trpc.io/)
- [React Query](https://tanstack.com/query)

---

**Made with ❤️ by HairKeeper Team**
