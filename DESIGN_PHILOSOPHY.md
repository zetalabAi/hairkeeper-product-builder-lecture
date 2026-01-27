# 머리보존 AI - 디자인 철학

## 핵심 원칙

**"iOS를 따라하지 말고, 이해해서 재해석한다"**

iPhone 사용자가 익숙함을 느끼는 감각은 유지하되, iOS 고유 컴포넌트·수치·색상·아이콘을 직접 사용하지 않는 로열티 안전한 독자적 UI를 설계한다.

---

## 디자인 목표

1. **직관성**: 버튼은 명확히 존재해야 한다
2. **심플함**: 구형 직사각형 버튼처럼 보이면 안 된다
3. **프리미엄**: 세련되고 신뢰감 있는 시각적 품질

---

## 버튼 디자인 규칙

### 형태
- **Soft rounded rectangle** 사용
  - iOS의 정확한 corner radius(10pt, 12pt 등) 사용 금지
  - 독자적 수치: 16px, 20px, 24px 사용
- **Border 사용 금지**
  - 버튼 구분은 명도 차이와 미세한 depth로 표현
  - 배경색 + subtle shadow로 레이어 구분

### 상태 표현
- **눌림 상태**: opacity 변화 + 1px 이동만 사용
  - `opacity: 0.85` + `transform: translateY(1px)`
  - bounce, spring animation 금지
- **비활성 상태**: opacity 0.4

### 계층 구조
1. **Primary Button**: 브랜드 컬러 배경 + 흰색 텍스트
2. **Secondary Button**: 저채도 배경 + 브랜드 컬러 텍스트
3. **Tertiary Button**: 투명 배경 + 텍스트만

---

## 색상 시스템

### 금지 사항
- iOS system color 직접 사용 금지
  - systemBlue, systemGray 등 사용 불가
- 고채도 accent color 금지

### 사용 원칙
- **저채도 브랜드 컬러 기반**
  - Primary: `#8B7FF5` (보라색, 채도 낮춤)
  - Background: `#0A0A0B` (순수 검정 대신 미세한 색조)
  - Surface: `#1A1A1D` (명도 차이로 레이어 구분)
- **색은 강조가 아니라 안내 역할**
  - 텍스트 위계: foreground → muted → disabled
  - 색상으로 시선 유도, 정보 구조화

---

## 아이콘 규칙

### 금지 사항
- SF Symbols 사용 금지
- iOS 기본 아이콘 복제 금지

### 사용 원칙
- **자체 선형 아이콘 사용** (Ionicons)
- **아이콘은 텍스트 보조 역할만 수행**
  - 아이콘만으로 의미 전달 금지
  - 항상 레이블과 함께 사용
- **일관된 stroke width**: 2px

---

## 화면별 적용

### 1. 사진 선택 화면
- **카드형 버튼**
  - 아이콘 + 텍스트 + 설명
  - iOS Action Sheet 형태 직접 사용 금지
  - 독자적 카드 레이아웃

### 2. 국적 / 성별 / 스타일 선택
- **버튼 유지**
  - Segmented 느낌은 허용
  - iOS segmented control과 시각적으로 구분
  - 독자적 선택 상태 표현

### 3. CTA (Call-to-Action)
- **하단 고정 버튼**
  - 브랜드 중심 디자인
  - iOS 기본 버튼과 혼동되지 않게 설계
  - Safe area 고려한 padding

---

## 레이아웃 원칙

### 여백
- 기본 단위: 4px
- 화면 좌우 padding: 24px
- 섹션 간격: 32px
- 버튼 내부 padding: 16px vertical, 24px horizontal

### 타이포그래피
- 제목: 24px, semibold
- 본문: 16px, regular
- 보조: 14px, regular
- 캡션: 12px, medium

### 그림자
- Subtle shadow만 사용
  - `shadowColor: #000`
  - `shadowOpacity: 0.08`
  - `shadowRadius: 12`
  - `shadowOffset: { width: 0, height: 4 }`

---

## 결과물 기대치

- ✅ iPhone 사용자에게 자연스럽게 느껴지는 UI
- ✅ iOS 복제나 표절 이슈가 없는 디자인
- ✅ 세련되고 신뢰감 있는 버튼 중심 UX
- ✅ 로열티 안전한 독자적 디자인 시스템
