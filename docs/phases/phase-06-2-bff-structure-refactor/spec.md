# Phase 6-2. BFF 구조 리팩터링

## 목표

- 현재 Fastify BFF의 테스트 구조, route 디렉터리 구조, fixture 경계를 리팩터링해 탐색 비용과 변경 비용을 낮춘다.
- 기존 `/api` 계약과 Phase 6-1 보안 하드닝 결과는 유지한 채, 구현 코드와 테스트 코드가 목적별 책임을 분명히 갖도록 정리한다.
- fixture를 dev/test 전용 경계로 격리해 production build와 runtime에서 직접 섞이지 않도록 bootstrap 구조를 다시 고정한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 6-2`
- `docs/phases/phase-03-bff/spec.md`
- `docs/phases/phase-05-5-library-availability-check/spec.md`
- `docs/phases/phase-05-6-book-detail-dialog/spec.md`
- `docs/phases/phase-06-1-bff-security-hardening/spec.md`

## 기술 결정

- 이번 phase는 **구조 리팩터링**이다.
  - 기존 route URL, response shape, error title, env 계약은 바꾸지 않는다.
  - business rule 추가나 provider contract 변경은 하지 않는다.
- 테스트 원칙은 유지한다.
  - BFF route regression은 계속 `createApp().inject()`로 검증한다.
  - pure helper는 독립 검증 가치가 있을 때만 focused test를 유지한다.
- 과한 공용화는 금지한다.
  - parse -> fixture/live branch -> normalize 흐름을 generic route factory로 숨기지 않는다.
  - 파일을 쪼개기 위한 쪼개기는 하지 않는다.
- fixture는 production `src`와 분리한다.
  - production build target은 `src`만 유지한다.
  - dev fixture source는 `apps/bff/dev` 경계로 이동한다.

## 구현 범위

- app baseline test와 route integration test를 목적별로 분리
- `src/routes`를 도메인 기준 production package 구조로 재정리
- fixture source와 fixture test를 dev/test 전용 경계로 이동
- fixture 주입 경계를 먼저 도입한 뒤 production bootstrap과 dev bootstrap을 분리
- route별 과분리 helper를 흡수하고 유지 가치가 있는 순수 로직만 남김
- 리팩터링 후 전체 BFF test/typecheck/build 기준 재검증

## 비범위

- `/api/books/search`, `/api/books/:isbn13`, `/api/libraries/search`, `/api/libraries/:libraryCode/books/:isbn13/availability`의 공개 계약 변경
- 새 provider endpoint 추가
- route pipeline 전체를 generic abstraction으로 치환
- web app 코드 변경
- Vercel 배포 설정 자체 변경

## 현재 구현 상태

- app baseline과 route integration test 분리는 이미 시작됐다.
  - [createApp.baseline.test.ts](/Users/gojimin/Desktop/ai/apps/bff/src/app/createApp.baseline.test.ts)가 baseline regression을 담당한다.
  - route integration test는 [book search](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/search/route.test.ts), [book detail](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/detail/route.test.ts), [library search](/Users/gojimin/Desktop/ai/apps/bff/src/routes/library/search/route.test.ts), [library availability](/Users/gojimin/Desktop/ai/apps/bff/src/routes/library/availability/route.test.ts)로 분리됐다.
- `src/routes` 도메인 뼈대도 일부 생겼지만, production 코드 co-location은 아직 불완전하다.
-  - [health/route.ts](/Users/gojimin/Desktop/ai/apps/bff/src/routes/health/route.ts)와 [book/search/route.ts](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/search/route.ts)는 도메인 경로로 이동했다.
-  - `book search` fixture source와 fixture test는 [dev/fixtures/book/search](/Users/gojimin/Desktop/ai/apps/bff/dev/fixtures/book/search)로 이동했고, `src/routes` 루트의 `bookSearchFixture*` flat 파일은 제거됐다.
-  - [book/detail/route.ts](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/detail/route.ts)도 도메인 경로로 이동했고, `book detail` fixture source와 fixture test는 [dev/fixtures/book/detail](/Users/gojimin/Desktop/ai/apps/bff/dev/fixtures/book/detail)로 이동했다.
-  - 반면 [librarySearch.ts](/Users/gojimin/Desktop/ai/apps/bff/src/routes/librarySearch.ts)와 [libraryAvailability.ts](/Users/gojimin/Desktop/ai/apps/bff/src/routes/libraryAvailability.ts), 해당 fixture/helper 파일은 아직 `src/routes` 루트에 남아 있다.
- 현재 구조는 “`book search`, `book detail`은 도메인 package가 완성됐지만, `library` 도메인은 아직 production 코드와 fixture 경계가 함께 정리되지 않은 중간 상태”다.
- `USE_DEV_FIXTURES`는 아직 runtime flag로 제어되지만, fixture resolver는 이제 `createApp()`과 `registerRoutes()`의 주입 경계를 통해 route에 전달된다.
- 다만 default fixture registry와 일부 fixture source는 아직 production `src` 안에 남아 있다.
- `src/main.ts`는 production bootstrap과 dev fixture bootstrap을 구분하지 않고 동일한 `createApp()` 진입만 사용한다.
- `libraryAvailabilityParams.ts`, `libraryAvailabilityResponse.ts`처럼 분리 이득이 있는 순수 helper는 남아 있지만, `book` 도메인 fixture 쪽의 단일 소비자용 helper 분리는 이미 흡수됐다.

## 구조 리팩터링 기준

### 1. 도메인 package 완성 기준

- 이번 phase에서 도메인 폴더는 단순 뼈대가 아니라 **해당 도메인의 production route package**여야 한다.
- 어떤 도메인 task도 아래 조건을 모두 만족하기 전에는 완료로 보지 않는다.
  - 해당 도메인의 production route code가 도메인 폴더 안에 있다.
  - 해당 도메인의 route integration test가 같은 도메인 폴더 안에 있다.
  - route-owned pure helper와 focused helper test가 같은 도메인 폴더 안에 있다.
  - 해당 도메인의 flat production 파일이 `src/routes` 루트에 남아 있지 않다.
- `src/routes` 루트는 최종적으로 아래만 남기는 것을 기준으로 삼는다.
  - `index.ts`
  - `book/`
  - `library/`
  - `health/`
- 즉 `book search` route 하나만 옮기고 fixture/helper가 루트에 남아 있는 상태는 도메인 구조 정리 완료가 아니다.

### 2. 테스트 구조 재편

- `createApp.test.ts`는 해체하고 아래 구조로 재배치한다.
  - `src/app/createApp.baseline.test.ts`
    - health
    - exact-origin CORS
    - 404 structured error
    - 500 structured error
    - security headers
  - `src/routes/book/search/route.test.ts`
    - query validation
    - upstream success/empty/error
    - fixture success/error
  - `src/routes/book/detail/route.test.ts`
    - param validation
    - upstream success/error
    - fixture rich/minimal/empty/error
  - `src/routes/library/search/route.test.ts`
    - query validation
    - upstream success/empty/error
    - fixture success/error
  - `src/routes/library/availability/route.test.ts`
    - param validation
    - upstream success/error
    - fixture available/unavailable/not-owned/error
- route integration test는 각 route 폴더에 둔다.
- app baseline test만 `src/app`에 남긴다.
- 공통 helper 허용 범위는 아래로 제한한다.
  - 기본 env setup
  - `requestLibraryApi` mock wiring
  - JSON `Response` 생성 helper
- assertion 문장, request URL, route별 기대 응답은 각 테스트 파일에 직접 남긴다.
- 하나의 shared test util이 route-specific assertion까지 숨기면 안 된다.

### 3. `src/routes` 도메인 폴더 구조

- 목표 구조는 아래로 고정한다.

```text
apps/bff/src/routes/
  book/
    detail/
      route.ts
      route.test.ts
    search/
      route.ts
      route.test.ts
  health/
    route.ts
  library/
    availability/
      parseParams.ts
      parseParams.test.ts
      normalizeResponse.ts
      normalizeResponse.test.ts
      route.ts
      route.test.ts
    search/
      route.ts
      route.test.ts
  index.ts
