# Phase 6-1. BFF 보안 하드닝

## 목표

- 현재 Fastify BFF를 API 전용 서버 기준의 secure-by-default baseline으로 정리한다.
- 외부 Open API 호출 경계, 입력 검증, fixture mode, 앱 레벨 에러 응답을 배포 전 기준으로 다시 고정한다.
- 기존 search/detail/library/availability 기능 계약은 유지한 채, abuse 방어와 내부 정보 노출 축소를 우선 적용한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 6-1`
- `docs/phases/phase-03-bff/spec.md`
- `docs/phases/phase-05-5-library-availability-check/spec.md`
- `docs/phases/phase-05-6-book-detail-dialog/spec.md`

## 기술 결정

- Fastify 앱 레벨 기준
  - `createApp()`에서 API 전용 서버 baseline을 고정한다.
  - `@fastify/rate-limit`과 `@fastify/helmet`을 도입한다.
  - `setNotFoundHandler`와 `setErrorHandler`를 추가해 404/500 응답을 `ErrorResponse` shape로 통일한다.
  - `trustProxy`는 계속 `false`로 유지한다.
  - 현재 개발용 CORS 정책은 유지하고, 이번 phase에서는 배포용 CORS 재설계를 하지 않는다.
- 외부 Open API 경계 기준
  - `LIBRARY_API_BASE_URL`은 이제 `https`만 허용한다.
  - auth key는 계속 BFF runtime env에서만 읽는다.
  - upstream 요청과 관련된 에러는 route별 `*_UPSTREAM_ERROR`, `*_RESPONSE_INVALID` 체계를 유지한다.
- 입력 검증 기준
  - 현재 Zod 기반 route boundary validation 구조는 유지한다.
  - `libraryCode`만 별도 hardening 대상으로 강화한다.
  - 모든 public route는 schema parse helper를 거친 값만 사용한다.
- fixture / 에러 기준
  - fixture mode에서도 raw throw나 stack 노출 없이 구조화된 `ErrorResponse`만 반환한다.
  - 앱 레벨 unknown error는 공통 500으로 감싸고, 내부 detail은 응답에 노출하지 않는다.

## 구현 범위

- `createApp()`에 rate limit, security headers, 404, 500 baseline 추가
- `LIBRARY_API_BASE_URL` https-only 강제
- `libraryCode` path param 허용 규칙 강화
- fixture mode 비구조화 예외를 공통 에러 응답 규칙으로 통일
- BFF integration test와 env/config test 보강

## 비범위

- 인증, 세션, 쿠키, CSRF 도입
- 배포 인프라 레벨 WAF, CDN, reverse proxy 설정
- CORS 정책을 localhost 개발 범위를 넘어 재설계하는 작업
- Redis 등 외부 rate limit store 도입
- web app 동작 변경

## 현재 기반 상태

- `apps/bff`는 현재 Fastify 단일 앱이며 `CORS onRequest hook`만 앱 레벨로 적용한다.
- 앱 레벨 `rate limit`, `helmet`, `setNotFoundHandler`, `setErrorHandler`는 아직 없다.
- `LIBRARY_API_BASE_URL`은 현재 `http`와 `https`를 모두 허용한다.
- `bookSearch`, `bookDetail`, `librarySearch`, `libraryAvailability`는 route별 Zod parse helper를 사용한다.
- `bookSearch`/`librarySearch` fixture는 성공 응답만 직접 반환하고, fixture branch 자체를 safe wrapper로 감싸는 규칙은 아직 없다.
- `libraryAvailabilityParamsSchema`의 `libraryCode`는 현재 `min(1)` 수준이라 허용 범위가 느슨하다.

## 앱 레벨 보안 baseline

### 1. 보안 헤더

- `@fastify/helmet`을 앱 시작 시 등록한다.
- API 서버 기준으로 아래 옵션을 고정한다.
  - `contentSecurityPolicy: false`
  - `hsts: false`
- 목적은 HTML 전용 정책이 아니라 기본 보안 헤더와 fingerprint 축소다.
- `helmet` 적용 후에도 현재 JSON API 응답 구조는 바뀌지 않아야 한다.

### 2. Rate limiting

- `@fastify/rate-limit`을 앱 레벨로 등록한다.
- `/health`는 제한 대상에서 제외한다.
- 기본 제한은 아래로 고정한다.
  - `60 requests / 1 minute / IP`
- search endpoint는 override를 둔다.
  - `GET /api/books/search`: `30 / 1 minute / IP`
  - `GET /api/libraries/search`: `30 / 1 minute / IP`
- 아래 route는 기본 제한을 사용한다.
  - `GET /api/books/:isbn13`
  - `GET /api/libraries/:libraryCode/books/:isbn13/availability`
- rate limit 초과 시 응답은 아래 shape로 고정한다.

```ts
{
  title: 'TOO_MANY_REQUESTS',
  detail: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  status: 429,
}
```

### 3. 404 / 500 공통 응답

- unknown route는 404 structured error로 고정한다.

```ts
{
  title: 'NOT_FOUND',
  detail: '요청한 경로를 찾을 수 없습니다.',
  status: 404,
}
```

- unhandled exception은 500 structured error로 고정한다.

```ts
{
  title: 'INTERNAL_SERVER_ERROR',
  detail: '서버 내부에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  status: 500,
}
```

- stack trace, raw error message, upstream raw payload는 응답에 포함하지 않는다.
- 내부 detail은 서버 로그에서만 확인한다.

## 외부 Open API 경계

### 1. env 계약

- `LIBRARY_API_BASE_URL`은 반드시 `https://` URL이어야 한다.
- `http://`는 개발 환경에서도 허용하지 않는다.
- `LIBRARY_API_AUTH_KEY`는 계속 필수 env로 유지한다.
- auth key는 로그, 에러 응답, fixture 문서에 노출하지 않는다.

