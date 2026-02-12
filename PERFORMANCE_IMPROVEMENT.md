# 성능 개선 방안

## 🐌 현재 문제

### 1. 번들링 속도
- **초기 번들링**: 129초 (2분 9초)
- **재번들링**: 47초
- **모듈 수**: 1,553개
- **node_modules 크기**: 996MB

### 2. 원인 분석

#### 사용하지 않는 무거운 의존성
```json
"@google-cloud/aiplatform": "^6.4.0",     // ❌ MVP에서 사용 안함
"@google-cloud/speech": "^7.2.1",         // ❌ MVP에서 사용 안함
```

#### 중복 Firebase 패키지
```json
"firebase": "^12.9.0",                    // 클라이언트용
"firebase-admin": "^13.6.1",              // 서버용 (번들에 포함될 필요 없음)
```

## ✅ 해결 방안

### 즉시 적용 가능 (Phase 1)

#### 1. 사용하지 않는 의존성 제거
```bash
# Vertex AI, Speech-to-Text 제거
npm uninstall @google-cloud/aiplatform @google-cloud/speech

# 관련 파일 제거
rm server/_core/vertex-ai-image.ts
rm server/_core/google-speech.ts
```

**예상 효과**:
- node_modules 크기: 996MB → ~700MB (30% 감소)
- 번들링 시간: 129초 → ~90초 (30% 개선)

#### 2. Metro Bundler 캐시 활성화
```json
// metro.config.js
module.exports = {
  resetCache: false,
  cacheStores: [
    new FileStore({
      root: path.join(__dirname, '.metro-cache'),
    }),
  ],
};
```

**예상 효과**:
- 재번들링: 47초 → 10초 이내

#### 3. 코드 스플리팅 (Dynamic Import)
```typescript
// 무거운 컴포넌트 lazy loading
const BetaFeedback = React.lazy(() => import('./beta-feedback'));
const BatchProcess = React.lazy(() => import('./batch-process'));
```

**예상 효과**:
- 초기 번들 크기 감소
- 첫 화면 로딩 속도 개선

### 중기 개선 (Phase 2)

#### 4. Firebase 웹 SDK 최적화
```json
// firebase/app만 import하고 필요한 것만 동적 로드
import { initializeApp } from 'firebase/app';
// auth는 사용할 때만 동적 import
const { getAuth } = await import('firebase/auth');
```

#### 5. 이미지 프리로딩 최적화
```typescript
// 현재: 모든 이미지 한번에 프리로드 (14장)
// 개선: 처음 6장만 프리로드, 나머지는 lazy load
```

#### 6. Metro Bundler 설정 최적화
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierConfig: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
      },
    },
  },
  resolver: {
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  },
};
```

## 📊 예상 개선 효과

| 항목 | 현재 | Phase 1 | Phase 2 |
|------|------|---------|---------|
| **초기 번들링** | 129초 | 90초 | 45초 |
| **재번들링** | 47초 | 10초 | 5초 |
| **node_modules** | 996MB | 700MB | 500MB |
| **초기 번들 크기** | ? | ? | -30% |

## 🚀 적용 순서

### 즉시 적용 (5분)
1. ✅ Dzine API 에러 수정 (완료)
2. ⏳ 사용하지 않는 의존성 제거
3. ⏳ Metro 캐시 활성화

### 이번 주 적용 (1-2시간)
4. 코드 스플리팅 적용
5. Firebase 웹 SDK 최적화

### 다음 주 적용
6. 이미지 프리로딩 최적화
7. Metro Bundler 설정 최적화

## 📝 참고사항

- 프로덕션 빌드는 개발 서버보다 훨씬 빠름
- EAS 빌드는 서버에서 진행되므로 로컬 속도 영향 없음
- 실제 사용자는 빌드된 앱을 사용하므로 개발 속도는 개발자 경험에만 영향

## ⚠️ 주의사항

- 의존성 제거 전 사용 여부 재확인
- 테스트 후 적용
- git commit 전 백업
