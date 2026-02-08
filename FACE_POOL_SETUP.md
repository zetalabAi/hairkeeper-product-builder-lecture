# 얼굴 풀 설정 가이드

헤어키퍼 가상 인물 얼굴 이미지를 업로드하는 방법입니다.

## 📋 준비사항

### 1. 얼굴 이미지 준비

**권장 사양**:
- 해상도: 최소 512x512, 권장 1024x1024
- 포맷: JPG, JPEG, PNG
- 얼굴: 정면, 고해상도, 깨끗한 배경
- 수량: 성별/스타일당 6-12개

**예시**:
- 한국인 남성 - 모던 스타일: 6개
- 한국인 남성 - 캐주얼 스타일: 6개
- 한국인 여성 - 우아한 스타일: 6개
- 한국인 여성 - 큐트 스타일: 6개

### 2. 파일 이름 형식

```
{nationality}-{gender}-{style}-{number}.jpg
```

**예시**:
```
korea-male-modern-01.jpg
korea-male-modern-02.jpg
korea-female-elegant-01.jpg
korea-female-elegant-02.jpg
japan-male-casual-01.jpg
```

**파라미터**:
- `nationality`: `korea` 또는 `japan`
- `gender`: `male` 또는 `female`
- `style`: 자유 (예: modern, elegant, casual, cute)
- `number`: 01, 02, 03 등

---

## 🚀 업로드 방법

### Step 1: faces/ 폴더 생성

```bash
mkdir faces
```

### Step 2: 얼굴 이미지 복사

얼굴 이미지 파일들을 `faces/` 폴더에 복사하세요.

**파일 구조 예시**:
```
hairkeeper/
├── faces/
│   ├── korea-male-modern-01.jpg
│   ├── korea-male-modern-02.jpg
│   ├── korea-male-modern-03.jpg
│   ├── korea-female-elegant-01.jpg
│   ├── korea-female-elegant-02.jpg
│   └── korea-female-elegant-03.jpg
├── scripts/
│   └── upload-face-pool.ts
└── ...
```

### Step 3: 업로드 스크립트 실행

```bash
npx tsx scripts/upload-face-pool.ts
```

**출력 예시**:
```
=================================================
📸 Face Pool Upload Script
=================================================

📋 Found 6 image(s) to upload:

   1. korea-male-modern-01.jpg
   2. korea-male-modern-02.jpg
   3. korea-male-modern-03.jpg
   4. korea-female-elegant-01.jpg
   5. korea-female-elegant-02.jpg
   6. korea-female-elegant-03.jpg

⚠️  This will upload all images to GCS and create Firestore records.
   Make sure your Firebase credentials are configured correctly.

📤 Uploading: korea-male-modern-01.jpg
   Nationality: korea
   Gender: male
   Style: modern
   File size: 245.32 KB
   ✅ Uploaded to GCS: face-pool/korea/male/korea-male-modern-01.jpg
   🌐 Public URL: https://storage.googleapis.com/...
   ✅ Saved to Firestore: facePool/korea-male-modern-01
   🎉 Success!

...

=================================================
📊 Upload Summary
=================================================
   Total files: 6
   ✅ Successful: 6
   ❌ Failed: 0

🎉 All images uploaded successfully!
```

---

## 🧪 테스트 방법

### 1. Firebase Console에서 확인

**Storage**:
- https://console.firebase.google.com/project/YOUR_PROJECT/storage
- `face-pool/` 폴더 확인

**Firestore**:
- https://console.firebase.google.com/project/YOUR_PROJECT/firestore
- `facePool` 컬렉션 확인

### 2. API로 조회 테스트

tRPC 클라이언트에서:
```typescript
const faces = await trpc.ai.getFacePool.query({
  nationality: "korea",
  gender: "male",
  style: "modern",
  limit: 6
});

console.log("Found faces:", faces);
```

---

## 📂 GCS 저장 구조

```
face-pool/
├── korea/
│   ├── male/
│   │   ├── korea-male-modern-01.jpg
│   │   ├── korea-male-modern-02.jpg
│   │   └── korea-male-casual-01.jpg
│   └── female/
│       ├── korea-female-elegant-01.jpg
│       └── korea-female-cute-01.jpg
└── japan/
    ├── male/
    │   └── japan-male-casual-01.jpg
    └── female/
        └── japan-female-elegant-01.jpg
```

---

## 📊 Firestore 문서 구조

**컬렉션**: `facePool`

**문서 예시**:
```json
{
  "id": "korea-male-modern-01",
  "imageUrl": "https://storage.googleapis.com/hairkeeper/face-pool/korea/male/korea-male-modern-01.jpg",
  "nationality": "korea",
  "gender": "male",
  "style": "modern",
  "faceType": null,
  "embedding": null,
  "isActive": true,
  "version": "1.0",
  "createdAt": "2026-02-08T10:30:00Z",
  "updatedAt": "2026-02-08T10:30:00Z"
}
```

---

## ❓ 문제 해결

### 1. "Faces directory not found" 에러

```bash
mkdir faces
# 이미지 파일들을 faces/ 폴더에 복사
```

### 2. "Invalid file name format" 경고

파일명이 올바른 형식인지 확인:
```
{nationality}-{gender}-{style}-{number}.jpg
```

예: `korea-male-modern-01.jpg` ✅
잘못된 예: `korean-man-01.jpg` ❌

### 3. Firebase 인증 에러

`.env` 파일에 Firebase 설정이 올바른지 확인:
```env
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

### 4. GCS 업로드 실패

Firebase Storage 권한 확인:
- Firebase Console → Storage → Rules
- 업로드 권한이 있는지 확인

---

## 💡 팁

### 얼굴 이미지 품질 체크리스트

- ✅ 정면 얼굴 (측면 X)
- ✅ 고해상도 (최소 512x512)
- ✅ 깨끗한 배경
- ✅ 충분한 조명
- ✅ 얼굴이 프레임의 60-80% 차지
- ✅ 얼굴 특징이 선명함
- ✅ 액세서리/안경 최소화

### 스타일 카테고리 예시

- **modern**: 현대적, 세련된
- **elegant**: 우아한, 고급스러운
- **casual**: 캐주얼, 편안한
- **cute**: 귀여운, 발랄한
- **professional**: 프로페셔널, 정장
- **trendy**: 트렌디, 유행하는

---

## 📞 지원

문제가 있으면 다음을 확인하세요:
1. Firebase Console에서 서비스 상태 확인
2. `.env` 파일 설정 확인
3. 이미지 파일 형식 확인
4. 네트워크 연결 확인
