# Phase 5-5. 도서관 대출 가능 여부 조회 구현

## 목표

- Phase 5-4에서 placeholder로 남겨둔 `대출 가능 여부 조회` CTA를 실제 조회 기능으로 연결한다.
- 외부 Open API `/bookExist`를 BFF가 정규화해 제공하고, web은 BFF 계약만 사용하도록 고정한다.
- desktop detail panel과 mobile detail 영역이 같은 availability 상태 모델과 copy를 공유하도록 계약을 정리한다.
- 이 phase에서는 실제 조회 결과를 CTA 안에서만 보여주고, 별도 panel 확장이나 route 분리는 하지 않는다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 5-5`
- `docs/phases/phase-03-bff/spec.md`
- `docs/phases/phase-05-4-library-search-result-dialog/spec.md`
- `docs/phases/phase-05-5-library-availability-check/open_api_spec.md`

## 기술 결정

- BFF 구현 기준
  - 외부 Open API 호출은 `apps/bff`만 담당한다.
  - 외부 `/bookExist` 응답은 그대로 노출하지 않고 `packages/contracts`의 내부 계약으로 정규화한다.
  - 구현 스타일은 기존 `bookDetail`, `librarySearch` route와 동일하게 유지한다.
    - zod schema 선검증
    - `requestLibraryApi` 재사용
    - `createErrorResponse` 계열 helper 재사용
    - `developmentConfig.useDevFixtures` 기준 fixture 분기
- web 구현 기준
  - availability 조회는 버튼 클릭으로만 시작한다.
  - 이 phase에서는 예외적으로 `useSuspenseQuery`가 아니라 `useQuery`를 사용한다.
  - availability 결과는 zustand에 저장하지 않고 query cache와 CTA local state로만 관리한다.
  - 같은 library result dialog 세션 안에서는 성공 결과를 캐시 재사용한다.
  - dialog를 닫거나 region backflow로 빠지면 availability cache는 제거한다.
- UI 기준
  - CTA는 계속 detail 영역 안에 남긴다.
  - pending은 버튼 내부 spinner로만 표현한다.
  - 성공 결과는 버튼 텍스트로 직접 보여주고, 성공 후 버튼은 비활성화한다.
  - 실패는 재시도 가능한 상태로 남기고, 버튼 아래 문구만 에러 문구로 바꾼다.

## 구현 범위

- BFF `/api/libraries/:libraryCode/books/:isbn13/availability` route 추가
- `packages/contracts`에 availability 응답 타입 추가
- web `entities/library`에 availability request/query 추가
- desktop/mobile detail CTA를 실제 조회 흐름에 연결
- dev fixture와 route/integration test 추가

## 비범위

- availability 결과를 별도 카드, 배지, 패널로 확장하는 작업
- URL 동기화
- toast 시스템 추가
- `open_api_spec.md` 원문 수정
- `대출 가능 여부 조회` 이후 추가 행동 흐름
  - 예: 예약, 알림 신청, 희망도서 신청

## 현재 기반 상태

- `features/library`는 이미 desktop detail panel과 mobile detail 영역에 `대출 가능 여부 조회` 버튼을 렌더링한다.
- 현재 CTA는 no-op placeholder 상태다.
- `useFindLibraryStore`는 `libraryResultBook`, `currentLibrarySearchParams`, `selectedLibraryCode`를 소유한다.
- availability 조회 입력은 아래 두 값으로 충분하다.
  - 현재 선택된 도서의 `isbn13`
  - 현재 선택된 도서관의 `libraryCode`
- `entities/library`는 현재 도서관 검색 query만 제공한다.
- `packages/contracts`는 현재 `LibrarySearchResponse`까지만 가지며 availability 응답 타입은 없다.

## 아키텍처와 책임 분리

### 1. route와 feature 경계

- `/books` route는 기존처럼 library result dialog orchestration만 담당한다.
- availability 조회 상태를 route나 zustand store로 끌어올리지 않는다.
- `features/library`가 detail CTA interaction과 availability 결과 표시를 담당한다.
- `entities/library`는 availability request/query 계약과 순수 helper만 담당한다.
- `packages/contracts`는 web과 BFF가 공유하는 availability 응답 타입만 관리한다.

### 2. BFF endpoint 계약

- BFF endpoint는 아래 path로 고정한다.
  - `GET /api/libraries/:libraryCode/books/:isbn13/availability`
- path param 기준
  - `libraryCode`: 비어 있지 않은 string
  - `isbn13`: 13자리 숫자 문자열
- upstream 호출은 아래로 고정한다.
  - endpoint: `/bookExist`
  - query:
    - `libCode = libraryCode`
    - `isbn13`
    - `format = json`
- 응답은 아래 normalized shape로 고정한다.

```ts
type LibraryAvailabilityResponse = {
  libraryCode: LibraryCode;
  isbn13: Isbn13;
  hasBook: 'Y' | 'N';
  loanAvailable: 'Y' | 'N';
};
```

- `hasBook`도 내부 계약에 포함한다.
  - 이유: library search 결과와 실제 availability가 어긋나는 stale edge case를 UI에서 분기해야 하기 때문이다.

### 3. BFF validation / normalization / security 계약

- validation은 library route와 같은 방식으로 zod schema로 먼저 수행한다.
- library 관련 schema는 기존 규칙에 맞게 `schemas/library.ts`에 함께 둔다.
- `requestLibraryApi`는 그대로 재사용하고, endpoint union에 `/bookExist`만 추가한다.
- error helper는 아래를 그대로 재사용한다.
  - `createErrorResponse`
  - `createRetryableUpstreamRequestError`
  - `createRetryableUpstreamResponseError`
  - `toLibraryApiErrorResponse`
- error title은 아래로 고정한다.
  - `LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID`
  - `LIBRARY_AVAILABILITY_ISBN13_INVALID`
  - `LIBRARY_AVAILABILITY_PARAMS_INVALID`
  - `LIBRARY_AVAILABILITY_UPSTREAM_ERROR`
  - `LIBRARY_AVAILABILITY_RESPONSE_INVALID`
- 외부 auth key는 계속 BFF env에서만 읽는다.
- web, contracts, fixture 문서에는 외부 auth key나 raw upstream base URL을 노출하지 않는다.

### 4. dev fixture 계약

- development fixture는 route 단위로 별도 파일을 둔다.
  - `libraryAvailabilityFixture.data.ts`
  - `libraryAvailabilityFixture.ts`
- fixture 응답 shape는 production normalized response와 완전히 동일해야 한다.
- fixture는 최소 아래 케이스를 제공해야 한다.
  - `hasBook='Y', loanAvailable='Y'`
  - `hasBook='Y', loanAvailable='N'`
  - `hasBook='N', loanAvailable='N'`
- fixture는 현재 library search fixture와 충돌하지 않는 도서관 코드/ISBN 조합을 사용해야 한다.
- 개발 단계에서 `/books` 플로우 안에서 실제로 확인 가능한 fixture가 되어야 한다.

## 공통 계약 패키지 기준

- `packages/contracts`에 availability 전용 파일을 추가한다.
  - 예: `libraryAvailability.ts`
- `packages/contracts/src/index.ts`에서 export한다.
- raw Open API 타입은 추가하지 않는다.
- web과 BFF는 `LibraryAvailabilityResponse`만 공유한다.

## web data flow 계약

### 1. request / query 공개 API

- `entities/library`에 아래 공개 API를 추가한다.
  - `getLibraryAvailability`
  - `librariesQueryKeys.availability`
  - `librariesQueryOptions.availability`
  - `useGetLibraryAvailability`
- request는 `shared/request`의 `requestGet`만 사용한다.
- endpoint는 아래로 고정한다.
  - `/api/libraries/:libraryCode/books/:isbn13/availability`

### 2. query 방식

- availability 조회는 `useQuery` 기반으로 구현한다.
- `enabled: false`를 기본으로 두고 버튼 클릭 시만 시작한다.
- detail CTA는 query key를 아래 기준으로 만든다.
  - `libraryCode`
  - `isbn13`
- query cache 재사용 기준
  - 같은 dialog 세션 안에서는 같은 key의 **성공 결과만** 재사용한다.
  - error 결과는 재사용 가능한 성공 상태로 취급하지 않는다.
- session cache 범위
  - library result dialog가 열린 동안만 유지한다.
  - dialog close
  - region backflow
  - find-library flow reset
  시 관련 availability query cache를 제거한다.

### 3. CTA local state 계약

- CTA는 query cache와 별도로 **현재 선택에 대해 사용자가 조회를 눌렀는지**를 local state로 가진다.
- 이유:
  - 이전에 같은 도서관을 조회한 성공 캐시가 있더라도, 선택이 바뀌고 다시 돌아왔을 때는 버튼이 자동으로 성공 상태를 보여주면 안 된다.
- 따라서 current selection이 바뀌면 UI는 항상 기본 상태로 되돌린다.
- 사용자가 다시 버튼을 눌렀을 때만 아래 순서로 동작한다.
  - 현재 key의 성공 캐시가 있으면 그 결과를 즉시 사용한다.
  - 성공 캐시가 없으면 query를 실행한다.
- 결과적으로
  - 선택/페이지 변경 후에는 기본 CTA로 보이고
  - 같은 세션에서 같은 도서관을 다시 누르면 네트워크 재요청 없이 결과를 빠르게 복원할 수 있다.

## CTA 상태 계약

### 1. 기본 상태

- 버튼 텍스트: `대출 가능 여부 조회`
- 버튼 활성
- 보조 문구:
  - `대출 가능 여부는 전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.`

### 2. pending 상태

- 버튼 내부에 spinner를 표시한다.
- 버튼 텍스트는 계속 `대출 가능 여부 조회`
- 버튼 비활성
- 보조 문구는 기본 disclaimer 유지

### 3. 성공 상태

- `hasBook='Y' && loanAvailable='Y'`
  - 버튼 텍스트: `대출이 가능해요`
- `hasBook='Y' && loanAvailable='N'`
  - 버튼 텍스트: `대출이 불가능해요`
- `hasBook='N'`
  - 버튼 텍스트: `소장하지 않아요`
- 위 세 경우 모두 성공 상태로 간주한다.
- 성공 상태에서는 버튼을 항상 비활성화한다.
  - 이유: 불필요한 재시도를 막고, 전날 기준 데이터라는 성격과 맞추기 위함이다.
- 성공 상태에서도 보조 문구는 기본 disclaimer를 유지한다.

### 4. 에러 상태

- 버튼 텍스트는 다시 기본값 `대출 가능 여부 조회`로 돌아간다.
- 버튼은 다시 활성화된다.
- 보조 문구는 disclaimer 대신 아래 문구로 교체한다.
  - `다시 한 번 시도해주세요.`
- 에러 상태는 최종 상태가 아니라 재시도 가능한 상태다.

### 5. reset 상태

- 아래 경우에는 CTA를 기본 상태로 되돌린다.
  - 다른 도서관 선택
  - 페이지 변경
  - library result dialog close
  - region backflow
  - flow reset

## UI 통합 계약

### 1. desktop / mobile 공통성

- desktop detail panel과 mobile detail 영역은 같은 availability 상태 모델을 써야 한다.
- 버튼 텍스트, spinner, 보조 문구, 성공/실패/reset 규칙이 두 레이아웃에서 달라지면 안 된다.
- quick map와 availability는 모바일에서 같은 detail 영역 안에 공존하되, availability 로직은 quick map 로직과 분리한다.

### 2. 구현 경계

- availability CTA 상태 모델은 공용으로 재사용 가능하게 정리한다.
- desktop와 mobile에 각각 별도 boolean 조합을 중복 구현하지 않는다.
- 단, zustand store로 올리지는 않는다.
- feature 내부 공용 CTA component 또는 공용 hook 하나로 정리하는 방향으로 구현한다.

### 3. 접근성

- pending spinner가 들어가도 버튼 accessible name은 현재 텍스트로 유지돼야 한다.
- 비활성 상태는 실제 `disabled`로 표현한다.
- 보조 문구는 버튼 바로 아래에서 읽을 수 있는 가시 텍스트로 둔다.

## 테스트 기준

### 1. BFF integration test

- `createApp().inject()` 기준으로 route를 검증한다.
- 아래를 모두 확인한다.
  - valid params 200 + normalized response
  - fixture mode에서 `Y`, `N`, `hasBook='N'`
  - invalid `isbn13` 400
  - empty `libraryCode` 400
  - upstream request failure 502
  - upstream invalid payload 502
- 외부 Open API 호출은 `requestLibraryApi` boundary에서 mock한다.

### 2. web integration test

- 기본 CTA와 disclaimer 렌더
- 클릭 시 spinner + disabled
- `Y` 응답 시 `대출이 가능해요` + disabled
- `N` 응답 시 `대출이 불가능해요` + disabled
- `hasBook='N'` 응답 시 `소장하지 않아요` + disabled
- 에러 시 버튼은 다시 `대출 가능 여부 조회`, 버튼 재활성, 보조 문구는 `다시 한 번 시도해주세요.`
- 다른 도서관 선택 후 기본 상태 reset
- 페이지 변경 후 기본 상태 reset
- dialog close / region backflow 후 기본 상태 reset
- 같은 dialog 세션에서 같은 도서관 재조회 시 성공 cache reuse

### 3. regression

- library result dialog의 list/map/detail selection sync 유지
- desktop 3영역 구조 비회귀
- mobile detail-first / quick map dialog 비회귀
- `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`
- `pnpm --filter @nearby-library-search/bff build`

## 구현자가 추가 결정하지 말아야 하는 사항

- availability 조회를 zustand store에 올리지 않는다.
- availability 결과를 별도 route나 별도 panel로 분리하지 않는다.
- 성공 상태에서 버튼을 다시 활성화하지 않는다.
- 에러 상태에서 성공 결과 copy를 유지하지 않는다.
- `hasBook='N'`를 무시하지 않는다.
- raw `/bookExist` 응답 envelope를 web에 노출하지 않는다.
- auth key를 web이나 contracts에서 직접 다루지 않는다.
