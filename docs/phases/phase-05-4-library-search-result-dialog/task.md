# Phase 5-4. 도서관 결과 다이얼로그 구현 Task

## 1. `/books` library result orchestration baseline 정리

- [x] `pages/book-search-result`가 region confirm 이후 library result dialog open state를 소유하도록 정리한다.
- [x] page가 `currentLibrarySearchParams`, `selectedLibraryCode`를 소유하도록 추가한다.
- [x] region confirm 시 `page=1`로 초기화된 `LibrarySearchParams`를 저장하고 region dialog를 닫은 뒤 library result dialog를 연다.
- [x] dialog close 시 `/books` 결과 화면은 유지되고 library dialog state만 종료되는지 route/page integration test로 검증한다.

## 2. `features/library` 공개 API와 최소 골격 구성

- [x] `features/library`에 `LibrarySearchResultDialog` public feature를 추가한다.
- [x] `features/library/index.ts`에서 dialog 공개 API를 노출한다.
- [x] dialog 입력 계약을 `open`, `params`, `selectedBook`, `selectedLibraryCode`, `onOpenChange`, `onBackToRegionSelect`, `onChangePage`, `onSelectLibrary`, `onCheckAvailability`로 고정한다.
- [x] 기본 integration test 파일을 추가한다.

## 3. dialog shell과 데스크톱 3영역 레이아웃 구현

- [x] `library_search_result_design_guide/screen.png` 기준의 desktop dialog shell을 구현한다.
- [x] 좌측 결과 리스트 패널, 우측 map 패널, 하단 detail panel의 큰 구조만 먼저 고정한다.
- [x] 우측 상단 닫기 버튼과 shell-level close interaction을 구현한다.
- [x] 이 단계에서는 실제 데이터 연결 전 placeholder skeleton layout만 사용한다.

## 4. 결과 조회와 loading / empty / error 상태 구현

- [ ] `useGetSearchLibraries(params)`를 연결한다.
- [ ] loading 상태에서 dialog shell을 유지한 채 list/map/detail skeleton을 렌더링한다.
- [ ] `isEmptyLibrarySearchResult` 기준 empty state와 복구 CTA를 구현한다.
- [ ] query error 시 dialog 내부 recoverable error UI와 `다시 시도` 흐름을 구현한다.
- [ ] 세 상태를 integration test로 검증한다.

## 5. 좌측 결과 리스트와 기본 선택 구현

- [ ] 결과가 1건 이상이면 현재 페이지 첫 번째 도서관을 기본 선택 상태로 두는 규칙을 구현한다.
- [ ] 좌측 리스트에 `name`, `address`, `operatingTime | closedDays` 요약을 렌더링한다.
- [ ] active row 스타일과 keyboard/select interaction을 구현한다.
- [ ] 좌표 없는 도서관도 리스트에는 그대로 남는지 integration test로 검증한다.

## 6. 하단 detail panel과 availability CTA placeholder 구현

- [ ] 선택된 도서관의 `name`, `operatingTime`, `closedDays`, `address`, `phone`을 detail panel에 렌더링한다.
- [ ] `homepage`는 링크 수준으로만 취급하고 `fax`는 기본 노출에서 제외한다.
- [ ] `대출 가능 여부 조회` 버튼을 footer CTA로 구현하되 실제 기능은 호출하지 않는다.
- [ ] 선택된 도서관이 없을 때 CTA 비활성 규칙을 잠근다.
- [ ] detail panel 렌더와 CTA placeholder handoff를 integration test로 검증한다.

## 7. 상태 기반 페이지네이션 구현

- [ ] `LibrarySearchParams.page`를 source of truth로 사용하는 상태 기반 페이지네이션을 구현한다.
- [ ] `pageSize=10` 고정 규칙을 화면과 helper에서 함께 잠근다.
- [ ] page 변경 시 `isbn`, `region`, `detailRegion`은 유지하고 `page`만 바뀌도록 연결한다.
- [ ] `totalPages > 1`일 때만 좌측 리스트 하단에 pagination을 렌더링한다.
- [ ] 페이지 전환 후 새 페이지 첫 번째 도서관이 기본 선택되는지 검증한다.
- [ ] page change helper를 분리했다면 focused unit test를 추가한다.

## 8. Kakao Map SDK loader와 map panel baseline 구현

