# Dzine + Kling 멀티 API 전략 구현 계획

## 📋 문서 정보
- **작성일**: 2026-01-31
- **총 소요 기간**: 6주
- **목표**: 이미지 합성(Dzine) + 영상 생성(Kling) 완전 통합

---

## 🎯 전체 로드맵

```
Week 1: Dzine AI 통합
Week 2: Kling AI 통합
Week 3: 멀티 API 시스템
Week 4: 크레딧 시스템
Week 5: 결제 시스템
Week 6: 테스트 및 출시
```

---

## 📅 Phase 1: Dzine AI 통합 (1주)

### 목표
사용자가 업로드한 사진의 얼굴을 9개의 한국인 얼굴 세트 중 하나로 교체하는 기능 구현

### 작업 항목

#### 1.1 Dzine AI API 키 발급 (1일)
- Dzine AI 계정 생성 (https://www.dzine.ai)
- API 키 발급 (Settings → API Keys)
- 환경 변수 설정 (`DZINE_API_KEY`)
- 서버 재시작 및 API 연결 테스트

#### 1.2 이미지 합성 API 통합 (2일)
**서버 측 구현**:
```typescript
// server/dzine-api.ts
export async function swapFace(
  sourceImageUrl: string,  // 사용자 업로드 이미지
  targetFaceUrl: string,   // 9개 얼굴 세트 중 선택된 얼굴
): Promise<string> {
  // Dzine AI Face Swap API 호출
  // 결과 이미지 URL 반환
}
```

**클라이언트 측 수정**:
- 기존 `synthesizeFace` API를 Dzine AI로 교체
- 로딩 진행률 유지 (업로드 30% + 합성 70%)

#### 1.3 Character Consistency 기능 테스트 (1일)
- Dzine AI의 Character Consistency 기능 활용
- 9개 얼굴을 "캐릭터"로 등록
- 다각도 이미지 생성 테스트 (정면, 좌측면, 우측면, 상향, 하향)

#### 1.4 9명의 얼굴 세트 생성 (3일)
**요구사항**:
- 한국인 남성 4명, 여성 5명
- 각 얼굴당 5개 각도 (정면, 좌측면, 우측면, 상향, 하향)
- 총 45개 이미지 (9명 × 5각도)
- 헤어 디자인 포트폴리오에 적합한 비즈니스 룩

**생성 방법**:
1. AI 이미지 생성 도구 사용 (Midjourney, DALL-E 3 등)
2. 프롬프트 예시:
   ```
   Professional Korean business headshot, [gender], [age], 
   [angle] view, neutral expression, studio lighting, 
   clean background, high resolution, photorealistic
   ```
3. S3에 업로드 및 URL 매핑 (`shared/face-urls.ts`)

---

## 📅 Phase 2: Kling AI 통합 (1주)

### 목표
합성된 이미지를 5초 릴스 영상으로 변환하는 기능 구현

### 작업 항목

#### 2.1 Kling AI API 키 발급 (1일)
- Kling AI 계정 생성 (https://klingai.com)
- API 키 발급
- 환경 변수 설정 (`KLING_API_KEY`)
- 크레딧 충전 ($20 테스트용)

#### 2.2 영상 생성 API 통합 (3일)
**서버 측 구현**:
```typescript
// server/kling-api.ts
export async function generateVideo(
  imageUrl: string,        // Dzine AI로 합성된 이미지
  duration: number = 5,    // 5초 고정
): Promise<string> {
  // Kling AI Image-to-Video API 호출
  // 결과 영상 URL 반환
}
```

**클라이언트 측 추가**:
- 결과 화면에 "영상 생성" 버튼 추가
- 영상 생성 로딩 화면 (예상 시간: 10-15초)
- 영상 재생 플레이어 (expo-video)

#### 2.3 Elements 기능 테스트 (1일)
- Kling AI의 Elements 기능 탐색
- 자연스러운 움직임 효과 테스트
- 헤어 디자인 포트폴리오에 적합한 효과 선택

#### 2.4 5초 릴스 영상 생성 테스트 (2일)
- 다양한 얼굴 세트로 영상 생성 테스트
- 품질 검증 (해상도, 프레임 레이트, 자연스러움)
- 실패율 모니터링 (예상: 10-20%)

---

## 📅 Phase 3: 멀티 API 시스템 구축 (3일)

### 목표
이미지 합성과 영상 생성을 분리하고, 장애 시 자동 전환 로직 구현

### 작업 항목

#### 3.1 API 라우팅 로직 구현 (1일)
**서버 측 구현**:
```typescript
// server/api-router.ts
export enum APIProvider {
  DZINE = 'dzine',
  KLING = 'kling',
  REPLICATE = 'replicate', // 백업용
}

export function routeImageSynthesis(): APIProvider {
  return APIProvider.DZINE; // 이미지는 무조건 Dzine
}

export function routeVideoGeneration(): APIProvider {
  return APIProvider.KLING; // 영상은 무조건 Kling
}
```

#### 3.2 장애 시 자동 전환 로직 (1일)
**백업 전략**:
- Dzine 장애 시 → Replicate Face Swap으로 자동 전환
- Kling 장애 시 → 영상 생성 실패 안내 (백업 없음)

**구현**:
```typescript
export async function swapFaceWithFallback(
  sourceUrl: string,
  targetUrl: string,
): Promise<string> {
  try {
    return await dzineAPI.swapFace(sourceUrl, targetUrl);
  } catch (error) {
    console.warn('Dzine failed, falling back to Replicate');
    return await replicateAPI.swapFace(sourceUrl, targetUrl);
  }
}
```

#### 3.3 재시도 제한 정책 구현 (1일)
**무료 사용자 제한**:
- 이미지 합성 실패 시 재시도 불가 (크레딧 소모)
- 주 2회 무료 충전 (월요일 오전 9시)

**유료 사용자**:
- 재시도 무제한 (크레딧 소모)
- 실패 시 크레딧 환불 옵션

---

## 📅 Phase 4: 크레딧 시스템 구현 (1주)

### 목표
Manus 스타일의 구독 + 크레딧 시스템 구현

### 작업 항목

#### 4.1 크레딧 충전/소모 로직 (2일)
**DB 스키마 추가**:
```typescript
// drizzle/schema.ts
export const credits = pgTable('credits', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  balance: integer('balance').default(0),
  plan: text('plan').default('free'), // free, pro, pro_plus
  lastRecharge: timestamp('last_recharge'),
});

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(), // 양수: 충전, 음수: 소모
  type: text('type').notNull(), // recharge, consume, purchase
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**API 구현**:
```typescript
// server/credit-system.ts
export async function consumeCredits(
  userId: string,
  amount: number,
  description: string,
): Promise<boolean> {
  // 크레딧 잔액 확인
  // 부족 시 false 반환
  // 충분 시 차감 및 트랜잭션 기록
}

export async function rechargeCredits(
  userId: string,
  amount: number,
): Promise<void> {
  // 크레딧 충전 및 트랜잭션 기록
}
```

#### 4.2 구독 플랜별 크레딧 할당 (1일)
**플랜별 크레딧**:
- **무료**: 주 2회 (월요일 오전 9시 자동 충전)
- **프로**: 월 100 크레딧 (구독 시 즉시 충전)
- **프로플러스**: 월 100 크레딧 (구독 시 즉시 충전)

**자동 충전 로직**:
```typescript
// server/cron-jobs.ts
import cron from 'node-cron';

// 매주 월요일 오전 9시 (한국 시간)
cron.schedule('0 9 * * 1', async () => {
  const freeUsers = await getFreeUsers();
  for (const user of freeUsers) {
    await rechargeCredits(user.id, 2);
  }
});
```

#### 4.3 추가 크레딧 구매 기능 (2일)
**가격표**:
- 10 크레딧: ₩2,900 ($2.23)
- 50 크레딧: ₩12,900 ($9.90)
- 100 크레딧: ₩22,900 ($17.59)

**UI 구현**:
- 크레딧 부족 시 구매 안내 모달
- 크레딧 구매 화면 (패키지 선택)
- 결제 완료 후 즉시 충전

#### 4.4 워터마크 로직 (무료 플랜) (2일)
**구현**:
```typescript
// server/watermark.ts
export async function addWatermark(
  imageUrl: string,
  plan: string,
): Promise<string> {
  if (plan !== 'free') return imageUrl; // 유료 플랜은 워터마크 없음
  
  // 이미지 다운로드
  // 워터마크 추가 ("머리보존 AI" 텍스트, 우측 하단)
  // S3 업로드 및 URL 반환
}
```

---

## 📅 Phase 5: 결제 시스템 통합 (1주)

### 목표
Stripe 또는 Toss Payments를 통한 구독 및 크레딧 구매 결제 구현

### 작업 항목

#### 5.1 Stripe/Toss Payments 통합 (2일)
**Stripe 선택 이유**:
- 글로벌 결제 지원
- 구독 관리 기능 내장
- 한국 카드 결제 지원

**구현**:
```typescript
// server/payment.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createSubscription(
  userId: string,
  plan: 'pro' | 'pro_plus',
): Promise<string> {
  // Stripe 구독 생성
  // Checkout Session URL 반환
}
```

#### 5.2 월 구독 자동 결제 (2일)
**Webhook 구현**:
```typescript
// server/stripe-webhook.ts
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'invoice.payment_succeeded':
      // 구독 갱신 시 크레딧 충전
      break;
    case 'customer.subscription.deleted':
      // 구독 취소 시 플랜 다운그레이드
      break;
  }
}
```

#### 5.3 크레딧 추가 구매 결제 (1일)
**일회성 결제**:
```typescript
export async function purchaseCredits(
  userId: string,
  package: 10 | 50 | 100,
): Promise<string> {
  // Stripe Checkout Session 생성
  // 결제 완료 시 크레딧 충전
}
```

#### 5.4 다운그레이드 기능 (2일)
**로직**:
- 프로플러스 → 프로: 즉시 적용, 남은 크레딧 유지
- 프로 → 무료: 다음 결제일에 적용, 남은 크레딧 소멸

**UI**:
- 설정 화면에 "플랜 변경" 버튼
- 다운그레이드 확인 모달 (크레딧 소멸 경고)

---

## 📅 Phase 6: 테스트 및 최종 전달 (1주)

### 목표
전체 플로우 테스트 및 API 비용 모니터링

### 작업 항목

#### 6.1 전체 플로우 테스트 (3일)
**시나리오 1: 무료 사용자**
1. 회원가입
2. 3회 무료 이미지 합성 (워터마크 있음)
3. 크레딧 소진 → 구매 안내
4. 다음 주 월요일 오전 9시 → 2회 충전 확인

**시나리오 2: 프로 사용자**
1. 프로 플랜 구독 ($9.90/월)
2. 100 크레딧 충전 확인
3. 이미지 합성 100회 (워터마크 없음)
4. 영상 생성 시도 → 프로플러스 업그레이드 안내

**시나리오 3: 프로플러스 사용자**
1. 프로플러스 플랜 구독 ($22.99/월)
2. 100 크레딧 충전 확인
3. 이미지 합성 50회 + 영상 생성 16회
4. 크레딧 부족 → 추가 구매

#### 6.2 API 비용 모니터링 (2일)
**대시보드 구축**:
```typescript
// server/analytics.ts
export async function getAPICosts(
  startDate: Date,
  endDate: Date,
): Promise<{
  dzine: number;
  kling: number;
  total: number;
}> {
  // 기간별 API 호출 횟수 및 비용 계산
}
```

**모니터링 항목**:
- Dzine AI 호출 횟수 및 비용
- Kling AI 호출 횟수 및 비용
- 실패율 (재시도 비용 포함)
- 사용자당 평균 비용

#### 6.3 사용자 피드백 수집 (1일)
**베타 테스터 모집**:
- 헤어 디자이너 5-10명
- 일반 사용자 20-30명

**피드백 항목**:
- 얼굴 합성 품질 (머리카락 경계선)
- 영상 생성 품질 (자연스러움)
- 크레딧 시스템 이해도
- 요금제 만족도

#### 6.4 공식 출시 (1일)
**출시 체크리스트**:
- [ ] 모든 API 정상 작동 확인
- [ ] 결제 시스템 테스트 완료
- [ ] 크레딧 자동 충전 테스트 완료
- [ ] 워터마크 로직 정상 작동 확인
- [ ] 서버 모니터링 설정 완료
- [ ] 사용자 문서 작성 (FAQ, 이용 가이드)

---

## 💰 예상 비용

### 개발 비용
- Dzine AI 테스트: $20
- Kling AI 테스트: $20
- Stripe 테스트: $10
- **합계**: $50

### 월 운영 비용 (10,000명 사용자 기준)
- API 비용: $19,510
- 서버 호스팅: $50
- 도메인/SSL: $10
- 기타: $40
- **합계**: $19,610

### 월 수익 (10,000명 사용자 기준)
- 구독 수익: $42,790
- **순이익**: $23,180

---

## 🎯 성공 지표 (KPI)

### 기술적 지표
- **이미지 합성 성공률**: 95% 이상
- **영상 생성 성공률**: 80% 이상
- **API 응답 시간**: 평균 10초 이하
- **서버 가동률**: 99.5% 이상

### 비즈니스 지표
- **무료 → 유료 전환율**: 10% 이상
- **프로 → 프로플러스 전환율**: 30% 이상
- **월간 활성 사용자(MAU)**: 5,000명 이상
- **고객 만족도(CSAT)**: 4.5/5.0 이상

---

## ⚠️ 리스크 및 대응

### 기술적 리스크
1. **Dzine AI 장애** → Replicate로 자동 전환
2. **Kling AI 장애** → 영상 생성 일시 중단 안내
3. **API 비용 폭증** → 일일 사용량 제한 설정

### 비즈니스 리스크
1. **무료 사용자 남용** → 주 2회 제한 + IP 기반 중복 방지
2. **유료 전환율 저조** → 무료 플랜 축소 (주 1회)
3. **경쟁사 출현** → 차별화 포인트 강화 (한국인 특화, 헤어 디자인 포트폴리오)

---

## 📚 참고 문서
- [BUSINESS_MODEL_PLAN_REVISED.md](./BUSINESS_MODEL_PLAN_REVISED.md) - 비즈니스 모델 기획서
- [spec.md](./spec.md) - 기능 명세서
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 아키텍처 문서
- [todo.md](./todo.md) - 작업 목록
