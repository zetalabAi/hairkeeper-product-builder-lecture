# 머리보존 AI - 아키텍처 및 개발 규칙

**버전**: 1.0.0  
**마지막 업데이트**: 2026-01-30  
**작성자**: Manus AI

이 문서는 현재 프로젝트에서 반복적으로 사용되는 패턴, 코딩 컨벤션, 그리고 지금부터 따라야 할 개발 규칙을 정의합니다. 대규모 리팩터링을 전제하지 않으며, 새로운 코드는 이 기준을 따릅니다.

---

## 1. 기술 스택 및 버전

### 1.1 핵심 프레임워크

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React Native | 0.81.5 | 크로스 플랫폼 모바일 UI |
| Expo | 54.0.29 | 개발 환경 및 배포 |
| React | 19.1.0 | UI 컴포넌트 |
| TypeScript | 5.9.3 | 타입 안정성 |
| Expo Router | 6.0.19 | 파일 기반 라우팅 |

### 1.2 상태 관리 및 데이터 페칭

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| tRPC | 11.7.2 | 타입 안전 API 클라이언트 |
| React Query | 5.90.12 | 서버 상태 관리 |
| Context API | 내장 | 전역 상태 (인증, 테마) |

### 1.3 스타일링

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| NativeWind | 4.2.1 | Tailwind CSS for React Native |
| Tailwind CSS | 3.4.17 | 유틸리티 기반 스타일링 |

### 1.4 백엔드 및 데이터베이스

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| Express.js | 4.22.1 | HTTP 서버 |
| Drizzle ORM | 0.44.7 | 타입 안전 ORM |
| MySQL | 8.0 | 데이터베이스 |

### 1.5 외부 서비스

| 서비스 | 용도 | 인증 |
|--------|------|------|
| Replicate | Face Swap API | API 키 |
| Manus LLM | 이미지 분석 | 자동 |
| S3 호환 스토리지 | 이미지 호스팅 | 자동 |

---

## 2. 폴더 구조 및 명명 규칙

### 2.1 프로젝트 레이아웃

