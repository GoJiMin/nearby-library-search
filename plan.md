# 내 주변 도서관 검색 서비스 개발 계획

## 문서 운영 방식

- 이 문서는 전체 개발 일정을 기록하는 마스터 플랜이다.
- 각 Phase는 별도의 `spec.md`로 상세 명세를 정의한다.
- 각 `spec.md`는 다시 `task.md`로 세분화해 실제 개발 단위를 관리한다.
- 전체 개발 목표는 MVP를 빠르게 구현해 기능 검증을 수행하는 것이다.
- 외부 Open API 인증키 보호를 위해 다음 단계부터 모노레포와 BFF를 전제로 계획을 진행한다.
- 모노레포 기본 구조는 `apps/web`, `apps/bff`, `packages/contracts`를 기준으로 한다.

## 사용자 경험 목표

1. 랜딩 페이지 진입 시 사용자에게 찾고 싶은 도서가 있는지 묻는 문구와 검색 바를 제공한다.
2. 사용자가 도서 제목을 입력하면 도서관 Open API를 사용해 ISBN을 조회한다.
3. 검색한 도서가 존재하면 지역 선택 다이얼로그를 표시한다.
4. 사용자가 지역 정보를 선택하면 해당 지역 내 도서 소장 도서관 정보를 조회한다.
5. 소장 도서관이 존재하면 카카오맵과 도서관 정보 목록으로 결과를 제공한다.

## Phase 1. App 레이어 표준화

- [x] FSD 기반 프로젝트 구조를 `app`, `features`, `entities`, `shared` 중심으로 정리한다.
- [x] 라우트 진입 화면을 위한 `pages` 레이어 구조를 함께 정리한다.
- [x] 앱 엔트리 구조와 공통 Provider 구성을 표준화한다.
- [x] 전역 스타일, 디자인 토큰, 리셋 규칙을 정리한다.
- [x] 공통 레이아웃과 앱 초기 진입 구조를 정의한다.
- [x] 라우팅 구조와 페이지 진입 규칙을 정리한다.
- [x] `vitest`, `react testing library` 기반 테스트 환경을 표준화한다.
- [x] 환경변수 관리 규칙과 외부 SDK 연동 진입점을 정리한다.
- [x] 에러 처리, 로딩 처리, 빈 상태 처리에 대한 앱 전역 기준을 정리한다.
- [x] Phase 1 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 2. Shared 레이어 구성

- [x] 공통 API 요청 함수와 기본 클라이언트 구조를 설계한다.
- [x] 재사용 가능한 UI 컴포넌트의 기준과 범위를 정리한다.
- [x] 입력, 버튼, 다이얼로그, 카드, 배지, 타이포그래피, 로딩, 빈 상태 등 공통 UI를 개발한다.
- [x] API 에러 핸들링과 공통 응답 처리 규칙을 정리한다.
- [x] Shared 레이어 사용 규칙을 문서화한다.
- [x] request core 공개 API에 대한 테스트와 검증을 완료한다.
- [x] Phase 2 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 3. 모노레포 및 BFF 구성

- [x] `pnpm` workspace 기반 모노레포 구조를 정의한다.
- [x] 현재 웹 앱을 `apps/web` 기준 구조로 옮긴다.
- [x] `apps/bff`에 Fastify 기반 BFF 프로젝트 구조를 정의한다.
- [x] `packages/contracts`에 웹과 BFF가 함께 사용하는 공통 타입과 스키마 구조를 정의한다.
- [x] Open API 인증키를 BFF 서버 환경변수로만 관리하도록 규칙을 정리한다.
- [x] 웹 앱이 외부 Open API를 직접 호출하지 않고 Fastify BFF만 호출하도록 경계를 정리한다.
- [x] BFF가 외부 Open API 응답을 내부 계약으로 정규화해 반환하는 기준을 정리한다.
- [x] 로컬 개발 시 웹 앱과 BFF를 함께 실행하는 기본 흐름을 정리한다.
- [x] 빌드와 배포 시 웹 앱과 BFF를 분리해 다루는 기준을 정리한다.
- [x] Phase 3 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 4. Entities 레이어 구성

- [x] `book`, `library`, `region` 엔티티 슬라이스 구조를 정리한다.
- [x] `book` 검색/상세와 `library` 검색용 BFF 요청 함수, query key, query options, suspense 훅을 정리한다.
- [x] `region` 정적 데이터 모델과 지역 검증 helper를 정리한다.
- [x] 엔티티 입력 검증을 `zod` 기반 스키마와 parse helper 기준으로 정리한다.
- [x] 엔티티 공개 API를 slice `index.ts` 기준으로 고정한다.
- [x] 엔티티 레이어의 순수 helper 테스트와 검증 기준을 정리한다.
- [x] Phase 4 내용을 기준으로 `spec.md`와 `task.md`를 작성하고 완료한다.

## Phase 4-1. TypeScript Workspace 정리

- [x] 루트 `tsconfig.json`을 solution-style workspace 진입점으로 재구성한다.
- [x] `packages/contracts`를 project references가 가능한 TypeScript 설정으로 정리한다.
- [x] `apps/web`, `apps/bff`의 `tsconfig`를 workspace references 흐름에 맞게 조정한다.
- [x] 루트 `typecheck` 및 관련 스크립트를 workspace graph 기준으로 재구성한다.
- [x] `pnpm exec tsc -b` 또는 동등한 전체 타입체크 진입점을 정상화한다.
- [x] TypeScript 설정 변경이 기존 `build`, `lint`, `test` 흐름과 충돌하지 않는지 검증한다.
- [x] 루트 README와 후속 문서에 TypeScript workspace 기준이 필요하면 반영한다.
- [x] Phase 4-1 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 4-2. UX/UI 설계 기준 정리

