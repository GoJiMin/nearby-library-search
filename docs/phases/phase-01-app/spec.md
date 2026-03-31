# Phase 1. App 레이어 표준화

## 목표

- 기본 Vite React 프로젝트를 FSD 기반 앱 셸로 전환한다.
- 이후 `shared`, `entities`, `features` 레이어 개발이 바로 이어질 수 있도록 앱 엔트리, Provider, Router, 스타일 시스템을 표준화한다.
- MVP 기준으로 필요한 최소 앱 인프라를 먼저 고정한다.

## 기술 결정

- 라우팅: `react-router`
- 서버 상태 관리: `@tanstack/react-query`
- 스타일링: `tailwindcss`
- 언어: `TypeScript`
- 테스트 환경: `vitest`, `react testing library`
- 전역 클라이언트 상태 라이브러리: 도입하지 않음
- 초기 라우트 범위: 공통 레이아웃 + `/` 단일 진입

## 구현 범위

- Vite React 템플릿을 TypeScript 기반 구조로 전환한다.
- FSD 기준의 최소 디렉터리 구조를 생성한다.
- 앱 엔트리에서 Query Provider, Router Provider, 글로벌 스타일을 연결한다.
- Tailwind CSS를 앱 전역 스타일 시스템으로 설정한다.
- `vitest`와 `react testing library` 기반 테스트 환경을 구성한다.
- 공통 레이아웃과 홈 진입 화면을 위한 앱 레벨 셸을 정의한다.
- 환경변수 접근 규칙과 외부 SDK 주입 진입점을 표준화한다.
- 앱 전역 로딩, 에러, 빈 상태 처리 기준을 정의한다.

## 비범위

- 실제 도서 검색 기능 구현
- 지역 선택 기능 구현
- 도서관 Open API 연동 구현
- 카카오맵 렌더링 구현
- 재사용 가능한 도메인 UI 상세 구현
- Zustand 등 별도 전역 상태 관리 도입

## 디렉터리 기준

- `src/app`
  - 앱 엔트리, Provider, Router, 레이아웃, 글로벌 스타일
- `src/shared`
  - 이후 공통 UI, 유틸, 훅이 들어갈 기반 구조
- `src/pages`
  - 라우트 단위 화면을 위한 페이지 슬라이스 구조
  - 페이지 컴포넌트는 각 슬라이스의 `ui` 세그먼트에 둔다
- `src/entities`
  - 이후 엔티티 개발을 위한 기반 구조
- `src/features`
  - 이후 기능 개발을 위한 기반 구조

## App 레이어 상세 설계

### 1. 엔트리 구조

- 앱 시작점은 `src/main.tsx`로 통일한다.
- `src/app/providers`에서 앱 전역 Provider 구성을 담당한다.
- 최상위 렌더링 순서는 다음과 같다.
  1. `StrictMode`
  2. 앱 Provider 묶음
  3. Router

### 2. Router 구조

- `react-router`의 데이터 라우터 기반 구성을 사용한다.
- 루트에는 공통 레이아웃을 두고 `/` 경로 하나만 우선 제공한다.
- 향후 라우트 확장을 고려해 레이아웃과 페이지 진입을 분리한다.
- 라우터 파일 내부에 페이지 컴포넌트를 직접 두지 않고 `pages` 레이어의 슬라이스를 참조한다.
- 라우터가 참조하는 오류 화면도 일반 라우트 화면과 동일하게 `pages` 레이어 슬라이스에서 관리한다.
- 레이어 루트 barrel export는 두지 않고 각 페이지 슬라이스의 `index.ts`만 공개 진입점으로 사용한다.
- 잘못된 경로에 대한 최소 fallback 화면은 둘 수 있지만, 상세 404 UX는 이후 Phase로 미룬다.

### 3. Query Provider 규칙

- 단일 `QueryClient` 인스턴스를 앱 공통 Provider에서 생성한다.
- 기본 옵션은 MVP 친화적으로 설정한다.
- 권장 기본값
  - `retry`: `1`
  - `refetchOnWindowFocus`: `false`
  - `staleTime`: 과도한 재요청을 막는 수준으로 설정
- 서버 상태 관리는 Phase 1부터 Query 기준으로 통일한다.
- Query Devtools는 필수 범위에서 제외한다.

### 4. 스타일 시스템

- Tailwind CSS를 전역 스타일링의 기본 도구로 사용한다.
- 글로벌 CSS 진입점은 `src/app/styles/globals.css`로 고정한다.
- 색상, 배경, 텍스트, 반경, 그림자 등 최소 디자인 토큰은 CSS 변수로 정의한다.
- 레이아웃과 컴포넌트 스타일은 Tailwind 유틸리티 클래스 우선으로 작성한다.
- 브라우저 기본 스타일 차이를 줄이기 위한 리셋과 베이스 스타일을 적용한다.

### 5. 앱 레이아웃

- 공통 레이아웃은 MVP 홈 화면을 감싸는 단일 레이아웃으로 시작한다.
- 레이아웃은 최소한 다음 영역을 책임진다.
  - 페이지 최대 너비와 여백
  - 배경 및 기본 타이포그래피
  - 공통 헤더 또는 서비스 타이틀 영역
  - 메인 콘텐츠 렌더링 영역