```
hairkeeper_ai/
├── app/                          # Expo Router 기반 화면 (파일 = 라우트)
│   ├── (tabs)/                   # 탭 네비게이션 그룹
│   │   ├── _layout.tsx           # 탭 레이아웃
│   │   └── index.tsx             # 홈 화면 (/tabs)
│   ├── _layout.tsx               # 루트 레이아웃
│   ├── photo-select.tsx          # /photo-select
│   ├── photo-edit.tsx            # /photo-edit
│   ├── face-select.tsx           # /face-select
│   ├── result.tsx                # /result
│   ├── history.tsx               # /history
│   ├── profile.tsx               # /profile
│   ├── settings.tsx              # /settings
│   ├── login.tsx                 # /login
│   ├── onboarding.tsx            # /onboarding
│   ├── oauth/
│   │   └── callback.tsx          # /oauth/callback
│   └── dev/
│       └── theme-lab.tsx         # 개발용 테마 테스트
│
├── components/                   # 재사용 가능한 UI 컴포넌트
│   ├── screen-container.tsx      # SafeArea + 배경색 처리
│   ├── sub-screen-header.tsx     # 부화면 헤더
│   ├── button.tsx                # 버튼 컴포넌트
│   ├── ui/                       # UI 기본 요소
│   │   ├── icon-symbol.tsx       # 아이콘 매핑
│   │   └── collapsible.tsx       # 접을 수 있는 컴포넌트
│   └── [기타 컴포넌트]
│
├── hooks/                        # React 커스텀 훅
│   ├── use-colors.ts             # 테마 색상 접근
│   ├── use-color-scheme.ts       # 라이트/다크 모드
│   └── use-auth.ts               # 인증 상태
│
├── lib/                          # 유틸리티 및 설정
│   ├── _core/
│   │   ├── api.ts                # API 설정
│   │   ├── auth.ts               # 인증 로직
│   │   ├── theme.ts              # 테마 팔레트
│   │   ├── manus-runtime.ts      # Manus 플랫폼 통합
│   │   └── nativewind-pressable.ts # Pressable 스타일 비활성화
│   ├── theme-provider.tsx        # 테마 컨텍스트
│   ├── demo-auth-context.tsx     # 데모 인증 컨텍스트
│   ├── trpc.ts                   # tRPC 클라이언트 설정
│   ├── upload-image.ts           # 이미지 업로드 유틸
│   └── utils.ts                  # 기타 유틸 (cn 함수 등)
│
├── server/                       # 백엔드 코드
│   ├── _core/
│   │   ├── index.ts              # Express 앱 초기화
│   │   ├── context.ts            # tRPC 컨텍스트
│   │   ├── trpc.ts               # tRPC 라우터 설정
│   │   ├── env.ts                # 환경 변수
│   │   ├── auth.ts               # 인증 미들웨어
│   │   ├── oauth.ts              # OAuth 처리
│   │   ├── llm.ts                # LLM API 호출
│   │   ├── cookies.ts            # 쿠키 관리
│   │   └── [기타 서버 로직]
│   ├── routers.ts                # tRPC 라우터 정의
│   ├── db.ts                     # 데이터베이스 함수
│   ├── storage.ts                # S3 스토리지 함수
│   └── README.md                 # 백엔드 문서
│
├── shared/                       # 클라이언트/서버 공유 코드
│   ├── face-urls.ts              # 얼굴 이미지 URL 관리
│   └── const.ts                  # 공유 상수
│
├── constants/                    # 상수 정의
│   ├── theme.ts                  # 테마 색상 상수
│   └── oauth.ts                  # OAuth 설정
│
├── assets/                       # 정적 자산
│   ├── images/
│   │   ├── icon.png              # 앱 아이콘
│   │   ├── splash-icon.png       # 스플래시 아이콘
│   │   └── favicon.png           # 웹 파비콘
│   └── faces/                    # 한국인 얼굴 이미지 (로컬)
│
├── drizzle/                      # Drizzle ORM 설정
│   ├── schema.ts                 # 데이터베이스 스키마
│   └── migrations/               # DB 마이그레이션
│
├── tests/                        # 테스트 파일
│   └── [테스트 파일]
│
├── app.config.ts                 # Expo 앱 설정
├── tailwind.config.js            # Tailwind 설정
├── theme.config.js               # 테마 색상 정의
├── tsconfig.json                 # TypeScript 설정
├── package.json                  # 의존성 정의
└── README.md                     # 프로젝트 문서
```

### 2.2 파일 명명 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 화면 (Screen) | kebab-case | `photo-select.tsx`, `face-select.tsx` |
| 컴포넌트 | PascalCase | `ScreenContainer.tsx`, `SubScreenHeader.tsx` |
| 훅 | camelCase with `use-` prefix | `use-colors.ts`, `use-auth.ts` |
| 유틸 함수 | camelCase | `uploadImage.ts`, `prepareImageForUpload` |
| 상수 | UPPER_SNAKE_CASE | `KOREAN_FACE_URLS`, `DEFAULT_TIMEOUT` |
| 타입/인터페이스 | PascalCase | `User`, `Project`, `FacePool` |

---

## 3. 코딩 컨벤션

### 3.1 TypeScript 사용

**규칙**: 모든 파일에서 TypeScript 사용 (`.ts` 또는 `.tsx`)

**타입 정의**:
```typescript
// 좋은 예: 명시적 타입
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // ...
}

// 피해야 할 예: any 사용
function getUser(id: any): any {
  // ...
}
```

**제네릭 활용**:
```typescript
// 좋은 예: 제네릭으로 재사용성 높임
interface ApiResponse<T> {
  data: T;
  error?: string;
}

const response: ApiResponse<User> = { data: user };
```

### 3.2 React 컴포넌트 패턴

**함수형 컴포넌트만 사용**:
```typescript
// 좋은 예
export default function PhotoSelectScreen() {
  const [state, setState] = useState<string>("");
  return <View>{/* ... */}</View>;
}

// 피해야 할 예: 클래스 컴포넌트
class PhotoSelectScreen extends React.Component {
  // ...
}
```

