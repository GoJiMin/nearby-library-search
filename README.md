# 니어립

니어립은 원하는 책을 검색하고, 가까운 도서관의 소장 여부와 대출 가능 여부를 확인할 수 있는 서비스입니다.

## 기술 스택

- React 19
- Vite
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui
- lucide-react
- Vitest
- React Testing Library

## 아키텍처

- FSD 기반 구조를 사용합니다.
- 현재 웹 앱은 `apps/web` 패키지로 이동한 상태입니다.
- 모노레포 기본 구조는 `apps/web`, `apps/bff`, `packages/contracts`를 기준으로 합니다.
- `apps/bff`는 Fastify 기반 BFF로 구성합니다.
- 루트 `tsconfig.json`은 `apps/web`, `apps/bff`, `packages/contracts`를 참조하는 solution-style workspace 진입점입니다.
- `apps/web/src/entities`에는 `book`, `library`, `region` 도메인 슬라이스를 둡니다.
- `book`, `library` 엔티티는 `api` + `model` 구조로, `region` 엔티티는 정적 데이터 중심의 `model` 구조로 구성합니다.
- `book`, `library` 읽기 모델은 React Query `useSuspenseQuery`와 query key/query options 팩터리 패턴으로 구성합니다.
- 엔티티 입력 검증은 `zod` 스키마로 처리하고, 재사용 가능한 정규화는 `@/shared/validation`을 통해 조합합니다.
- 공통 UI는 `@/shared/ui` 단일 엔트리로 공개합니다.
- 공통 API 요청은 `@/shared/request` 공개 API를 통해서만 사용합니다.
- 엔티티, 기능, 페이지 레이어는 `fetch`를 직접 호출하지 않고 `@/shared/request`를 통해 Fastify BFF `/api`만 호출합니다.
- 재사용 가능한 도메인 계약 타입은 `packages/contracts`를 기준으로 공유합니다.
- `apps/web`와 `apps/bff`는 `packages/contracts`를 project reference로 연결하고, 직접 타입체크 시에는 source path alias를 통해 계약 타입을 해석합니다.
- 클라이언트 환경변수는 `@/shared/env`를 통해서만 읽습니다.
- `VITE_API_BASE_URL`은 web이 호출할 Fastify BFF base URL입니다.
- 외부 Open API 인증키는 웹 앱이 아니라 BFF 서버 환경변수에서만 관리합니다.
- 현재 라우트 구조는 `/` 검색 시작 화면과 `/books` 도서 검색 결과 화면으로 나뉩니다.
- `features/book`는 검색 시작, 결과 화면, 결과 카드, 페이지네이션, 결과 상태 처리를 함께 담당합니다.
- `shared/request`는 공통 요청 API와 함께 query error boundary 복구와 서버 에러 메시지 매핑 helper를 공개합니다.

## Entities 레이어 현재 구성

- `book`
  - `/api/books/search`, `/api/books/:isbn13`를 감싸는 엔티티 API 함수와 `useGetSearchBooks`, `useGetBookDetail` 훅을 제공합니다.
  - 입력 경계에서는 `bookSchema.ts`의 `zod` 스키마로 canonical params를 만듭니다.
- `library`
  - `/api/libraries/search`를 감싸는 엔티티 API 함수와 `useGetSearchLibraries` 훅을 제공합니다.
  - 검색 `pageSize`는 현재 엔티티 내부 상수 `10`으로 고정합니다.
  - 좌표 존재 여부와 빈 결과 판별은 순수 helper로 분리되어 있습니다.
- `region`
  - 지역/세부 지역 코드는 Phase 3 문서 `docs/phases/phase-03-bff/open_api_spec.md`를 source of truth로 사용합니다.
  - `REGION_OPTIONS`, `DETAIL_REGION_OPTIONS_BY_REGION`, `isDetailRegionOfRegion`을 공개합니다.
  - 세부 지역 목록은 `DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []` 형태로 바로 접근합니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

루트 스크립트 기준은 아래와 같습니다.

```bash
pnpm dev       # web만 실행
pnpm dev:web   # web만 실행
pnpm dev:bff   # bff만 실행
pnpm dev:all   # web + bff 동시 실행
pnpm typecheck:all # 루트 solution tsconfig 기준 전체 타입체크
pnpm build     # web 기본 빌드
pnpm build:all # web + bff 전체 빌드
```

