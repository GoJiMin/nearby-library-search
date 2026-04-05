# Phase 5-1. 홈 검색 시작 화면 구현

## 목표

- `pages`는 feature를 조합하고, `features`는 도메인 기능 단위로 책임을 나누는 기준을 Phase 5부터 본격 적용한다.
- `Home / Search Start` 화면을 Phase 4-2 UX/UI 계약대로 실제 구현 가능한 명세로 고정한다.
- `features/book` 내부의 검색 시작 기능을 먼저 구현하고, 이후 Phase 5-2부터 같은 도메인 slice 안에서 검색 결과와 도서 선택으로 이어질 수 있는 기반을 만든다.
- 홈 화면에서 설명형 placeholder를 제거하고, 사용자가 바로 검색을 시작할 수 있는 첫 행동 UX를 만든다.

## 기술 결정

- 1차 UI/UX source of truth
  - 루트 `.impeccable.md`
  - `docs/phases/phase-04-2-ux-ui-design/spec.md`
  - 루트 `AGENTS.md`
- Phase 5 feature slicing 기준
  - `features/book`
  - `features/region`
  - `features/library`
- feature slice 내부 세그먼트
  - `ui`, `model`, `lib`를 필요 시 사용
  - slice 바깥 공개 API는 `index.ts` 하나로 고정
- 페이지 조합 기준
  - `pages`는 feature slice의 공개 API만 조합한다.
  - `pages`는 엔티티 API 함수나 feature 내부 파일을 직접 import하지 않는다.
- React 구현 기준
  - `vercel-react-best-practices`를 기본 적용한다.
  - Phase 5-1에서는 새 전역 상태 라이브러리나 새 폼 라이브러리를 도입하지 않는다.
- 디자인 구현 기준
  - `frontend-design`을 기본으로 사용한다.
  - 필요 시 `arrange`, `typeset`, `adapt`, `harden`, `clarify`, `polish`를 함께 사용한다.
- 검색 시작 feature 경계
  - 이번 phase의 실구현 대상은 `features/book` 내부의 검색 시작 기능이다.
  - 실제 도서 검색 결과 렌더링과 도서 선택은 후속 phase로 넘긴다.

## 구현 범위

- `features/book`를 Phase 5 도메인 feature slice 기준으로 정의한다.
- 홈 화면의 첫 행동 UI를 `features/book`의 검색 시작 기능으로 구현할 수 있게 명세를 고정한다.
- `pages/home`가 `features/book` 공개 API를 조합해 홈 검색 시작 화면을 구성하도록 기준을 정한다.
- 세그먼트 탭, 단일 입력 필드, 검색 CTA, 짧은 안내 1문단, 예시 검색어 2~4개를 실제 구현 계약으로 정리한다.
- 검색 시작 feature의 로컬 상태, 제출 계약, 접근성, 테스트 기준을 정리한다.
- 이후 `features/region`, `features/library`가 같은 방식으로 이어질 수 있도록 feature layer baseline을 함께 고정한다.

## 비범위

- 도서 검색 결과 목록 UI 구현
- 도서 선택/확정 UI 구현
- 지역 선택 다이얼로그 구현
- 도서관 검색과 결과 화면 구현
- 카카오맵 연동
- URL query 동기화와 검색 상태 복원
- Phase 5-2 이후 feature/task 구현 자체

## 현재 기반 상태

- `apps/web/src/features`에는 현재 `nearby-library-search` placeholder slice만 존재한다.
- `pages/home/ui/HomePage.tsx`는 설명형 placeholder 화면이며, 실제 검색 시작 UI가 없다.
- `entities/book`는 `parseSearchBooksParams`, `BookSearchParams`, `useGetSearchBooks`를 공개하고 있다.
- `shared/ui`는 `Input`, `Button`, `Heading`, `Text` 등 홈 검색 시작 화면 구현에 필요한 공통 primitive를 이미 제공한다.
- Phase 4-2 문서에서는 홈 화면의 순서와 금지 패턴, CTA, 접근성, 반응형, 카피 기준이 이미 결정 완료 상태다.

## 디렉터리 기준

- `src/features/book`
  - 홈 검색 시작, 도서 검색 결과, 도서 선택/확정 관련 기능을 담당하는 도메인 feature slice
  - Phase 5-1에서는 검색 시작 기능만 구현 대상으로 삼는다.
