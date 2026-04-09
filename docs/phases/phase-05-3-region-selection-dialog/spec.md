# Phase 5-3. 지역 선택 다이얼로그 구현

## 목표

- `Phase 5-2`에서 확정한 도서 선택 handoff를 실제 지역 선택 다이얼로그로 연결한다.
- 지역 선택 다이얼로그를 `docs/phases/phase-04-2-ux-ui-design/spec.md`의 상호작용 계약과 `region-select-dialog-design-guide/screen.png`의 시각 구조에 맞게 구현 가능한 명세로 고정한다.
- 상위 지역 필수, 세부 지역 선택 optional refinement, `전체` 기본값, 하단 선택 요약, 완료 CTA 활성 조건을 이번 phase에서 잠근다.
- 다이얼로그 완료 시 다음 phase가 바로 사용할 수 있는 canonical `LibrarySearchParams` handoff 계약을 고정한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- 루트 `AGENTS.md`
- `region-select-dialog-design-guide`
  - `screen.png`: 최우선 시각 정합 기준
  - `code.html`: 구조와 레이아웃 구현 힌트
  - `DESIGN.md`: 표면 계층, 깊이감, CTA 톤 기준

## 기술 결정

- React 구현 기준
  - `vercel-react-best-practices`를 기본 적용한다.
  - dialog open state와 마지막 확정 선택값은 page orchestration에서 소유하고, 다이얼로그 내부에서는 현재 편집 중인 draft만 관리한다.
  - effect로 중복 동기화 상태를 만들기보다, `open` 시점의 입력값으로 draft를 초기화하는 구조를 우선한다.
- UI primitive 기준
  - dialog는 직접 구현하지 않고 `@/shared/ui`의 `Dialog`, `DialogContent`, `DialogTitle`, `DialogClose` 등 현재 shared primitive를 사용한다.
  - 새 dialog primitive나 별도 modal 라이브러리를 추가하지 않는다.
- 코드 구조 기준
  - `pages/book-search-result`는 지역 선택 dialog의 open/close와 선택된 책, 마지막 확정 지역 상태를 소유한다.
  - `features/region`은 지역 선택 다이얼로그 UI와 지역/세부 지역 draft 선택 흐름을 담당한다.
  - `entities/region`은 지역 옵션과 검증 helper를 제공한다.
  - `entities/library`는 `LibrarySearchParams`와 `parseSearchLibrariesParams`를 제공한다.
- 시각 기준
  - 스크린샷의 영문 카피는 모두 한국어로 번역한다.
  - 활성 행, 체크 표시, 완료 CTA의 강조 색은 현재 프로젝트 accent 토큰으로 번역하며, 대표 배경은 `bg-accent`를 사용한다.
  - 강한 1px 테두리보다는 surface 차이와 낮은 대비 outline로 위계를 만든다.

## 구현 범위

- `/books` 결과 화면의 `소장 도서관 찾기` 클릭으로 여는 지역 선택 다이얼로그를 구현한다.
- 상위 지역 목록, 세부 지역 목록, 현재 선택 요약, `초기화`, `선택 완료` 흐름을 정리한다.
- `전체` 선택이 실제 `detailRegion` 미포함 canonical params로 매핑되는 규칙을 정리한다.
- ESC, 닫기 버튼, overlay dismiss, focus trap, 키보드 탭 순서를 포함한 접근성 기준을 정리한다.
- 다시 열기 시 마지막 확정 지역 선택을 복원하는 규칙을 정리한다.
- 사용자 요청에 따라 스크린샷 수준의 row 톤 polish와 모바일 전용 stack 재배치는 이번 phase 마감 범위에서 제외한다.

## 비범위

- 실제 도서관 결과 조회 실행과 결과 화면 렌더링
- 지도/리스트/상세 패널 UI
- 지역 선택 상태의 URL 동기화
- 전역 토스트나 전역 dialog 매니저 도입
- 지역 데이터의 BFF 동적 조회

