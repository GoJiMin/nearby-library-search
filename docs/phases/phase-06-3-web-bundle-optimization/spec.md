# Phase 6-3. 웹 번들 최적화

## 목표

- 현재 web production build의 단일 JS bundle을 route, dialog, map, home hero enhancement 기준으로 분리해 initial JS 비용을 줄인다.
- 단순히 Vite의 `500 kB` warning을 숨기지 않고, 실제 사용자 흐름 기준으로 **필요한 코드만 필요한 시점에 로드**되게 만든다.
- 기존 `/`와 `/books` 사용자 흐름, dialog 동작, Kakao map interaction, availability 조회 경험은 유지한 채 semantic code-splitting 구조를 고정한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 6-3`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- `docs/phases/phase-05-4-library-search-result/spec.md`
- `docs/phases/phase-05-5-library-availability-check/spec.md`
- `docs/phases/phase-05-6-book-detail-dialog/spec.md`

## 기술 결정

- 이번 phase는 **semantic code-splitting**을 우선한다.
  - `manualChunks`, `chunkSizeWarningLimit` 상향, warning 무시는 도입하지 않는다.
  - route, dialog, map, animation enhancement 같은 실제 UX 경계를 async boundary로 만든다.
- route-level splitting은 React Router route object의 `lazy`를 사용한다.
  - `/books` route는 eager import를 제거하고 route-level lazy module로 전환한다.
  - `/`, `*`, route error는 eager 유지한다.
- component-level splitting은 `React.lazy` + `Suspense` 기반으로 통일한다.
  - `shared/lib/lazyWithPreload.ts`를 추가한다.
  - 이 helper는 lazy component와 명시적 `preload()` 함수를 함께 제공한다.
- 이번 phase에서만 허용하는 최소 구조 조정이 있다.
  - `features/book`는 `book-search`와 `book-detail-dialog` 성격으로 최소 분리한다.
  - 이유는 FSD public API 규칙을 지키면서 `BookDetailDialog`만 별도 lazy boundary로 분리하기 위해서다.
- build acceptance는 숫자 기준으로 고정한다.
  - `pnpm --filter @nearby-library-search/web build`에서 Vite chunk size warning이 없어야 한다.
  - initial entry chunk는 minified 기준 `300 kB` 이하여야 한다.
  - emitted app JS chunk는 모두 minified 기준 `400 kB` 이하여야 한다.
  - emitted app JS는 single chunk가 아니라 multiple chunks여야 한다.

## 구현 범위

- `/books` route route-level lazy 전환
- `/books` 결과 문맥 dialog 3종 lazy boundary 전환
- Kakao map runtime을 library result dialog shell과 분리
- home hero의 `react-type-animation` defer
- dialog chunk preload와 map chunk preload 정책 추가
- bundle 회귀 기준과 async boundary 회귀 테스트 보강

## 비범위

- 상태 수명주기 리팩터링
- 이미지 최적화
- `manualChunks` 기반 세부 chunk 수동 분할
- build analyzer plugin 추가
- BFF/API 계약 변경
- UI 구조나 copy 자체 변경

## 현재 구현 상태

- 현재 [router.tsx](/Users/gojimin/Desktop/ai/apps/web/src/app/router/router.tsx)는 `HomePage`, `BookSearchResultPage`, `NotFoundPage`, `RouteErrorPage`를 모두 eager import한다.
- 현재 web build는 JS chunk 하나만 생성한다.
  - 최근 기준 `dist/assets/index-*.js` 단일 chunk `588.33 kB` minified warning이 발생한다.
- 현재 [BookSearchResultPage.tsx](/Users/gojimin/Desktop/ai/apps/web/src/pages/book-search-result/ui/BookSearchResultPage.tsx)는 아래 dialog를 모두 eager import한다.
  - `BookDetailDialog`
  - `RegionSelectDialog`
  - `LibrarySearchResultDialog`
- 현재 [LibrarySearchResultDialog.tsx](/Users/gojimin/Desktop/ai/apps/web/src/features/library/ui/LibrarySearchResultDialog.tsx) 아래에서 desktop/mobile layout과 Kakao map runtime까지 같은 chunk로 묶인다.
- 현재 [BrandMessage.tsx](/Users/gojimin/Desktop/ai/apps/web/src/pages/home/ui/BrandMessage.tsx)는 `react-type-animation`을 initial home entry에 직접 싣는다.
- 현재 [features/book/index.ts](/Users/gojimin/Desktop/ai/apps/web/src/features/book/index.ts)는 search/result와 detail dialog를 한 slice public API로 같이 노출한다.

## Async boundary 설계

### 1. Route boundary

- `/books` route는 route object의 `lazy`로 전환한다.
- router module은 `/books`에 대해 eager `element: <BookSearchResultPage />`를 두지 않는다.
- route lazy import는 page slice public API만 사용한다.
  - `@/pages/book-search-result`
- `/` home route는 eager 유지한다.
- route 전환 loading fallback은 기존 [RootLayout.tsx](/Users/gojimin/Desktop/ai/apps/web/src/app/layouts/RootLayout.tsx)의 `useNavigation()` + [LoadingState.tsx](/Users/gojimin/Desktop/ai/apps/web/src/shared/feedback/ui/LoadingState.tsx) 계약을 유지한다.

### 2. Book result dialog boundary

- `features/book`는 아래 두 slice로 최소 분리한다.

```text
features/
  book-search/
  book-detail-dialog/