- [ ] `@/shared/env`의 `kakaoMapConfig`를 사용해 Kakao Maps JS SDK를 지연 로드하는 helper를 구현한다.
- [ ] `autoload=false` + `kakao.maps.load(...)` 패턴과 dedupe 규칙을 잠근다.
- [ ] SDK enabled 상태에서는 map instance를 만들고, disabled 상태에서는 map unavailable placeholder를 렌더링한다.
- [ ] dialog open 이후 `relayout()`이 필요한 구조를 반영한다.
- [ ] SDK loader와 unavailable fallback을 focused unit/integration test로 검증한다.

## 9. marker 렌더링과 list / map / detail 선택 동기화 구현

- [ ] 좌표가 있는 도서관만 marker로 렌더링한다.
- [ ] 최초 진입 시 `setBounds()`로 전체 marker가 보이게 맞춘다.
- [ ] 리스트에서 도서관을 선택하면 marker focus와 detail panel이 함께 갱신되게 한다.
- [ ] marker를 클릭해도 active row와 detail panel이 같은 도서관으로 갱신되게 한다.
- [ ] 선택 포커스는 `panTo()` 또는 동등한 부드러운 중심 이동으로 고정한다.
- [ ] selection sync를 feature integration test로 검증한다.

## 10. region backflow와 reopen reset 규칙 구현

- [ ] empty state 또는 결과 dialog 내부에서 `지역 다시 선택` CTA를 누르면 region dialog를 다시 연다.
- [ ] library result dialog를 닫고 다시 열면 pagination과 selected library는 항상 초기 상태로 다시 시작한다.
- [ ] region을 다시 confirm하면 새 params 기준으로 `page=1`부터 다시 조회되게 한다.
- [ ] `/books` page orchestration test로 reopen reset 흐름을 검증한다.

## 11. 모바일 정보 우선 구조와 접근성 마감

- [ ] 모바일에서 `리스트/선택 정보 우선, 지도는 아래` 순서를 구현한다.
- [ ] dialog 내부 tab order, active row semantics, pagination `aria-current`, map unavailable 가시 문구를 점검한다.
- [ ] close button, `ESC`, overlay dismiss, keyboard navigation을 library result dialog 기준으로 검증한다.
- [ ] 이번 task에서는 구조/순서와 접근성만 마감하고, 과한 시각 polish는 별도 후속으로 남긴다.

## 12. 최종 검증과 문서 동기화

- [ ] `LibrarySearchResultDialog` integration test와 필요한 focused unit test만 남아 있는지 점검한다.
- [ ] `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`를 통과시킨다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-4 상태를 현재 구현 결과와 동기화한다.

## Important Changes

- 이번 phase는 `/books` 위 overlay dialog 안에서 도서관 결과를 조회하고 탐색하는 순서를 먼저 구현하도록 고정한다.
- pagination은 URL이 아니라 dialog/page local state 기반으로 구현한다.
- `pageSize`는 사용자 조절 없이 항상 `10`으로 고정한다.
- Kakao Map SDK는 `@/shared/env`의 `kakaoMapConfig`를 통해 로드하고, `autoload=false` + `kakao.maps.load(...)` 패턴을 따른다.
- `대출 가능 여부 조회`는 이번 phase에서 버튼과 handoff 자리까지만 구현하고, 실제 기능은 다음 phase로 넘긴다.

## Test Plan

- region confirm 후 library result dialog open
- loading / empty / error 상태 복구
- 현재 페이지 첫 번째 도서관 기본 선택
- list 선택 → map focus + detail sync
- marker 선택 → list active row + detail sync
- 좌표 없는 도서관 marker 제외
- state 기반 pagination과 `page=1` reset
- Kakao SDK unavailable fallback
- mobile info-first 순서와 dialog 접근성
- `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`

## Assumptions

- `task.md` 경로는 `docs/phases/phase-05-4-library-search-result-dialog/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- integration test의 상호작용 기본값은 `@testing-library/user-event`다.
- focused unit test는 page change helper, coordinate filtering, Kakao SDK loader처럼 순수 로직이 실제로 분리될 때만 추가한다.
- 이번 phase는 도서관 결과 dialog와 지도/리스트/상세 동기화까지 다루고, `대출 가능 여부 조회`의 실제 조회 기능은 다루지 않는다.
