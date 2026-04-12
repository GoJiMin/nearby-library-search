# Phase 5-6. 도서 상세 보기 구현 Task

## 1. `packages/contracts`의 도서 상세 대출 정보 계약 축소

- [x] `BookDetailLoanInfo`에서 `byGender`, `byRegion`를 제거한다.
- [x] `BookDetailResponse`가 `loanInfo.total + loanInfo.byAge`만 가지도록 고정한다.
- [x] `packages/contracts/src/index.ts` export가 새 계약과 일치하는지 확인한다.
- [x] web과 BFF가 축소된 내부 계약만 공유하는지 확인한다.

## 2. BFF `bookDetail` 정규화 축소

- [x] `/api/books/:isbn13` normalized response에서 `loanInfo.total`만 대표 값으로 남긴다.
- [x] `loanInfo.byAge`만 정규화하고 `genderResult`, `regionResult`는 버린다.
- [x] `book === null`을 error가 아니라 empty 가능한 정상 응답으로 유지한다.
- [x] 기존 error helper와 route 구조를 그대로 유지한다.

## 3. BFF 상세 route 회귀 검증 정리

- [x] `/api/books/:isbn13` integration test가 축소된 `loanInfo` shape를 검증하도록 갱신한다.
- [x] `byGender`, `byRegion`가 normalized response에 남지 않는지 검증한다.
- [x] upstream payload 일부 누락 시에도 `loanInfo.total + byAge`가 안전하게 정규화되는지 검증한다.
- [x] 기존 `BOOK_DETAIL_*` 에러 흐름이 깨지지 않는지 검증한다.

## 4. `features/book` 상세 dialog store 추가

- [x] `features/book/model`에 `useBookDetailDialogStore`를 추가한다.
- [x] store state는 `selectedBookDetail: { isbn13; detailUrl } | null`만 소유한다.
- [x] `openBookDetailDialog`, `closeBookDetailDialog`, `resetBookDetailDialog` action을 추가한다.
- [x] 상세 조회 응답 데이터는 store에 저장하지 않는 규칙을 고정한다.

## 5. `BookDetailActionPayload`와 결과 카드 open payload 정리

- [x] `BookDetailActionPayload`를 `isbn13 + detailUrl` 기준으로 확장한다.
- [x] `BookSearchResultCard`의 `상세 보기` 클릭 payload를 새 계약에 맞춘다.
- [x] `detailUrl`이 `null`이어도 dialog를 여는 데 문제 없도록 고정한다.
- [x] `소장 도서관 찾기` payload와 흐름은 그대로 유지한다.

## 6. `BookSearchResultActionContext` 제거

- [ ] `BookSearchResultActionContext`와 관련 helper를 제거한다.
- [ ] `BookSearchResultProps`의 `onOpenBookDetail`를 제거한다.
- [ ] `BookSearchResult`가 더 이상 detail handoff orchestration을 소유하지 않게 정리한다.
- [ ] 결과 카드가 store action을 직접 사용하도록 연결한다.

## 7. `/books` route shell에 `BookDetailDialog` mount

- [ ] `pages/book-search-result`가 `BookDetailDialog`를 `RegionSelectDialog`, `LibrarySearchResultDialog`와 함께 조합하도록 연결한다.
- [ ] dialog open 기준을 `selectedBookDetail != null`로 고정한다.
- [ ] close 시 result page는 유지되고 dialog만 닫히게 한다.
- [ ] 검색 조건이 바뀌거나 route를 이탈하면 dialog를 reset하는 규칙을 연결한다.

## 8. `BookDetailDialog` 기본 골격 구현

- [ ] shared `Dialog` primitive를 사용해 상세 dialog shell을 구현한다.
- [ ] 현재 region/library dialog와 같은 close affordance, overlay, surface 톤을 따른다.
- [ ] desktop/mobile 모두 현재 app typography와 spacing rhythm을 그대로 사용한다.
- [ ] 새 시각 언어를 만들지 않는다는 구현 경계를 유지한다.

## 9. 상세 dialog loading 상태 구현

- [ ] dialog는 즉시 열리고 본문 안에서 loading skeleton을 렌더한다.
- [ ] loading 중에도 닫을 수 있게 유지한다.
- [ ] loading shell이 실제 dialog 구조와 같은 cover, heading, content rhythm을 따르도록 구현한다.
- [ ] 기존 `useGetBookDetail`의 suspense 흐름과 충돌하지 않게 연결한다.

## 10. 상세 dialog success 기본 정보 구현