**Props 타입 정의**:
```typescript
// 좋은 예
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  // ...
}

// 피해야 할 예: Props 타입 없음
export function Button(props: any) {
  // ...
}
```

### 3.3 상태 관리 패턴

**로컬 상태 (useState)**:
```typescript
// 좋은 예: 명시적 타입
const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
const [isProcessing, setIsProcessing] = useState<boolean>(false);

// 피해야 할 예: 타입 생략
const [selectedFaceId, setSelectedFaceId] = useState(null);
```

**전역 상태 (Context)**:
- 인증: `DemoAuthProvider` 사용
- 테마: `ThemeProvider` 사용
- 색상: `useColors()` 훅 사용

**서버 상태 (React Query + tRPC)**:
```typescript
// 좋은 예: 뮤테이션 사용
const synthesizeMutation = trpc.ai.synthesizeFace.useMutation();

const handleSynthesize = async () => {
  try {
    const result = await synthesizeMutation.mutateAsync({
      originalImageUrl,
      selectedFaceUrl,
      nationality: "한국인",
      gender,
      style,
    });
    // 성공 처리
  } catch (error) {
    // 에러 처리
  }
};
```

### 3.4 에러 처리

**모든 async 작업에 try-catch 사용**:
```typescript
// 좋은 예
try {
  const result = await synthesizeMutation.mutateAsync(input);
  // 성공 처리
} catch (error: any) {
  console.error("Face synthesis failed:", error);
  alert(`오류: ${error?.message || '알 수 없는 오류'}`);
}

// 피해야 할 예: 에러 처리 없음
const result = await synthesizeMutation.mutateAsync(input);
```

**에러 로깅**:
```typescript
// 좋은 예: 구조화된 로깅
console.error("\n========== FACE SWAP ERROR ==========");
console.error("Error message:", error?.message);
console.error("Input params:", { originalImageUrl, selectedFaceUrl });
console.error("Full error:", JSON.stringify(error, null, 2));
console.error("====================================\n");

// 피해야 할 예: 단순 로깅
console.log(error);
```

### 3.5 스타일링 규칙

**NativeWind (Tailwind) 사용**:
```typescript
// 좋은 예: className 사용
<View className="flex-1 items-center justify-center p-4">
  <Text className="text-2xl font-bold text-foreground">Hello</Text>
</View>

// 피해야 할 예: 인라인 스타일
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground }}>Hello</Text>
</View>
```

**Pressable에는 className 사용 금지** (NativeWind 제한):
```typescript
// 좋은 예: style prop 사용
<Pressable
  onPress={handlePress}
  style={({ pressed }) => ({
    opacity: pressed ? 0.7 : 1,
    transform: [{ scale: pressed ? 0.95 : 1 }],
  })}
>
  <Text>Press me</Text>
</Pressable>

// 피해야 할 예: className 사용
<Pressable className="opacity-70 scale-95" onPress={handlePress}>
  <Text>Press me</Text>
</Pressable>
```

**색상 토큰 사용**:
```typescript
// 좋은 예: 테마 색상 사용
const colors = useColors();
<View style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.foreground }}>Text</Text>
</View>

// 피해야 할 예: 하드코딩된 색상
<View style={{ backgroundColor: '#0a7ea4' }}>
  <Text style={{ color: '#11181C' }}>Text</Text>
</View>
```

### 3.6 API 호출 패턴

**tRPC 뮤테이션**:
```typescript
// 좋은 예
const uploadImageMutation = trpc.ai.uploadImage.useMutation();

const handleUpload = async (base64Data: string, filename: string) => {
  try {
    const result = await uploadImageMutation.mutateAsync({
      base64Data,
      filename,
    });
    return result.url;
  } catch (error) {
    throw new Error("Upload failed");
  }
};
```

