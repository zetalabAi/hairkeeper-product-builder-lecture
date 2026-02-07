# 🧪 수동 테스트 가이드

Firebase/GCP 마이그레이션 후 수동으로 테스트할 항목들입니다.

---

## ✅ 빠른 체크리스트

### 1. 환경 설정 확인
- [ ] `.env` 파일에 모든 Firebase 환경 변수 설정
- [ ] `firebase-service-account.json` 파일 존재
- [ ] `GoogleService-Info.plist` (iOS) 또는 `google-services.json` (Android) 존재

### 2. 서버 시작
```bash
npm run dev:server
```

**예상 출력:**
```
[Firestore] 초기화 완료
[Firebase Auth] 초기화 완료
[GCS] 초기화 완료
[Monitoring] Cloud Logging 초기화 완료
Server running on port 3000
```

**에러 발생 시:**
- `FIREBASE_PROJECT_ID` 확인
- `GOOGLE_APPLICATION_CREDENTIALS` 경로 확인
- Firebase Console에서 API 활성화 확인

### 3. 클라이언트 시작
```bash
npm run ios    # iOS
npm run android  # Android
npm run web    # Web
```

---

## 🔥 Firebase Auth 테스트

### 시나리오 1: Google 로그인
1. 앱 실행
2. 로그인 화면에서 "Google로 계속하기" 버튼 클릭
3. Google 계정 선택
4. 로그인 성공 → 메인 화면으로 이동

**예상 콘솔 로그:**
```
[Auth Provider] 인증 상태 변경: abc123xyz
[Auth Provider] Analytics 및 Crashlytics 사용자 설정 완료
[Analytics] 사용자 ID 설정: abc123xyz
```

**실패 시 확인:**
- [ ] `GoogleService-Info.plist` / `google-services.json` 파일 존재
- [ ] Firebase Console → Authentication → Sign-in method → Google 활성화
- [ ] iOS: URL Scheme 설정 (`app.json`)
- [ ] Android: SHA-1 인증서 등록

### 시나리오 2: Apple 로그인 (iOS만)
1. iOS 앱 실행
2. 로그인 화면에서 "Apple로 계속하기" 버튼 클릭
3. Apple 계정 선택
4. 로그인 성공 → 메인 화면으로 이동

**실패 시 확인:**
- [ ] Apple Developer Console → App ID → Sign In with Apple 활성화
- [ ] `app.json`에 `usesAppleSignIn: true` 설정

### 시나리오 3: 로그아웃
1. 앱에서 로그아웃 버튼 클릭
2. 로그인 화면으로 이동
3. 인증 상태 확인 (Firebase Console → Authentication → Users)

**예상 콘솔 로그:**
```
[Auth] 로그아웃 성공
[Auth Provider] 인증 상태 변경: null
[Analytics] 사용자 ID 설정: null
```

---

## 🗄️ Firestore 테스트

### 시나리오 1: 사용자 자동 생성
1. 새 계정으로 로그인
2. Firebase Console → Firestore → users 컬렉션 확인
3. 새 사용자 문서 생성 확인

**예상 필드:**
- `uid`: Firebase UID
- `email`: 이메일 주소
- `displayName`: 사용자 이름
- `createdAt`: 생성 시간
- `role`: "user"

### 시나리오 2: 프로젝트 생성
1. 앱에서 새 프로젝트 생성
2. 이미지 업로드
3. 스타일 선택 (nationality, gender, style)
4. "생성" 버튼 클릭

**Firebase Console 확인:**
- Firestore → projects 컬렉션
- 새 프로젝트 문서 생성
- `userId`가 현재 사용자 UID와 일치
- `status`: "pending"

### 시나리오 3: 프로젝트 목록 조회
1. 앱에서 프로젝트 목록 화면 이동
2. 본인 프로젝트만 표시되는지 확인
3. 최신순 정렬 확인

**성능 확인:**
- 첫 로딩: < 1초
- 이후 캐시: < 100ms (React Query 캐싱)

---

## 📦 Cloud Storage 테스트

### 시나리오 1: 이미지 업로드
1. 이미지 선택
2. 업로드 버튼 클릭
3. 업로드 진행률 표시

**Firebase Console 확인:**
- Storage → 버킷 확인
- `images/` 폴더에 파일 업로드됨
- 파일 크기 및 메타데이터 확인

**예상 콘솔 로그:**
```
[Storage] Uploading: images/abc123.jpg
[GCS] 업로드 완료: https://storage.googleapis.com/...
```

### 시나리오 2: 이미지 다운로드/표시
1. 프로젝트 상세 화면
2. 원본 이미지 표시
3. 결과 이미지 표시 (생성 후)

**확인 사항:**
- [ ] 이미지가 정상적으로 표시됨
- [ ] Signed URL 사용 (private 파일)
- [ ] 공개 URL 사용 (public 파일)

---

## 🤖 AI Services 테스트

### 시나리오 1: 이미지 생성 (Vertex AI)
1. 프로젝트 생성
2. 이미지 업로드
3. 스타일 선택
4. "생성" 버튼 클릭
5. 생성 완료 대기 (약 5-10초)

**예상 콘솔 로그:**
```
[Vertex AI] 이미지 생성 시작
[Vertex AI] 이미지 생성 완료: https://...
[Project] 상태 업데이트: processing → completed
```