- [ ] 제목, 저자, 표지, 출판사/출판일 또는 출판연도, ISBN/ISBN13, 분류 정보를 렌더한다.
- [ ] 값이 없는 필드는 가짜 문구 없이 숨긴다.
- [ ] `description`이 있을 때만 설명 섹션을 렌더한다.
- [ ] desktop은 정보형 dialog, mobile은 단일 컬럼 스크롤 구조로 구현한다.

## 11. 상세 dialog 대출 정보 구현

- [ ] `loanInfo.total`을 대표 수치 블록으로 렌더한다.
- [ ] `loanInfo.byAge`를 연령대별 목록 또는 토큰 형태로 렌더한다.
- [ ] `loanInfo.total`과 `loanInfo.byAge`가 모두 없으면 `대출 정보가 없어요.`를 보여준다.
- [ ] `byGender`, `byRegion` UI는 만들지 않는다.

## 12. 상세 링크 표시 규칙 구현

- [ ] store payload의 `detailUrl`을 dialog가 읽을 수 있게 연결한다.
- [ ] `detailUrl`이 있을 때만 `상세 링크 보기`를 렌더한다.
- [ ] `detailUrl`이 없으면 해당 CTA를 완전히 숨긴다.
- [ ] 외부 링크는 현재 shared button/link 톤을 따르되, dialog 내부 보조 행동 수준으로 유지한다.

## 13. empty, error, close 흐름 구현

- [ ] `book === null`이면 `도서 상세 정보를 찾지 못했어요.` empty state를 렌더한다.
- [ ] error는 dialog 내부 복구 가능한 상태로 렌더한다.
- [ ] `다시 시도`로 query reset과 boundary reset을 수행한다.
- [ ] 닫기 버튼, overlay click, `Esc` 모두 dialog close로 동작하게 한다.

## 14. 사용자 기능 통합테스트 추가

- [ ] 결과 카드에서 `상세 보기`를 눌러 상세 창을 열 수 있는지 검증한다.
- [ ] loading, success, empty, error를 사용자 기능 기준으로 검증한다.
- [ ] 제목, 저자, 표지, 메타 정보, 전체 대출 정보, 연령별 대출 정보를 확인할 수 있는지 검증한다.
- [ ] 설명이나 상세 링크가 없으면 보이지 않는지 검증한다.
- [ ] 창을 닫으면 결과 화면으로 자연스럽게 돌아가는지 검증한다.
- [ ] 검색 조건이 바뀌면 상세 창이 닫히는지 검증한다.

## 15. 최종 검증과 문서 동기화

- [ ] `pnpm test:run`을 통과시킨다.
- [ ] `pnpm lint:web`를 통과시킨다.
- [ ] `pnpm typecheck:web`와 `pnpm --filter @nearby-library-search/bff build`를 통과시킨다.
- [ ] `pnpm build:web`를 통과시킨다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-6 상태를 실제 구현과 동기화한다.

## Important Changes

- 이번 phase는 `상세 보기`를 `/books` 결과 화면 위의 실제 dialog로 연결하도록 고정한다.
- `BookSearchResultCard -> context -> onOpenBookDetail` 패턴은 제거하고 `features/book` 전용 zustand store로 전환한다.
- 상세 응답 데이터는 zustand에 저장하지 않고 기존 React Query 흐름을 그대로 사용한다.
- `BookDetailLoanInfo`는 `total + byAge`만 남기고 `byGender`, `byRegion`는 제거한다.
- 상세 dialog UI는 현재 region/library dialog와 같은 shared UI 톤을 그대로 따른다.

## Test Plan

- BFF
  - `/api/books/:isbn13`가 축소된 `loanInfo` shape만 반환하는지 검증
  - `book === null` empty 가능 응답 유지 검증
  - error flow 회귀 검증
- web
  - `/books` 결과 화면에서 상세 dialog open/close
  - loading, success, empty, error
  - 설명과 상세 링크 조건부 렌더
  - 검색 조건 변경 시 dialog close
- 테스트 원칙
  - 사용자 기능 통합테스트 중심
  - context callback, store action, React Query 내부 동작 직접 검증 금지

## Assumptions

- `task.md` 경로는 `docs/phases/phase-05-6-book-detail-dialog/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- integration test 상호작용 기본값은 `@testing-library/user-event`다.
- `상세 보기` 상태는 `useFindLibraryStore`와 분리된 `features/book` 전용 store로 간다.
- `detailUrl`은 store payload로만 전달하고 BFF/contracts에는 추가하지 않는다.