```

- `book-search` slice는 아래를 담당한다.
  - `BookSearchStart`
  - `BookSearchResult`
  - `readBookSearchResultUrlState`
  - 기존 result/search 관련 model
- `book-detail-dialog` slice는 아래를 담당한다.
  - `useBookDetailDialogStore`
  - `BookDetailDialog`
  - detail dialog 전용 UI/model
- `book-detail-dialog` slice public API는 아래를 노출한다.
  - `BookDetailDialogAsync`
  - `preloadBookDetailDialog()`
  - `useBookDetailDialogStore`
- `BookSearchResultPage`는 더 이상 `BookDetailDialog`를 eager import하지 않는다.
- `BookSearchResultPage`는 store open 상태가 `true`일 때만 `BookDetailDialogAsync`를 mount한다.
- `BookSearchResultCard`의 `상세 보기` CTA는 아래 intent에서 `preloadBookDetailDialog()`를 호출한다.
  - `pointerenter`
  - `focus`
  - `touchstart`

### 3. Region select dialog boundary

- `features/region` slice public API는 아래를 노출한다.
  - `RegionSelectDialogAsync`
  - `preloadRegionSelectDialog()`
- `BookSearchResultPage`는 더 이상 `RegionSelectDialog`를 eager import하지 않는다.
- `BookSearchResultPage`는 `regionDialogBook != null`일 때만 `RegionSelectDialogAsync`를 mount한다.
- `BookSearchResultCard`의 `소장 도서관 찾기` CTA는 아래 intent에서 `preloadRegionSelectDialog()`를 호출한다.
  - `pointerenter`
  - `focus`
  - `touchstart`

### 4. Library result dialog boundary

- `features/library` slice public API는 아래를 노출한다.
  - `LibrarySearchResultDialogAsync`
  - `preloadLibrarySearchResultDialog()`
- `BookSearchResultPage`는 더 이상 `LibrarySearchResultDialog`를 eager import하지 않는다.
- `BookSearchResultPage`는 아래가 모두 참일 때만 `LibrarySearchResultDialogAsync`를 mount한다.
  - `currentLibrarySearchParams != null`
  - `libraryResultBook != null`
- `RegionSelectDialog`의 `선택 완료` CTA는 아래 intent에서 `preloadLibrarySearchResultDialog()`를 호출한다.
  - `pointerenter`
  - `focus`
  - `touchstart`
- `handleConfirm`는 `confirmRegion()` 호출 직전에 `preloadLibrarySearchResultDialog()`를 한 번 더 호출해 first-open 지연을 줄인다.

### 5. Kakao map boundary

- Kakao map 관련 runtime은 library result dialog shell과 별도 chunk로 분리한다.
- map runtime chunk 범위는 아래로 고정한다.
  - `features/library/map/**`
  - `shared/kakao-map/**`
- `LibrarySearchResultSelectedMap`는 data wrapper로 유지하되, 실제 map canvas/runtime은 `LibrarySearchResultMapAsync`로 lazy import한다.
- desktop의 [LibrarySearchResultRightPanel.tsx](/Users/gojimin/Desktop/ai/apps/web/src/features/library/ui/desktop/LibrarySearchResultRightPanel.tsx)와 mobile의 [LibrarySearchResultMobileQuickMapDialog.tsx](/Users/gojimin/Desktop/ai/apps/web/src/features/library/ui/mobile/LibrarySearchResultMobileQuickMapDialog.tsx)는 직접 map runtime을 eager import하지 않는다.
- `LibrarySearchResultDialog` shell이 열린 뒤 map area가 처음 렌더될 때 map chunk 로딩을 시작한다.
- mobile `지도로 보기` CTA는 open intent에서 `preloadLibrarySearchResultMap()`를 호출한다.
  - `pointerenter`
  - `focus`
  - `touchstart`
- map chunk loading 동안 fallback은 기존 map placeholder/disabled UI 계약을 유지한다.

### 6. Home hero animation boundary

- home hero의 `react-type-animation`은 initial entry에서 제거한다.
- `BrandMessage`는 정적 heading shell을 eager 유지한다.
  - 초기 문구는 `근처 도서관에 있나요?`로 고정한다.
- animation enhancement는 별도 async component로 분리한다.
- `BrandMessage`는 첫 paint 이후 `requestIdleCallback`을 우선 사용해 enhancement 로딩을 시작한다.
  - `requestIdleCallback`이 없으면 `setTimeout(0)` fallback을 사용한다.
- animation chunk가 늦어도 static heading 문맥은 그대로 유지돼야 한다.

## Shared helper 규칙

- `shared/lib/lazyWithPreload.ts`를 추가한다.
- helper 계약은 아래 의미를 갖는다.

```ts
const AsyncComponent = lazyWithPreload(() => import('./Component'));

AsyncComponent.preload();
```

- 이 helper는 route-level lazy에는 쓰지 않는다.
  - route-level lazy는 React Router `lazy`
  - dialog/map/animation lazy는 `lazyWithPreload`
- FSD 규칙을 지키기 위해 dynamic import target도 slice public API 또는 slice 내부 전용 async entry module만 사용한다.
- slice 외부에서는 개별 `ui` 파일을 직접 dynamic import하지 않는다.

## Loading / fallback 규칙

- route-level lazy fallback은 기존 `LoadingState`를 재사용한다.
- dialog closed 상태에서는 lazy fallback을 렌더하지 않는다.
- dialog open 이후 lazy sub-tree가 아직 로드되지 않았을 때만 fallback을 보여준다.
  - `BookDetailDialogAsync`: 기존 `BookDetailDialogLoadingContent`
  - `RegionSelectDialogAsync`: `null` fallback 허용
  - `LibrarySearchResultDialogAsync`: dialog shell loading은 `null` fallback 허용
  - map async boundary: 기존 map placeholder/fallback 사용
- 기존 Suspense data loading boundary는 유지한다.
  - data Suspense와 code-splitting Suspense를 하나로 합치지 않는다.

## Build acceptance

- `pnpm --filter @nearby-library-search/web build`에서 chunk size warning이 없어야 한다.
- `vite.config.ts`에서 `chunkSizeWarningLimit`를 올려 warning을 숨기지 않는다.
- build 결과는 아래를 만족해야 한다.
  - JS chunk가 2개 이상이다.
  - initial entry chunk minified size `<= 300 kB`
  - 모든 app JS chunk minified size `<= 400 kB`
- home initial entry에는 아래가 포함되면 안 된다.
  - `/books` page code
  - `BookDetailDialog` runtime
  - `RegionSelectDialog` runtime
  - `LibrarySearchResultDialog` runtime
  - Kakao map runtime
  - `react-type-animation`

## 테스트 기준

### 1. build 검증

- `pnpm --filter @nearby-library-search/web build`
- output에서 Vite chunk size warning이 없어야 한다.
- `dist/assets`에 multiple JS chunks가 생성돼야 한다.
- build 로그의 minified JS size 기준으로 entry/chunk budget을 만족해야 한다.

### 2. 사용자 흐름 회귀

- 기존 route integration과 feature integration은 계속 통과해야 한다.
  - `app/router/router.integration.test.tsx`
  - `features/library/ui/test/LibrarySearchResultDialog.test.tsx`
  - book search/detail 관련 기존 테스트
- 추가로 아래 시나리오를 고정한다.
  - `/books` direct entry가 기존과 같은 결과 화면을 보여준다.
  - `상세 보기` 첫 open과 재open이 모두 동작한다.
  - `소장 도서관 찾기 -> 지역 선택 -> 결과 dialog` 흐름이 기존과 같이 동작한다.
  - mobile `지도로 보기`와 desktop map panel이 모두 기존 선택 동기화를 유지한다.
  - home hero는 animation enhancement가 늦어도 static 문구가 바로 보인다.

### 3. prefetch 회귀

- intent prefetch는 기능 동작을 바꾸지 않아야 한다.
- CTA hover/focus/touchstart가 없어도 click/open 시 최종 동작은 동일해야 한다.
- preload 실패가 사용자 오류로 보이면 안 된다.
  - preload는 best-effort
  - 최종 click/open 시 lazy import가 다시 정상 동작해야 한다.

## 구현 완료 기준

- `Phase 6-3` 구현 후 master plan의 번들 최적화 항목을 모두 설명할 수 있어야 한다.
- spec 기준으로 implementer가 추가 설계를 하지 않아도 아래를 바로 구현할 수 있어야 한다.
  - 어떤 경계를 lazy로 나눌지
  - 어떤 slice를 최소 분리할지
  - preload를 어디서 호출할지
  - 어떤 fallback을 유지할지
  - 어떤 숫자 예산을 맞출지