**실패 시 확인:**
- [ ] Vertex AI API 활성화
- [ ] 서비스 계정 권한: Vertex AI User
- [ ] `VERTEX_AI_LOCATION` 환경 변수

### 시나리오 2: 음성 인식 (Google Speech)
1. 음성 녹음
2. "인식" 버튼 클릭
3. 텍스트 변환 결과 표시

**예상 콘솔 로그:**
```
[Google Speech] 음성 인식 시작
[Google Speech] 인식 완료: "안녕하세요"
```

---

## 📊 Analytics & Crashlytics 테스트

### 시나리오 1: Analytics 이벤트
1. 앱에서 주요 액션 수행
   - 로그인
   - 프로젝트 생성
   - 화면 전환
2. Firebase Console → Analytics → Events 확인 (최대 24시간 지연)

**예상 이벤트:**
- `login` (method: google/apple/email)
- `sign_up`
- `project_created`
- `screen_view`

### 시나리오 2: Crashlytics 에러
1. 개발 모드에서 테스트 크래시 실행
```typescript
import * as ErrorTracking from '@/lib/error-tracking';
ErrorTracking.testCrash();
```
2. Firebase Console → Crashlytics → Issues 확인
3. 크래시 리포트 확인

**확인 사항:**
- [ ] 크래시 스택 트레이스 표시
- [ ] 사용자 ID 표시
- [ ] 디바이스 정보 표시

### 시나리오 3: 에러 로깅
1. 앱에서 의도적으로 에러 발생
2. Firebase Console → Crashlytics → Non-fatals 확인

**예상 로그:**
```
[Crashlytics] 에러 기록: 이미지 업로드 실패
context: { fileSize: 10485760, mimeType: 'image/jpeg' }
```

---

## ⚡ 성능 테스트

### React Query 캐싱
1. 프로젝트 목록 조회 (첫 로딩)
2. 다른 화면으로 이동
3. 프로젝트 목록으로 돌아오기
4. 즉시 표시되는지 확인 (캐시)

**예상 동작:**
- 첫 로딩: 네트워크 요청
- 5분 이내 재방문: 캐시 사용 (즉시 표시)
- 5분 후 재방문: 백그라운드 갱신

### API 응답 시간
**Chrome DevTools → Network 탭:**
- Firestore 읽기: < 200ms
- Firestore 쓰기: < 300ms
- GCS 업로드: < 2s (1MB 기준)
- Vertex AI 이미지 생성: < 10s

---

## 🔒 보안 테스트

### Firestore 보안 규칙
1. **테스트 1:** 다른 사용자의 프로젝트 접근 시도
   - 예상: 접근 거부 (permission-denied)

2. **테스트 2:** 로그아웃 상태에서 데이터 접근
   - 예상: 인증 필요 에러

3. **테스트 3:** 사용자 role 변경 시도
   - 예상: 업데이트 실패 (보안 규칙에서 차단)

### API 인증
```bash
# 유효하지 않은 토큰으로 API 호출
curl -X POST http://localhost:3000/api/trpc/user.getProfile \
  -H "Authorization: Bearer invalid-token"

# 예상: 401 Unauthorized
```

---

## 🐛 문제 해결

### 로그인 실패
**증상:** "Google Sign-In은 아직 구현되지 않았습니다"

**해결:**
1. `@react-native-google-signin/google-signin` 패키지 설치
2. 네이티브 설정 파일 추가
3. `NATIVE_SETUP_GUIDE.md` 참고

### Firestore 권한 에러
**증상:** `permission-denied`

**해결:**
1. Firestore 보안 규칙 배포: `firebase deploy --only firestore:rules`
2. Firebase Console → Firestore → Rules 탭 확인
3. 사용자가 올바르게 인증되었는지 확인

### 이미지 업로드 실패
**증상:** `Storage: unauthorized`

**해결:**
1. 서비스 계정에 Storage Admin 권한 추가
2. `GOOGLE_APPLICATION_CREDENTIALS` 환경 변수 확인
3. Storage 버킷 존재 확인

### Vertex AI 에러
**증상:** `Vertex AI API has not been enabled`

**해결:**
```bash
# API 활성화
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

---

## 📝 테스트 결과 기록

### 체크리스트
- [ ] Firebase Auth: 로그인/로그아웃
- [ ] Firestore: CRUD 작업
- [ ] Cloud Storage: 업로드/다운로드
- [ ] Vertex AI: 이미지 생성
- [ ] Google Speech: 음성 인식
- [ ] Analytics: 이벤트 기록
- [ ] Crashlytics: 에러 로깅
- [ ] React Query: 캐싱
- [ ] 보안 규칙: 접근 제어
- [ ] 성능: 응답 시간

### 발견된 이슈
```
이슈 1: [제목]
- 설명:
- 재현 방법:
- 예상 동작:
- 실제 동작:
- 해결 방법:

이슈 2: ...
```

---

## 🎯 다음 단계

모든 테스트 통과 후:
1. ✅ 자동화 테스트 작성
2. ✅ CI/CD 파이프라인 구성
3. ✅ 프로덕션 배포
4. 🔄 사용자 피드백 수집
5. 🔄 성능 최적화

질문이나 문제가 있으면 말씀해주세요! 🚀