**Zod 입력 검증**:
```typescript
// 서버: 입력 검증
const input = z.object({
  originalImageUrl: z.string().url(),
  selectedFaceUrl: z.string().url(),
  nationality: z.string(),
  gender: z.string(),
  style: z.string(),
});

export const synthesizeFace = publicProcedure
  .input(input)
  .mutation(async ({ input }) => {
    // input은 이미 검증됨
  });
```

---

## 4. 폴더별 책임 및 패턴

### 4.1 `/app` - 화면 (Pages)

**책임**: 사용자 인터페이스 및 네비게이션 로직

**패턴**:
```typescript
// 화면은 다음 구조를 따름
export default function PhotoSelectScreen() {
  // 1. 훅 및 상태 선언
  const params = useLocalSearchParams();
  const [state, setState] = useState<Type>("");
  const colors = useColors();

  // 2. 이벤트 핸들러
  const handleAction = () => {
    // 로직
  };

  // 3. 렌더링
  return (
    <ScreenContainer>
      {/* 콘텐츠 */}
    </ScreenContainer>
  );
}
```

**규칙**:
- 모든 화면은 `ScreenContainer`로 감싸기
- 부화면은 `SubScreenHeader` 포함
- 네비게이션은 `router.push()` 사용
- 파라미터는 `useLocalSearchParams()` 사용

### 4.2 `/components` - 재사용 컴포넌트

**책임**: 여러 화면에서 재사용되는 UI 컴포넌트

**패턴**:
```typescript
interface ComponentProps {
  // Props 정의
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Component({ label, onPress, variant = 'primary' }: ComponentProps) {
  // 컴포넌트 로직
  return (
    <Pressable onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  );
}
```

**규칙**:
- 모든 컴포넌트는 Props 타입 정의 필수
- 기본값은 Props 인터페이스에 명시
- 컴포넌트는 부작용 없어야 함 (순수 함수)

### 4.3 `/hooks` - 커스텀 훅

**책임**: 재사용 가능한 로직 캡슐화

**패턴**:
```typescript
export function useCustomHook(): ReturnType {
  const [state, setState] = useState<Type>("");

  useEffect(() => {
    // 초기화 로직
  }, []);

  return {
    state,
    setState,
  };
}
```

**규칙**:
- 훅 이름은 `use` 접두사 필수
- 반환 타입 명시 필수
- 부작용은 `useEffect`에서만 처리

### 4.4 `/lib` - 유틸리티 및 설정

**책임**: 앱 전역 설정 및 유틸 함수

**구조**:
- `_core/`: 핵심 설정 (테마, 인증, API)
- 루트: 일반 유틸 함수 및 컨텍스트

**패턴**:
```typescript
// 유틸 함수
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// 컨텍스트
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 4.5 `/server` - 백엔드 로직

**책임**: API 엔드포인트 및 비즈니스 로직

**구조**:
- `_core/`: tRPC 설정, 인증, 미들웨어
- `routers.ts`: API 라우터 정의
- `db.ts`: 데이터베이스 함수
- `storage.ts`: S3 스토리지 함수

**패턴**:
```typescript
// tRPC 라우터
export const appRouter = router({
  ai: router({
    synthesizeFace: publicProcedure
      .input(z.object({ /* ... */ }))
      .mutation(async ({ input }) => {
        // 비즈니스 로직
        return result;
      }),
  }),
});
```

**규칙**:
- 모든 입력에 Zod 검증 필수
- 에러는 명확한 메시지와 함께 throw
- 로깅은 구조화된 형식 사용

### 4.6 `/shared` - 공유 코드

**책임**: 클라이언트와 서버가 공유하는 타입 및 상수

**패턴**:
```typescript
// 공유 상수
export const KOREAN_FACE_URLS = {
  male: [{ id: "male-1", url: "..." }],
  female: [{ id: "female-1", url: "..." }],
};

