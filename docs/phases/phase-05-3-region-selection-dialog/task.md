# Phase 5-3. 지역 선택 다이얼로그 구현 Task

## 1. `/books` 지역 선택 orchestration baseline 정리

- [x] `pages/book-search-result`가 `소장 도서관 찾기` 클릭 payload를 받아 dialog open state와 선택된 책 상태를 소유하도록 정리한다.
- [x] 마지막 확정 지역 선택 상태를 page에 추가한다.
- [x] `features/book`의 `onSelectBook` handoff가 실제 page orchestration으로 연결되도록 바꾼다.
- [x] route/page integration test에 카드 CTA 클릭 시 지역 선택 dialog가 열린다는 기준을 추가한다.

## 2. `features/region` 공개 API와 최소 골격 구성

- [ ] `features/region`에 `RegionSelectDialog` public feature를 추가한다.
- [ ] `features/region/index.ts`에서 dialog 공개 API를 노출한다.
- [ ] dialog 입력 계약을 `open`, `selectedBook`, `lastSelection`, `onOpenChange`, `onConfirm`으로 고정한다.
- [ ] 기본 integration test 파일을 추가한다.

## 3. dialog shell과 스크린샷 상단 구조 구현

- [ ] `@/shared/ui`의 `Dialog`, `DialogContent`, `DialogTitle`, `DialogClose`를 사용해 modal shell을 구현한다.
- [ ] 상단에 위치 아이콘, `검색 지역 선택` 제목, 닫기 버튼을 구현한다.
- [ ] 스크린샷 기준 progress rail을 비상호작용 장식 요소로 추가한다.
- [ ] overlay dismiss, `ESC`, 닫기 버튼으로 닫히는지 integration test로 검증한다.

## 4. 2열 지역 선택 구조 구현

- [ ] 좌측 `시/도`, 우측 `세부 지역` 2열 레이아웃을 구현한다.
- [ ] 좌측은 `REGION_OPTIONS`, 우측은 선택된 상위 지역 기준 `DETAIL_REGION_OPTIONS_BY_REGION`로 렌더링한다.
- [ ] 첫 진입에 상위 지역이 없으면 세부 지역 목록은 비활성 상태로 렌더링한다.
- [ ] 상위 지역 선택 후 세부 지역의 기본값은 항상 `전체`가 되도록 구현한다.
- [ ] 상위 지역 변경 시 기존 세부 지역 선택이 새 지역의 `전체`로 리셋되는지 integration test로 검증한다.

## 5. 세부 지역 fallback과 비활성 설명 구현

- [ ] 상위 지역 선택 전 세부 지역 영역 아래에 비활성 이유 설명을 구현한다.
- [ ] 세종처럼 세부 지역이 1개뿐인 경우에도 기본값은 `전체`를 유지하도록 구현한다.
- [ ] 세부 지역이 실질적으로 없을 때 `전체`만 유지하고 전체 검색 안내 문구를 노출한다.
- [ ] fallback 케이스에서도 `선택 완료`가 동작하는지 integration test로 검증한다.

## 6. footer 요약, 초기화, 선택 완료 handoff 구현

- [ ] footer에 `현재 선택` 요약을 구현한다.
- [ ] 요약은 `서울 전체`, `서울 > 마포구`, `지역을 선택해주세요` 규칙으로 갱신되게 한다.
- [ ] `초기화`는 draft를 완전히 비선택 상태로 되돌리게 한다.
- [ ] `선택 완료`는 `parseSearchLibrariesParams`로 canonicalize한 `LibrarySearchParams`를 만든 뒤 `onConfirm`에 전달한다.
- [ ] `전체` 선택 시 `detailRegion`이 빠진 payload, 세부 지역 선택 시 `detailRegion`이 포함된 payload를 integration test로 검증한다.
- [ ] draft → canonical params 변환 helper를 별도로 뺐다면 그 부분만 focused unit test를 추가한다.

## 7. reopen 복원과 page 연계 구현

- [ ] `선택 완료` 후 dialog를 닫고 마지막 확정 지역 선택을 page state에 저장한다.
- [ ] dialog를 다시 열면 마지막 확정 선택이 draft로 복원되게 한다.
- [ ] confirm 없이 닫은 변경은 버려지고, 재오픈 시 마지막 확정 선택으로 돌아가는지 검증한다.
- [ ] `/books` 결과 화면에서 다른 책을 눌러도 마지막 지역 선택이 유지되는 현재 정책을 integration test로 잠근다.

## 8. 접근성, 반응형, 시각 정합 마감

- [ ] 선택 row 강조, 체크 아이콘, `bg-accent` 기반 활성 상태를 스크린샷 톤에 맞게 정리한다.
- [ ] 모바일에서는 2열을 세로 stack으로 바꾸고 footer 버튼을 더 넓게 배치한다.
- [ ] 포커스 트랩, 키보드 탭 순서, disabled semantics, `aria-selected` 또는 동등한 선택 구조를 점검한다.
- [ ] feature integration test에 키보드 이동과 접근성 기준을 추가한다.

## 9. 최종 검증과 문서 동기화

- [ ] `RegionSelectDialog` integration test와 필요한 focused unit test만 남아 있는지 점검한다.
- [ ] `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`를 통과시킨다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-3 상태를 현재 구현 결과와 동기화한다.

## Important Changes

- 이번 phase는 `/books` 결과 화면 안의 modal dialog로 지역 선택을 연결하는 순서를 먼저 구현하도록 고정한다.
- dialog는 새 라이브러리를 직접 붙이지 않고 현재 `@/shared/ui`의 dialog primitive를 사용한다.
- 상위 지역 선택은 필수, 세부 지역은 optional refinement, 기본값은 항상 `전체`라는 계약을 그대로 따른다.
- canonical handoff는 `LibrarySearchParams` 기준으로 고정하고, 실제 도서관 결과 조회와 결과 화면은 Phase 5-4로 넘긴다.

## Test Plan

- 카드 `소장 도서관 찾기` 클릭 시 dialog open
- 상위 지역 선택 전 세부 지역/완료 CTA 비활성
- 상위 지역 선택 후 `전체` 기본값과 CTA 활성
- 상위 지역 변경 시 세부 지역 리셋
- `초기화` 동작
- `선택 완료` canonical params 생성
- 닫기 후 재오픈 시 마지막 확정 선택 복원
- `ESC`/닫기 버튼/overlay dismiss
- 모바일 stack 구조와 키보드 접근성 유지
- `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`

## Assumptions

- `task.md` 경로는 `docs/phases/phase-05-3-region-selection-dialog/task.md`로 고정한다.
- dialog 구현은 새 shadcn 설치가 아니라 현재 `@/shared/ui`의 dialog wrapper를 사용하는 방향으로 간다.
- 테스트 기본값은 feature/page integration test이고, draft → canonical params 변환처럼 순수 로직이 분리될 때만 focused unit test를 허용한다.
- 이번 phase는 지역 선택 dialog와 confirm handoff까지만 다루고, 실제 도서관 결과 조회와 결과 화면은 Phase 5-4로 넘긴다.
