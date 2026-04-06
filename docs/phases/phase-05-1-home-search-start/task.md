# Phase 5-1. 홈 검색 시작 화면 구현 Task

## 1. Phase 5 feature baseline 정리

- [x] `features` 레이어 기준을 `book`, `region`, `library` 도메인 slice로 고정한다.
- [x] `features/book`, `features/region`, `features/library` 기본 디렉터리와 `index.ts` 공개 API 구조를 정리한다.
- [x] 기존 `features/nearby-library-search` placeholder slice를 Phase 5 baseline에서 제외한다.

## 2. `features/book` 검색 시작 feature 골격 구성

- [x] `features/book` 안에 검색 시작 기능의 UI/model 분리 기준을 만든다.
- [x] 검색 모드와 입력값을 다루는 최소 로컬 상태 구조를 정리한다.
- [x] `features/book/index.ts`에서 검색 시작 feature의 공개 진입점을 노출한다.
- [x] 검색 시작 feature의 기본 integration test 파일을 추가한다.

## 3. 검색 모드 세그먼트 탭 구현

- [x] `책 제목` / `저자명` 세그먼트 탭 UI를 구현한다.
- [x] 현재 선택된 검색 모드가 시각적으로 드러나도록 구현한다.
- [x] 세그먼트 전환 시 입력값이 유지되도록 동작을 고정한다.
- [x] 탭 전환과 입력 유지 동작을 integration test로 검증한다.

## 4. 단일 입력 필드와 검색 CTA 구현

- [x] 현재 검색 모드에 맞는 라벨과 placeholder를 가진 단일 입력 필드를 구현한다.
- [x] trim 기준 유효 입력일 때만 검색 CTA가 활성화되도록 구현한다.
- [x] Enter 입력과 CTA 클릭이 같은 제출 흐름을 타도록 구현한다.
- [x] 비활성 CTA 근처에 이유 설명 텍스트를 노출한다.
- [x] 입력/CTA/disabled helper 흐름을 integration test로 검증한다.

## 5. 예시 검색어와 보조 설명 구현

- [x] 짧은 안내 1문단을 Phase 4-2 계약에 맞게 구현한다.
- [x] 현재 검색 모드에 맞는 예시 검색어 2~4개를 구현한다.
- [x] 예시 검색어 클릭 시 입력값만 채우고 자동 제출은 하지 않도록 구현한다.
- [x] 예시 검색어가 별도 카드 섹션으로 확장되지 않도록 구조를 제한한다.
- [x] 예시 검색어 상호작용을 integration test로 검증한다.

## 6. canonical 검색 제출 계약 연결

- [x] 제출 시 `parseSearchBooksParams`를 사용해 canonical `BookSearchParams`를 만든다.
- [x] 제목 모드와 저자 모드가 각각 `{title, page: 1}` / `{author, page: 1}` 형태로 정규화되도록 연결한다.
- [x] 실제 검색 결과 소비는 하지 않고, Phase 5-2로 넘길 제출 handoff 구조만 유지한다.
- [x] 제출 handoff를 integration test로 검증한다.
- [x] 별도 순수 helper를 추출했다면 그 helper에 한해 focused unit test를 추가한다.

## 7. `pages/home` 조합 구조 교체

- [x] `pages/home/ui/HomePage.tsx`에서 설명형 placeholder 구조를 제거한다.
- [x] `HomePage`가 `features/book` 검색 시작 feature를 조합하는 얇은 route shell이 되도록 정리한다.
- [x] 반복 카드 3개, nested card, empty-state 랜딩 패턴이 남아 있지 않은지 점검한다.
- [x] 홈 route integration test를 Phase 5-1 기준으로 갱신한다.

## 8. 접근성과 상호작용 하드닝

- [x] 홈 화면 제목이 실제 `h1` semantics를 유지하는지 확인한다.
- [x] 검색 입력에 명시적 라벨이 연결되는지 확인한다.
- [x] 세그먼트 탭과 CTA가 키보드 탭 순서대로 접근 가능한지 확인한다.
- [x] 포커스 링과 helper text 위치가 Phase 4-2 접근성 계약과 일치하는지 확인한다.
- [x] 위 접근성 요구사항을 integration test assertion에 포함한다.

## 9. 최종 검증

- [ ] `features/book` 검색 시작 기능의 integration test가 통과하는지 확인한다.
- [ ] 필요한 범위의 unit test만 남아 있고 과도한 file-by-file unit test가 없는지 점검한다.
- [ ] `pnpm test:run`, `pnpm lint:web`, `pnpm typecheck:web`, `pnpm build:web`가 성공하는지 확인한다.
- [ ] `spec.md`, `task.md`, `plan.md`의 Phase 5-1 범위와 실제 구현 결과가 어긋나지 않는지 확인한다.

## Important Changes

- Phase 5-1부터 feature 구현은 구현과 테스트를 같은 단계에서 함께 완료하는 기준으로 진행한다.
- 테스트 기본값은 `features/book`과 `pages/home` 기준의 integration test다.
- 사용자 경험 기준 integration test는 기본적으로 `@testing-library/user-event`를 사용한다.
- `fireEvent`는 저수준 DOM 이벤트나 `user-event`로 다루기 어려운 예외 케이스에만 제한한다.
- unit test는 추출된 순수 로직이나 UI 분기처럼 integration test만으로 신뢰 확보가 부족한 경우에만 추가한다.
- `pages/home`는 조합만 담당하고, 검색 시작 세부 로직과 테스트 중심은 `features/book`에 둔다.

## Test Plan

- 세그먼트 탭 전환 시 입력값 유지
- 빈 입력에서 CTA 비활성 + 이유 설명 노출
- 유효 입력에서 CTA/Enter 제출 동작
- 예시 검색어 클릭 시 입력만 채워지고 자동 제출 없음
- canonical `BookSearchParams` handoff 생성
- 홈 route가 placeholder 랜딩이 아니라 실제 검색 시작 UI를 렌더링
- `test:run`, `lint:web`, `typecheck:web`, `build:web` 통과

## Assumptions

- 기능 구현 시 테스트 작성은 필수다.
- 테스트 우선순위는 integration test > focused unit test다.
- integration test의 상호작용 기본값은 `user-event`다.
- unit test는 UI 분기나 추출된 순수 로직에만 제한한다.
- Phase 5-1은 `features/book`의 검색 시작 기능만 구현하고, 실제 검색 결과 화면은 Phase 5-2에서 다룬다.