### 2. request 경계

- `requestLibraryApi`는 계속 아래를 공통으로 강제한다.
  - `authKey`
  - `format=json`
  - `redirect: 'error'`
  - `AbortSignal.timeout(5000)`
- endpoint allowlist는 현재 4개를 유지한다.
  - `/srchBooks`
  - `/srchDtlList`
  - `/libSrchByBook`
  - `/bookExist`
- 외부 요청 실패는 route별 retryable upstream error title로 변환한다.

## 입력 검증 hardening

### 1. route boundary 규칙

- `bookSearch`, `bookDetail`, `librarySearch`, `libraryAvailability` 모두 현재처럼 route별 parse helper를 유지한다.
- route handler 본문은 parse 성공값만 사용한다.
- raw `request.query`, `request.params`를 직접 downstream helper에 전달하지 않는다.

### 2. `libraryCode` 규칙

- `libraryCode`는 아래 regex를 만족해야 한다.

```ts
/^[A-Za-z0-9]{1,20}$/
```

- 허용 의도:
  - fixture의 `LIB0001` 같은 영숫자 코드 허용
  - 실 Open API의 `143136` 같은 숫자 코드 허용
- 공백, 특수문자, 하이픈, 길이 21자 이상은 거부한다.
- invalid `libraryCode` 응답 title은 계속 `LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID`를 사용한다.
- detail 문구는 새 규칙에 맞춰 아래로 고정한다.
  - `libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.`

## Fixture mode와 공통 에러 규칙

### 1. fixture branch 규칙

- `USE_DEV_FIXTURES=true`일 때도 모든 route는 구조화된 `Result<T>` 또는 동등한 safe wrapper를 통해 응답한다.
- fixture helper 내부 예외가 발생하면 raw throw를 route 밖으로 보내지 않는다.
- fixture failure는 live mode와 같은 계열의 `*_RESPONSE_INVALID` 또는 `*_UPSTREAM_ERROR` title로 변환한다.

### 2. route별 기준

- `bookDetailFixture`, `libraryAvailabilityFixture`처럼 success/error를 분기하는 resolver 스타일을 기준으로 삼는다.
- `bookSearchFixture`, `librarySearchFixture`도 route에서 safe wrapper를 거쳐야 한다.
- fixture 응답이 잘못되거나 내부 예외가 나도 500 raw stack 대신 구조화된 route error를 반환해야 한다.

## 테스트 기준

### 1. 앱 레벨 integration

- `createApp().inject()` 기준으로 아래를 검증한다.
  - `/health`는 정상 동작하고 rate limit 대상이 아니다.
  - `/api/books/search`와 `/api/libraries/search`는 제한 초과 시 429 structured error를 반환한다.
  - unknown route는 404 structured error를 반환한다.
  - 앱 레벨 unknown exception은 500 structured error를 반환하고 stack을 노출하지 않는다.
  - security headers가 응답에 포함된다.

### 2. env / request 경계 검증

- `LIBRARY_API_BASE_URL`이 `http://...`면 env loading이 실패한다.
- `requestLibraryApi`는 계속 `https` base URL과 allowlisted endpoint만 사용한다.

### 3. route validation / fixture 검증

- `libraryCode`가 공백, 특수문자 포함, 길이 초과면 400으로 실패한다.
- fixture mode에서 route별 success path는 그대로 유지된다.
- fixture branch 내부 예외나 invalid fixture 응답은 structured error로 변환된다.
- 기존 search/detail/library/availability route 정상 응답과 현재 error title 계약은 유지된다.

## Acceptance 기준

- 문서만 읽고 현재 BFF에 어떤 앱 레벨 보안 기본값이 새로 추가되는지 설명할 수 있어야 한다.
- 문서만 읽고 왜 `LIBRARY_API_BASE_URL`이 `https`만 허용되는지 설명할 수 있어야 한다.
- 문서만 읽고 `libraryCode` 허용 범위와 에러 title이 무엇인지 설명할 수 있어야 한다.
- 문서만 읽고 fixture mode에서도 raw stack이 아니라 구조화된 에러만 나가야 한다는 점이 분명해야 한다.

## Assumptions

- 이 phase는 배포 전 hardening 단계이므로 기능 추가보다 안전한 기본값 고정이 우선이다.
- rate limit store는 우선 Fastify 기본 메모리 store를 사용한다.
- production reverse proxy, CDN, WAF는 이번 spec 범위 밖이다.
- 현재 localhost/127 개발용 CORS 허용 정책은 유지한다.
- HSTS는 이번 phase에서 도입하지 않는다.
