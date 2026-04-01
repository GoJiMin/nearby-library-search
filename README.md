# 동네 도서관 찾기

책 제목과 지역 정보를 기준으로 내 주변 도서관의 소장 여부와 위치를 빠르게 확인하기 위한 MVP 프로젝트입니다.

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
- `apps/web/src/entities`에는 `book`, `library`, `region` 도메인 슬라이스를 둡니다.
- `book`, `library` 엔티티는 `api` + `model` 구조로, `region` 엔티티는 정적 데이터 중심의 `model` 구조로 구성합니다.
- `book`, `library` 읽기 모델은 React Query `useSuspenseQuery`와 query key/query options 팩터리 패턴으로 구성합니다.
- 엔티티 입력 검증은 `zod` 스키마로 처리하고, 재사용 가능한 정규화는 `@/shared/validation`을 통해 조합합니다.
- 공통 UI는 `@/shared/ui` 단일 엔트리로 공개합니다.
- 공통 API 요청은 `@/shared/request` 공개 API를 통해서만 사용합니다.
- 엔티티, 기능, 페이지 레이어는 `fetch`를 직접 호출하지 않고 `@/shared/request`를 통해 Fastify BFF `/api`만 호출합니다.
- 재사용 가능한 도메인 계약 타입은 `packages/contracts`를 기준으로 공유합니다.
- 클라이언트 환경변수는 `@/shared/env`를 통해서만 읽습니다.
- `VITE_API_BASE_URL`은 web이 호출할 Fastify BFF base URL입니다.
- 외부 Open API 인증키는 웹 앱이 아니라 BFF 서버 환경변수에서만 관리합니다.

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
pnpm build     # web 기본 빌드
pnpm build:all # web + bff 전체 빌드
```

웹 앱 공개 환경변수 예시는 [apps/web/.env.example](/Users/gojimin/Desktop/ai/apps/web/.env.example)에 두고, BFF 서버 전용 환경변수 예시는 [apps/bff/.env.example](/Users/gojimin/Desktop/ai/apps/bff/.env.example)에 둡니다.
웹 앱에서는 `VITE_` 접두사를 가진 공개 설정만 사용하고, 외부 Open API 인증키는 `apps/bff/.env`에서만 관리합니다.
`apps/web/.env`의 `VITE_API_BASE_URL`에는 외부 provider 주소가 아니라 Fastify BFF 주소만 넣습니다.

## 검증

```bash
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

## 현재 상태

- Phase 1 app 레이어 표준화 완료
- Phase 2 shared 레이어 구성 완료
- Phase 3 모노레포 전환과 Fastify BFF 구성 완료
- Phase 4 entities 레이어 구성 완료
- web 테스트는 현재 `shared/request`, router integration, `library`/`region` 엔티티 순수 helper 검증까지 포함합니다.
