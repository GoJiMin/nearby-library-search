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
- 공통 UI는 `@/shared/ui` 단일 엔트리로 공개합니다.
- 공통 API 요청은 `@/shared/request` 공개 API를 통해서만 사용합니다.
- 클라이언트 환경변수는 `@/shared/env`를 통해서만 읽습니다.
- `VITE_API_BASE_URL`은 web이 호출할 Fastify BFF base URL입니다.
- 외부 Open API 인증키는 웹 앱이 아니라 BFF 서버 환경변수에서만 관리합니다.

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
pnpm test:run
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

## 현재 상태

- Phase 1 app 레이어 표준화 완료
- Phase 2 shared 레이어 구성 완료
- Phase 3 모노레포 전환과 Fastify BFF 기본 구조 진행 중
