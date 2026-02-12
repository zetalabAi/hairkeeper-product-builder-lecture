# Face Pool Creation Workflow

이 문서는 HairKeeper 얼굴 풀을 확장/관리하기 위한 표준 절차입니다.

## 1. 이미지 소싱

### 방법 A: AI 생성 (Midjourney, Stable Diffusion, DALL-E)
- 프롬프트 예시
  - "Korean adult male, neutral expression, front-facing, studio lighting, solid background, high resolution portrait"
  - "Korean adult female, neutral expression, front-facing, soft daylight, solid background, high resolution portrait"
- 장점
  - 저작권 문제 없음
  - 원하는 다양성 확보 용이

### 방법 B: 무료 스톡 사이트 (Unsplash, Pexels, Pixabay)
- 주의사항
  - 상업적 사용 라이선스 확인 필수
  - 얼굴 사용 범위 및 재배포 제한 확인

### 방법 C: 직접 촬영
- 요구사항
  - 모델 동의서 및 초상권 계약서 필수
  - 촬영 가이드 사전 공유

## 2. 이미지 전처리

### 체크리스트
- 최소 해상도 1920x1080
- 포맷 JPG (80-90% 품질) 또는 PNG
- 얼굴 정면 중앙
- 중립 표정
- 단색 배경
- 자연스러운 조명
- 액세서리 최소화

### 편집 도구
- Photoshop
- GIMP
- Remove.bg

## 3. 파일명 규칙

- 형식: `{gender}_{ageGroup}_{skinTone}_{index}.jpg`
- 파라미터 설명
  - `gender`: `male` | `female`
  - `ageGroup`: `20s` | `30s` | `40s` | `50s` | `60s`
  - `skinTone`: `light` | `medium` | `dark`
  - `index`: 두 자리 숫자 (예: `01`, `02`)
- 예시
  - `male_30s_light_01.jpg`
  - `female_40s_medium_02.jpg`

## 4. 품질 검증

### 자동 검증
- 해상도 체크 (width/height)
- 파일 크기 체크 (최소 용량 기준 설정)

### 수동 검증 체크리스트
- 얼굴이 이미지 중심에 위치
- 정면 시선
- 표정이 중립인지 확인
- 배경이 단색인지 확인
- 조명이 과하거나 부족하지 않은지 확인
- 과도한 보정/필터 제거

## 5. GCS 업로드

- 디렉토리 구조
  - `hairkeeper-bucket/faces/korea/{gender}/`
- 업로드 명령
  - `pnpm upload-faces`

## 6. Firestore 등록

- 컬렉션: `facePool`
- 필드 정의
  - `imageUrl`: 업로드된 이미지 URL
  - `nationality`: `korea`
  - `gender`: `male` | `female`
  - `ageGroup`: `20s` | `30s` | `40s` | `50s` | `60s`
  - `skinTone`: `light` | `medium` | `dark`
  - `style`: `default`
  - `isActive`: `true`
  - `createdAt`: server timestamp

## 7. 확장 시나리오

### 100장으로 확장
- 성별 50장씩 확보
- 연령대별 10장 기준 유지
- 피부톤/조명 다양성 확보

### 1000장으로 확장
- 스타일 카테고리 추가 (예: `casual`, `formal`, `studio`)
- 자동 품질 검증 파이프라인 구축
- 업로드/검증 배치 작업 스케줄링

### 일본 얼굴 풀 추가
- 디렉토리 추가: `face-pool-temp/japan/{male,female}`
- 파일명 규칙 유지
- 업로드 스크립트에 `japan` 처리 추가

## 8. 유지보수

- 주기적 검토 (월 1회)
- 품질 관리 방안
  - 랜덤 샘플링 리뷰
  - 불량 이미지 비활성화 (isActive=false)
  - 중복 이미지 제거
