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
- type-only 파일은 명시적으로 드러낸다.
  - type-only module은 `*.types.ts`를 사용한다.
  - runtime 모듈과 type-only 모듈을 이름으로 구분할 수 있어야 한다.
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

- app baseline과 route integration test는 이미 목적별로 분리됐다.
  - [createApp.baseline.test.ts](/Users/gojimin/Desktop/ai/apps/bff/src/app/test/createApp.baseline.test.ts)가 baseline regression을 담당한다.
  - route integration test는 [book search](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/search/test/route.test.ts), [book detail](/Users/gojimin/Desktop/ai/apps/bff/src/routes/book/detail/test/route.test.ts), [library search](/Users/gojimin/Desktop/ai/apps/bff/src/routes/library/search/test/route.test.ts), [library availability](/Users/gojimin/Desktop/ai/apps/bff/src/routes/library/availability/test/route.test.ts)로 정리됐다.
- `src/routes`는 `book`, `library`, `health` production package 구조로 정리됐다.
  - `book/search`, `book/detail`, `library/availability`는 parse/normalize helper와 helper test까지 같은 도메인 경로에 둔다.
  - `library/search`도 production route와 route test를 같은 도메인 경로에 둔다.
- real fixture source와 fixture test는 모두 `apps/bff/dev/fixtures` 아래로 이동했다.
  - `book`과 `library` fixture는 production `src` 밖에서만 관리한다.
  - route integration test는 real fixture source를 직접 import하지 않고 injected fixture로만 검증한다.
- bootstrap 경계는 분리됐다.
  - [src/index.ts](/Users/gojimin/Desktop/ai/apps/bff/src/index.ts)는 production bootstrap만 사용한다.
  - [dev/main.ts](/Users/gojimin/Desktop/ai/apps/bff/dev/main.ts)는 dev fixture registry를 연결한 dev bootstrap만 사용한다.
  - production bootstrap은 `USE_DEV_FIXTURES=true`면 즉시 실패한다.
- build 경계도 분리됐다.
  - `typecheck`는 `tsconfig.json --noEmit` 기준으로 전체 `src`를 검사한다.
  - `build`는 먼저 `@nearby-library-search/contracts` declaration build를 보장한 뒤, `tsconfig.build.json` 기준으로 production runtime 파일만 emit한다.
- 공용 타입 경계도 정리됐다.
  - [fixtures.types.ts](/Users/gojimin/Desktop/ai/apps/bff/src/app/fixtures.types.ts)와 [result.types.ts](/Users/gojimin/Desktop/ai/apps/bff/src/utils/result.types.ts)가 type-only 기준을 따른다.
  - `Result<T>`는 route, helper, dev fixture에서 공용 `result.types.ts`를 재사용한다.

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
  - `src/app/test/createApp.baseline.test.ts`
    - health
    - exact-origin CORS
    - 404 structured error
    - 500 structured error
    - security headers
  - `src/routes/book/search/test/route.test.ts`
    - query validation
    - upstream success/empty/error
    - fixture success/error
  - `src/routes/book/detail/test/route.test.ts`
    - param validation
    - upstream success/error
    - fixture rich/minimal/empty/error
  - `src/routes/library/search/test/route.test.ts`
    - query validation
    - upstream success/empty/error
    - fixture success/error
  - `src/routes/library/availability/test/route.test.ts`
    - param validation
    - upstream success/error
    - fixture available/unavailable/not-owned/error
- BFF test 파일은 runtime 파일 옆이 아니라, 대상 코드와 같은 depth의 `test/` 폴더에 둔다.
- route integration test는 각 route 폴더의 `test/` 하위에 둔다.
- app baseline test도 `src/app/test`에 둔다.
- 공통 helper 허용 범위는 아래로 제한한다.
  - 기본 env setup
  - `fetchLibraryApi` mock wiring
  - JSON `Response` 생성 helper
- assertion 문장, request URL, route별 기대 응답은 각 테스트 파일에 직접 남긴다.
- 하나의 shared test util이 route-specific assertion까지 숨기면 안 된다.

### 3. `src/routes` 도메인 폴더 구조

- 목표 구조는 아래로 고정한다.

```text
apps/bff/src/routes/
  book/
    detail/
      normalizeResponse.ts
      parseParams.ts
      route.ts
      test/
        normalizeResponse.test.ts
        parseParams.test.ts
        route.test.ts
    search/
      normalizeResponse.ts
      parseQuery.ts
      route.ts
      test/
        normalizeResponse.test.ts
        parseQuery.test.ts
        route.test.ts
  health/
    route.ts
  library/
    availability/
      parseParams.ts
      normalizeResponse.ts
      route.ts
      test/
        parseParams.test.ts
        normalizeResponse.test.ts
        route.test.ts
    search/
      route.ts
      test/
        route.test.ts
  index.ts
```

