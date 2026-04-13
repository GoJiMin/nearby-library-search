# Phase 6-2. BFF 구조 리팩터링 Task

## 1. `createApp` baseline integration test를 분리한다.

- [ ] `apps/bff/src/app/createApp.baseline.test.ts`를 추가한다.
- [ ] health, exact-origin CORS, preflight, 404/500 structured error, security headers 검증을 새 파일로 옮긴다.
- [ ] 기존 `createApp.test.ts`에서는 baseline 관련 assertion을 제거한다.
- [ ] baseline test가 `createApp().inject()` 기준을 그대로 유지하는지 확인한다.

## 2. book search route integration test를 분리한다.

- [ ] `apps/bff/src/routes/book/search/route.test.ts`를 추가한다.
- [ ] 도서 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [ ] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [ ] 기존 `createApp.test.ts`의 book search 관련 assertion을 제거한다.

## 3. library search route integration test를 분리한다.

- [ ] `apps/bff/src/routes/library/search/route.test.ts`를 추가한다.
- [ ] 도서관 검색 query validation, upstream success/empty/error 회귀를 새 파일로 옮긴다.
- [ ] fixture success, fixture pagination, fixture resolver failure 회귀를 새 파일로 옮긴다.
- [ ] 기존 `createApp.test.ts`의 library search 관련 assertion을 제거한다.

## 4. book detail route integration test를 분리한다.

- [ ] `apps/bff/src/routes/book/detail/route.test.ts`를 추가한다.
- [ ] 도서 상세 param validation, upstream success/error, 응답 정규화 회귀를 새 파일로 옮긴다.
- [ ] fixture rich/minimal/empty/error/miss 회귀를 새 파일로 옮긴다.
- [ ] 기존 `createApp.test.ts`의 book detail 관련 assertion을 제거한다.

## 5. library availability route integration test를 분리한다.

- [ ] `apps/bff/src/routes/library/availability/route.test.ts`를 추가한다.
- [ ] availability param validation, upstream success/error, 응답 정규화 회귀를 새 파일로 옮긴다.
- [ ] fixture available/unavailable/not-owned/error 회귀를 새 파일로 옮긴다.
- [ ] 기존 `createApp.test.ts`의 availability 관련 assertion을 제거하고 legacy test 파일을 제거한다.

## 6. `src/routes` 도메인 폴더 뼈대를 정리한다.

- [ ] `apps/bff/src/routes/book`, `apps/bff/src/routes/library`, `apps/bff/src/routes/health` 폴더를 기준 구조로 만든다.
- [ ] `health` route를 `apps/bff/src/routes/health/route.ts`로 옮긴다.
- [ ] `apps/bff/src/routes/index.ts`가 새 도메인 경로만 register 하도록 정리한다.
- [ ] 불필요한 flat route import 경로를 더 이상 유지하지 않는다.

## 7. book search route 파일 구조를 리팩터링한다.

- [ ] `apps/bff/src/routes/book/search/route.ts`로 route plugin을 이동한다.
- [ ] parse, upstream fetch, normalize, logging helper는 route-local 기준으로 유지한다.
- [ ] route 관련 import 경로를 새 폴더 구조에 맞게 갱신한다.
- [ ] 리팩터링 후 book search route test가 계속 통과하는지 확인한다.

## 8. book detail route 파일 구조를 리팩터링한다.

- [ ] `apps/bff/src/routes/book/detail/route.ts`로 route plugin을 이동한다.
- [ ] parse, upstream fetch, normalize, logging helper는 route-local 기준으로 유지한다.
- [ ] route 관련 import 경로를 새 폴더 구조에 맞게 갱신한다.
- [ ] 리팩터링 후 book detail route test가 계속 통과하는지 확인한다.

## 9. library search route 파일 구조를 리팩터링한다.

- [ ] `apps/bff/src/routes/library/search/route.ts`로 route plugin을 이동한다.
- [ ] parse, upstream fetch, normalize, logging helper는 route-local 기준으로 유지한다.
- [ ] route 관련 import 경로를 새 폴더 구조에 맞게 갱신한다.
- [ ] 리팩터링 후 library search route test가 계속 통과하는지 확인한다.

## 10. library availability route 파일 구조를 리팩터링한다.

- [ ] `apps/bff/src/routes/library/availability/route.ts`로 route plugin을 이동한다.
- [ ] `parseParams.ts`, `normalizeResponse.ts`와 해당 focused test를 같은 도메인 폴더로 이동한다.
- [ ] availability는 parse/normalize 분리 유지 원칙을 지킨다.
- [ ] 리팩터링 후 availability route test와 pure helper test가 계속 통과하는지 확인한다.

## 11. book fixture를 dev/test 전용 경계로 이동한다.

- [ ] `apps/bff/dev/fixtures/book/search`, `apps/bff/dev/fixtures/book/detail` 구조를 추가한다.
- [ ] book search fixture data/resolver/test를 dev 경계로 이동한다.
- [ ] book detail fixture data/resolver/test를 dev 경계로 이동한다.
- [ ] `bookSearchFixture.builders.ts`는 별도 파일로 유지하지 않고 fixture data 파일로 흡수한다.

## 12. library fixture를 dev/test 전용 경계로 이동한다.

- [ ] `apps/bff/dev/fixtures/library/search`, `apps/bff/dev/fixtures/library/availability` 구조를 추가한다.
- [ ] library search fixture data/resolver/test를 dev 경계로 이동한다.
- [ ] library availability fixture data/resolver/test를 dev 경계로 이동한다.
- [ ] `apps/bff/dev/fixtures/index.ts`에서 전체 fixture registry를 조합한다.

## 13. production/dev bootstrap과 fixture 주입 구조를 재설계한다.

- [ ] `createApp(options?: {fixtures?: AppFixtures})` 형태로 fixture 주입 경계를 추가한다.
- [ ] `registerRoutes(app, options?)`가 주입받은 fixture resolver만 사용하도록 바꾼다.
- [ ] `apps/bff/src/main.ts`는 production bootstrap만 담당하게 정리한다.
- [ ] `apps/bff/dev/main.ts`를 추가해 dev bootstrap에서만 fixture registry를 연결한다.
- [ ] production bootstrap에서 `USE_DEV_FIXTURES=true`인데 fixture registry가 없으면 fail-fast 하도록 고정한다.
- [ ] `apps/bff/package.json`의 `dev` 스크립트가 dev bootstrap을 사용하도록 정리한다.

## 14. 최종 검증과 문서 동기화를 마감한다.

- [ ] `pnpm --filter @nearby-library-search/bff exec vitest run`을 통과시킨다.
- [ ] `pnpm --filter @nearby-library-search/bff exec tsc -p tsconfig.json`을 통과시킨다.
- [ ] `pnpm --filter @nearby-library-search/bff build`를 통과시킨다.
- [ ] production build 산출물에 fixture source가 포함되지 않는지 확인한다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 6-2 상태를 실제 구현과 동기화한다.

## Important Changes

- 이번 phase는 공개 `/api` 계약을 바꾸지 않고 BFF 내부 구조만 리팩터링한다.
- `createApp.test.ts` 단일 파일 구조를 해체하고 app baseline과 route별 integration test로 분리한다.
- `src/routes`는 flat 구조를 버리고 book/library/health 도메인 폴더 기준으로 재정리한다.
- fixture는 production `src`에서 분리된 `dev` 경계로 옮기고, production bootstrap에서는 직접 import하지 않는다.

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