- [x] 루트 `.impeccable.md`와 `AGENTS.md`의 Design Context를 Phase 4-2 설계의 source of truth로 고정한다.
- [x] Phase 5 MVP 전체 플로우를 화면/상태/행동 기준으로 설계한다.
- [x] 홈 검색 시작, 도서 선택, 지역 선택, 결과 지도·목록 화면의 정보 위계와 CTA를 고정한다.
- [x] 로딩, 빈 상태, 오류 상태를 공통 톤과 상태 매트릭스 기준으로 정리한다.
- [x] 라이트/다크 모드, 색상, 타이포, 간격, 밀도, 모션 규칙을 문서로 고정한다.
- [x] 모바일과 데스크톱의 레이아웃 계약과 반응형 기준을 정리한다.
- [x] HomePage audit에서 드러난 첫 행동 부재, 중첩 카드, 대비 부족 문제를 설계 단계에서 해소한다.
- [x] Phase 5 구현자가 추가 디자인 결정을 하지 않아도 되도록 design handoff spec을 완성한다.
- [x] Phase 4-2 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5. Features 레이어 MVP 구현

- [ ] Phase 4-2 handoff 기준으로 MVP feature 구현을 단계별로 진행한다.

## Phase 5-1. 홈 검색 시작 화면 구현

- [x] 세그먼트 탭과 단일 입력 필드 기반 검색 시작 화면을 구현한다.
- [x] 홈 보조 설명 영역과 예시 검색어를 Phase 4-2 계약에 맞게 구현한다.
- [x] canonical 검색 제출 계약, 키보드 탭 탐색, 홈 route 첫 행동 UX를 검증한다.
- [x] Phase 5-1 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-1A. 홈 메인 화면 스크린샷 정합 리디자인

- [x] `stitch_design_specification_implementation.zip`의 `screen.png`, `code.html`, `DESIGN.md`를 홈 메인 화면 리디자인의 참조 기준으로 고정한다.
- [x] 현재 홈 화면을 중앙 히어로 + 단일 검색 슬랩 구조로 재구성해 스크린샷과 최대한 비슷한 인상과 비율을 구현한다.
- [x] 검색 시작 feature의 기능 계약은 유지한 채, support 영역과 표면 계층을 보조 정보 수준으로 재배치한다.
- [x] 홈 route 시각 구조, 반응형, 접근성, 문서 상태를 리디자인 결과에 맞게 검증한다.
- [x] Phase 5-1A 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-2. 도서 검색 결과와 도서 선택 구현

- [x] `/books` route에서 텍스트 우선 카드 구조의 도서 검색 결과 화면을 구현한다.
- [x] 카드별 즉시 선택 CTA와 재검색 중심 empty/error 흐름을 구현한다.
- [x] 도서 검색 결과와 선택 상태를 Phase 4-2 계약에 맞게 검증한다.
- [x] Phase 5-2 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-3. 지역 선택 다이얼로그 구현

- [x] 상위 지역 필수, 세부 지역 선택적 refinement 구조의 지역 선택 다이얼로그를 구현한다.
- [x] `전체` 기본값, 선택 요약, CTA 활성 조건, fallback 규칙을 구현한다.
- [x] 키보드/포커스/비활성 설명 기준을 포함해 지역 선택 흐름을 검증한다.
- [x] Phase 5-3 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-4. 도서관 결과 화면 구현

- [x] 데스크톱 3영역 구조와 모바일 정보 우선 구조의 결과 화면을 구현한다.
- [x] 리스트, 지도 마커, 하단 상세 정보 패널의 선택 상태 동기화를 구현한다.
- [x] 카카오맵을 연결해 전체 마커 표시와 선택 강조를 구현한다.
- [x] Phase 5-4 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-5. 도서관 대출 가능 여부 조회 구현

- [x] 도서관 결과 dialog의 `대출 가능 여부 조회` CTA를 실제 availability 조회 흐름에 연결한다.
- [x] 선택된 도서관 기준 availability loading, success, empty, error 상태 계약을 정리한다.
- [x] desktop detail panel과 mobile detail 영역에서 같은 availability 결과를 일관되게 노출한다.
- [x] Phase 5-5 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-6. BFF 보안 하드닝

- [ ] 공개 BFF route 전반에 대한 abuse 방어 전략을 정하고, 앱 레벨 rate limiting 또는 route 그룹 단위 호출량 제한을 적용한다.
- [ ] 외부 Open API 호출 경계가 HTTPS만 사용하도록 고정하고, auth key가 계속 BFF runtime 내부에서만 관리되는지 검증한다.
- [ ] BFF route 입력 검증 규칙을 재점검하고, `libraryCode` 같은 느슨한 path/query 입력에 길이 상한과 허용 규칙을 추가한다.
- [ ] dev fixture mode에서 발생하는 비구조화 예외를 공통 에러 응답 규칙으로 정리해 내부 오류 노출을 줄인다.
- [ ] BFF 앱 레벨 보안 기본값을 점검하고, 필요한 보안 헤더, 에러 핸들링, not-found 처리 기준을 정리한다.
- [ ] Phase 5-6 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.

## Phase 5-7. 상태 처리와 통합 사용자 흐름 검증

- [ ] 검색 결과 없음, 지역 결과 없음, 도서관 결과 없음, 요청 오류 흐름을 공통 상태 계약에 맞게 구현한다.
- [ ] 라이트/다크 토큰 적용, 반응형 마감, 접근성 기준을 전체 흐름에서 점검한다.
- [ ] MVP 사용자 흐름 전체를 연결하고 통합 테스트와 최종 검증을 수행한다.
- [ ] Phase 5-7 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.
