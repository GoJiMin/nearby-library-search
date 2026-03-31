# Phase 2. Shared 레이어 구성

## 목표

- `shared` 레이어에 공통 API 요청 구조, 재사용 가능한 UI, 유틸, 훅의 기준을 정리한다.
- 이후 `entities`와 `features`가 직접 `fetch`나 임시 UI를 만들지 않고, `shared`의 공개 인터페이스를 조합해 개발할 수 있게 한다.
- MVP 범위에 맞게 빠르게 검증 가능한 수준으로 공통 기반을 구축하되, 이후 확장이 가능한 구조를 유지한다.

## 기술 결정

- 공통 API 요청: `fetch` 기반 request core 직접 구현
- 추가 HTTP 클라이언트 의존성: 도입하지 않음
- 서버 상태 연계: `@tanstack/react-query`
- 공통 UI: `shadcn/ui`
- 아이콘: `lucide-react`
- 테스트 환경: `vitest`, `react testing library`
- 접근성 쿼리 기준: `getByRole`, `getByLabelText` 우선
- 인증 처리: 도입하지 않음
- 토큰 갱신/세션 재시도: 도입하지 않음

## 구현 범위

- request core, request error, request type을 포함한 공통 API 요청 구조를 만든다.
- 쿼리 스트링 직렬화, 공통 헤더 병합, JSON/FormData body 처리 기준을 정리한다.
- 읽기 요청과 쓰기 요청을 구분하는 공통 에러 타입을 정의한다.
- `shadcn/ui` 기반 입력, 버튼, 다이얼로그, 피드백 UI를 도입한다.
- `lucide-react` 아이콘 사용 기준을 통일한다.
- 공통 유틸과 커스텀 훅의 최소 구조를 만든다.
- Shared 레이어 공개 규칙과 사용 방식을 문서화한다.
- Phase 2 구현을 위한 `task.md` 작성 기준을 마련한다.

## 비범위

- 실제 도서/지역/도서관 API 도메인 요청 구현
- 특정 엔티티 전용 데이터 모델 정의
- 인증, 사용자 세션, refresh token 처리
- 글로벌 토스트 시스템의 최종 UX 확정
- 카카오맵 실제 스크립트 로딩 구현

## 디렉터리 기준

- `src/shared/request`
  - 공통 request core와 에러 타입을 관리하는 슬라이스
  - `lib/requestCore.ts`, `lib/requestError.ts`, `lib/requestType.ts`
- `src/shared/feedback`
  - 로딩, 에러, 빈 상태 같은 공통 피드백 UI 슬라이스
- `src/shared/ui`
  - 재사용 가능한 UI 컴포넌트를 별도 슬라이스 없이 파일 단위로 둔다
  - 예시: `button.tsx`, `input.tsx`, `dialog.tsx`
  - 모든 UI 컴포넌트는 `src/shared/ui/index.ts` 단일 엔트리에서 공개한다
- `src/shared/lib`
  - 재사용 가능한 유틸을 별도 슬라이스 없이 파일 단위로 둔다
  - 예시: `debounce.ts`, `format.ts`, `queryString.ts`
  - 모든 유틸은 `src/shared/lib/index.ts` 단일 엔트리에서 공개한다
- `src/shared/icon`
  - 필요 시 `lucide-react` 래퍼 또는 아이콘 매핑 파일을 둔다

`shared/request`, `shared/feedback`, `shared/env` 같은 슬라이스는 각 슬라이스의 `index.ts`만 공개 진입점으로 사용하고, `shared/ui`, `shared/lib`는 각 디렉터리의 단일 `index.ts`로 공개한다.

## Shared 레이어 상세 설계

### 1. 공통 API 요청 구조

- request core는 예시로 공유된 `request-core`, `request-error`, `request-type`, `index` 구조를 참고해 현재 프로젝트에 맞게 단순화한다.
- 핵심 공개 함수는 다음 수준을 목표로 한다.
  - `request`
  - `requestGet`
  - `requestPost`
  - `requestPut`
  - `requestPatch`
  - `requestDelete`
- request core는 최소한 다음 책임을 가진다.
  - base URL과 endpoint 결합
  - query param 직렬화
  - 공통 헤더 병합
  - JSON body 직렬화
  - `FormData` 그대로 전달
  - 응답 파싱 여부 제어
  - 실패 응답을 공통 에러 객체로 변환
- 현재 프로젝트는 인증이 없으므로 다음 항목은 제외한다.
  - `credentials: 'include'` 강제
  - 401 재시도
  - refresh token 요청

### 2. 공통 API 타입 규칙

- request type은 요청 메서드, 헤더, body, query params, response parse 여부를 명확하게 표현해야 한다.
- query params는 MVP 편의성을 위해 최소한 다음 타입을 지원한다.
  - `string`
  - `number`
  - `boolean`
  - `null | undefined`는 직렬화 시 제외
- body는 JSON 객체와 `FormData`를 모두 허용하되, `GET` 요청에는 body를 사용하지 않는 규칙을 우선한다.
- 읽기 요청은 기본적으로 응답 body를 반환하고, 쓰기 요청은 기본적으로 `void`를 반환하되 `withResponse` 옵션으로 확장 가능하게 둔다.

### 3. 공통 에러 구조

- API 실패 시 공통 에러 클래스 계층을 사용한다.
- 최소 에러 구조는 다음 정보를 포함한다.
  - `name`
  - `message`
  - `status`
  - `endpoint`
  - `method`
  - `requestBody`
- 읽기 요청만 별도 에러 유형으로 분리하고, 쓰기 요청은 기본 에러를 사용한다.
- 권장 방향
  - `RequestError`
  - `RequestGetError`
