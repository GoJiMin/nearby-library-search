# Phase 5-6. 도서 상세 보기 구현

## 목표

- `Phase 5-2`에서 handoff만 고정했던 `상세 보기` 버튼을 실제 도서 상세 조회 다이얼로그로 연결한다.
- `BookSearchResultCard -> context -> onOpenBookDetail` 패턴을 제거하고, 현재 프로젝트의 dialog orchestration 방식에 맞는 zustand 기반 상태 소유 구조로 정리한다.
- 도서 상세 다이얼로그는 현재 지역 선택, 도서관 결과 다이얼로그와 같은 overlay dialog 톤과 shared UI 규칙을 그대로 따른다.
- 상세 조회에서 필요한 대출 정보는 `전체 대출 정보`와 `연령별 대출 정보`만 남기고, 나머지 분기 정보는 내부 계약에서 제거한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 5-6`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- `docs/phases/phase-05-2-book-search-result-and-selection/spec.md`

## 기술 결정

- web 구현 기준
  - `/books` route page는 계속 book, region, library 흐름을 orchestration한다.
  - `상세 보기`는 새 route가 아니라 `/books` 위 overlay dialog로 구현한다.
  - 상세 dialog open/close 상태는 `features/book` 전용 zustand store가 소유한다.
  - 상세 응답 데이터는 zustand에 저장하지 않고, 기존 `useGetBookDetail` query 결과를 그대로 사용한다.
  - 상세 dialog 내부 조회는 기존 `useSuspenseQuery` 흐름을 유지하고 `Suspense + QueryErrorBoundary` 조합으로 처리한다.
- 데이터/계약 기준
  - `BookDetailResponse`는 유지하되 `loanInfo` shape를 `total + byAge`로 축소한다.
  - `BookDetailActionPayload`는 `isbn13`만 가진다.
  - 검색 결과의 `detailUrl`은 상세 dialog 문맥으로 넘기지 않는다.
  - BFF는 계속 `/api/books/:isbn13`를 제공하고, web은 기존 entity 공개 API만 사용한다.
- UI 기준
  - 새 시각 언어를 만들지 않는다.
  - dialog, button, card, typography, close affordance, overlay, spacing은 현재 region/library dialog와 같은 앱 톤을 따른다.
  - 상세 dialog는 정보형 surface로 구현하고, map/result dialog처럼 기능 밀도가 높은 비교 화면으로 만들지 않는다.

## 구현 범위

- `상세 보기` 버튼을 실제 상세 dialog open action으로 연결한다.
- `features/book`에 상세 dialog 전용 store와 dialog UI를 추가한다.
- `/books` 결과 화면 route shell에 `BookDetailDialog`를 mount한다.
- 기존 `useGetBookDetail`와 `/api/books/:isbn13`를 연결해 loading, success, empty, error 상태를 구현한다.
- `packages/contracts`와 BFF book detail normalization에서 `loanInfo`를 `total + byAge` 기준으로 정리한다.
- 결과 화면 맥락이 바뀔 때 상세 dialog가 자연스럽게 닫히는 규칙을 고정한다.

## 비범위

- 도서 상세 전용 page route 추가
- 상세 dialog 안에서 `소장 도서관 찾기`를 다시 제공하는 작업
- `지역별`, `성별` 대출 정보 표시
- 상세 dialog의 북마크, 공유, 추천 등 추가 행동
- BFF 상세 endpoint path 변경

## 현재 구현 상태

- `entities/book`는 이미 아래 공개 API를 가진다.
  - `useGetBookDetail`
  - `booksQueryOptions.detail`
  - `getBookDetail`
- BFF는 이미 `/api/books/:isbn13` route를 제공한다.
- `packages/contracts`의 `BookDetailResponse`는 현재 `loanInfo.total`, `loanInfo.byAge`만 가진다.
- `BookSearchResultCard`는 현재 `useBookDetailDialogStore(state => state.openBookDetailDialog)`를 직접 사용해 `isbn13`만 handoff한다.
- `/books` route shell은 현재 `BookDetailDialog`, `RegionSelectDialog`, `LibrarySearchResultDialog`를 함께 mount한다.
- `BookDetailDialog`는 현재 loading, success, empty, error, close 흐름과 route 문맥 변경 시 reset 규칙까지 구현돼 있다.

## 아키텍처와 책임 분리

### 1. route와 feature 경계

- `pages/book-search-result`
  - `/books` route shell과 dialog mount orchestration만 담당한다.
  - `BookDetailDialog`, `RegionSelectDialog`, `LibrarySearchResultDialog`를 함께 조합한다.
- `features/book`
  - 상세 dialog 상태 store
  - 상세 dialog 레이아웃과 loading/empty/error/success UI
  - 결과 카드의 `상세 보기` open action
  를 담당한다.
- `entities/book`
  - 상세 조회 request/query 계약만 담당한다.
- `shared/ui`
  - 기존 dialog primitive와 공통 UI만 제공한다.

### 2. 상세 dialog store 계약

- 새 store는 `features/book/model` 전용으로 둔다.
- 권장 shape는 아래로 고정한다.

```ts
type BookDetailDialogPayload = {
  isbn13: Isbn13;
};

