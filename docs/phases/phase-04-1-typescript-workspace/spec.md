# Phase 4-1. TypeScript Workspace 정리

## 목표

- 루트 `tsconfig.json`을 에러를 발생시키는 placeholder가 아니라 workspace 전체 TypeScript 진입점으로 재구성한다.
- `apps/web`, `apps/bff`, `packages/contracts`의 TypeScript 관계를 project references 기준으로 명확히 정리한다.
- 루트 타입체크 흐름을 `tsc -b` 기반으로 정상화해 Phase 5 기능 구현 전에 모노레포 타입 안정성을 확보한다.
- 기존 `build`, `lint`, `test` 흐름과 충돌하지 않는 범위에서 TypeScript 설정 구조를 정리한다.

## 기술 결정

- 루트 `tsconfig.json`: solution-style workspace 진입점
- 공통 옵션 계층: `tsconfig.base.json`, `tsconfig.web.json`, `tsconfig.server.json` 유지
- 루트 타입체크 방식: `tsc -b` 기반 project graph 타입체크
- 참조 대상 타입 패키지: `packages/contracts`
- `packages/contracts` 산출물 정책: declaration-only 타입 산출물
- `apps/web` 프로젝트 성격: `composite + noEmit` 기반 앱 프로젝트
- `apps/bff` 프로젝트 성격: `composite` 기반 서버 프로젝트
- TypeScript 버전 기준: 현재 루트 devDependency `typescript@^6.0.2`

## 구현 범위

- 루트 `tsconfig.json`을 workspace TypeScript 진입점으로 재구성한다.
- `packages/contracts`를 project references가 가능한 타입 패키지로 정리한다.
- `apps/web`, `apps/bff`의 `tsconfig`를 references 흐름에 맞게 조정한다.
- 루트 `typecheck` 스크립트와 관련 검증 진입점을 정상화한다.
- TypeScript workspace 기준을 README와 후속 문서가 참조할 수 있게 정리한다.
- Phase 4-1 구현을 바로 분해할 수 있는 `task.md` 작성 기준을 마련한다.

## 비범위

- Vite, Fastify, Vitest, ESLint 도구 자체를 교체하는 작업
- 프론트엔드 alias 체계 전면 변경
- `entities`, `features`, `pages` 레이어의 기능 구현
- `packages/contracts`에 runtime value export를 추가하는 작업
- 배포 파이프라인, CI/CD 설정, release automation 도입
- TypeScript 외 설정 전체를 모노레포 솔루션 스타일로 일괄 전환하는 작업

## 정리 전 문제 상태

- 루트 `tsconfig.json`은 현재 `{"files": []}`만 포함하고 있어 `pnpm exec tsc -p tsconfig.json` 실행 시 `TS18002`를 발생시킨다.
- 루트 `package.json`의 `typecheck:all`은 `pnpm -r --if-present exec tsc -p tsconfig.json` 형태라 현재 정상 동작하지 않는다.
- `tsconfig.base.json`, `tsconfig.web.json`, `tsconfig.server.json`은 이미 공통 옵션 계층으로 사용 중이다.
- `apps/web/tsconfig.json`은 `../../tsconfig.web.json`을 확장하고 `@/*` alias와 `src` include만 가진다.
- `apps/bff/tsconfig.json`은 `../../tsconfig.server.json`을 확장하고 `rootDir`, `outDir`를 가진다.
- `packages/contracts/tsconfig.json`은 `noEmit: true`라 project references의 참조 대상이 될 수 없다.
- 현재 코드베이스에서 `@nearby-library-search/contracts`는 web, bff 모두 `import type`로만 사용하고 있다.
- `packages/contracts/package.json`의 `types`는 현재 `./src/index.ts`를 가리킨다.

## 현재 구현 기준

- 루트 `tsconfig.json`은 `packages/contracts`, `apps/web`, `apps/bff`를 reference로 가지는 solution-style workspace entrypoint다.
- 루트 `package.json`의 `typecheck:all`은 `pnpm exec tsc -b tsconfig.json`으로 정리됐다.
- `packages/contracts/tsconfig.json`은 `composite + declaration + emitDeclarationOnly + outDir=dist` 기준의 declaration-only upstream project다.
- `packages/contracts/package.json`의 `types`는 `./dist/src/index.d.ts`를 가리킨다.
- `apps/web/tsconfig.json`은 `composite + noEmit`을 유지하면서 `packages/contracts` reference와 source path alias를 함께 가진다.
- `apps/bff/tsconfig.json`은 `composite`을 유지하면서 `packages/contracts` reference와 source path alias를 함께 가진다.

## 디렉터리 기준

- 루트
  - `tsconfig.json`: workspace solution entrypoint
  - `tsconfig.base.json`: 공통 TypeScript 규칙
  - `tsconfig.web.json`: 웹 앱 공통 설정
  - `tsconfig.server.json`: 서버 공통 설정
