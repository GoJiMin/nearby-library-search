# Phase 6-2. BFF 구조 리팩터링 Task

## 1. `createApp` baseline integration test를 분리한다.

- [x] `apps/bff/src/app/test/createApp.baseline.test.ts`를 추가한다.
- [x] health, exact-origin CORS, preflight, 404/500 structured error, security headers 검증을 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`에서는 baseline 관련 assertion을 제거한다.
- [x] baseline test가 `createApp().inject()` 기준을 그대로 유지하는지 확인한다.

## 2. book search route integration test를 분리한다.

- [x] `apps/bff/src/routes/book/search/test/route.test.ts`를 추가한다.
- [x] 도서 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [x] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 book search 관련 assertion을 제거한다.

## 3. library search route integration test를 분리한다.

- [x] `apps/bff/src/routes/library/search/test/route.test.ts`를 추가한다.
- [x] 도서관 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [x] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 library search 관련 assertion을 제거한다.

## 4. book detail route integration test를 분리한다.

- [x] `apps/bff/src/routes/book/detail/test/route.test.ts`를 추가한다.
- [x] 도서 상세 param validation, upstream success/error, 응답 정규화 회귀를 새 파일로 옮긴다.
- [x] fixture rich/minimal/empty/error/miss 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 book detail 관련 assertion을 제거한다.

## 5. library availability route integration test를 분리한다.

- [x] `apps/bff/src/routes/library/availability/test/route.test.ts`를 추가한다.
- [x] availability param validation, upstream success/error, 응답 정규화 회귀를 새 파일로 옮긴다.
- [x] fixture available/unavailable/not-owned/error 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 availability 관련 assertion을 제거하고 legacy test 파일을 제거한다.

## 6. `src/routes` 도메인 폴더 시작점을 정리한다.

- [x] `apps/bff/src/routes/book`, `apps/bff/src/routes/library`, `apps/bff/src/routes/health` 폴더를 기준 구조로 만든다.
- [x] `health` route를 `apps/bff/src/routes/health/route.ts`로 옮긴다.
- [x] `apps/bff/src/routes/index.ts`가 새 도메인 경로 전환을 시작하도록 정리한다.
- [x] 이 단계는 도메인 package 완성 이전의 뼈대 정리 단계로만 간주한다.

## 7. fixture 주입 경계를 먼저 도입한다.

- [x] `createApp(options?: {fixtures?: AppFixtures})` 형태의 주입 경계를 추가한다.
- [x] `registerRoutes(app, options?)`가 주입받은 fixture resolver를 route에 전달할 수 있게 정리한다.
- [x] route 코드가 fixture resolver를 정적으로 import하지 않도록 전환한다.
- [x] 이 주입 경계가 생기기 전에는 어떤 도메인도 완료로 처리하지 않는다.

## 8. book search 도메인 package를 완성한다.

- [x] `apps/bff/src/routes/book/search` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [x] `book search` fixture data, resolver, resolver test를 `apps/bff/dev/fixtures/book/search`로 이동한다.
- [x] `bookSearchFixture.builders.ts`는 별도 파일로 유지하지 않고 fixture data 파일로 흡수한다.
- [x] `book search` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 9. book detail 도메인 package를 완성한다.

- [x] `apps/bff/src/routes/book/detail` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [x] `book detail` fixture source와 fixture test를 `apps/bff/dev/fixtures/book/detail`로 이동한다.
- [x] route-local helper는 같은 도메인 경로에 두고, 불필요한 flat helper를 남기지 않는다.
- [x] `book detail` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 10. 공용 타입 경계와 type-only 파일 naming을 정리한다.

- [x] `fixtures.ts`처럼 runtime 파일로 오해될 수 있는 type-only 파일을 `*.types.ts` 규칙으로 정리한다.
- [x] `Result<T>`를 `apps/bff/src/utils/result.types.ts`로 공용화하고 route, helper, dev fixture의 중복 정의를 제거한다.
- [x] 현재 BFF에서 확인된 type-only 파일이 `fixtures.types.ts`, `result.types.ts`라는 점을 기준으로 남은 naming 규칙을 고정한다.
- [x] 이 정리 없이 다음 도메인 package task를 진행하지 않는다.

## 11. library search 도메인 package를 완성한다.

- [x] `apps/bff/src/routes/library/search` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [x] `library search` fixture source와 fixture test를 `apps/bff/dev/fixtures/library/search`로 이동한다.
- [x] route-local helper는 같은 도메인 경로에 두고, 불필요한 flat helper를 남기지 않는다.
- [x] `library search` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 12. library availability 도메인 package를 완성한다.

- [x] `apps/bff/src/routes/library/availability` 안에 route, parse helper, normalize helper, route/helper test가 함께 남도록 정리한다.
- [x] `library availability` fixture source와 fixture test를 `apps/bff/dev/fixtures/library/availability`로 이동한다.
- [x] availability는 parse/normalize 분리 유지 원칙을 지키되, 관련 파일이 도메인 폴더 밖에 흩어지지 않게 한다.
- [x] `library availability` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 13. BFF 테스트 파일을 test 폴더 규칙으로 재배치한다.

- [x] `src` 아래 BFF test 파일을 대상 코드와 같은 depth의 `test/` 폴더로 옮긴다.
- [x] `dev/fixtures` 아래 fixture test 파일도 같은 규칙으로 `test/` 폴더로 옮긴다.
- [x] `*.test.ts`가 runtime 파일 옆에 직접 남지 않도록 import 경로까지 함께 정리한다.
- [x] `spec.md`, `task.md`, `plan.md`, 루트 `AGENTS.md`에 같은 규칙을 반영한다.

## 14. production/dev bootstrap을 마감한다.

- [x] `apps/bff/dev/fixtures/index.ts`에서 전체 fixture registry를 조합한다.
- [x] `apps/bff/src/main.ts`는 production bootstrap만 담당하게 정리한다.
- [x] `apps/bff/dev/main.ts`를 추가해 dev bootstrap에서만 fixture registry를 연결한다.
- [x] production bootstrap에서 `USE_DEV_FIXTURES=true`인데 fixture registry가 없으면 fail-fast 하도록 고정한다.
- [x] `apps/bff/package.json`의 `dev` 스크립트가 dev bootstrap을 사용하도록 정리한다.

## 15. production build 경계를 정리한다.

- [x] `apps/bff/tsconfig.build.json`을 추가해 production emit 대상을 `src` runtime 파일로 한정한다.
- [x] `apps/bff/package.json`에 `build`와 `typecheck`를 분리해 production emit과 전체 검사 경계를 나눈다.
- [x] production build에서 `test/` 산출물과 dev fixture source가 emit되지 않도록 고정한다.

## 16. 최종 검증과 문서 동기화를 마감한다.

- [x] `pnpm --filter @nearby-library-search/bff exec vitest run`을 통과시킨다.
- [x] `pnpm --filter @nearby-library-search/bff typecheck`를 통과시킨다.
- [x] `pnpm --filter @nearby-library-search/bff build`를 통과시킨다.
- [x] fresh build 기준으로 production emit 대상에 dev/test 파일이 포함되지 않는지 확인한다.
- [x] `spec.md`, `task.md`, `plan.md`의 Phase 6-2 상태를 실제 구현과 동기화한다.

## Important Changes

- 이번 phase는 공개 `/api` 계약을 바꾸지 않고 BFF 내부 구조만 리팩터링한다.
- `createApp.test.ts` 단일 파일 구조를 해체하고 app baseline과 route별 integration test로 분리한다.
- `src/routes`는 단순 뼈대가 아니라, 각 도메인의 production route code와 test가 함께 있는 package 구조로 재정리한다.
- BFF test 파일은 runtime 파일 옆에 직접 두지 않고, 대상 코드와 같은 depth의 `test/` 폴더에 둔다.
- fixture는 production `src`에서 분리된 `dev` 경계로 옮기고, production bootstrap에서는 직접 import하지 않는다.
- production build는 `tsconfig.build.json` 기준으로 test/dev fixture 산출물을 emit하지 않아야 한다.
- route 파일 하나만 옮긴 상태는 완료로 보지 않고, fixture와 helper까지 포함한 도메인 package completion을 기준으로 닫는다.
- type-only 파일은 `*.types.ts`로만 두고, 공용 `Result<T>` 같은 내부 타입은 한 곳에서 재사용한다.

## Test Plan

- app baseline
  - health
  - CORS allow/block
  - preflight
  - 404/500 structured error
  - security headers
- route integration
  - book search
  - library search
  - book detail
  - library availability
- pure helper / fixture
  - availability parse/normalize
  - fixture source validation
  - production bootstrap fail-fast
  - production build에 test/dev fixture 미포함

## Assumptions

- `task.md` 경로는 `docs/phases/phase-06-2-bff-structure-refactor/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- 하나의 task는 한 가지 구조 문제만 해결하도록 유지한다.
- route generic factory 같은 과한 공용화는 이번 phase에서 도입하지 않는다.
- production build 산출물 정리는 fresh CI workspace 기준으로 판단하고, local stale artifact cleanup까지 build 책임으로 두지 않는다.
