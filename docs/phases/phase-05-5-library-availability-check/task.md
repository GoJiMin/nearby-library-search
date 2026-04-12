# Phase 5-5. 도서관 대출 가능 여부 조회 구현 Task

## 1. `packages/contracts` availability 응답 계약 추가

- [x] `LibraryAvailabilityResponse` 타입을 추가한다.
- [x] 필요하면 `'Y' | 'N'` flag 타입을 함께 정의한다.
- [x] `packages/contracts/src/index.ts`에서 새 타입을 export한다.
- [x] web과 BFF가 raw Open API 타입이 아니라 내부 계약만 공유하는지 확인한다.

## 2. BFF `/bookExist` endpoint와 param schema 확장

- [x] `requestLibraryApi` endpoint union에 `/bookExist`를 추가한다.
- [x] `libraryCode`, `isbn13` path param 검증 schema를 추가한다.
- [x] `libraryCode`는 non-empty string, `isbn13`은 13자리 숫자 문자열로 검증한다.
- [x] availability param validation error title을 고정한다.

## 3. BFF availability 응답 정규화 helper 구현

- [x] `/bookExist` raw envelope를 `LibraryAvailabilityResponse`로 정규화하는 helper를 구현한다.
- [x] `hasBook`, `loanAvailable`의 `'Y' | 'N'`만 허용하는 규칙을 잠근다.
- [x] invalid upstream payload를 `LIBRARY_AVAILABILITY_RESPONSE_INVALID`로 처리한다.
- [x] 기존 error helper를 그대로 재사용한다.

## 4. BFF availability route 추가

- [x] `GET /api/libraries/:libraryCode/books/:isbn13/availability` route를 추가한다.
- [x] `/bookExist` upstream 호출을 route에 연결한다.
- [x] route를 `routes/index.ts`에 등록한다.
- [x] auth key가 계속 BFF env에서만 사용되는지 유지한다.

## 5. 개발용 availability fixture 추가

- [x] `libraryAvailabilityFixture.data.ts`를 추가한다.
- [x] `libraryAvailabilityFixture.ts`를 추가한다.
- [x] fixture mode에서 외부 호출 없이 normalized response를 반환하게 한다.
- [x] `Y`, `N`, `hasBook='N'` 케이스를 모두 제공한다.

## 6. BFF integration test 추가

- [x] `createApp().inject()` 기준 success 응답을 검증한다.
- [x] fixture mode 응답과 외부 호출 미발생을 검증한다.
- [x] invalid `isbn13` / empty `libraryCode` 400을 검증한다.
- [x] upstream request failure / invalid payload 502를 검증한다.

## 7. web `entities/library` request 추가

- [x] `getLibraryAvailability` request 함수를 추가한다.
- [x] endpoint를 `/api/libraries/:libraryCode/books/:isbn13/availability`로 고정한다.
- [x] `shared/request`의 `requestGet`만 사용한다.
- [x] CTA 로컬 처리에 맞는 request error handling 방식을 고정한다.

## 8. web availability query 공개 API 추가

- [x] `librariesQueryKeys.availability`를 추가한다.
- [x] `librariesQueryOptions.availability`를 추가한다.
- [x] `useGetLibraryAvailability`를 추가한다.
- [x] `useQuery` + `enabled: false` + button-triggered `refetch` 규칙을 잠근다.

## 8-1. web 전역 request error와 toast 인프라 선행 도입

- [ ] `sonner` 기반 toast wrapper와 `AppToaster`를 추가한다.
- [ ] `shared/request`에 전역 request error queue를 추가한다.
- [ ] `ReactQueryProvider`가 `errorBoundary`와 `toast` 요청 에러를 다르게 라우팅하도록 정리한다.
- [ ] `GlobalErrorDetector`와 global unexpected error boundary를 `AppProvider`에 연결한다.

## 9. 공용 availability CTA 상태 모델 구현

- [ ] feature/library 내부 공용 CTA 상태 모델을 추가한다.
- [ ] 기본 / pending / success(Y) / success(N) / success(hasBook=N) / error 상태를 분리한다.
- [ ] 버튼 텍스트, disabled 여부, 하단 문구를 한 곳에서 결정하게 한다.
- [ ] availability 상태를 zustand에 올리지 않는 규칙을 유지한다.