- `src/features/region`
  - 지역 선택, 세부 지역 refinement, 선택 요약 기능을 담당하는 도메인 feature slice
  - Phase 5-3 구현 전까지는 책임만 고정한다.
- `src/features/library`
  - 도서관 검색 트리거, 결과 탐색, 리스트/지도/상세 패널 동기화 기능을 담당하는 도메인 feature slice
  - Phase 5-4 구현 전까지는 책임만 고정한다.
- `src/pages/home`
  - route-level page slice
  - 홈 화면에서 필요한 feature를 조합하는 역할만 담당한다.

## Feature 레이어 상세 설계

### 1. Phase 5 feature slicing baseline

- Phase 5부터 `features`는 우산형 `nearby-library-search` 하나로 묶지 않는다.
- 큰 도메인 기준으로 아래 3개 slice를 사용한다.
  - `features/book`
  - `features/region`
  - `features/library`
- 각 slice 내부에서 필요 기능을 다시 나눈다.
  - `features/book`
    - 검색 시작
    - 검색 결과
    - 도서 선택/확정
    - 필요 시 도서 상세 보조 기능
  - `features/region`
    - 지역 선택
    - 세부 지역 refinement
    - 선택 요약/완료
  - `features/library`
    - 도서관 검색 트리거
    - 결과 탐색
    - 리스트/지도/상세 패널 동기화
- `pages`는 위 feature slice들의 공개 API만 조합한다.
- `pages`가 엔티티를 직접 묶어 화면 흐름을 재구현하는 구조는 기본값으로 두지 않는다.

### 2. `pages/home` 조합 계약

- `HomePage`는 route shell과 feature composition만 담당한다.
- Home route의 첫 화면은 `features/book`의 검색 시작 기능을 주인공으로 렌더링한다.
- 이후 phase에서 도서 결과, 지역 선택, 도서관 결과가 추가되더라도 `pages/home`는 feature를 배치하고 orchestration state를 연결하는 역할만 맡는다.
- `pages/home`는 feature 내부 입력 상태, 세그먼트 전환, 예시 검색어 동작, 제출 가능 여부 같은 세부 로직을 직접 소유하지 않는다.

### 3. `features/book` 검색 시작 기능 계약

- 이번 phase의 구현 대상은 `features/book` 내부 검색 시작 기능 하나다.
- 책임은 아래로 고정한다.
  - 검색 모드 선택
  - 현재 입력값 관리
  - 예시 검색어 상호작용
  - 제출 가능 여부 판별
  - canonical 검색 파라미터 생성
- 최소 로컬 상태는 아래 두 가지다.
  - `searchMode`: `'title' | 'author'`
  - `queryText`: 사용자가 입력 중인 문자열
- 검색 모드는 `책 제목`, `저자명` 두 가지로 고정한다.
- 세그먼트 전환 시 `queryText`는 유지한다.
- 예시 검색어는 현재 검색 모드에 맞는 입력 예시 2~4개를 사용한다.
- 예시 검색어는 클릭 가능한 보조 요소로 두고, 클릭 시 현재 입력값만 채운다.
- 예시 검색어 클릭은 자동 제출을 발생시키지 않는다.
- 제출 시점에는 `parseSearchBooksParams`를 사용해 canonical `BookSearchParams`를 만든다.
- canonical params는 아래 형태로 고정한다.
  - 제목 모드: `{title, page: 1}`
  - 저자 모드: `{author, page: 1}`
- trim 기준 빈 입력은 제출할 수 없다.
- 비활성 상태의 이유 설명은 검색 입력/CTA 근처의 가시 텍스트로 노출한다.
- Enter 입력으로도 제출 가능해야 한다.

### 4. Home / Search Start 화면 계약

- 첫 화면의 주인공은 검색 시작 블록 하나다.
- 요소 순서는 아래로 고정한다.
  - `책 제목` / `저자명` 세그먼트 탭
  - 단일 입력 필드
  - 검색 CTA
  - 짧은 안내 1문단
  - 예시 검색어 2~4개
- 검색 CTA는 과업 중심의 단일 1차 CTA로 유지한다.
- 입력 placeholder, helper copy, 예시 검색어는 현재 검색 모드에 맞게 바뀌어야 한다.
- 설명형 placeholder 랜딩, 동일 비중 3개 카드 반복, 카드 안에 빈 상태 카드를 다시 넣는 패턴은 금지한다.
- 예시 검색어는 보조 입력 장치이지, 별도 콘텐츠 블록이나 카드 섹션으로 확장하지 않는다.
- 홈 화면은 서비스 소개보다 검색 시작 경험이 우선이어야 한다.

