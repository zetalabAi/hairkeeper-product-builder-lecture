# Replicate Face Swap API 분석 결과

## 개요
Replicate는 AI 모델을 API로 제공하는 플랫폼으로, Face Swap 기능을 제공합니다.

## 선택한 모델
**codeplugtech/face-swap**
- URL: https://replicate.com/codeplugtech/face-swap
- 비용: $0.0027/run (370 runs per $1)
- 실행 시간: 평균 27초
- 하드웨어: CPU
- 실행 횟수: 1.6M runs (검증된 모델)

## API 사용 방법

### 1. 인증
```bash
export REPLICATE_API_TOKEN=<your-token>
```

### 2. Node.js 예제
```javascript
import Replicate from "replicate";
const replicate = new Replicate();

const input = {
    swap_image: "https://example.com/target-face.jpg",  // 교체할 얼굴
    input_image: "https://example.com/source-image.jpg" // 원본 이미지
};

const output = await replicate.run(
  "codeplugtech/face-swap:278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34",
  { input }
);

console.log(output.url()); // 결과 이미지 URL
```

### 3. 입력 파라미터
- `swap_image`: 교체할 얼굴 이미지 URL (선택한 한국인 얼굴)
- `input_image`: 원본 이미지 URL (사용자가 업로드한 사진)

### 4. 출력
- 얼굴이 교체된 이미지 URL 반환
- JPG, PNG, WEBP 형식 지원

## 구현 계획

### 서버 측 (Node.js)
1. Replicate API 키를 환경 변수로 설정
2. `replicate` npm 패키지 설치
3. tRPC API에서 Replicate API 호출
4. 사용자 업로드 이미지와 선택한 얼굴 이미지를 S3에 업로드
5. S3 URL을 Replicate API에 전달
6. 결과 이미지 URL을 클라이언트에 반환

### 클라이언트 측 (React Native)
1. 기존 `synthesizeFace` API 호출 유지
2. 로딩 화면에서 진행률 표시
3. 결과 이미지 URL을 받아 표시

## 주의사항
- API 키는 서버 측에서만 사용 (클라이언트 노출 금지)
- 이미지는 공개 URL이어야 함 (S3 사용)
- 비용: 실행당 약 $0.0027 (370회/$1)
- 실행 시간: 평균 27초 (로딩 화면 필수)

## 대안 모델
- `cdingram/face-swap`: $0.014/run (더 비쌈)
- `easel/advanced-face-swap`: 2명 이상 얼굴 교체 지원

## 결론
`codeplugtech/face-swap` 모델이 가장 저렴하고 빠르며, 1.6M 실행 기록으로 검증되었으므로 이 모델을 사용합니다.
