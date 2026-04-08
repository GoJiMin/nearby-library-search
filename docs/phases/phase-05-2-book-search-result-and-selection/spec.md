# Phase 5-2. 도서 검색 결과와 도서 선택 구현

## 목표

- `Phase 5-1`에서 완성한 검색 시작 경험을 검색 결과 화면으로 확장한다.
- 도서 검색 결과 화면을 `docs/phases/phase-04-2-ux-ui-design/spec.md`의 흐름 계약과 `book-result-design-guide/screen.png`의 시각 구조에 맞게 구현 가능한 명세로 고정한다.
- 검색 결과 상태를 URL 기반으로 관리해 뒤로가기, 새로고침, 직접 진입 시 같은 결과 화면을 복원할 수 있게 한다.
- 결과 카드의 1차 행동은 `소장 도서관 찾기`로 두고, `상세 보기`와 함께 후속 다이얼로그 구현으로 이어질 수 있는 handoff 계약을 잠근다.

## 1차 source of truth

- 루트 `.impeccable.md`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- 루트 `AGENTS.md`
- `book-result-design-guide`
  - `screen.png`: 최우선 시각 정합 기준
  - `code.html`: 구조와 레이아웃 구현 힌트
  - `DESIGN.md`: 표면 계층, 타이포, 깊이감 기준

## 기술 결정

- React 구현 기준
  - `vercel-react-best-practices`를 기본 적용한다.
  - URL 상태와 화면 파생값은 effect로 중복 상태를 만들지 않고, 가능한 한 현재 URL과 query 결과에서 직접 계산한다.
  - 컴포넌트는 역할 단위로 분리하되, 현재 `features/book` 내부 코드 스타일을 그대로 따른다.
- 코드 구조 기준
  - `pages/home`는 검색 시작 route shell만 담당한다.
  - `pages/book-search-result`는 `/books` 결과 route shell과 URL 상태 분기만 담당한다.
  - 결과 조회, 결과 리스트, 페이지네이션, 카드 버튼은 `features/book`가 담당한다.
  - `entities/book`는 검색 params, query hook, 응답 타입, 상세 조회 hook을 공개한다.
- URL 상태 기준
  - 결과 화면 상태는 URL 검색 파라미터를 source of truth로 사용한다.
  - 허용 파라미터는 `title` 또는 `author`, 그리고 `page`다.
  - 예:
    - `?title=파친코&page=1`
    - `?author=한강&page=2`
- 버튼 행동 기준
  - `상세 보기`와 `소장 도서관 찾기`는 둘 다 버튼으로 렌더한다.
  - `상세 보기`는 후속 phase에서 `isbn13` 기준 도서 상세 조회 API를 호출하는 다이얼로그로 연결한다.
  - `소장 도서관 찾기`는 후속 phase에서 선택한 책 정보를 기준으로 지역 선택 다이얼로그를 연다.
  - 이번 phase에서는 버튼의 존재, 위치, handoff payload를 고정하고 실제 다이얼로그 구현은 하지 않는다.

## 구현 범위

- 검색 제출 후 `/books` route로 이동하는 구조를 명세로 고정한다.
- 결과 화면 상단의 압축 검색 바, 결과 요약 영역, 단일 컬럼 결과 카드 리스트, 페이지네이션 구조를 정리한다.
- `useGetSearchBooks`를 사용한 결과 조회 계약과 URL 기반 페이지 전환 규칙을 정리한다.
- 결과 카드에 표시할 실제 필드, 표시 우선순위, 버튼 구조, 없는 필드 처리 방식을 정리한다.
- loading, empty, error 상태를 결과 화면 안에서 복구 가능한 구조로 정리한다.
- 후속 phase에서 상세 다이얼로그와 지역 선택 다이얼로그가 이어질 수 있도록 클릭 handoff 인터페이스를 고정한다.

## 비범위

