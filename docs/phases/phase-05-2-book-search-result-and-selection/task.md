# Phase 5-2. 도서 검색 결과와 도서 선택 구현 Task

## 1. 결과 화면 URL 상태 baseline 정리

- [ ] 홈 route 결과 상태의 source of truth를 URL 검색 파라미터로 고정한다.
- [ ] `title | author | page`를 canonical 검색 상태로 해석하는 최소 model 구조를 만든다.
- [ ] URL 상태가 없거나 유효하지 않을 때 검색 시작 화면으로 돌아가는 기준을 정리한다.
- [ ] URL 상태 해석을 검증하는 focused unit test를 추가한다.

## 2. `features/book` 결과 화면 feature 골격 구성

- [ ] `features/book` 안에 결과 화면 orchestration 구조를 만든다.
- [ ] 결과 조회, 리스트, 페이지네이션, 카드 action을 역할 단위로 나눌 최소 UI/model 경계를 정리한다.
- [ ] `features/book/index.ts`에서 결과 화면 공개 API를 노출한다.
- [ ] 결과 화면 기본 integration test 파일을 추가한다.

## 3. 상단 결과 검색 바 구현

- [ ] 스크린샷 기준의 압축 검색 바 구조를 구현한다.
- [ ] `책 제목` / `저자명` 탭, 넓은 입력, 검색 아이콘 제출 affordance, 글자 수 표시를 결과 화면용으로 재구성한다.
- [ ] 현재 URL 검색 상태를 입력 초기값으로 반영하고, 재검색 제출 시 `page=1`로 리셋되도록 연결한다.
- [ ] 탭 전환, 입력 유지, 재검색 제출을 integration test로 검증한다.

## 4. 검색 결과 요약과 리스트 구조 구현

- [ ] `검색 결과` 제목과 `"검색어"에 대한 N개의 검색 결과가 있습니다.` 문구를 구현한다.
- [ ] `useGetSearchBooks`를 연결해 단일 컬럼 결과 리스트를 렌더링한다.
- [ ] 홈 히어로 대신 결과 화면 레이아웃이 보이도록 결과 모드 화면 구조를 고정한다.
- [ ] 결과 화면 진입과 요약 영역 렌더링을 integration test로 검증한다.

## 5. 결과 카드 정보 구조 구현

- [ ] 카드에 `title`, `author`, `publisher/publicationYear`, `isbn13`, `loanCount`, `imageUrl`만 사용해 메타 정보를 렌더링한다.
- [ ] 없는 필드는 해당 조각만 숨기고, 존재하지 않는 설명 문단은 구현하지 않는다.
- [ ] `imageUrl`이 없을 때 중립적 표지 placeholder를 렌더링한다.
- [ ] 카드 정보 우선순위와 필드 숨김 규칙을 integration test로 검증한다.

## 6. 카드 버튼과 선택 handoff 구현

- [ ] 카드마다 `상세 보기`, `소장 도서관 찾기` 버튼을 구현한다.
- [ ] `상세 보기`는 후속 상세 다이얼로그용 `isbn13` handoff만 만들고 실제 다이얼로그는 구현하지 않는다.
- [ ] `소장 도서관 찾기`는 후속 지역 선택 다이얼로그용 책 선택 handoff만 만들고 실제 다이얼로그는 구현하지 않는다.
- [ ] 1개 결과여도 자동 진행하지 않고 버튼 클릭이 필요하도록 고정한다.
- [ ] 버튼별 handoff payload를 integration test로 검증한다.

## 7. URL 기반 페이지네이션 구현

- [ ] `totalCount`와 `BOOK_SEARCH_PAGE_SIZE`로 전체 페이지 수를 계산한다.
- [ ] 스크린샷 기준의 `이전 / 숫자 / 다음` 페이지네이션을 구현한다.
- [ ] 페이지 전환 시 URL의 `page`만 갱신되도록 연결한다.
- [ ] 페이지 수 계산 helper를 추출했다면 focused unit test를 추가한다.
- [ ] 페이지 전환, 뒤로가기, 새로고침 복원 시나리오를 integration test로 검증한다.

## 8. loading, empty, error 상태 구현

- [ ] loading 상태에서 상단 검색 바와 결과 요약은 유지하고 카드 스켈레톤을 렌더링한다.
- [ ] empty 상태에서 검색 모드와 검색어를 유지한 채 같은 화면에서 재검색 가능하도록 구현한다.
- [ ] error 상태에서 인라인 복구 UI와 다시 시도 흐름을 제공한다.
- [ ] 세 상태를 integration test로 검증한다.

## 9. `pages/home` 조합 구조 확장

- [ ] `pages/home`가 URL 상태에 따라 검색 시작 화면과 결과 화면을 전환하도록 정리한다.
- [ ] 검색 시작 제출이 URL 업데이트로 이어지고, 결과 화면이 같은 route 안에서 렌더링되도록 연결한다.
- [ ] 홈 route integration test를 Phase 5-2 기준으로 갱신한다.

## 10. 최종 검증과 문서 동기화

- [ ] `features/book` 결과 화면 integration test와 필요한 focused unit test만 남아 있는지 점검한다.
- [ ] `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`를 통과시킨다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-2 범위와 실제 구현 결과를 동기화한다.

## Important Changes

- 이번 phase는 URL 기반 결과 상태와 같은 home route 안에서의 화면 전환을 먼저 구현하도록 순서를 고정한다.
- `상세 보기`와 `소장 도서관 찾기`는 이번 phase에서 버튼과 handoff까지만 구현하고, 실제 다이얼로그는 후속 phase로 넘긴다.
- 결과 카드에는 실제 계약 필드만 사용하고, 스크린샷의 설명 문단처럼 없는 데이터는 구현하지 않는다.
- 코드 구조와 테스트 파일 위치는 현재 `features/book` 스타일을 그대로 따른다.

## Test Plan

- URL에 유효한 `title|author + page`가 있으면 결과 화면이 복원된다.
- 상단 검색 바에서 재검색 시 URL이 갱신되고 `page=1`로 리셋된다.
- 결과 카드가 실제 필드만 렌더링하고, 없는 필드는 숨긴다.
- `상세 보기`, `소장 도서관 찾기` 버튼이 각각 올바른 handoff를 만든다.
- 페이지 전환이 URL 기반으로 동작하고 뒤로가기/새로고침 후에도 유지된다.
- loading, empty, error가 모두 같은 화면에서 복구 가능하다.
- `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`를 통과한다.

## Assumptions

- `task.md` 경로는 `docs/phases/phase-05-2-book-search-result-and-selection/task.md`로 고정한다.
- 구현과 테스트를 같은 단계에서 완료하는 현재 프로젝트 규칙을 그대로 따른다.
- integration test의 상호작용 기본값은 `@testing-library/user-event`다.
- focused unit test는 URL 파싱, 페이지 수 계산처럼 순수 로직이 실제로 분리될 때만 추가한다.
- 이번 phase는 결과 화면과 도서 선택 handoff까지 다루고, 상세/지역 선택 다이얼로그 자체 구현은 다루지 않는다.