## 현재 기반 상태

- `features/book` 결과 카드에는 이미 `소장 도서관 찾기` 버튼과 `BookSelectionActionPayload` handoff가 구현되어 있다.
- `pages/book-search-result`는 `/books` route shell을 소유하고 있어 지역 선택 다이얼로그 orchestration을 가장 자연스럽게 연결할 수 있다.
- `entities/region`은 아래 공개 API를 이미 가진다.
  - `REGION_OPTIONS`
  - `DETAIL_REGION_OPTIONS_BY_REGION`
  - `isDetailRegionOfRegion`
- `entities/library`는 아래 공개 API를 이미 가진다.
  - `LibrarySearchParams`
  - `parseSearchLibrariesParams`
  - `DEFAULT_SEARCH_LIBRARIES_PAGE=1`
- `shared/ui`는 dialog 조합에 필요한 공통 primitive를 이미 공개하고 있다.

## 라우트와 feature 경계 계약

### 1. `/books` route와 지역 선택 다이얼로그 연결

- 지역 선택 다이얼로그는 별도 route로 분리하지 않는다.
- `/books` 결과 화면 위에서 열리는 modal dialog로 고정한다.
- `소장 도서관 찾기` 클릭 시 `pages/book-search-result`가 선택된 책 payload를 받아 dialog를 연다.
- dialog open state는 URL 파라미터로 관리하지 않고 page local state로 유지한다.

### 2. feature 책임 분리

- `pages/book-search-result`
  - 선택된 책
  - dialog open/close
  - 마지막 확정 지역 선택
  - confirm 이후 다음 phase로 넘길 canonical params handoff
  를 담당한다.
- `features/region`
  - dialog 레이아웃
  - 상위 지역/세부 지역 선택
  - 하단 선택 요약
  - reset/confirm/close 상호작용
  을 담당한다.
- `features/book`
  - 계속 `소장 도서관 찾기` 버튼의 click handoff source만 담당한다.
- `entities/region`
  - 정적 옵션과 지역 종속 helper만 담당한다.

## 다이얼로그 계약

### 1. 진입과 종료

- dialog는 `selectedBook`이 있을 때만 열 수 있다.
- 닫기 동작은 아래를 모두 지원한다.
  - 우측 상단 닫기 버튼
  - `ESC`
  - overlay dismiss
- 닫기 시 confirm되지 않은 draft 변경은 버리고, 다음 open 때는 마지막 확정 지역 상태로 다시 시작한다.
- `선택 완료` 후에는 dialog를 닫는다.

### 2. 레이아웃 구조

- 다이얼로그는 스크린샷처럼 중앙 정렬 modal panel 구조로 고정한다.
- 상단에서 아래 순서는 아래로 고정한다.
  - 위치 아이콘 + `검색 지역 선택` 제목 + 닫기 버튼
  - 두 칸짜리 progress rail
  - 2열 선택 본문
  - 하단 요약/액션 footer
- progress rail은 실제 단계 이동용 stepper가 아니라, 흐름상 현재 단계 강조를 위한 비상호작용 장식 요소로 본다.
- 다이얼로그 내부에 별도 도서 정보 카드, 추가 안내 카드, 중첩 패널은 넣지 않는다.

### 3. 본문 2열 구조

- 좌측 열 제목은 `시/도`, 우측 열 제목은 `세부 지역`으로 고정한다.
- 좌측은 `entities/region`의 `REGION_OPTIONS` 순서를 그대로 사용한다.
- 우측은 선택된 상위 지역에 종속된 세부 지역 목록을 보여준다.
- 데스크톱과 태블릿에서는 2열 병렬 구조를 유지한다.
- 모바일에서는 현재 2열 구조를 유지하며 기능과 접근성 기준을 우선 충족한다.
- 별도 세로 stack 재배치와 footer full-width polish는 후속 시각 정리 pass로 넘긴다.