- `apps/web`
  - 브라우저 번들러 기반 앱 프로젝트
  - `packages/contracts`를 참조하는 consumer project
- `apps/bff`
  - NodeNext 기반 서버 프로젝트
  - `packages/contracts`를 참조하는 consumer project
- `packages/contracts`
  - workspace 내 공통 타입 패키지
  - 다른 프로젝트가 참조 가능한 declaration-only project

## TypeScript Workspace 상세 설계

### 1. 루트 solution `tsconfig`

- 루트 `tsconfig.json`은 직접 소스 파일을 컴파일하지 않는다.
- 루트 `tsconfig.json`은 `include: []`와 `references`만 가진 workspace graph entrypoint로 동작한다.
- 루트 `references` 대상은 아래 3개로 고정한다.
  - `./packages/contracts`
  - `./apps/web`
  - `./apps/bff`
- 루트 `tsconfig.json`은 설정 공유용 `extends` 파일이 아니라, 전체 타입체크 오케스트레이션 진입점으로 사용한다.
- 루트 `tsconfig.json` 자체에 app/server 전용 옵션을 직접 넣지 않는다.

예시 형태:

```json
{
  "include": [],
  "references": [
    { "path": "./packages/contracts" },
    { "path": "./apps/web" },
    { "path": "./apps/bff" }
  ]
}
```

### 2. 공통 옵션 계층

- `tsconfig.base.json`은 strictness, 공통 언어 옵션, unused 규칙 같은 저장소 공통 정책만 유지한다.
- `tsconfig.web.json`은 브라우저/번들러 계열 옵션만 유지한다.
- `tsconfig.server.json`은 NodeNext/서버 계열 옵션만 유지한다.
- solution-style 전환 후에도 `base`, `web`, `server` 계층은 유지한다.
- 새 phase에서는 이 계층을 제거하지 않고 references가 가능하도록 보강만 한다.

### 3. `packages/contracts` project references 기준

- `packages/contracts`는 다른 프로젝트가 참조하는 upstream TypeScript project다.
- 따라서 `packages/contracts`는 `noEmit: true`를 유지하지 않는다.
- `packages/contracts`는 아래 기준으로 정리한다.
  - `composite: true`
  - `declaration: true`
  - `emitDeclarationOnly: true`
  - declaration 산출물용 `outDir` 지정
- `packages/contracts`는 runtime JavaScript 패키지가 아니라 declaration-only 타입 패키지로 유지한다.
- 현재 web/bff에서 value import가 없으므로 declaration-only 정책을 채택한다.
- `packages/contracts/package.json`의 `types`는 declaration output 경로를 가리키도록 정리한다.
- 필요 시 `build` 스크립트는 계속 `tsc -p tsconfig.json`을 사용하되, 결과가 declaration output을 만들도록 맞춘다.

### 4. `apps/web` project references 기준

- `apps/web`는 Vite가 실제 빌드를 담당하므로 TypeScript는 타입체크 전용으로 사용한다.
- `apps/web/tsconfig.json`은 아래 기준으로 정리한다.
  - `composite: true`
  - `noEmit: true`
  - 기존 `@/*` alias 유지
  - `@nearby-library-search/contracts -> ../../packages/contracts/src/index.ts` source path alias 추가
  - `packages/contracts` reference 추가
- `apps/web`는 참조 대상이 아니라 consumer project이므로 `noEmit: true`를 유지할 수 있다.
- `apps/web`는 declaration 산출물을 만들지 않는다.
- `apps/web`는 여전히 `tsconfig.web.json`을 확장한다.
- source path alias는 개별 `pnpm typecheck:web` 실행 시 prebuilt declaration 산출물에 의존하지 않도록 유지한다.

### 5. `apps/bff` project references 기준

- `apps/bff`는 Node 서버용 consumer project다.
- `apps/bff/tsconfig.json`은 아래 기준으로 정리한다.
  - `composite: true`
  - 기존 `rootDir`, `outDir` 유지
  - `@nearby-library-search/contracts -> ../../packages/contracts/src/index.ts` source path alias 추가
  - `packages/contracts` reference 추가
- `apps/bff`는 서버 빌드가 필요하므로 현재 emit 구조를 유지한다.
- `apps/bff`는 여전히 `tsconfig.server.json`을 확장한다.
- source path alias는 개별 `pnpm typecheck:bff` 실행 시 prebuilt declaration 산출물에 의존하지 않도록 유지한다.

### 6. scripts와 타입체크 진입점