// 공유 타입 (필요시)
export interface SharedType {
  // ...
}
```

---

## 5. 성능 및 보안 규칙

### 5.1 성능 규칙

**이미지 최적화**:
- 이미지 크기: 1-5MB 이하 (압축 권장)
- 이미지 포맷: JPEG (호환성) 또는 PNG (투명도)
- 캐싱: React Query 자동 캐싱 활용

**렌더링 최적화**:
```typescript
// 좋은 예: useMemo로 계산 결과 캐싱
const selectedFace = useMemo(() => 
  faces.find(f => f.id === selectedFaceId),
  [faces, selectedFaceId]
);

// 피해야 할 예: 매번 계산
const selectedFace = faces.find(f => f.id === selectedFaceId);
```

**리스트 렌더링**:
```typescript
// 좋은 예: FlatList 사용
<FlatList
  data={items}
  renderItem={({ item }) => <Item item={item} />}
  keyExtractor={(item) => item.id}
/>

// 피해야 할 예: ScrollView + map
<ScrollView>
  {items.map(item => <Item key={item.id} item={item} />)}
</ScrollView>
```

### 5.2 보안 규칙

**입력 검증**:
```typescript
// 좋은 예: Zod로 검증
const input = z.object({
  imageUrl: z.string().url(),
  filename: z.string().min(1).max(255),
});

// 피해야 할 예: 검증 없음
const imageUrl = input.imageUrl; // 타입만 확인
```

**민감한 정보 처리**:
- API 키는 환경 변수에만 저장
- 토큰은 HTTP-only 쿠키에 저장
- 클라이언트에 민감한 정보 노출 금지

**에러 메시지**:
```typescript
// 좋은 예: 일반적인 메시지
throw new Error("Failed to upload image. Please try again.");