웹 앱 공개 환경변수 예시는 [apps/web/.env.example](/Users/gojimin/Desktop/ai/apps/web/.env.example)에 두고, BFF 서버 전용 환경변수 예시는 [apps/bff/.env.example](/Users/gojimin/Desktop/ai/apps/bff/.env.example)에 둡니다.
웹 앱에서는 `VITE_` 접두사를 가진 공개 설정만 사용하고, 외부 Open API 인증키는 `apps/bff/.env`에서만 관리합니다.
`apps/web/.env`의 `VITE_API_BASE_URL`에는 외부 provider 주소가 아니라 Fastify BFF 주소만 넣습니다.
`apps/bff/.env`의 `WEB_APP_ORIGIN`에는 운영 web custom domain origin만 넣고, localhost origin은 넣지 않습니다.
`apps/bff/.env`의 `ALLOW_DEV_CORS_ORIGINS=true`일 때만 localhost 개발 origin CORS를 임시로 허용합니다.
`apps/bff/.env`의 `LIBRARY_API_BASE_URL`은 `https://` 주소만 허용합니다.

## 검증

```bash
pnpm run typecheck:all
pnpm lint:web
pnpm test:run
pnpm --filter @nearby-library-search/bff test:run
pnpm --filter @nearby-library-search/contracts build
pnpm typecheck:web
pnpm typecheck:bff
pnpm build
pnpm build:all
```

## 문서

- 전체 개발 계획: `plan.md`
- 프로젝트 규칙: `AGENTS.md`
- Phase 1 명세: `docs/phases/phase-01-app/spec.md`
- Phase 1 작업 목록: `docs/phases/phase-01-app/task.md`
- Phase 2 명세: `docs/phases/phase-02-shared/spec.md`
- Phase 2 작업 목록: `docs/phases/phase-02-shared/task.md`
- Phase 3 명세: `docs/phases/phase-03-bff/spec.md`
- Phase 3 Open API 스펙: `docs/phases/phase-03-bff/open_api_spec.md`
- Phase 3 작업 목록: `docs/phases/phase-03-bff/task.md`
- Phase 4 명세: `docs/phases/phase-04-entities/spec.md`
- Phase 4 작업 목록: `docs/phases/phase-04-entities/task.md`
- Phase 4-1 명세: `docs/phases/phase-04-1-typescript-workspace/spec.md`
- Phase 4-1 작업 목록: `docs/phases/phase-04-1-typescript-workspace/task.md`
- Phase 4-2 명세: `docs/phases/phase-04-2-ux-ui-design/spec.md`
- Phase 4-2 작업 목록: `docs/phases/phase-04-2-ux-ui-design/task.md`
- Phase 5-1 명세: `docs/phases/phase-05-1-home-search-start/spec.md`
- Phase 5-1 작업 목록: `docs/phases/phase-05-1-home-search-start/task.md`
- Phase 5-1A 명세: `docs/phases/phase-05-1a-home-visual-refresh/spec.md`
- Phase 5-1A 작업 목록: `docs/phases/phase-05-1a-home-visual-refresh/task.md`
- Phase 5-2 명세: `docs/phases/phase-05-2-book-search-result-and-selection/spec.md`
- Phase 5-2 작업 목록: `docs/phases/phase-05-2-book-search-result-and-selection/task.md`

## 현재 상태

- Phase 1 app 레이어 표준화 완료
- Phase 2 shared 레이어 구성 완료
- Phase 3 모노레포 전환과 Fastify BFF 구성 완료
- Phase 4 entities 레이어 구성 완료
- Phase 4-1 TypeScript workspace 정리 완료
- Phase 4-2 UX/UI 설계 기준 정리 완료
- Phase 5-1 홈 검색 시작 화면 구현 완료
- Phase 5-1A 홈 메인 화면 리디자인 완료
- Phase 5-2 `/books` 결과 화면, URL 기반 페이지네이션, loading/empty/error 상태, 카드 handoff 구현 완료
- web 테스트는 현재 `shared/request`, `features/book` 검색 시작/결과 화면 integration, router integration, `book`/`library`/`region` 순수 helper 검증까지 포함합니다.