- 도서 상세 조회 다이얼로그 실제 구현
- 지역 선택 다이얼로그 실제 구현
- 도서관 결과 화면 구현
- 카카오맵 연동
- 존재하지 않는 설명 필드나 추천 문구 추가
- 앱 전역 URL 상태 관리 프레임워크 도입

## 현재 기반 상태

- `features/book`는 이미 검색 시작 기능 `BookSearchStart`와 canonical 검색 params 생성 helper를 가진다.
- `pages/home/ui/HomePage.tsx`는 현재 홈 메인 화면과 `BookSearchStart`를 조합하는 route shell이다.
- 결과 화면은 `/books` route에서 별도 page slice로 진입하도록 정리한다.
- `entities/book`는 아래 공개 API를 이미 가진다.
  - `parseSearchBooksParams`
  - `useGetSearchBooks`
  - `useGetBookDetail`
  - `MAX_BOOK_SEARCH_TERM_LENGTH`
  - `BOOK_SEARCH_PAGE_SIZE=10`
- 도서 검색 응답 계약은 아래로 고정돼 있다.
  - `BookSearchResponse`
    - `totalCount`
    - `items`
  - `BookSearchItem`
    - `title`
    - `author`
    - `publisher`
    - `publicationYear`
    - `isbn13`
    - `imageUrl`
    - `detailUrl`
    - `loanCount`
- 따라서 스크린샷에 보이는 카드 설명 문단은 현재 계약에 없으므로 구현 대상에 포함하지 않는다.

## 라우트 전환 계약

### 1. 검색 시작 route와 결과 route

- 홈 route `/`는 검색 시작 화면만 렌더한다.
- 결과 route `/books`는 검색 결과 화면만 렌더한다.
- `/books`는 URL 검색 파라미터를 source of truth로 사용한다.
- 결과 route에서는 `Phase 5-1A`의 홈 히어로 구조를 재사용하지 않고, 스크린샷처럼 압축된 결과 화면만 보여준다.

### 2. 검색 시작에서 결과 route로의 전환

- `BookSearchStart` 제출은 기존 canonical `BookSearchParams`를 만든다.
- `pages/home`는 제출된 params를 `/books` route URL 검색 파라미터로 기록한다.
- 검색 시작 제출 시 `page`는 항상 `1`로 시작한다.
- route가 `/books`로 전환되면 결과 화면이 렌더되고 `useGetSearchBooks`가 해당 params로 조회를 수행한다.

### 3. 결과 route 내부 재검색

- 결과 화면 상단 검색 바는 현재 URL 상태를 초기값으로 가진다.
- 사용자가 검색어를 수정하거나 검색 모드를 바꾸고 다시 제출하면 `/books` URL이 새 params로 갱신된다.
- 결과 화면에서 새 검색을 제출할 때는 항상 `page=1`로 리셋한다.
- 탭 전환 시 각 검색 모드의 마지막 입력값을 따로 기억한다.
- URL에 없는 반대 검색 모드의 입력값은 빈 값에서 시작하고, 이후에는 결과 검색 바 내부에서 모드별 마지막 값을 기억한다.
- URL에 반영되기 전까지의 편집 상태는 결과 검색 바 내부 로컬 상태로 유지할 수 있다.

## 결과 화면 계약

### 1. 스크린샷 정합 기준

- 결과 화면은 `book-result-design-guide/screen.png`의 구조를 최대한 그대로 따른다.
- 상단에서 아래로의 순서는 아래로 고정한다.
  - 중앙 정렬 세그먼트 탭
  - 넓은 단일 검색 바
  - 동적 결과 요약 문장
  - 단일 컬럼 결과 카드 리스트
  - 하단 중앙 페이지네이션
- 결과 화면은 홈 히어로보다 훨씬 압축된 검색 툴바 중심 구조여야 한다.
- 표면 표현은 `DESIGN.md`의 기준대로 밝기 차이와 부드러운 깊이감을 우선하고, 강한 경계선 사용은 최소화한다.

### 2. 상단 결과 검색 바

