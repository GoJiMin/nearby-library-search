# Phase 5-4. 도서관 결과 다이얼로그 구현

## 목표

- `Phase 5-3`에서 확정한 `LibrarySearchParams` handoff를 받아 `/books` 위에 도서관 결과 다이얼로그를 여는 흐름을 구현 가능한 명세로 고정한다.
- `library_search_result_design_guide/screen.png`의 데스크톱 3영역 구조를 기준으로, 도서관 리스트, 지도, 선택된 도서관 정보 패널이 하나의 선택 상태를 공유하도록 계약을 정리한다.
- 도서관 검색의 상태 기반 페이지네이션과 카카오맵 SDK 연동 기준을 이번 phase에서 잠근다.
- `대출 가능 여부 조회` CTA는 이번 phase에서 UI와 handoff 자리까지만 제공하고, 실제 조회 기능은 다음 phase로 넘긴다.

## 1차 source of truth

- 루트 `.impeccable.md`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 5-4`
- `library_search_result_design_guide`
  - `screen.png`: 최우선 시각 정합 기준
  - `code.html`: 레이아웃/밀도 참고
  - `DESIGN.md`: no-line rule, tonal depth, surface hierarchy 기준
- Kakao Maps JavaScript API 공식 문서
  - SDK 로드
  - `kakao.maps.load`
  - `Marker`
  - `LatLngBounds`, `setBounds`
  - `panTo` 또는 동등한 중심 이동
  - `relayout`

## 기술 결정

- React 구현 기준
  - `vercel-react-best-practices`를 기본 적용한다.
  - `/books` route page가 book, region, library 흐름을 계속 orchestration한다.
  - 도서관 결과 다이얼로그는 route가 아니라 `/books` 위 overlay로 유지한다.
  - 다이얼로그 내부 페이지네이션은 URL이 아니라 page local state로 관리한다.
- UI primitive 기준
  - 결과 화면은 새 route를 만들지 않고 현재 `@/shared/ui` dialog primitive 위에 구현한다.
  - 데스크톱 시각 구조는 스크린샷을 최대한 따르되, 모바일은 Phase 4-2의 정보 우선 계약을 따른다.
- 데이터/상태 기준
  - 조회 입력은 `LibrarySearchParams`를 그대로 사용한다.
  - `pageSize`는 사용자 조절 없이 항상 `10`으로 고정한다.
  - 다이얼로그를 닫고 다시 열면 library search는 항상 `page=1`부터 다시 시작한다.
- 카카오맵 SDK 기준
  - 클라이언트 공개 키는 `@/shared/env`의 `kakaoMapConfig`를 통해서만 읽는다.
  - SDK는 `autoload=false` + `kakao.maps.load(...)` 패턴으로 한 번만 지연 로드한다.
  - dialog처럼 나중에 크기가 확정되는 컨테이너에서는 지도 mount/open 이후 `relayout()`을 호출한다.
  - 최초 진입 시에는 좌표가 있는 도서관 전체를 보여주도록 `LatLngBounds` + `setBounds()`를 기본값으로 사용한다.
  - 사용자가 도서관을 명시적으로 선택했을 때만 `panTo()` 또는 동등한 중심 이동으로 해당 마커에 포커스한다.

## 구현 범위

- `RegionSelectDialog`의 `onConfirm(params)` 이후 지역 선택 다이얼로그를 닫고 도서관 결과 다이얼로그를 연다.
- `useGetSearchLibraries(params)` 기준의 실제 결과 조회를 연결한다.
- 좌측 결과 리스트, 우측 지도, 하단 선택 도서관 정보 패널을 스크린샷 구조에 맞게 구성한다.
- 좌측 리스트 하단에 상태 기반 페이지네이션을 구현한다.
- 카카오맵 SDK로 결과 마커 표시와 선택 포커스를 구현한다.
- 로딩, empty, error 상태를 도서관 결과 다이얼로그 문맥 안에서 복구 가능하게 정리한다.
- `대출 가능 여부 조회` 버튼을 detail panel footer에 구현한다.

## 비범위

- `대출 가능 여부 조회`의 실제 API 요청과 결과 UI
- 도서관 상세 route 분리
- 도서관 결과 상태의 URL 동기화
- 페이지 크기 선택 UI
- 지도 provider 교체나 멀티 provider 지원
- 지도 스타일 커스터마이징이나 경로 탐색 기능

## 현재 기반 상태

- `features/region`은 이미 `LibrarySearchParams`를 `onConfirm`으로 넘긴다.
- `pages/book-search-result`는 현재 region dialog orchestration과 `lastRegionSelection`을 소유하고 있다.
- `entities/library`는 아래 공개 API를 이미 가진다.
  - `LibrarySearchParams`
  - `parseSearchLibrariesParams`
  - `useGetSearchLibraries`
  - `hasLibraryCoordinates`
  - `isEmptyLibrarySearchResult`
- `shared/env`는 이미 `kakaoMapConfig`를 제공한다.
- 현재 plan 기준으로 도서관 결과는 별도 페이지가 아니라 Phase 5-4에서 다이얼로그로 구현해야 한다.

## 라우트와 feature 경계 계약

### 1. `/books` route와 도서관 결과 다이얼로그 연결

- 도서관 결과는 별도 route로 분리하지 않는다.
- `/books` 결과 화면 위에 modal dialog로 연다.
- `pages/book-search-result`가 아래 상태를 소유한다.
  - `selectedBook`
  - `lastRegionSelection`
  - `isLibraryResultDialogOpen`
  - `currentLibrarySearchParams`
  - `selectedLibraryCode`
- 지역 선택 완료 시 page는 아래 순서로 처리한다.
  - `lastRegionSelection` 저장
  - region dialog close
  - `currentLibrarySearchParams = {...params, page: 1}`
  - `selectedLibraryCode = null`
  - library result dialog open

### 2. feature 책임 분리

- `pages/book-search-result`
  - library result dialog open/close
  - 현재 library search params
  - 현재 선택된 도서관 code
  - region dialog 재오픈
  - 다음 phase로 넘길 availability check handoff
  를 담당한다.
- `features/library`
  - dialog 레이아웃
  - 결과 리스트
  - 지도 패널
  - detail panel
  - pagination UI
  - loading/empty/error 화면
  - list/marker/detail 선택 동기화
  를 담당한다.
- `entities/library`
  - 조회 계약과 순수 helper만 담당한다.
- `shared/env`
  - Kakao JS SDK app key 접근만 담당한다.

## 다이얼로그 계약

### 1. 진입과 종료

- 도서관 결과 다이얼로그는 `currentLibrarySearchParams`가 있을 때만 열 수 있다.
- 닫기 동작은 아래를 모두 지원한다.
  - 우측 상단 닫기 버튼
  - `ESC`
  - overlay dismiss
- 닫으면 library result dialog state만 종료하고, `/books` 검색 결과 화면은 그대로 유지한다.
- 닫은 뒤 다시 region dialog를 열 수 있어야 한다.

### 2. 데스크톱 레이아웃 구조

- 데스크톱 기본 구조는 스크린샷처럼 `좌측 1/3 + 우측 2/3`로 고정한다.
- 좌측 컬럼
  - `검색 결과` 제목
  - 헤더 우측 secondary action `지역 변경`
  - `총 N개의 도서관을 검색했어요.`
  - 결과 리스트
  - 페이지네이션
- 우측 컬럼
  - 상단 지도 영역
  - 지도 우측 하단 map controls
  - 하단 선택된 도서관 detail panel
  - detail panel footer CTA `대출 가능 여부 조회`
- 구획은 강한 divider보다 surface 차이와 tonal layering으로 만든다.

### 3. 모바일 구조

- 모바일 기본 구조는 Phase 4-2 계약을 따른다.
  - 도서관 리스트/선택 정보 우선
  - 지도는 그 아래 보조 영역
- 데스크톱의 2열 병렬 구조를 그대로 축소하지 않는다.
- 모바일 시각 polish는 이번 spec에서 정보 구조와 행동 계약만 고정하고, 세밀한 스타일 보정은 후속 task에서 다룬다.

## 조회와 페이지네이션 계약

### 1. 조회 입력

- library search는 항상 `LibrarySearchParams`로 조회한다.
- `pageSize`는 항상 `10`이다.
- 초기 open은 항상 `page=1`이다.
- region dialog 재오픈 후 다시 confirm하면 이전 page를 복원하지 않고 다시 `page=1`부터 시작한다.

### 2. 페이지네이션 동작

- 페이지네이션은 URL 기반이 아니라 state 기반이다.
- page 변경 시 `isbn`, `region`, `detailRegion`은 유지하고 `page`만 바꾼다.
- 페이지네이션 UI는 좌측 리스트 하단에 배치한다.
- `totalPages > 1`일 때만 노출한다.
- 페이지가 바뀌고 새 응답이 성공하면 **그 페이지 첫 번째 도서관**을 기본 선택 상태로 둔다.
- 페이지 변경 시 직전 페이지의 `selectedLibraryCode`를 유지하려고 시도하지 않는다.

## 리스트, 지도, 상세 패널 선택 계약

### 1. 기본 선택

- 결과가 1건 이상이면 현재 페이지 첫 번째 도서관을 기본 선택 상태로 둔다.
- 결과가 0건이면 선택 상태는 `null`이고, empty state를 보여준다.

### 2. 좌측 리스트 선택

- 리스트 항목 클릭 시 해당 도서관을 active row로 표시한다.
- 같은 선택으로 아래가 함께 갱신돼야 한다.
  - 우측 상단 지도 포커스
  - 우측 하단 detail panel 정보
- 리스트 item의 최소 정보 우선순위는 아래로 고정한다.
  - `name`
  - `address`
  - `operatingTime` 또는 `closedDays` 요약

### 3. 지도 마커 선택

- 최초 진입 시 좌표가 있는 도서관 전체를 marker로 표시한다.
- 기본 선택이 있더라도 initial viewport는 결과 marker 전체를 먼저 보여준다.
- 사용자가 marker를 클릭하면 아래가 함께 갱신돼야 한다.
  - 좌측 active row
  - detail panel
  - selected library code
- 좌표가 없는 도서관은 marker에서 제외한다.

### 4. detail panel

- 하단 detail panel은 현재 선택된 도서관의 상세 정보를 보여준다.
- 정보 우선순위는 아래로 고정한다.
  - `name`
  - `operatingTime`
  - `closedDays`
  - `address`
  - `phone`
- `homepage`는 보조 링크 수준으로만 취급한다.
- `fax`는 기본 노출 우선순위에서 제외한다.

## 카카오맵 계약

### 1. SDK 로드와 초기화

- 지도 SDK는 필요한 시점에만 지연 로드한다.
- `kakaoMapConfig.isEnabled`가 `false`면 map area는 지도 unavailable 상태를 보여주고, 리스트와 detail panel은 계속 동작해야 한다.
- SDK 로더는 한 번만 실행되도록 dedupe한다.

### 2. 초기 viewport

- 좌표가 있는 결과가 2건 이상이면 `setBounds()`로 전체 marker가 보이게 맞춘다.
- 좌표가 있는 결과가 1건이면 그 한 점을 중심으로 적절한 level로 초기화한다.
- 좌표가 모두 없으면 지도에는 empty placeholder만 노출하고 map controls와 marker는 숨긴다.

### 3. 선택 포커스

- 사용자가 좌측 리스트나 marker로 특정 도서관을 선택하면 지도는 해당 위치로 포커스 이동한다.
- 포커스 이동은 `panTo()` 또는 동등한 부드러운 중심 이동을 사용한다.
- 선택된 marker와 비선택 marker는 시각적으로 명확히 구분돼야 한다.

## 상태 처리 계약

### 1. loading

- loading 중에도 dialog shell은 유지한다.
- 좌측 리스트, 지도, detail panel은 현재 구조와 같은 크기의 skeleton으로 표시한다.
- region dialog에서 막 넘어온 직후 결과를 기다리는 상태가 사용자에게 분명해야 한다.

### 2. empty

- 결과가 비어 있으면 리스트/지도/detail 대신 empty state를 보여준다.
- 주 복구 CTA는 `지역 다시 선택`이다.
- 결과가 있을 때는 좌측 리스트 헤더의 `지역 변경` action으로 같은 backflow를 시작할 수 있다.
- 보조 복구 CTA는 `다른 책 다시 선택`이다.
- empty state에서도 dialog close는 계속 가능해야 한다.

### 3. error

- error는 dialog 내부 recoverable UI로 처리한다.
- `다시 시도`와 `닫기`를 제공한다.
- SDK 로드 실패와 library search 실패를 같은 화면 톤으로 다루되, 리스트와 지도 unavailable 원인을 사용자가 구분할 수 있는 copy는 허용한다.

## `대출 가능 여부 조회` CTA 계약

- 버튼은 detail panel footer에 항상 존재한다.
- 현재 선택된 도서관이 있을 때만 활성 상태다.
- 클릭 시 다음 phase에서 사용할 handoff 또는 no-op placeholder만 수행한다.
- 이번 phase에서는 아래를 하지 않는다.
  - 실제 availability API 호출
  - 대출 가능/불가 badge 표시
  - 버튼 클릭 후 detail panel 내용 변경

## 접근성 계약

- dialog는 포커스 트랩을 유지해야 한다.
- 리스트, map controls, pagination, CTA는 키보드 탭 순서로 접근 가능해야 한다.
- active library row는 시각 강조 외에도 접근성 상태로 드러나야 한다.
- pagination의 현재 페이지는 `aria-current="page"`를 사용한다.
- map unavailable, empty, error 상태는 가시 텍스트로 이유를 전달해야 한다.

## 테스트 기준

### 1. page/router integration test

- region confirm 후 region dialog는 닫히고 library result dialog가 열린다.
- dialog close 후 `/books` 화면은 그대로 유지된다.
- `지역 다시 선택` CTA가 region dialog reopen 흐름과 연결된다.
- 성공 상태 헤더의 `지역 변경` action도 같은 region dialog reopen 흐름과 연결된다.

### 2. feature integration test

- 결과가 1건 이상이면 현재 페이지 첫 항목이 기본 선택된다.
- 좌측 리스트 클릭 시 active row, map focus, detail panel이 같은 도서관으로 갱신된다.
- marker 클릭 시 active row와 detail panel이 같은 도서관으로 갱신된다.
- 좌표 없는 도서관은 marker 없이도 리스트와 detail에서 확인 가능하다.
- `totalPages > 1`이면 리스트 하단에 pagination이 보인다.
- 페이지 변경 시 같은 검색 조건으로 `page`만 바뀌고, 새 페이지 첫 항목이 기본 선택된다.
- dialog를 닫고 다시 열면 pagination은 `page=1`로 다시 시작한다.
- `대출 가능 여부 조회` 버튼은 렌더되지만 실제 조회는 수행하지 않는다.

### 3. focused unit test

- coordinate filtering helper
- 기본 선택 helper
- page change param helper
- Kakao SDK loader dedupe helper
- marker focus helper
  - 위 로직이 순수 함수나 작은 util로 분리될 때만 추가한다.

## 구현자가 추가 결정하지 말아야 하는 사항

- 도서관 결과를 별도 route로 분리하지 않는다.
- dialog 내부 페이지네이션을 URL에 동기화하지 않는다.
- `pageSize` 선택 UI를 추가하지 않는다.
- 선택된 도서관이 없어도 `대출 가능 여부 조회`를 활성화하지 않는다.
- 초기 open에서 바로 선택 marker로 zoom-in하지 않는다.
- 좌표 없는 도서관을 결과에서 제거하지 않는다.
- Kakao SDK key를 `@/shared/env` 밖에서 직접 읽지 않는다.