### 5. 상태와 후속 phase handoff 계약

- Phase 5-1은 검색 시작 경험과 제출 계약까지만 완성한다.
- 실제 도서 검색 요청의 결과 렌더링, empty/error/retry 흐름은 Phase 5-2에서 구현한다.
- 따라서 Phase 5-1에서는 `useGetSearchBooks`를 직접 소비해 홈 화면을 서스펜드시키지 않는다.
- 대신 `features/book` 검색 시작 기능은 유효한 canonical params를 상위 조합 계층으로 전달하는 계약을 가진다.
- `pages/home`는 이후 phase를 위해 제출된 book search params를 연결할 수 있는 구조를 유지하되, 이번 phase에서는 첫 행동 UI 구현이 우선이다.

### 6. 접근성과 카피 계약

- 홈 화면의 주요 제목은 실제 `h1` semantics를 유지한다.
- 검색 입력은 명시적 라벨을 가져야 한다.
- 세그먼트 탭은 키보드와 클릭 모두로 접근 가능해야 한다.
- 포커스 링은 기존 shared token 규칙에 맞게 분명히 보여야 한다.
- 비활성 이유 설명은 hover가 아니라 항상 읽을 수 있는 텍스트여야 한다.
- CTA, helper, 예시 검색어 카피는 마케팅 문구가 아니라 즉시 행동을 돕는 utility copy로 유지한다.

## 현재 구현 결과 목표

- `features/book`가 Phase 5 기준의 첫 실제 feature slice로 정의된다.
- 홈 화면은 placeholder가 아니라 실제 검색 시작 UI를 가지게 된다.
- `pages/home`는 feature composition 경계를 유지한다.
- 이후 Phase 5-2에서 같은 `features/book` slice 안으로 검색 결과와 도서 선택을 자연스럽게 확장할 수 있다.
- 이후 Phase 5-3, 5-4에서도 같은 패턴으로 `features/region`, `features/library`를 연결할 수 있다.

## 산출물

- Phase 5-1 `spec.md`
- 도메인 기준 feature slice baseline
- 홈 검색 시작 화면 구현 계약
- Phase 5-2로 넘길 검색 제출 handoff 계약

## 완료 기준

- 문서만 읽고 `features`가 왜 `book`, `region`, `library` 3개 도메인 slice로 나뉘는지 설명할 수 있어야 한다.
- 문서만 읽고 `pages/home`와 `features/book`의 책임 경계를 설명할 수 있어야 한다.
- 문서만 읽고 홈 검색 시작 화면의 구조, CTA, 예시 검색어 동작, 제출 계약을 구현할 수 있어야 한다.
- 문서만 읽고 Phase 5-2로 무엇이 넘어가고, 무엇이 아직 비범위인지 설명할 수 있어야 한다.

## 테스트 기준

- 홈 route 진입 시 첫 fold 안에서 검색 시작 UI가 보여야 한다.
- `책 제목` / `저자명` 세그먼트 탭이 키보드와 클릭으로 전환 가능해야 한다.
- 세그먼트 전환 시 입력값이 유지돼야 한다.
- trim 기준 빈 입력이면 CTA가 비활성이고 이유 설명이 보여야 한다.
- 유효 입력 후 CTA 클릭 또는 Enter 입력으로 canonical 검색 제출 계약이 발생해야 한다.
- 예시 검색어 클릭 시 현재 검색 모드 기준으로 입력만 채워지고 자동 제출은 발생하지 않아야 한다.
- `pages/home`는 feature를 조합할 뿐 검색 시작 세부 로직을 직접 소유하지 않아야 한다.
- placeholder 랜딩, 반복 카드, nested card 패턴이 남아 있지 않아야 한다.

## 기본 가정

- Phase 5 전체 feature layer baseline은 `features/book`, `features/region`, `features/library` 3개 큰 도메인 slice로 고정한다.
- 각 slice 내부에서 `search`, `select`, `detail`, `browse` 같은 역할 단위로 기능을 확장한다.
- Phase 5-1 구현은 그중 `features/book`의 검색 시작 기능만 담당한다.
- `features/nearby-library-search`는 Phase 5 기준의 정식 baseline으로 사용하지 않는다.
- 실제 검색 결과 UI와 요청 상태 UI는 Phase 5-2에서 구현한다.
