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

## Phase 5. Features 레이어 MVP 구현

- [ ] 랜딩 페이지의 검색 경험을 구현한다.
- [ ] 도서 제목 입력 후 ISBN 조회 플로우를 구현한다.
- [ ] ISBN 조회 성공 시 지역 선택 다이얼로그를 구현한다.
- [ ] 시/구/동 depth 기반 지역 선택 경험을 구현한다.
- [ ] 선택한 지역 기준 도서관 소장 정보 조회 기능을 구현한다.
- [ ] 조회된 도서관 정보를 지도와 목록으로 함께 제공한다.
- [ ] 카카오맵을 활용해 도서관 위치를 시각화한다.
- [ ] 검색 결과 없음, 지역 결과 없음, API 실패 등의 예외 흐름을 처리한다.
- [ ] MVP 사용자 흐름 전체를 연결하고 검증한다.
- [ ] Phase 5 내용을 기준으로 `spec.md`와 `task.md`를 작성한다.