- 상단 세그먼트 탭은 `책 제목` / `저자명` 두 가지로 고정한다.
- 탭 아래에는 넓은 단일 검색 바를 둔다.
- 검색 바는 스크린샷처럼 하나의 큰 rounded field로 보이게 한다.
- 검색 제출 affordance는 검색 바 오른쪽 내부의 검색 아이콘 버튼으로 둔다.
- 결과 화면 상단 검색 바에서는 `Phase 5-1`의 긴 CTA 버튼 레이아웃을 재사용하지 않는다.
- 글자 수 표시는 검색 바 오른쪽 아래에 `현재 길이 / 100` 형태로 노출한다.
- 검색 바도 `MAX_BOOK_SEARCH_TERM_LENGTH`를 그대로 따른다.

### 3. 검색 결과 요약 영역

- 결과 리스트 위에는 `"검색어"에 대한 N개의 검색 결과가 있습니다.` 문구만 둔다.
- 이 문장이 결과 화면의 유일한 제목 역할을 한다.
- 검색어는 현재 활성 검색 모드의 실제 query 값을 사용한다.
- 결과 수는 `totalCount`를 사용한다.

### 4. 결과 카드 구조

- 결과 카드는 단일 컬럼 수직 리스트로 렌더한다.
- 각 카드는 아래 구조를 가진다.
  - 좌측: 표지 영역
  - 우측 상단: 제목, 저자
  - 우측 중단: 메타 정보 행
  - 우측 하단: 버튼 영역
- 정보 우선순위는 아래로 고정한다.
  - `title`
  - `author`
  - `publisher`, `publicationYear`
  - `isbn13`
  - `loanCount`
- `imageUrl`은 보조 정보다.
  - 값이 있으면 표지를 렌더한다.
  - 값이 없으면 중립적인 placeholder 표지 박스를 렌더한다.
- 카드 설명 문단은 실제 필드가 없으므로 구현하지 않는다.
- 존재하지 않는 값을 위해 가짜 문구, lorem ipsum, 설명 placeholder를 추가하지 않는다.

### 5. 카드 메타 정보 표시 규칙

- `publisher`와 `publicationYear`는 둘 다 있으면 함께 표시한다.
- 둘 중 하나만 있으면 있는 값만 표시한다.
- `isbn13`은 메타 정보 행에서 보조 정보로 표시한다.
- `loanCount`가 있으면 `대출 N건` 형태로 표시한다.
- `loanCount`가 없으면 해당 메타 정보만 숨긴다.
- 메타 정보는 스크린샷처럼 한 줄에 이어지는 작은 토큰형 정보로 배치한다.

### 6. 카드 버튼 계약

- 각 카드의 액션은 메타 정보 바로 아래 한 줄에 둔다.
- 액션 순서는 아래로 고정한다.
  - `상세 보기`
  - `소장 도서관 찾기`
- 두 액션 모두 semantic은 `button`으로 유지하되, 시각적으로는 배경과 테두리가 없는 텍스트 액션으로 구현한다.
- hover와 focus 시 텍스트는 브랜드 accent 색으로 강조한다.
- `상세 보기`
  - 텍스트 secondary action
  - 후속 phase의 도서 상세 다이얼로그 트리거
  - handoff payload는 최소 `isbn13`
  - 이번 phase에서는 버튼 존재와 click handoff 계약만 고정한다.
- `소장 도서관 찾기`
  - 텍스트 primary action
  - 도서 선택/확정의 의미를 가진다.
  - 후속 phase의 지역 선택 다이얼로그 트리거
  - handoff payload는 최소 `isbn13`, `title`, `author`
  - 1개 결과여도 자동 진행하지 않고 사용자가 이 버튼을 눌러야 한다.
- `detailUrl`은 현재 phase에서 버튼 렌더 조건이나 기본 동작으로 사용하지 않는다.
  - 후속 도서 상세 조회는 `isbn13` 기반 내부 API를 사용한다.

## URL 상태와 페이지네이션 계약