type BookDetailDialogState = {
  selectedBookDetail: BookDetailDialogPayload | null;
};

type BookDetailDialogActions = {
  closeBookDetailDialog: () => void;
  openBookDetailDialog: (payload: BookDetailDialogPayload) => void;
  resetBookDetailDialog: () => void;
};
```

- store는 `selectedBookDetail`만 가진다.
- 상세 조회 결과, loading, error 같은 query 상태는 store에 저장하지 않는다.
- 결과 화면 맥락이 아래처럼 바뀌면 dialog는 닫는다.
  - 새 검색 제출
  - `/books` URL params 변경
  - route 이탈

### 3. 결과 카드 open action 계약

- `BookSearchResultActionContext`는 제거한다.
- `BookSearchResultProps`의 `onOpenBookDetail`도 제거한다.
- `BookSearchResultCard`는 context 대신 `useBookDetailDialogStore(state => state.openBookDetailDialog)`를 직접 사용한다.
- `상세 보기` 클릭 payload는 아래로 고정한다.

```ts
{
  isbn13: item.isbn13,
}
```

## 데이터 계약

### 1. contracts shape

- `BookDetailLoanInfo`는 아래 shape로 축소한다.

```ts
type BookDetailLoanInfo = {
  total: BookDetailLoanStat | null;
  byAge: BookDetailLoanStat[];
};
```

- `byGender`, `byRegion`는 제거한다.

### 2. BFF normalization 계약

- BFF는 계속 `/srchDtlList`와 `loaninfoYN=Y`를 사용한다.
- 다만 normalized response에서는 아래만 남긴다.
  - `loanInfo.total`
  - `loanInfo.byAge`
- upstream에서 `regionResult`, `genderResult`가 오더라도 web/contracts로는 전달하지 않는다.
- `book === null`은 error가 아니라 정상 응답의 empty state로 취급한다.

## dialog UI 계약

### 1. open / close

- 상세 dialog는 `selectedBookDetail != null`일 때만 연다.
- 아래 close 동작을 모두 지원한다.
  - 우측 상단 닫기 버튼
  - overlay dismiss
  - `Esc`
- 닫으면 `/books` 결과 화면은 그대로 유지한다.

### 2. 공통 visual tone

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` 등 현재 shared dialog primitive를 그대로 사용한다.
- close button, overlay, shadow, surface, radius, spacing은 현재 region/library dialog와 같은 톤을 따른다.
- 새 dialog만 별도의 시각 언어를 갖지 않는다.
- desktop/mobile 모두 현재 app typography와 spacing rhythm을 유지한다.

### 3. 정보 구조

- 정보 우선순위는 아래로 고정한다.
  - 표지
  - 제목
  - 저자
  - 출판사 / 출판일 또는 출판연도
  - ISBN / ISBN13
  - 분류 정보
  - 설명
  - 전체 대출 정보
  - 연령별 대출 정보
- 값이 없는 필드는 가짜 문구 없이 숨긴다.
- `description`이 없으면 설명 섹션을 숨긴다.

### 4. 반응형 구조