- 완료된 도메인에 대해 production route code가 `src/routes` 루트 flat 파일로 남아 있으면 안 된다.
- `routes/index.ts`는 새 도메인 폴더에서 route register만 담당한다.
- `book/search`, `book/detail`, `library/availability`는 parse/normalize 책임이 명확하므로 helper를 같은 도메인 경로에 분리 유지한다.
- `library/search`는 아직 route-local helper를 같은 파일 안에 두는 상태지만, 기준 자체는 helper 분리 쪽으로 맞춘다.
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
        test/
          fixture.test.ts
      search/
        books.ts
        fixture.ts
        test/
          fixture.test.ts
    library/
      availability/
        fixture.ts
        holdings.ts
        test/
          fixture.test.ts
      search/
        libraries.ts
        fixture.ts
        test/
          fixture.test.ts
    index.ts
  index.ts
```

- fixture test도 fixture source와 같은 depth의 `test/` 폴더로 이동한다.
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

- `AppFixtures`, `CreateAppOptions`, `FixtureResolver`는 `app/fixtures.types.ts`에 둔다.
- `Result<T>`는 `utils/result.types.ts`에 둔다.
- route, helper, dev fixture는 공용 타입을 재선언하지 않고 `import type`으로 재사용한다.

- `src/index.ts`는 production bootstrap만 담당한다.
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
  - `dev`: dev bootstrap 진입점 사용
  - `typecheck`: `tsconfig.json --noEmit` 기준 전체 `src` 검사
  - `build`: contracts declaration build 후 `tsconfig.build.json` 기준 production `src` runtime만 emit
  - `start`: production `dist/index.js`
- `apps/bff/tsconfig.build.json`은 아래를 만족해야 한다.
  - `src` runtime 파일만 emit 대상으로 둔다.
  - `src/**/test/**`와 `**/*.test.ts`는 emit 대상에서 제외한다.
  - `@nearby-library-search/contracts`는 workspace source가 아니라 `packages/contracts/dist/src/index.d.ts` declaration output을 바라본다.
- acceptance는 아래로 고정한다.
  - production runtime entrypoint가 dev fixture source를 import하지 않는다.
  - fresh workspace 기준 `pnpm --filter @nearby-library-search/bff build`가 test/dev fixture를 emit하지 않고 통과한다.

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

- `src/app/test/createApp.baseline.test.ts`는 아래만 검증한다.
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
- route integration test는 `fetchLibraryApi` mock을 경계로 유지한다.
- route/helper/fixture test는 모두 대상 코드와 같은 depth의 `test/` 폴더에 둔다.

### 3. pure helper test

- 분리 유지한 pure helper만 focused test를 유지한다.
  - `book search` parse/normalize
  - `book detail` parse/normalize
  - `library availability` parse/normalize
  - fixture source validation
- route-local helper는 정말 분리 이득이 없는 경우에만 같은 파일 안에 둔다.

### 4. fixture/build 검증

- `USE_DEV_FIXTURES=true` + dev bootstrap에서 fixture route가 정상 동작한다.
- production bootstrap에서 fixture registry 없이 `USE_DEV_FIXTURES=true`면 부팅이 실패한다.
- production build는 `apps/bff/dev/**`와 `src/**/test/**`를 emit하지 않아야 한다.

## Acceptance 기준

- 더 이상 단일 테스트 파일이 모든 BFF regression을 담당하지 않는다.
- 완료된 각 도메인에 대해 production route code, route integration test, route-owned helper가 같은 도메인 폴더 안에 있다.
- 완료된 도메인에 대한 flat production 파일이 `src/routes` 루트에 남아 있지 않다.
- `src/routes` 루트는 최종적으로 `index.ts`와 도메인 폴더만 남는다.
- fixture source는 production `src` 밖에 존재하며, production build에서 emit되지 않는다.
- route 공개 계약과 fixture regression은 모두 유지된다.
- `pnpm --filter @nearby-library-search/bff exec vitest run`, `pnpm --filter @nearby-library-search/bff typecheck`, `pnpm --filter @nearby-library-search/bff build`를 계속 통과한다.

## Assumptions

- 이번 phase는 코드 가독성과 배포 경계를 위한 구조 리팩터링이므로, 사용자 가시 기능 변화는 없다.
- fixture는 dev/test 전용으로만 유지하고, production runtime에서 켤 수 없는 구조를 목표로 한다.
- 테스트 파일 수 증가는 허용하지만, 각 파일은 한 가지 목적만 담당해야 한다.
- `dev` 경계 코드는 production `tsc` 대상이 아니며, fixture 회귀는 Vitest로 계속 검증한다.
- production build 결과 평가는 fresh CI workspace를 기준으로 하고, local stale artifact cleanup까지 build 책임으로 두지 않는다.
