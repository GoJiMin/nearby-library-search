# Phase 6-2. BFF 구조 리팩터링 Task

## 1. `createApp` baseline integration test를 분리한다.

- [x] `apps/bff/src/app/createApp.baseline.test.ts`를 추가한다.
- [x] health, exact-origin CORS, preflight, 404/500 structured error, security headers 검증을 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`에서는 baseline 관련 assertion을 제거한다.
- [x] baseline test가 `createApp().inject()` 기준을 그대로 유지하는지 확인한다.

## 2. book search route integration test를 분리한다.

- [x] `apps/bff/src/routes/book/search/route.test.ts`를 추가한다.
- [x] 도서 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [x] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 book search 관련 assertion을 제거한다.

## 3. library search route integration test를 분리한다.

- [x] `apps/bff/src/routes/library/search/route.test.ts`를 추가한다.
- [x] 도서관 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [x] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 library search 관련 assertion을 제거한다.

## 4. book detail route integration test를 분리한다.

- [x] `apps/bff/src/routes/book/detail/route.test.ts`를 추가한다.
- [x] 도서 상세 param validation, upstream success/error, 응답 정규화 회귀를 새 파일로 옮긴다.
- [x] fixture rich/minimal/empty/error/miss 회귀를 새 파일로 옮긴다.
- [x] 기존 `createApp.test.ts`의 book detail 관련 assertion을 제거한다.

## 5. library availability route integration test를 분리한다.

- [x] `apps/bff/src/routes/library/availability/route.test.ts`를 추가한다.
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

- [ ] `apps/bff/src/routes/book/search` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [ ] `book search` fixture data, resolver, resolver test를 `apps/bff/dev/fixtures/book/search`로 이동한다.
- [ ] `bookSearchFixture.builders.ts`는 별도 파일로 유지하지 않고 fixture data 파일로 흡수한다.
- [ ] `book search` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 9. book detail 도메인 package를 완성한다.

- [ ] `apps/bff/src/routes/book/detail` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [ ] `book detail` fixture data, resolver, resolver test를 `apps/bff/dev/fixtures/book/detail`로 이동한다.
- [ ] route-local helper는 같은 도메인 경로에 두고, 불필요한 flat helper를 남기지 않는다.
- [ ] `book detail` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 10. library search 도메인 package를 완성한다.

- [ ] `apps/bff/src/routes/library/search` 안에 production route code와 route integration test가 함께 남도록 정리한다.
- [ ] `library search` fixture data, resolver, resolver test를 `apps/bff/dev/fixtures/library/search`로 이동한다.
- [ ] route-local helper는 같은 도메인 경로에 두고, 불필요한 flat helper를 남기지 않는다.
- [ ] `library search` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 11. library availability 도메인 package를 완성한다.

- [ ] `apps/bff/src/routes/library/availability` 안에 route, parse helper, normalize helper, route/helper test가 함께 남도록 정리한다.
- [ ] `library availability` fixture data, resolver, resolver test를 `apps/bff/dev/fixtures/library/availability`로 이동한다.
- [ ] availability는 parse/normalize 분리 유지 원칙을 지키되, 관련 파일이 도메인 폴더 밖에 흩어지지 않게 한다.
- [ ] `library availability` 관련 flat production 파일과 fixture 파일이 `src/routes` 루트에 남지 않도록 제거한다.

## 12. production/dev bootstrap을 마감한다.

- [ ] `apps/bff/dev/fixtures/index.ts`에서 전체 fixture registry를 조합한다.
- [ ] `apps/bff/src/main.ts`는 production bootstrap만 담당하게 정리한다.
- [ ] `apps/bff/dev/main.ts`를 추가해 dev bootstrap에서만 fixture registry를 연결한다.
- [ ] production bootstrap에서 `USE_DEV_FIXTURES=true`인데 fixture registry가 없으면 fail-fast 하도록 고정한다.
- [ ] `apps/bff/package.json`의 `dev` 스크립트가 dev bootstrap을 사용하도록 정리한다.

## 13. 최종 검증과 문서 동기화를 마감한다.

- [ ] `pnpm --filter @nearby-library-search/bff exec vitest run`을 통과시킨다.
- [ ] `pnpm --filter @nearby-library-search/bff exec tsc -p tsconfig.json`을 통과시킨다.
- [ ] `pnpm --filter @nearby-library-search/bff build`를 통과시킨다.
- [ ] production build 산출물에 fixture source가 포함되지 않는지 확인한다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 6-2 상태를 실제 구현과 동기화한다.

## Important Changes

- 이번 phase는 공개 `/api` 계약을 바꾸지 않고 BFF 내부 구조만 리팩터링한다.
- `createApp.test.ts` 단일 파일 구조를 해체하고 app baseline과 route별 integration test로 분리한다.
- `src/routes`는 단순 뼈대가 아니라, 각 도메인의 production route code와 test가 함께 있는 package 구조로 재정리한다.
- fixture는 production `src`에서 분리된 `dev` 경계로 옮기고, production bootstrap에서는 직접 import하지 않는다.
- route 파일 하나만 옮긴 상태는 완료로 보지 않고, fixture와 helper까지 포함한 도메인 package completion을 기준으로 닫는다.

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
  - fixture resolver validation
  - production bootstrap fail-fast
  - production build에 fixture 미포함

## Assumptions

- `task.md` 경로는 `docs/phases/phase-06-2-bff-structure-refactor/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- 하나의 task는 한 가지 구조 문제만 해결하도록 유지한다.
- route generic factory 같은 과한 공용화는 이번 phase에서 도입하지 않는다.