## 지역 선택 상태 계약

### 1. 상위 지역 선택

- 상위 지역 선택은 필수다.
- 첫 진입에 이전 확정 선택이 없으면 아무 상위 지역도 선택되지 않은 상태로 연다.
- 이 상태에서는 세부 지역 목록과 `선택 완료` CTA가 비활성이다.
- 상위 지역을 선택하면 해당 행을 accent 배경으로 강조한다.

### 2. 세부 지역 선택

- 세부 지역은 optional refinement다.
- 상위 지역을 선택하면 세부 지역 목록이 활성화된다.
- 세부 지역 첫 옵션은 항상 `전체`다.
- 상위 지역 선택 직후 세부 지역의 기본값은 `전체`다.
- 상위 지역을 바꾸면 직전 세부 지역 선택은 버리고, 새 상위 지역의 `전체`로 즉시 초기화한다.
- `전체`는 UI 전용 선택값이며, 실제 canonical params에서는 `detailRegion`을 포함하지 않는다.
- 특정 세부 지역을 고르면 해당 row를 별도 강조하고 체크 아이콘으로 현재 선택을 표시한다.

### 3. fallback 규칙

- 세종처럼 세부 지역이 1개뿐인 경우에도 기본 선택은 `전체`로 유지한다.
- 세부 지역 데이터가 없거나 노출 가능한 세부 지역이 실질적으로 없으면 `전체`만 유지한다.
- 이 경우 `세부 지역 없이 이 지역 전체를 검색합니다`와 동등한 보조 문구를 노출한다.
- 상위 지역만 선택된 상태면 `선택 완료` CTA는 계속 활성 상태여야 한다.

### 4. reset과 selection summary

- `초기화`는 현재 draft를 완전히 비선택 상태로 되돌린다.
- 초기화 후에는 상위 지역 미선택 상태가 되므로 세부 지역 목록과 `선택 완료` CTA가 다시 비활성화된다.
- footer에는 항상 현재 선택 요약을 보여준다.
- 요약 문구 규칙은 아래로 고정한다.
  - 상위 지역만 선택된 경우: `서울 전체`
  - 세부 지역까지 선택된 경우: `서울 > 마포구`
  - 미선택 상태: `지역을 선택해주세요`

### 5. reopen 복원 규칙

- 마지막 확정 지역 선택이 있으면 dialog를 다시 열 때 그 값을 그대로 복원한다.
- 이 복원 규칙은 같은 책을 다시 눌렀을 때뿐 아니라 결과 화면에서 다른 책을 선택했을 때도 유지된다.
- 이번 phase에서는 지역 선택 draft를 route 전환이나 URL에 기록하지 않는다.

## 확인 완료 handoff 계약

### 1. 입력과 출력

- dialog의 입력은 아래로 고정한다.
  - `open: boolean`
  - `selectedBook: BookSelectionActionPayload | null`
  - `lastSelection?: { region: RegionCode; detailRegion?: DetailRegionCode } | null`
  - `onOpenChange(open: boolean): void`
  - `onConfirm(params: LibrarySearchParams): void`
- `selectedBook`은 최소 아래 값을 가진다.
  - `isbn13`
  - `title`
  - `author`

### 2. canonical params 생성

- `선택 완료`는 내부 draft를 `parseSearchLibrariesParams`로 canonicalize한 뒤 `onConfirm`에 전달한다.
- confirm payload는 아래 shape로 고정한다.
  - `isbn`: 선택된 책의 `isbn13`
  - `region`: 선택된 상위 지역 code
  - `detailRegion`: `전체`가 아닐 때만 포함
  - `page: 1`
- 이 phase에서는 `onConfirm` 이후 즉시 library search를 실행할지 여부까지 정하지 않는다.
- 다음 phase는 이 canonical params를 그대로 받아 도서관 조회를 연결한다.