```

- 완료된 도메인에 대해 production route code가 `src/routes` 루트 flat 파일로 남아 있으면 안 된다.
- `routes/index.ts`는 새 도메인 폴더에서 route register만 담당한다.
- `book/detail/route.ts`, `book/search/route.ts`, `library/search/route.ts`는 route-local helper를 같은 파일 안에 두는 것을 기본값으로 한다.
- `library/availability`는 현재처럼 parse/normalize 책임이 명확하고 전용 테스트가 있으므로 분리 유지한다.
- `health`는 단일 route라 `route.ts` 하나만 유지한다.

### 4. 과분리 정리 기준

- 아래는 분리 유지 대상으로 본다.
  - 독립 입력 검증 helper
  - 독립 normalize helper
  - 전용 unit test가 이미 있는 pure function
- 아래는 흡수 대상으로 본다.
  - 단일 소비자용 trivial builder
  - fixture data 생성만 돕는 얕은 helper
  - 테스트 가치 없이 route 한 곳에서만 읽히는 얇은 변환 함수
- 따라서 `bookSearchFixture.builders.ts` 같은 파일은 별도 파일로 유지하지 않고 fixture data 파일로 흡수한다.
- 리팩터링 후에는 “route 폴더를 열었을 때 route contract, pure helper, integration test의 경계가 바로 보이는지”를 기준으로 삼는다.

## Fixture 격리 기준

### 1. fixture 주입 경계는 도메인 완성의 선행 조건이다

- fixture를 `dev/fixtures`로 내보내려면 route가 fixture resolver를 정적으로 import하지 않아야 한다.
- 따라서 아래 내부 인터페이스는 fixture 이동보다 먼저 도입해야 한다.

```ts
type CreateAppOptions = {
  fixtures?: AppFixtures;
};

