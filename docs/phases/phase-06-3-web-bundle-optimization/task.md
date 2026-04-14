# Phase 6-3. 웹 번들 최적화 Task

## 1. `lazyWithPreload` 공용 helper와 async export 규칙을 도입한다.

- [x] `apps/web/src/shared/lib/lazyWithPreload.ts`를 추가한다.
- [x] component-level lazy는 `*Async` export와 `preload*()` 함수 규칙으로 통일한다.
- [x] route-level lazy에는 이 helper를 쓰지 않고 React Router `lazy`만 쓰는 기준을 고정한다.
- [x] 이후 task에서 dynamic import target이 slice public API 또는 slice 내부 async entry만 향하도록 경계를 맞춘다.

## 2. `/books` route를 route-level lazy boundary로 전환한다.

- [x] `apps/web/src/app/router/router.tsx`에서 `BookSearchResultPage` eager import를 제거한다.
- [x] `/books` route를 React Router route object `lazy`로 전환한다.
- [x] `/`, `*`, route error는 eager 유지한다.
- [x] `/books` direct entry가 기존과 같은 결과 화면을 유지하는지 확인한다.

## 3. `features/book`를 `book-search`와 `book-detail-dialog`로 최소 분리한다.

- [x] 기존 `features/book` public API를 `apps/web/src/features/book-search`와 `apps/web/src/features/book-detail-dialog`로 재구성한다.
- [x] search/start/result/url-state 관련 코드는 `book-search` slice로 옮긴다.
- [x] detail dialog UI와 store는 `book-detail-dialog` slice로 옮긴다.
- [x] slice 외부 import가 새 public API만 사용하도록 정리한다.

## 4. `BookDetailDialog` lazy boundary와 intent preload를 도입한다.

- [x] `book-detail-dialog` slice가 `BookDetailDialogAsync`와 `preloadBookDetailDialog()`를 노출하게 한다.
- [x] `BookDetailDialogAsync`가 `selectedBookDetail != null`일 때만 실제 dialog를 mount하게 한다.
- [x] `상세 보기` CTA의 `pointerenter`, `focus`, `touchstart`에서 `preloadBookDetailDialog()`를 호출한다.
- [x] 기존 dialog loading fallback 계약을 유지한다.

## 5. `RegionSelectDialog` lazy boundary와 intent preload를 도입한다.

- [x] `features/region` slice가 `RegionSelectDialogAsync`와 `preloadRegionSelectDialog()`를 노출하게 한다.
- [x] `RegionSelectDialogAsync`가 `regionDialogBook != null`일 때만 실제 dialog를 mount하게 한다.
- [x] `소장 도서관 찾기` CTA의 `pointerenter`, `focus`, `touchstart`에서 `preloadRegionSelectDialog()`를 호출한다.
- [x] closed 상태에서는 dialog lazy fallback을 렌더하지 않도록 정리한다.

## 6. `LibrarySearchResultDialog` lazy boundary와 confirm intent preload를 도입한다.

- [x] `features/library` slice가 `LibrarySearchResultDialogAsync`와 `preloadLibrarySearchResultDialog()`를 노출하게 한다.
- [x] `LibrarySearchResultDialogAsync`가 실제로 필요한 state가 있을 때만 dialog를 mount하게 한다.
- [x] region confirm CTA의 `pointerenter`, `focus`, `touchstart`에서 preload를 연결한다.
- [x] `handleConfirm` 직전에 `preloadLibrarySearchResultDialog()`를 한 번 더 호출해 first-open 지연을 줄인다.

## 7. async boundary 회귀 테스트를 보강한다.

- [x] `apps/web/src/app/router/router.integration.test.tsx`에서 `/books` direct entry와 dialog open/reopen 흐름 회귀를 유지한다.
- [x] book, region, library dialog 관련 RTL tests를 lazy boundary 기준으로 갱신한다.
- [x] preload가 best-effort이고 preload 실패가 최종 click/open 동작을 깨지 않는다는 점을 회귀로 잠근다.

## 8. build acceptance와 문서 동기화를 마감한다.

- [x] `pnpm --filter @nearby-library-search/web build`에서 Vite chunk size warning이 없음을 확인한다.
- [x] emitted app JS가 multiple chunks이며 initial entry `<= 300 kB`, all app chunks `<= 400 kB`를 만족하는지 확인한다.
- [x] `manualChunks`, `chunkSizeWarningLimit` 상향, analyzer plugin 없이 목표를 달성했는지 확인한다.
- [x] `spec.md`, `task.md`, `plan.md`의 Phase 6-3 상태를 실제 구현 결과와 동기화한다.

## Important Changes

- 이번 phase는 공개 route 계약 `/`, `/books`를 바꾸지 않고 web bundle 경계만 재설계한다.
- `features/book`는 `book-search`와 `book-detail-dialog`로 최소 분리한다.
- dialog lazy는 `lazyWithPreload` 기반으로, route lazy는 React Router `lazy` 기반으로 구현한다.
- intent preload는 UX 최적화 수단일 뿐이며, preload가 없어도 click/open 최종 동작은 동일해야 한다.
- `manualChunks`, `chunkSizeWarningLimit` 상향, analyzer plugin 추가는 이번 phase 비범위다.

## Test Plan

- route integration
  - `/books` direct entry
  - dialog open/reopen
- feature integration
  - book detail dialog
  - region select dialog
  - library result dialog
- build acceptance
  - `pnpm --filter @nearby-library-search/web build`
  - Vite warning 없음
  - initial entry `<= 300 kB`
  - all app JS chunks `<= 400 kB`

## Assumptions

- 구현 순서는 helper -> route -> slice split -> dialogs -> tests -> build 마감으로 고정한다.
- dialog 3종은 각각 별도 task로 다룬다.
- 이번 phase는 JS bundle/code-splitting만 다루고 이미지 최적화는 별도 phase로 미룬다.
- 최종 task 전까지는 숫자 예산을 향해 구현을 진행하되, build acceptance 체크는 실제 build 확인 후에만 `[x]` 처리한다.