## 시각 계약

### 1. 스크린샷 정합 기준

- 시각 구조는 `region-select-dialog-design-guide/screen.png`를 최대한 따른다.
- 영문 카피는 한국어로 바꾸되, 정보량과 배치 밀도는 유지한다.
- 좌측 활성 지역 row, 우측 선택된 세부 지역 row, 하단 `선택 완료` CTA는 모두 accent 톤이 주인공이어야 한다.
- border-heavy한 공공서비스 레이아웃이 아니라, 밝은 surface 위계와 부드러운 그림자 깊이로 구획을 만든다.
- 현재 phase에서는 기능을 드러내는 선택 상태와 CTA 위계를 우선 구현하고, 스크린샷 레벨의 세밀한 톤 보정은 후속 polish 범위로 남긴다.

### 2. 컴포넌트 스타일 기준

- dialog panel은 충분히 둥근 모서리와 떠 있는 그림자를 가진다.
- 활성 상위 지역 row는 `bg-accent` 기반 fill과 밝은 전경색으로 표시한다.
- 선택된 세부 지역 row는 중립 high-surface 위에 accent 체크 아이콘을 배치한다.
- `초기화`는 낮은 강조의 outline/ghost button으로 처리한다.
- `선택 완료`는 accent 기반 pill button으로 처리한다.
- footer summary는 별도 카드로 띄우지 않고 footer 안에서 간결하게 정렬한다.

## 접근성 계약

- dialog는 포커스 트랩을 유지해야 한다.
- `ESC`와 닫기 버튼으로 닫을 수 있어야 한다.
- 상위 지역 목록, 세부 지역 목록, `초기화`, `선택 완료`는 모두 키보드 탭 순서대로 접근 가능해야 한다.
- 비활성 세부 지역 영역에는 이유 설명이 가시 텍스트로 존재해야 한다.
- 현재 선택된 row는 시각 강조 외에도 `aria-selected` 또는 동등한 접근성 구조로 드러나야 한다.
- `선택 완료` CTA의 비활성 상태는 색만으로 표현하지 않고 실제 disabled semantics를 함께 가져야 한다.

## 테스트 기준

### 1. feature integration test

- `소장 도서관 찾기` 클릭 시 dialog가 열린다.
- 상위 지역 선택 전에는 세부 지역 목록과 `선택 완료`가 비활성이다.
- 상위 지역 선택 후 `전체`가 기본 선택되고 CTA가 활성화된다.
- 세부 지역 선택 시 하단 요약이 `서울 > 마포구`처럼 갱신된다.
- 상위 지역 변경 시 세부 지역은 새 지역의 `전체`로 리셋된다.
- `초기화`는 draft를 완전히 비선택 상태로 되돌린다.
- `선택 완료`는 `detailRegion` 포함 여부까지 맞는 canonical `LibrarySearchParams`를 전달한다.

### 2. 접근성과 복원 테스트

- `ESC`, 닫기 버튼, overlay dismiss로 닫을 수 있다.
- 닫기 후 다시 열면 confirm되지 않은 draft는 버려지고 마지막 확정 선택이 복원된다.
- 마지막 확정 선택이 있으면 dialog 재오픈 시 같은 상위/세부 지역이 다시 선택된 상태로 보인다.
- 세종 또는 세부 지역 fallback 케이스에서도 CTA가 동작한다.

## 구현자가 추가 결정하지 말아야 하는 사항

- 지역 선택 구조를 checkbox, select box, searchable combobox로 바꾸지 않는다.
- `전체`를 실제 region code나 fake detail code로 저장하지 않는다.
- 결과 화면 route를 지역 선택 때문에 추가 분리하지 않는다.
- dialog 내부에 별도 설명 카드, 지역 지도 미리보기, 최근 선택 목록 같은 새 요소를 추가하지 않는다.
- 직접 dialog primitive를 다시 구현하지 않는다.