## 10. desktop detail CTA 연결

- [ ] desktop detail panel의 `대출 가능 여부 조회` 버튼을 실제 query에 연결한다.
- [ ] pending 시 버튼 내부 spinner와 disabled를 적용한다.
- [ ] success 시 `대출이 가능해요` / `대출이 불가능해요` / `소장하지 않아요`를 표시한다.
- [ ] error 시 버튼 문구를 `재시도`로 바꾸고, toast로 실패를 안내한다.

## 11. mobile detail CTA 연결

- [ ] mobile detail 영역의 `대출 가능 여부 조회` 버튼에 같은 상태 모델을 연결한다.
- [ ] quick map 동작과 availability 상태가 섞이지 않게 분리한다.
- [ ] desktop과 동일한 버튼/문구 계약을 적용한다.
- [ ] mobile details fallback/로딩 상태와 availability CTA 배치가 충돌하지 않는지 확인한다.

## 12. availability reset과 session cache 정리

- [ ] 다른 도서관 선택 시 CTA 상태를 기본값으로 reset한다.
- [ ] 페이지 변경 시 CTA 상태를 기본값으로 reset한다.
- [ ] library result dialog close 시 관련 availability cache를 제거한다.
- [ ] region backflow와 flow reset 시 관련 availability cache를 제거한다.
- [ ] 같은 dialog 세션에서 같은 도서관 재조회 시 성공 cache를 재사용하는지 검증한다.

## 13. web integration test 추가

- [ ] 기본 CTA와 disclaimer 렌더를 검증한다.
- [ ] pending spinner + disabled를 검증한다.
- [ ] `대출이 가능해요` / `대출이 불가능해요` / `소장하지 않아요`를 검증한다.
- [ ] error 시 버튼 문구 `재시도`와 toast 안내를 검증한다.
- [ ] 선택 변경 / 페이지 변경 / dialog close / backflow 후 reset을 검증한다.
- [ ] 같은 dialog 세션의 cache reuse를 검증한다.

## 14. 최종 검증과 문서 동기화

- [ ] `pnpm test:run`을 통과시킨다.
- [ ] `pnpm lint:web`를 통과시킨다.
- [ ] `pnpm typecheck:web`를 통과시킨다.
- [ ] `pnpm build:web`와 `pnpm --filter @nearby-library-search/bff build`를 통과시킨다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-5 상태를 현재 구현 결과와 동기화한다.

## Important Changes

- 이번 phase는 외부 Open API `/bookExist`를 BFF가 정규화해 availability 응답으로 제공하도록 고정한다.
- web availability 조회는 예외적으로 `useQuery` 기반 on-demand 요청으로 구현한다.
- availability 결과는 zustand가 아니라 query cache와 CTA local state로만 관리한다.
- 성공 결과는 버튼 텍스트로 직접 보여주고, 성공 후에는 버튼을 비활성화한다.
- 실패 시에는 전역 toast로 안내하고, 버튼 문구를 `재시도`로 바꾼다.

## Test Plan

- BFF route success / fixture / invalid param / upstream failure / invalid payload
- web CTA 기본 / pending / success(Y) / success(N) / success(hasBook=N) / error
- 선택 변경, 페이지 변경, dialog close, region backflow 시 reset
- 같은 dialog 세션에서 같은 도서관 재조회 시 성공 cache reuse
- `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`, `pnpm --filter @nearby-library-search/bff build`

## Assumptions

- `task.md` 경로는 `docs/phases/phase-05-5-library-availability-check/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- integration test 상호작용 기본값은 `@testing-library/user-event`다.
- `open_api_spec.md`는 source of truth로만 사용하고, task 문서에는 raw 응답 구조를 중복 복붙하지 않는다.
- 성공 결과는 `Y`, `N`, `hasBook='N'` 모두 버튼 비활성 상태로 처리한다.
- 에러는 재시도 가능한 상태로 처리한다.
