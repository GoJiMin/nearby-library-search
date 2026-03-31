# Web Migration Scope

## `apps/web`로 이동할 대상

- `src/`
- `public/`
- `index.html`
- `components.json`

## 루트에 남길 대상

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.json`
- `tsconfig.base.json`
- `eslint.config.js`
- `README.md`
- `plan.md`
- `AGENTS.md`
- `docs/`

## 이동 기준

- 웹 앱 런타임에 직접 사용되는 소스와 정적 자산은 `apps/web`로 이동한다.
- 루트는 workspace 관리, 공통 설정, 문서, 루트 실행 스크립트만 관리한다.
- 웹 전이용 Vite 설정과 루트 웹 전용 타입스크립트 설정은 정리하고, 실제 웹 설정은 `apps/web` 내부에서 관리한다.
