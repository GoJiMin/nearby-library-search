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
- `apps/bff`는 Fastify 기반 BFF로 구성할 예정입니다.
- 공통 UI는 `@/shared/ui` 단일 엔트리로 공개합니다.
- 공통 API 요청은 `@/shared/request` 공개 API를 통해서만 사용합니다.
- 클라이언트 환경변수는 `@/shared/env`를 통해서만 읽습니다.
- 외부 Open API 인증키는 웹 앱이 아니라 BFF 서버 환경변수에서만 관리합니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

현재 저장소는 web 패키지 중심 모노레포 구조로 전환 중입니다. BFF와 contracts 패키지는 다음 Phase 작업에서 이어서 구성합니다.

## 검증

```bash
pnpm test:run
pnpm typecheck:web
pnpm build
```

## 문서

- 전체 개발 계획: `plan.md`
- 프로젝트 규칙: `AGENTS.md`
- Phase 1 명세: `docs/phases/phase-01-app/spec.md`
- Phase 1 작업 목록: `docs/phases/phase-01-app/task.md`
- Phase 2 명세: `docs/phases/phase-02-shared/spec.md`
- Phase 2 작업 목록: `docs/phases/phase-02-shared/task.md`

## 현재 상태

- Phase 1 app 레이어 표준화 완료
- Phase 2 shared 레이어 구성 완료
- 다음 단계는 Phase 3 루트 정리 후 Fastify BFF 구성입니다.