// 피해야 할 예: 민감한 정보 노출
throw new Error("S3 bucket 'hairkeeper-ai' is not accessible");
```

---

## 6. 테스트 규칙

### 6.1 테스트 작성

**테스트 파일 위치**:
- 테스트 파일은 `/tests` 디렉토리에 위치
- 파일명: `[기능].test.ts` 또는 `[기능].spec.ts`

**테스트 도구**:
- Vitest (유닛 테스트)
- React Native Testing Library (UI 테스트)

**테스트 패턴**:
```typescript
describe('uploadImage', () => {
  it('should upload image and return URL', async () => {
    const result = await uploadImage(base64Data, 'test.jpg');
    expect(result.url).toBeDefined();
    expect(result.url).toMatch(/^https:\/\//);
  });

  it('should throw error on invalid input', async () => {
    await expect(uploadImage('', 'test.jpg')).rejects.toThrow();
  });
});
```

### 6.2 테스트 작성 규칙

- 모든 공개 API는 테스트 필수
- 에러 케이스도 테스트
- 테스트 이름은 명확하고 설명적

---

## 7. 위험한 부분 (확장 시 깨질 가능성)

### 7.1 데이터베이스 미연동

**현재 상태**: 모든 데이터가 메모리 또는 더미 데이터 사용

**위험성**: 
- 사용자 작업 기록 저장 안 됨
- 히스토리 화면이 항상 빈 상태
- 사용자 데이터 확장 불가

**해결 방법**:
```
1. Projects 테이블에 작업 기록 저장
2. 히스토리 화면에서 DB 조회
3. 사용자별 데이터 필터링
```

### 7.2 얼굴 풀 하드코딩

**현재 상태**: 12개 얼굴 URL이 `shared/face-urls.ts`에 하드코딩

**위험성**:
- 얼굴 추가/변경 시 코드 수정 필요
- 동적 얼굴 풀 관리 불가
- 다국적 얼굴 추가 시 복잡도 증가

**해결 방법**:
```
1. Face Pool 테이블에서 동적 조회
2. 국적/성별별 필터링
3. 캐싱으로 성능 최적화
```

### 7.3 이미지 업로드 경로 고정

**현재 상태**: `uploads/${Date.now()}_${filename}` 고정 경로

**위험성**:
- 사용자별 폴더 구조 없음
- 이미지 관리 어려움
- 보안 취약 (사용자 이미지 노출 가능)

**해결 방법**:
```
1. 사용자별 폴더: uploads/{userId}/{projectId}/
2. 접근 제어 추가
3. 만료된 이미지 정리 로직
```

### 7.4 에러 처리 일관성 부족

**현재 상태**: 화면마다 다른 에러 처리 방식

**위험성**:
- 사용자 경험 일관성 부족
- 에러 추적 어려움
- 에러 복구 로직 없음

**해결 방법**:
```
1. 글로벌 에러 핸들러 추가
2. 에러 타입별 처리 규칙 정의
3. 에러 로깅 중앙화
```

### 7.5 웹 환경 미지원

**현재 상태**: `expo-file-system` 네이티브 API로 인해 웹 미지원

**위험성**:
- 웹 테스트 불가
- 웹 배포 불가
- 크로스 플랫폼 이점 상실

**해결 방법**:
```
1. 파일 읽기 추상화 (Platform.select)
2. 웹용 대체 구현
3. 웹 환경 테스트 추가
```

### 7.6 API 키 관리 미흡

**현재 상태**: Replicate API 키가 환경 변수에만 저장

**위험성**:
- 키 로테이션 어려움
- 키 사용량 추적 불가
- 여러 모델 지원 시 확장 어려움

**해결 방법**:
```
1. API 키 관리 시스템 구축
2. 사용량 모니터링
3. 키 로테이션 자동화
```

---

## 8. 코드 리뷰 체크리스트

새로운 코드 작성 시 다음을 확인하세요:

### 8.1 타입 안정성
- [ ] 모든 함수에 입력/출력 타입 명시
- [ ] `any` 타입 사용 금지
- [ ] 제네릭 활용으로 재사용성 높임

### 8.2 에러 처리
- [ ] 모든 async 작업에 try-catch
- [ ] 에러 메시지가 명확하고 안전
- [ ] 에러 로깅 구조화됨

### 8.3 성능
- [ ] 불필요한 리렌더링 최소화
- [ ] 리스트는 FlatList 사용
- [ ] 이미지 크기 최적화

### 8.4 보안
- [ ] 입력 검증 (Zod)
- [ ] 민감한 정보 노출 금지
- [ ] API 키 환경 변수 사용

### 8.5 스타일
- [ ] NativeWind 클래스 우선
- [ ] 색상 토큰 사용
- [ ] Pressable에는 style prop 사용

### 8.6 테스트
- [ ] 공개 API 테스트 작성
- [ ] 에러 케이스 테스트
- [ ] 테스트 이름이 명확

---

## 9. 개발 워크플로우

### 9.1 새 기능 추가

```
1. spec.md에서 요구사항 확인
2. 화면/컴포넌트 구조 설계
3. 타입 정의 (TypeScript)
4. 컴포넌트/훅 구현
5. API 호출 연결
6. 테스트 작성
7. 에러 처리 추가
8. 코드 리뷰
9. 체크포인트 생성
```

### 9.2 버그 수정

```
1. 버그 재현 및 로깅
2. 원인 분석
3. 최소 변경으로 수정
4. 테스트 추가 (회귀 방지)
5. 코드 리뷰
6. 체크포인트 생성
```

### 9.3 리팩터링

```
1. 변경 범위 정의
2. 테스트 작성
3. 점진적 리팩터링
4. 기능 검증
5. 코드 리뷰
6. 체크포인트 생성
```

---

## 10. 참고 자료

### 10.1 공식 문서

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 공식 문서](https://reactnative.dev/)
- [tRPC 공식 문서](https://trpc.io/)
- [NativeWind 공식 문서](https://www.nativewind.dev/)
- [Drizzle ORM 공식 문서](https://orm.drizzle.team/)

### 10.2 프로젝트 문서

- `spec.md` - 현재 기능 명세
- `server/README.md` - 백엔드 문서
- `design.md` - 디자인 철학

### 10.3 유용한 패턴

- React Query 공식 가이드
- tRPC 타입 안정성 가이드
- NativeWind Tailwind 매핑

---

## 11. 변경 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| 1.0.0 | 2026-01-30 | 초기 아키텍처 문서 작성 |