declare function createApp(options?: CreateAppOptions): FastifyInstance;
declare function registerRoutes(app: FastifyInstance, options?: CreateAppOptions): void;
```

- 이 주입 경계가 없으면 fixture source를 production `src` 밖으로 이동할 수 없고, 결국 `src/routes` 루트에 도메인별 fixture 파일이 계속 남는다.
- 따라서 fixture 주입 경계는 “나중에 추가해도 되는 개선”이 아니라 도메인 package completion의 선행 조건으로 본다.

### 2. fixture source 위치

- fixture source는 `apps/bff/dev/fixtures` 아래로 이동한다.
- 목표 구조는 아래를 기본으로 한다.

```text
apps/bff/dev/
  fixtures/
    book/
      detail/
        books.ts
        fixture.ts
        fixture.test.ts
      search/
        books.ts
        fixture.ts
        fixture.test.ts
    library/
      availability/
        fixture.ts
        fixture.test.ts
      search/
        libraries.ts
        fixture.ts
        fixture.test.ts
    index.ts
  main.ts
```

- fixture test도 fixture source와 같은 `dev/fixtures` 경계로 이동한다.
- production compile target은 계속 `src`만 포함한다.
- fixture 파일 이름은 `data`/`resolver` 같은 일반화보다 도메인 용어를 우선한다.
  - 예: `books.ts`, `libraries.ts`, `fixture.ts`
  - 별도 추상 레이어를 암시하는 `resolver.ts`는 기본값으로 쓰지 않는다.

### 3. bootstrap과 주입 방식

- `createApp()`은 optional runtime option을 받도록 바꾼다.

```ts
type AppFixtures = {
  bookSearch?: {
    resolve(query: BookSearchQuery): Result<BookSearchResponse>;
  };
  bookDetail?: {
    resolve(params: BookDetailParams): Result<BookDetailResponse>;
  };
  librarySearch?: {
    resolve(query: LibrarySearchQuery): Result<LibrarySearchResponse>;
  };
  libraryAvailability?: {
    resolve(params: LibraryAvailabilityParams): Result<LibraryAvailabilityResponse>;
  };
};