### 6. 환경변수 및 외부 SDK 진입

- 클라이언트에서 사용하는 환경변수는 `VITE_` 접두사만 허용한다.
- 루트 `.env.example`에는 MVP에서 사용하는 공개 키 예시를 유지한다.
- Phase 1 기준 공개 env 키는 `VITE_APP_ENV`, `VITE_KAKAO_MAP_APP_KEY`, `VITE_LIBRARY_API_BASE_URL`, `VITE_LIBRARY_API_KEY`로 시작한다.
- Kakao Map 키와 Open API 관련 설정값은 `@/shared/env` 단일 진입 모듈을 통해 접근한다.
- `@/shared/env`는 최소한 `appConfig`, `kakaoMapConfig`, `libraryApiConfig`처럼 확장 가능한 설정 객체를 제공한다.
- 컴포넌트, 페이지, feature, entity, shared UI에서는 `import.meta.env`를 직접 사용하지 않고 `@/shared/env`만 참조한다.
- 실제 SDK 스크립트 로딩과 API 호출 구현은 이후 Phase에서 수행한다.

### 7. 에러, 로딩, 빈 상태 기준

- 앱 초기 렌더링 시 공통 로딩 폴백 구조를 마련한다.
- 라우트 또는 Provider 단계에서 예외가 발생했을 때 노출할 최소 에러 화면 구조를 마련한다.
- 빈 화면 상태에 대한 기본 메시지 스타일 기준을 정의한다.
- 상태 표현 UI는 `shared` 슬라이스에서 관리하고, 앱 조립 로직만 `app` 레이어에 둔다.
- 상세 도메인 에러 메시지 설계는 이후 Phase에서 다룬다.

## 산출물

- TypeScript 기반 앱 엔트리 구조
- FSD 최소 디렉터리 구조
- Router Provider 구성
- Query Provider 구성
- Tailwind 설정 및 글로벌 스타일 진입점
- `vitest`, `react testing library` 테스트 실행 기반
- 공통 App Layout 및 홈 진입 화면
- env 접근 유틸 또는 설정 모듈
- Phase 1 기준 문서화된 규칙

## 완료 기준

- 앱이 TypeScript 기반으로 정상 실행된다.
- `/` 경로에서 공통 레이아웃과 기본 홈 화면이 렌더링된다.
- Tailwind 스타일이 실제로 적용된다.
- Query Provider와 Router Provider가 앱 전역에 정상 연결된다.
- `vitest` 테스트 실행 환경이 정상 동작한다.
- 기본 Vite 샘플 화면과 불필요한 데모 자산은 제거된다.
- 이후 `shared`, `entities`, `features` 작업을 바로 시작할 수 있는 구조가 준비된다.

## 테스트 기준

- `pnpm dev` 실행 시 앱이 오류 없이 부팅된다.
- `pnpm build`가 성공한다.
- TypeScript 타입 체크가 성공한다.
- `/` 경로 렌더링 시 레이아웃과 홈 화면이 보인다.
- Tailwind 유틸리티 클래스가 정상 반영된다.
- Query Client가 주입된 상태에서 하위 컴포넌트가 정상 렌더링된다.
- `vitest`와 `react testing library` 기반 기본 테스트가 실행된다.
- env 접근 유틸이 없거나 잘못된 값일 때 최소한의 방어 처리를 할 수 있는 구조가 준비된다.

## 후속 연결 포인트

- Phase 2에서 `shared` 레이어 공통 UI와 API 클라이언트를 확장한다.
- Phase 3에서 도서, 지역, 도서관 엔티티 모델과 API 스펙을 연결한다.
- Phase 4에서 실제 사용자 검색 플로우와 지도 표시 기능을 구현한다.

## Phase 1 구현 결과

- app 레이어는 앱 엔트리, Provider 조합, 라우터 구성, 레이아웃 조립 책임만 담당하도록 정리했다.
- 라우트 화면은 `pages` 슬라이스에서 관리하고, 로딩·에러·빈 상태 표현은 `shared/feedback` 슬라이스로 분리했다.
- 공개 환경변수는 `@/shared/env` 단일 진입 모듈을 통해서만 접근하도록 고정했다.
- 홈 진입 화면과 404 화면, 라우트 오류 화면, 앱 공통 헤더와 레이아웃이 MVP 셸 기준으로 연결됐다.
- 홈과 404 경로를 검증하는 라우터 통합 테스트, TypeScript 타입 체크, 프로덕션 빌드 검증을 완료했다.

## Shared 레이어 진입 준비 상태

- `shared/feedback`과 `shared/env` 슬라이스가 이미 마련되어 있어 Phase 2에서 같은 패턴으로 공통 UI와 설정 모듈을 확장할 수 있다.
- `shared` 루트 배럴은 제거되어 있으므로, 이후 공통 모듈도 슬라이스 단위 `index.ts`로만 공개하면 된다.
- 다음 작업은 API 클라이언트, 공통 입력 UI, 다이얼로그, 유틸, 훅을 `shared` 슬라이스로 추가하는 순서가 적절하다.