### 1. URL 검색 파라미터

- URL 상태는 아래 규칙을 따른다.
  - `title`과 `author`는 동시에 존재하지 않는다.
  - `page`는 양의 정수만 허용한다.
- URL 파라미터 파싱은 `parseSearchBooksParams`를 사용한다.
- 유효하지 않은 `page`는 기본값 `1`로 보정한다.
- `/books`에 검색 상태가 전혀 없으면 `/`로 복귀시킨다.
- `/books`에 잘못된 검색 상태가 있으면 결과 route 안에서 인라인 복구 UI를 렌더한다.

### 2. 페이지네이션

- 전체 페이지 수는 `Math.ceil(totalCount / BOOK_SEARCH_PAGE_SIZE)`로 계산한다.
- 페이지네이션 UI는 스크린샷처럼 아래 구조를 가진다.
  - 이전 버튼
  - 숫자 버튼들
  - 다음 버튼
- 현재 페이지는 시각적으로 강하게 강조한다.
- 페이지 버튼 클릭은 URL의 `page`만 갱신한다.
- 뒤로가기와 앞으로가기는 브라우저 URL history에 맞게 결과 상태를 복원해야 한다.
- 새로고침 시에도 같은 URL이면 같은 검색 결과 상태를 복원해야 한다.

## 상태 계약

### 1. loading

- 결과 조회 중에도 상단 검색 바와 결과 요약 영역은 유지한다.
- 로딩 중 결과 요약 제목은 실제 `totalCount` 대신 현재 검색어를 포함한 상태 문구로 표시한다.
  - 예: `파친코 검색 결과를 불러오는 중이에요.`
- 카드 영역에는 스크린샷 레이아웃을 닮은 결과 카드 스켈레톤을 렌더한다.
- 스켈레톤 카드는 현재 결과 카드와 같은 크기와 배치를 유지하고, 기본 개수는 5개로 고정한다.
- 짧은 단계 안내 문구는 `도서를 찾고 있습니다.` 수준으로 유지한다.

### 2. empty

- 결과가 없으면 같은 결과 화면 안에서 empty state를 렌더한다.
- 검색 모드와 검색어는 유지한다.
- 결과 요약 제목은 `0개의 검색 결과`를 그대로 보여준다.
- 주 복구 행동은 `검색어 수정 후 다시 검색`이다.
- 검색 시작 화면으로 강제 복귀시키지 않는다.
- 결과 카드가 없다고 해서 스크린샷에 없는 추가 정보 섹션을 만들지 않고, 간략한 텍스트 안내만 둔다.

### 3. error

- 조회 오류가 나도 상단 검색 바와 현재 검색 상태는 유지한다.
- 결과 영역 안에서 스크린샷 기준의 중앙 정렬 오류 패널과 `다시 시도` 버튼을 렌더한다.
- query 오류는 공용 query error boundary가 잡고, `다시 시도`는 query reset과 boundary reset을 함께 수행해야 한다.
- 사용자 메시지는 `shared/request`의 서버 에러 title 매핑을 우선 사용하고, 매핑되지 않으면 공통 fallback 문구를 사용한다.
- 전역 오류 페이지나 토스트를 기본 경로로 사용하지 않는다.

## Feature 레이어 상세 설계

### 1. `pages/home`

- 검색 시작 route shell만 담당한다.
- 검색 제출 시 canonical params를 `/books` route URL로 반영한다.
- `pages/home`는 결과 카드 렌더링, 페이지네이션 계산, 도서 선택 버튼 세부 로직을 직접 소유하지 않는다.

### 2. `pages/book-search-result`

- `/books` route shell과 URL 상태 분기만 담당한다.
- URL 상태 해석 결과가 `ok`면 `features/book` 결과 화면을 렌더한다.
- URL 상태 해석 결과가 `empty`면 `/`로 복귀시킨다.
- URL 상태 해석 결과가 `recoverable`이면 결과 route 안에서 인라인 복구 UI를 렌더한다.