- 루트 `typecheck:web`와 `typecheck:bff`는 각 패키지의 직접 타입체크 용도로 유지할 수 있다.
- 루트 `typecheck:all`은 workspace graph를 타는 명령으로 교체한다.
- 권장 기준은 아래와 같다.
  - `typecheck:all`: `pnpm exec tsc -b tsconfig.json`
- 필요 시 `typecheck:contracts`를 추가해 contracts만 독립 검증할 수 있게 한다.
- `build:web`, `build:bff`, `build:all`은 기존 빌드 역할을 유지한다.
- TypeScript solution-style 전환이 곧 전체 빌드 파이프라인 교체를 의미하지는 않는다.

### 7. references와 import 기준

- `references`는 TypeScript project graph를 설명하는 설정이다.
- `extends`는 공통 옵션 공유 용도이고, `references`를 대체하지 않는다.
- `packages/contracts`는 upstream project로 두고, `apps/web`, `apps/bff`가 이를 참조한다.
- `apps/web`, `apps/bff`는 package resolution과 별도로 `paths`를 통해 `@nearby-library-search/contracts`를 source entry로 해석한다.
- `apps/web`와 `apps/bff`가 서로를 직접 참조하는 구조는 도입하지 않는다.
- `features`, `entities`, `shared`의 import 규칙은 이번 phase 범위에서 변경하지 않는다.

### 8. 문서와 운영 기준

- 루트 README에는 workspace TypeScript 기준과 루트 타입체크 명령을 반영한다.
- Phase 4-1 문서는 Phase 5 전에 수행해야 하는 안정화 단계로 기록한다.
- 후속 `task.md`는 설정 파일 변경, script 변경, 검증 순서를 작은 작업 단위로 분해한다.

## 현재 구현 결과 목표

- 루트 `tsconfig.json`은 더 이상 에러를 만드는 placeholder가 아니다.
- 루트 `tsconfig.json`은 workspace graph 진입점으로 동작한다.
- `packages/contracts`는 project references의 참조 대상이 될 수 있는 선언 파일 산출 구조를 가진다.
- `apps/web`, `apps/bff`는 `packages/contracts` reference를 가진 consumer project로 정리된다.
- 루트 `typecheck:all`은 실제 동작하는 workspace 타입체크 명령이 된다.
- TypeScript workspace 구조가 Phase 5 기능 구현 전에 안정화된다.

## 산출물

- solution-style 루트 `tsconfig.json`
- project reference 친화 설정으로 정리된 `packages/contracts`
- references가 연결된 `apps/web`, `apps/bff` `tsconfig`
- 정상 동작하는 루트 타입체크 스크립트
- Phase 4-1 `task.md`

## 완료 기준

- 루트 `tsconfig.json` 실행 시 `TS18002`가 더 이상 발생하지 않는다.
- 루트에서 workspace project graph를 기준으로 타입체크를 시작할 수 있다.
- `packages/contracts`는 다른 프로젝트가 참조 가능한 선언 파일 산출 구조를 가진다.
- `apps/web`, `apps/bff`는 `packages/contracts` reference를 포함한 TypeScript 프로젝트로 정리된다.
- 루트 `typecheck:all`이 정상 동작한다.
- 기존 web/bff/contracts의 개별 타입체크 및 빌드 흐름이 회귀 없이 유지된다.
- README와 후속 문서가 TypeScript workspace 기준을 참조할 수 있다.

## 테스트 기준

- `pnpm exec tsc -b tsconfig.json` 또는 동등한 루트 타입체크 명령이 성공한다.
- `pnpm run typecheck:all`이 정상 동작한다.
- `pnpm typecheck:web`가 성공한다.
- `pnpm typecheck:bff`가 성공한다.
- `pnpm --filter @nearby-library-search/contracts build`가 성공한다.
- `pnpm lint:web`, `pnpm test:run`, `pnpm build:web`, `pnpm build:bff`가 기존처럼 동작한다.
- `@nearby-library-search/contracts`는 계속 type-only 패키지 사용 기준을 유지한다.

## 후속 연결 포인트

- Phase 4-1 완료 후 Phase 5에서 기능 구현 중 루트 타입체크와 패키지 간 타입 추적이 안정적으로 동작해야 한다.
- 이후 contracts에 runtime schema/value export가 필요해지면 declaration-only 정책을 재검토할 수 있다.
- CI를 도입할 때는 루트 `typecheck:all`을 workspace 기본 타입체크 진입점으로 사용할 수 있다.

## 기본 가정

- 현재 저장소는 `apps/web`, `apps/bff`, `packages/contracts` 구조를 유지한다.
- `packages/contracts`는 당분간 타입 전용 패키지로 유지한다.
- `apps/web`는 Vite 빌드, `apps/bff`는 `tsc` 빌드 구조를 유지한다.
- Phase 5 기능 구현은 Phase 4-1의 TypeScript workspace 정리가 끝난 뒤 진행한다.
