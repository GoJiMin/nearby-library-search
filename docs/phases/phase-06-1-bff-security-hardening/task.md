# Phase 6-1. BFF 보안 하드닝 Task

## 1. Vercel 배포 기준 env 계약 hardening

- [x] `apps/bff` env에 `WEB_APP_ORIGIN`을 추가한다.
- [x] `WEB_APP_ORIGIN`이 운영 web custom domain exact origin만 허용하도록 검증한다.
- [x] `LIBRARY_API_BASE_URL`을 https-only로 강제한다.
- [x] auth key가 계속 BFF runtime env에서만 읽히는지 확인한다.

## 2. `createApp()` 앱 레벨 보안 baseline 정리

- [x] `@fastify/helmet`을 등록한다.
- [x] CORS를 `WEB_APP_ORIGIN` + dev opt-in localhost allowlist 방식으로 바꾼다.
- [x] `setNotFoundHandler`로 404 structured error를 추가한다.
- [x] `setErrorHandler`로 500 structured error를 추가한다.

## 3. `libraryCode` path param 검증 hardening

- [x] `libraryCode`를 `^[A-Za-z0-9]{1,20}$` 기준으로 검증한다.
- [x] `LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID` detail 문구를 새 규칙에 맞게 고친다.
- [x] 숫자 코드와 fixture 영숫자 코드가 모두 통과하는지 확인한다.

## 4. fixture mode 공통 에러 규칙 정리

- [x] `bookSearch` fixture branch를 safe wrapper로 감싼다.
- [x] `librarySearch` fixture branch를 safe wrapper로 감싼다.
- [x] fixture 내부 예외나 invalid fixture 응답이 structured error로 변환되게 고정한다.

## 5. BFF integration과 env/config 테스트 보강

- [x] `WEB_APP_ORIGIN` missing 또는 invalid failure를 검증한다.
- [x] `LIBRARY_API_BASE_URL` http rejection을 검증한다.
- [x] exact-origin CORS allow/block를 검증한다.
- [x] 404/500 structured error를 검증한다.
- [x] security headers를 검증한다.
- [x] `libraryCode` invalid regression과 fixture safe error regression을 검증한다.

## 6. Vercel 배포 전 운영 확인 항목 정리

- [x] Vercel Firewall/WAF에서 search route 보호 규칙이 필요한 이유와 확인 기준을 task에 적는다.
  - 보호 대상은 production BFF 프로젝트의 `GET /api/books/search`, `GET /api/libraries/search`다.
  - 이유는 Vercel Functions 환경에서 앱 메모리 rate limit를 보안 기준으로 두지 않고, search route를 플랫폼 레벨에서 먼저 보호하기 위해서다.
  - 완료 기준은 Vercel 대시보드에서 해당 route 보호 규칙이 존재하는지 수동 확인하는 것이다.
- [x] production custom domain 기준 CORS 확인 절차를 task에 적는다.
  - `WEB_APP_ORIGIN`은 production web custom domain exact origin이어야 한다.
  - deployed web에서 production BFF로 실제 요청을 보내고, 응답의 `access-control-allow-origin`이 production web origin과 일치하는지 확인한다.
  - localhost origin은 `ALLOW_DEV_CORS_ORIGINS=true`일 때만 임시 허용 대상이며, production acceptance에 포함하지 않는다.
- [x] preview cross-origin이 이번 phase 범위 밖이라는 점을 task에 적는다.
  - preview `*.vercel.app` web이 production BFF를 cross-origin으로 호출하는 흐름은 이번 phase acceptance가 아니다.
  - preview origin 차단은 회귀가 아니라 의도된 비범위로 본다.

## 7. 최종 검증과 문서 동기화

- [x] `pnpm --filter @nearby-library-search/bff exec vitest run`을 통과시킨다.
- [x] `pnpm --filter @nearby-library-search/bff exec tsc -p tsconfig.json`을 통과시킨다.
- [x] `spec.md`, `task.md`, `plan.md`의 Phase 6-1 상태를 실제 구현과 동기화한다.

## Important Changes

- 이번 phase는 Vercel 배포를 전제로 BFF를 얇은 API boundary 기준으로 hardening한다.
- 앱 내부 IP 기반 rate limit는 구현하지 않고, Vercel Firewall/WAF를 운영 보호 기준으로 둔다.
- `WEB_APP_ORIGIN`과 `ALLOW_DEV_CORS_ORIGINS` 기반 exact-origin CORS, 404/500 structured error를 앱 레벨 기본값으로 추가한다.
- `LIBRARY_API_BASE_URL`은 https-only로 강제하고, `libraryCode` 검증을 강화한다.
- fixture mode에서도 raw stack이 아니라 structured error만 반환하도록 정리한다.

## Test Plan

- 앱 레벨 integration
  - exact-origin CORS allow/block
  - 404 structured error
  - 500 structured error
  - security headers
- env/config
  - `WEB_APP_ORIGIN` missing/invalid failure
  - `ALLOW_DEV_CORS_ORIGINS` boolean-like validation
  - `LIBRARY_API_BASE_URL` http rejection
- route regression
  - `libraryCode` invalid 400
  - fixture safe error
  - 기존 search/detail/library/availability 정상 응답 유지
- 운영 확인
  - Vercel Firewall/WAF search route 보호 규칙
  - production custom domain 기준 web → bff CORS 확인

## Assumptions

- `task.md` 경로는 `docs/phases/phase-06-1-bff-security-hardening/task.md`로 고정한다.
- same-origin rewrites와 preview cross-origin 지원은 이번 phase에 포함하지 않는다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- Vercel 운영 보호 항목은 코드 테스트가 아니라 수동 확인 체크리스트로 관리한다.