### 3. `features/book`

- 이번 phase에서 같은 `features/book` slice 안에 아래 역할을 추가한다.
  - 결과 화면 상단 검색 바
  - 결과 리스트
  - 결과 카드
  - 페이지네이션
  - 결과 상태 handling
- 현재 `features/book` 스타일을 그대로 따른다.
  - `ui`, `model` 중심 분리
  - 공개 API는 slice `index.ts`
  - 테스트는 대상 디렉터리 아래 `test/`
- 컴포넌트 책임은 아래처럼 나눈다.
  - 결과 화면 orchestration
  - 상단 검색 바
  - 결과 카드 리스트
  - 카드 액션 버튼 영역
  - 페이지네이션
- 하나의 컴포넌트가 조회, URL 파싱, 카드 렌더링, 버튼 orchestration을 모두 떠안지 않도록 한다.

### 3. `entities/book`

- `useGetSearchBooks`는 결과 조회를 담당한다.
- `parseSearchBooksParams`는 URL params canonicalization을 담당한다.
- `useGetBookDetail`는 이번 phase에서 직접 호출하지 않더라도 후속 상세 다이얼로그 handoff를 위한 기반으로 유지한다.

## 완료 기준

- 문서만 읽고 홈 검색 시작 화면에서 `/books` 결과 route로 어떻게 이동하는지 설명할 수 있어야 한다.
- 문서만 읽고 결과 화면이 왜 URL 기반 상태를 source of truth로 가지는지 설명할 수 있어야 한다.
- 문서만 읽고 결과 카드에 어떤 필드를 어떤 우선순위로 보여주는지 구현할 수 있어야 한다.
- 문서만 읽고 `상세 보기`와 `소장 도서관 찾기` 버튼이 이번 phase에서 어디까지 구현되고, 무엇을 후속 phase로 넘기는지 설명할 수 있어야 한다.
- 문서만 읽고 스크린샷과 얼마나 비슷하게 만들어야 하는지 구현자가 별도 판단 없이 이해할 수 있어야 한다.

## 테스트 기준

- `/books` URL에 유효한 `title` 또는 `author`가 있으면 결과 화면이 렌더링돼야 한다.
- `/books` URL에 검색 상태가 없으면 `/`로 복귀해야 한다.
- `/books` URL이 잘못되면 결과 route 안에서 인라인 복구 UI가 렌더링돼야 한다.
- 결과 화면은 스크린샷처럼 상단 검색 바, 결과 요약, 카드 리스트, 페이지네이션 구조를 가져야 한다.
- 결과 카드는 실제 필드만 렌더링해야 하며, 설명 문단은 렌더링하지 않아야 한다.
- `상세 보기`와 `소장 도서관 찾기`는 모두 버튼이어야 한다.
- `소장 도서관 찾기`는 카드별 1차 CTA로 동작해야 한다.
- 페이지 전환 시 URL의 `page`가 갱신돼야 하며, 뒤로가기와 새로고침 후에도 상태가 유지돼야 한다.
- empty, error, loading은 모두 결과 화면 안에서 복구 가능해야 한다.
- integration test를 기본으로 하고, URL 파싱이나 페이지 수 계산처럼 순수 로직이 추출되면 그 부분만 focused unit test를 허용한다.

## 기본 가정

- Phase 5-2의 새 문서 경로는 `docs/phases/phase-05-2-book-search-result-and-selection/spec.md`로 고정한다.
- 결과 화면은 `/books` 별도 route에서 URL 상태를 source of truth로 유지한다.
- 스크린샷 정합은 최대한 강하게 맞추되, 실제 계약에 없는 설명 문단과 가짜 데이터는 추가하지 않는다.
- `상세 보기`와 `소장 도서관 찾기`의 실제 다이얼로그 구현은 후속 phase에서 진행한다.
- 코드 구조와 테스트 위치는 현재 `features/book` 구현 스타일을 그대로 따른다.
