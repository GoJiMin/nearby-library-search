# Phase 4-1. TypeScript Workspace 정리 Task

## 1. 루트 solution `tsconfig` 진입점 정리

- [ ] 루트 `tsconfig.json`의 placeholder 구조를 제거한다.
- [ ] 루트 `tsconfig.json`에 `files: []`를 유지한다.
- [ ] 루트 `tsconfig.json`에 `packages/contracts` reference를 추가한다.
- [ ] 루트 `tsconfig.json`에 `apps/web` reference를 추가한다.
- [ ] 루트 `tsconfig.json`에 `apps/bff` reference를 추가한다.

## 2. `packages/contracts` TypeScript 설정 정리

- [ ] `packages/contracts/tsconfig.json`에 `composite`를 추가한다.
- [ ] `packages/contracts/tsconfig.json`에서 `noEmit`를 제거한다.
- [ ] `packages/contracts/tsconfig.json`에 `declaration`을 추가한다.
- [ ] `packages/contracts/tsconfig.json`에 `emitDeclarationOnly`를 추가한다.
- [ ] `packages/contracts/tsconfig.json`에 declaration output `outDir`를 지정한다.

## 3. `packages/contracts` 패키지 메타데이터 정리

- [ ] `packages/contracts/package.json`의 `types` 경로를 declaration output 기준으로 수정한다.
- [ ] `packages/contracts`의 `build` 스크립트가 declaration output 구조와 맞는지 확인한다.
- [ ] `packages/*/dist`와 `*.tsbuildinfo`가 현재 `.gitignore` 규칙으로 충분히 제외되는지 확인한다.

## 4. `apps/web` project references 연결

- [ ] `apps/web/tsconfig.json`에 `composite`를 추가한다.
- [ ] `apps/web/tsconfig.json`에 `packages/contracts` reference를 추가한다.
- [ ] `apps/web/tsconfig.json`의 `@/*` alias가 유지되는지 확인한다.
- [ ] `apps/web/tsconfig.json`의 `noEmit` 타입체크 전용 성격이 유지되는지 확인한다.

## 5. `apps/bff` project references 연결

- [ ] `apps/bff/tsconfig.json`에 `composite`를 추가한다.
- [ ] `apps/bff/tsconfig.json`에 `packages/contracts` reference를 추가한다.
- [ ] `apps/bff/tsconfig.json`의 `rootDir`와 `outDir`가 기존 빌드 흐름과 충돌하지 않는지 확인한다.
- [ ] `apps/bff/tsconfig.json`의 NodeNext 서버 설정이 유지되는지 확인한다.

## 6. 루트 타입체크 스크립트 정리

- [ ] 루트 `package.json`의 `typecheck:all`을 `tsc -b` 기반 명령으로 교체한다.
- [ ] 루트 `typecheck:web`가 기존처럼 `apps/web` 직접 타입체크를 유지하는지 확인한다.
- [ ] 루트 `typecheck:bff`가 기존처럼 `apps/bff` 직접 타입체크를 유지하는지 확인한다.
- [ ] 잘못된 `pnpm exec --if-present` 흐름이 남아 있지 않은지 점검한다.

## 7. 루트 TypeScript 진입점 검증

- [ ] `pnpm exec tsc -p tsconfig.json` 실행 시 `TS18002`가 더 이상 발생하지 않는지 확인한다.
- [ ] `pnpm exec tsc -b tsconfig.json`가 성공하는지 확인한다.
- [ ] 루트 `tsconfig.json`이 workspace graph entrypoint로 동작하는지 확인한다.

## 8. 패키지별 회귀 검증

- [ ] `pnpm run typecheck:all`이 성공하는지 확인한다.
- [ ] `pnpm typecheck:web`가 성공하는지 확인한다.
- [ ] `pnpm typecheck:bff`가 성공하는지 확인한다.
- [ ] `pnpm --filter @nearby-library-search/contracts build`가 성공하는지 확인한다.
- [ ] `pnpm lint:web`가 성공하는지 확인한다.
- [ ] `pnpm test:run`이 성공하는지 확인한다.
- [ ] `pnpm build:web`가 성공하는지 확인한다.
- [ ] `pnpm build:bff`가 성공하는지 확인한다.

## 9. 문서 동기화

- [ ] 루트 `README.md`에 TypeScript workspace 기준과 루트 타입체크 명령이 필요하면 반영한다.
- [ ] Phase 4-1 `spec.md`와 실제 구현 결과 차이가 있으면 반영한다.
- [ ] 루트 `plan.md`의 Phase 4-1 진행 기준과 실제 작업 범위가 어긋나지 않는지 확인한다.

## Important Changes

- 루트 `tsconfig.json`은 placeholder가 아니라 solution-style workspace entrypoint가 된다.
- `packages/contracts`는 declaration-only upstream TypeScript project로 정리된다.
- 루트 `typecheck:all`은 `tsc -b` 기반 workspace 타입체크 명령으로 바뀐다.

## Test Plan

- 루트 진입점 검증: `tsc -p`, `tsc -b`
- 패키지 검증: `typecheck:web`, `typecheck:bff`, `contracts build`
- 회귀 검증: `lint:web`, `test:run`, `build:web`, `build:bff`

## Assumptions

- `packages/contracts`는 계속 type-only 패키지로 유지하고 runtime value export는 추가하지 않는다.
- `typecheck:contracts`는 기본 task 범위에 넣지 않고, contracts 검증은 기존 `build`로 처리한다.
- `.gitignore`는 현재 `packages/*/dist`, `*.tsbuildinfo`를 이미 포함하므로 기본적으로 추가 수정 없이 간다.
- task는 구현 순서대로 바로 체크해 나갈 수 있도록 작성하고, 한 체크 항목은 한 파일군 또는 한 검증 책임만 가진다.