- 에러를 분리하는 이유는 이후 처리 전략이 다르기 때문이다.
  - 읽기 요청 실패: 대체 UI, 에러 영역, 재시도 UI 연결
  - 쓰기 요청 실패: `RequestError`를 통해 토스트, 액션 실패 메시지 등 연결
- 서버 에러 응답이 JSON이면 파싱해 title/detail을 우선 사용하고, 실패하면 기본 fallback 메시지를 사용한다.

### 4. shadcn/ui 기반 공통 UI

- 공통 UI는 `shadcn/ui`를 사용해 빠르게 구축한다.
- Phase 2 우선 범위는 다음과 같다.
  - `Button`
  - `Input`
  - `Dialog`
  - `LoadingState`
  - `EmptyState`
  - `ErrorState`
- 재사용 가능한 UI 컴포넌트는 모두 `src/shared/ui` 내부 파일로 관리한다.
- `Button`, `Input`, `Dialog` 같은 공통 UI는 `src/shared/ui/index.ts` 단일 엔트리에서 export한다.
- 이미 있는 `feedback` 슬라이스는 `shadcn/ui` 톤과 함께 정리해 일관된 스타일로 맞춘다.
- 컴포넌트는 단순 래핑에 그치지 않고, 현재 서비스의 스타일 토큰과 접근성 요구사항이 반영된 프로젝트 표준 컴포넌트로 둔다.
- 아이콘은 `lucide-react`만 사용한다.

### 5. 공통 유틸 구조

- MVP 기준으로 먼저 필요한 유틸만 만든다.
- 재사용 가능한 유틸은 `src/shared/lib` 아래 파일 단위로 바로 둔다.
- 유틸 공개 진입점은 `src/shared/lib/index.ts` 하나로 고정한다.
- 우선 후보
  - query string 생성
  - debounce
  - 문자열/숫자 포맷팅
  - 좌표/지도 관련 단순 보조 함수
- 유틸은 순수 함수로 유지하고, 복잡한 분기나 예외 케이스는 선택적으로 단위 테스트를 추가한다.

### 6. 공통 훅 구조

- 재사용 훅도 실제 필요가 확인된 범위만 만든다.
- 우선 후보
  - `useDebounceValue`
  - 다이얼로그 open 상태 보조 훅
  - 외부 스크립트 로딩 준비 훅의 진입점
- 훅은 UI 편의 로직이나 브라우저 API 래핑에 집중하고, 도메인 상태는 다루지 않는다.

### 7. Shared 사용 규칙

- `entities`, `features`, `pages`는 직접 `fetch`하지 않고 `shared/request`의 공개 함수만 사용한다.
- `entities`, `features`, `pages`는 `import.meta.env`를 직접 읽지 않고 `@/shared/env`만 사용한다.
- 공통 UI는 `@/shared/ui` 단일 엔트리로만 import한다.
- 공통 유틸은 `@/shared/lib` 단일 엔트리로만 import한다.
- `lucide-react`는 공통 UI 내부나 실제 화면 구현에서 직접 사용할 수 있지만, 같은 아이콘 조합이 반복되면 `shared/icon` 슬라이스로 승격한다.
- Shared 레이어는 도메인 지식을 가지지 않고, 여러 도메인에서 재사용 가능한 규칙만 포함한다.

## 산출물

- 공통 request core 슬라이스
- 공통 request error/type 정의
- `shadcn/ui` 기반 공통 입력/버튼/다이얼로그 슬라이스
- `lucide-react` 도입 및 사용 기준
- 공통 유틸 슬라이스
- 공통 훅 슬라이스
- Shared 사용 규칙 문서
- Phase 2 `task.md`

## 완료 기준

- `shared/request`만으로 GET/POST/PATCH/PUT/DELETE 요청을 일관되게 보낼 수 있다.
- query string, headers, body 처리 규칙이 공통화된다.
- 읽기/쓰기 요청 에러가 다른 유형으로 구분된다.
- `shadcn/ui` 기반 공통 UI가 최소 버튼, 입력, 다이얼로그, 피드백 상태까지 준비된다.
- 공통 유틸과 훅이 이후 `entities`, `features`에서 바로 사용할 수 있는 수준으로 정리된다.
- Shared 공개 규칙이 문서와 코드 구조에 함께 반영된다.

## 테스트 기준

- request core가 query string, headers, JSON body, `FormData`를 올바르게 처리한다.
- 실패 응답이 `RequestError`, `RequestGetError` 규칙에 맞게 변환된다.
- `shadcn/ui`처럼 이미 검증된 UI 기반 컴포넌트는 별도의 테스트를 기본으로 추가하지 않는다.
- 공통 유틸의 복잡한 분기와 에러 케이스는 선택적으로 단위 테스트를 가진다.
- `pnpm test:run`, `pnpm exec tsc -p tsconfig.app.json`, `pnpm build`가 통과한다.

## 후속 연결 포인트

- Phase 3에서는 `shared/request` 위에 `entities`별 API 함수와 응답 정규화 로직을 얹는다.
- Phase 4에서는 `shared` 공통 UI와 훅을 조합해 검색 입력, 지역 선택, 결과 표시 기능을 구현한다.

## 참고 구현 메모

- 공통 API 구조는 사용자가 공유한 `modu-client` 예시의 `request-core`, `request-error`, `request-type`, `index` 분리 방식을 참고한다.
- 다만 현재 프로젝트는 인증 요구사항이 없으므로 `credentials` 강제, 401 재시도, refresh token 흐름은 제외한다.
- 에러 유형 분리는 이후 읽기 요청의 대체 UI와 쓰기 요청의 토스트 메시지 연결을 위한 준비 단계로 유지한다.