type CreateAppOptions = {
  fixtures?: AppFixtures;
};
```

- `src/main.ts`는 production bootstrap만 담당한다.
  - `createApp()`을 fixture 없이 호출한다.
- `dev/main.ts`는 dev bootstrap만 담당한다.
  - `USE_DEV_FIXTURES=true`면 `dev/fixtures/index.ts`의 registry를 주입한다.
  - `USE_DEV_FIXTURES=false`면 fixture 없이 `createApp()`을 호출해도 된다.
- route 코드는 fixture resolver를 정적으로 import하지 않는다.
  - route는 `registerRoutes(app, options)`에서 주입받은 fixture resolver만 사용한다.
- production bootstrap에서 `USE_DEV_FIXTURES=true`인데 fixture registry가 없으면 부팅 시 즉시 실패시킨다.
  - silent fallback으로 live path를 타면 안 된다.

### 4. build 경계

- `apps/bff/package.json` script 기준은 아래로 정리한다.
  - `build`: production `src`만 컴파일
  - `start`: production `dist/main.js`
  - `dev`: dev bootstrap 진입점 사용
- acceptance는 아래로 고정한다.
  - `tsc -p tsconfig.json` 결과물에 fixture source 파일이 포함되지 않는다.
  - production runtime entrypoint가 dev fixture source를 import하지 않는다.

## 반복 패턴 정리 기준

- route 내부의 아래 흐름은 route-local로 유지한다.
  - parse
  - fixture/live branch
  - normalize
  - logging
  - reply status 결정
- 허용하는 공통화는 아래까지만이다.
  - `Result<T>` 공용 타입 alias
  - fixture registry/interface 타입
  - test env/bootstrap helper
- 금지하는 공통화는 아래다.
  - route generic factory
  - 모든 route를 하나의 공용 실행기로 감싸는 abstraction
  - domain 차이를 숨기는 공용 parse/normalize framework

## 테스트 기준

### 1. baseline test

- `createApp.baseline.test.ts`는 아래만 검증한다.
  - health route
  - CORS allow/block
  - preflight 처리
  - 404/500 structured error
  - helmet headers

### 2. route integration test

- 각 route test는 아래를 최소로 검증한다.
  - 입력 검증 failure
  - upstream success
  - upstream empty 또는 no-result path
  - upstream non-ok/throw/invalid path
  - fixture success/error path
- route integration test는 `requestLibraryApi` mock을 경계로 유지한다.

### 3. pure helper test

- 분리 유지한 pure helper만 focused test를 유지한다.
  - `library availability` parse/normalize
  - fixture resolver validation
- route-local helper로 흡수된 함수는 별도 unit test를 만들지 않는다.

### 4. fixture/build 검증

- `USE_DEV_FIXTURES=true` + dev bootstrap에서 fixture route가 정상 동작한다.
- production bootstrap에서 fixture registry 없이 `USE_DEV_FIXTURES=true`면 부팅이 실패한다.
- production build 산출물에는 fixture source 파일이 없어야 한다.

## Acceptance 기준

- 더 이상 단일 테스트 파일이 모든 BFF regression을 담당하지 않는다.
- 완료된 각 도메인에 대해 production route code, route integration test, route-owned helper가 같은 도메인 폴더 안에 있다.
- 완료된 도메인에 대한 flat production 파일이 `src/routes` 루트에 남아 있지 않다.
- `src/routes` 루트는 최종적으로 `index.ts`와 도메인 폴더만 남는다.
- fixture source는 production `src` 밖에 존재하며, production build 산출물에 포함되지 않는다.
- route 공개 계약과 fixture regression은 모두 유지된다.
- `pnpm --filter @nearby-library-search/bff exec vitest run`, `pnpm --filter @nearby-library-search/bff exec tsc -p tsconfig.json`, `pnpm --filter @nearby-library-search/bff build`를 계속 통과한다.

## Assumptions

- 이번 phase는 코드 가독성과 배포 경계를 위한 구조 리팩터링이므로, 사용자 가시 기능 변화는 없다.
- fixture는 dev/test 전용으로만 유지하고, production runtime에서 켤 수 없는 구조를 목표로 한다.
- 테스트 파일 수 증가는 허용하지만, 각 파일은 한 가지 목적만 담당해야 한다.
- `dev` 경계 코드는 production `tsc` 대상이 아니며, fixture 회귀는 Vitest로 계속 검증한다.