- desktop
  - 표지와 본문 정보가 함께 보이는 정보형 dialog 구조
  - 본문은 overflow 시 내부 스크롤 가능
- mobile
  - 단일 컬럼 스크롤 구조
  - close affordance와 heading은 상단에 유지
- mobile도 desktop과 같은 tone과 정보 순서를 유지하되, 병렬 배치만 단일 컬럼으로 바꾼다.

## 상태 계약

### 1. loading

- dialog는 즉시 열리고, 본문 안에서 loading skeleton을 보여준다.
- loading 중에도 close는 가능해야 한다.
- loading shell도 실제 dialog 구조와 같은 heading, cover block, 정보 block rhythm을 유지한다.

### 2. success

- 상세 정보가 있으면 본문 전체를 렌더한다.
- `loanInfo.total`이 있으면 대표 수치 블록으로 보여준다.
- `loanInfo.byAge`가 있으면 연령대별 목록을 보여준다.
- `loanInfo.total`과 `loanInfo.byAge`가 모두 없으면 `대출 정보가 없어요.`만 보여준다.

### 3. empty

- `book === null`이면 empty state를 보여준다.
- empty state 문구는 `도서 상세 정보를 찾지 못했어요.`로 고정한다.
- empty state에서도 dialog는 열린 상태를 유지하고, 사용자는 닫을 수 있어야 한다.

### 4. error

- 에러는 dialog 내부에서 복구 가능한 상태로 보여준다.
- 사용자 문구는 `shared/request`의 error message mapping을 따른다.
- `다시 시도` 버튼으로 query reset + boundary reset을 수행한다.
- 전역 오류 페이지로 보내지 않는다.

## 테스트 기준

### 1. web 통합 테스트

- 사용자 기능 통합테스트 기준으로 아래를 검증한다.
  - 결과 카드에서 `상세 보기`를 눌러 도서 상세 창을 열 수 있다.
  - 상세 정보를 불러오는 동안 loading 상태를 본다.
  - 상세 정보가 있으면 제목, 저자, 표지, 기본 메타 정보, 전체 대출 정보, 연령별 대출 정보를 확인할 수 있다.
  - 설명이 없으면 해당 정보는 보이지 않는다.
  - 상세 정보를 찾지 못하면 빈 상태 안내를 본다.
  - 상세 정보를 불러오지 못하면 dialog 안에서 다시 시도할 수 있다.
  - 창을 닫으면 결과 화면으로 자연스럽게 돌아간다.
  - 검색 조건이 바뀌면 상세 창은 닫힌다.
- 구현 디테일 검증은 하지 않는다.
  - context callback 호출 테스트 금지
  - store action 직접 호출 테스트 금지
  - React Query 내부 동작 검증 금지

### 2. BFF/contracts 테스트

- `/api/books/:isbn13` integration 기준으로 아래를 검증한다.
  - normalized response가 `loanInfo.total + loanInfo.byAge`만 가진다.
  - `byGender`, `byRegion`는 내부 계약에 남지 않는다.
  - upstream payload 일부 누락 시에도 `book`과 `loanInfo`가 안전하게 정규화된다.

## Acceptance 기준

- 문서만 읽고 `상세 보기`가 `/books` route 안에서 어떤 dialog로 열리고 닫히는지 설명할 수 있어야 한다.
- 문서만 읽고 왜 context를 제거하고 zustand store로 바꾸는지 설명할 수 있어야 한다.
- 문서만 읽고 상세 dialog가 현재 region/library dialog와 같은 UI 톤을 따른다는 점이 분명해야 한다.
- 문서만 읽고 `loanInfo`가 왜 `total + byAge`만 남는지 설명할 수 있어야 한다.

## Assumptions

- `상세 보기` 상태는 `useFindLibraryStore`에 합치지 않고 `features/book` 전용 store로 분리한다.
- 검색 결과 응답의 `detailUrl`은 이번 phase의 상세 dialog UI에서 사용하지 않는다.
- 상세 응답 데이터는 zustand에 저장하지 않고 React Query가 계속 소유한다.
- 상세 dialog 안에 `소장 도서관 찾기`를 다시 노출하지 않는다.
