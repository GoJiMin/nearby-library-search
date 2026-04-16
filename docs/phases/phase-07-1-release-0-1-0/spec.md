# Phase 7-1. 0.1.0 릴리즈 스냅샷 작성

## 목표

- 현재 MVP 상태를 `0.1.0`으로 정의하고, 새로 투입되는 개발자가 문서만 읽고도 서비스와 구현 범위를 빠르게 이해할 수 있는 릴리즈 문서 세트를 만든다.
- `docs/phases/`에 흩어져 있는 작업 문서와 `README.md`의 프로젝트 소개를 그대로 복사하지 않고, **0.1.0 시점의 서비스 목표, 사용자 플로우, 핵심 기능, 기술 선택 이유, 검증 상태**를 버전 기준으로 다시 정리한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 7`, `Phase 7-1`
- `README.md`
- `docs/phases/phase-03-bff/spec.md`
- `docs/phases/phase-04-2-ux-ui-design/spec.md`
- `docs/phases/phase-05-1-home-search-start/spec.md`
- `docs/phases/phase-05-1a-home-visual-refresh/spec.md`
- `docs/phases/phase-05-2-book-search-result-and-selection/spec.md`
- `docs/phases/phase-05-3-region-selection-dialog/spec.md`
- `docs/phases/phase-05-4-library-search-result-dialog/spec.md`
- `docs/phases/phase-05-5-library-availability-check/spec.md`
- `docs/phases/phase-05-6-book-detail-dialog/spec.md`
- `docs/phases/phase-06-3-web-bundle-optimization/spec.md`
- 현재 `apps/web`, `apps/bff`, `packages/contracts`의 실제 구현 상태

## 기술 결정

- 이번 phase는 **릴리즈 문서 작성 phase**다.
  - 코드 구조 리팩터링, 새 기능 구현, 배포 파이프라인 추가는 범위에 넣지 않는다.
  - `package.json`의 version 값을 `0.1.0`으로 올리는 작업도 이번 phase의 기본 범위에 넣지 않는다.
  - 다만 `verification.md`에 실제 커버리지 수치를 남기기 위해 필요한 최소한의 테스트 인프라 설정은 범위에 포함한다.
- 릴리즈 문서의 1차 독자는 **새로 투입되는 개발자**다.
  - 개발 경험은 있다고 가정하지만, 이 프로젝트의 배경과 결정은 모른다고 본다.
  - 문서는 기술적 정확성을 유지하되, 서비스 설명 없이 용어만 나열하지 않는다.
- 문서는 한국어로 작성한다.
- 릴리즈 문서는 changelog보다 **온보딩 가능한 버전 스냅샷**에 가깝다.
  - “무엇이 바뀌었는지”만 적지 않고, “이 서비스가 무엇을 하고, 어떤 흐름이 동작하며, 왜 이런 구조를 택했는지”를 함께 적는다.
- 각 문서는 **혼자 읽혀도 이해 가능**해야 한다.
  - 다른 릴리즈 문서를 꼭 열어봐야만 이해되는 구조로 쓰지 않는다.
- 릴리즈 문서 자체가 `0.1.0` 시점의 스냅샷 역할을 한다.
  - phase 문서 원본은 `docs/phases/`에 그대로 두고, 과거 시점이 필요하면 해당 릴리즈 commit을 다시 확인한다.

## 구현 범위

- `docs/releases/index.md` 작성
- `docs/releases/0.1.0/overview.md` 작성
- `docs/releases/0.1.0/changes.md` 작성
- `docs/releases/0.1.0/verification.md` 작성
- `docs/releases/0.1.0/known-issues.md` 작성
- web / bff coverage 측정 스크립트와 reporter 설정 추가

## 비범위

- 배포 자동화, release note automation, tag 생성, GitHub Release 작성
- `package.json` version 동기화
- 영어 번역본 작성
- 기존 `docs/phases/` 문서 구조 개편
- 전체 README를 릴리즈 문서 구조에 맞춰 재작성하는 작업

## 현재 기반 상태

- 현재 프로젝트 문서는 `plan.md`, `README.md`, `docs/phases/` 중심으로 관리되고 있다.
- `docs/releases/` 구조는 아직 존재하지 않는다.
- `apps/web`, `apps/bff`, `packages/contracts`의 package version은 모두 `0.0.0`이다.
- MVP 사용자 플로우는 이미 구현돼 있다.
  - 홈 검색 시작
  - `/books` 검색 결과
  - 지역 선택 다이얼로그
  - 도서관 결과 다이얼로그
  - 도서관 대출 가능 여부 조회
  - 도서 상세 보기
- web과 bff는 분리 배포 기준을 이미 갖고 있고, `Phase 6-3`까지 반영된 현재 상태가 `0.1.0`의 기능 기준이다.

## 릴리즈 문서 구조

### 1. `docs/releases/index.md`

- 버전 목록과 각 버전의 한 줄 요약만 담당한다.
- 최소 항목은 아래로 고정한다.
  - 버전
  - 상태 또는 성격
  - 한 줄 요약
  - 문서 링크
- 상세 기능 설명은 넣지 않는다.
- `0.1.0`이 첫 항목으로 들어가야 한다.

### 2. `docs/releases/0.1.0/overview.md`

- 이 문서 하나만 읽어도 서비스 전반을 이해할 수 있어야 한다.
- 아래 내용을 이 순서대로 포함한다.
  - `0.1.0`이 어떤 릴리즈인지
  - 서비스의 주 목표
  - 주 사용자
  - 사용자가 어떤 순서로 기능을 쓰는지
  - 현재 MVP에서 가능한 핵심 행동
  - 현재 아키텍처 개요
  - 왜 `web + bff + contracts` 구조를 택했는지에 대한 짧은 설명
  - 특히 BFF를 도입한 이유가 아래 기준으로 분명히 드러나야 한다.
    - 외부 Open API 인증키를 브라우저에 노출하지 않기 위해
    - web이 외부 도서 Open API를 직접 호출하지 않고 BFF만 호출하도록 경계를 만들기 위해
    - 외부 Open API 응답을 내부 계약으로 정규화해 안정적인 API를 제공하기 위해
- 기술 설명은 허용하지만, 사용자 플로우 설명보다 앞에 오면 안 된다.

### 3. `docs/releases/0.1.0/changes.md`

- `0.1.0`에 포함된 내용을 **기능**과 **기술적 기반** 기준으로 정리한다.
- 최소 섹션은 아래로 고정한다.
  - `0.1.0에 담긴 내용`
  - `현재 구현된 사용자가 경험 가능한 기능`
  - `이 기능을 가능하게 한 기술적 기반`
  - 이번 버전에 포함되지 않은 것
- 사용자가 경험 가능한 기능 섹션에서는 화면 이름보다 사용 흐름 중심으로 설명한다.
- 기술적 기반 섹션에서는 아래 내용을 반드시 포함한다.
  - BFF 도입 이유와 API 키 보호 경계
  - React web + Fastify BFF 분리 구조
  - URL 기반 `/books` 결과 흐름
  - 지역 선택 / 도서관 결과 / availability / 상세 보기 흐름
  - `Phase 6-3` 번들 최적화 결과
  - Vercel 배포 기준
- 커밋 제목이나 파일 수정 목록 중심으로 쓰지 않는다.

### 4. `docs/releases/0.1.0/verification.md`

- 이 문서는 “왜 `0.1.0`을 배포 가능 상태로 보는지”를 설명해야 한다.
- 최소 섹션은 아래로 고정한다.
  - `0.1.0 검증 기준`
  - 자동 검증
  - 테스트 커버리지
  - 수동 확인
  - 배포/운영 확인
- 이 문서는 **Task 4 시점에 다시 실행한 결과만** 근거로 사용한다.
  - 이전에 통과했던 이력은 참고만 하고, 릴리즈 문서의 근거로 그대로 옮기지 않는다.
- 자동 검증에는 아래 범주의 결과가 반드시 들어가야 한다.
  - 타입체크
  - web build
  - bff build
  - 핵심 사용자 흐름 관련 web 테스트
  - 핵심 route 관련 bff 테스트
- 테스트 커버리지에는 아래 기준을 반드시 포함한다.
  - web 전체 suite 기준 coverage 수치
  - bff 전체 suite 기준 coverage 수치
  - `statements`, `branches`, `functions`, `lines` 네 지표
  - threshold를 강제하지 않고 `0.1.0` 기준선으로 기록한다는 설명
- 수동 확인에는 아래 흐름을 반드시 포함한다.
  - 홈에서 검색 시작
  - `/books` 결과 확인
  - 상세 보기
  - 소장 도서관 찾기
  - 지역 선택
  - 도서관 결과 및 지도
  - 대출 가능 여부 조회
- 배포/운영 확인에는 아래를 포함한다.
  - web / bff 분리 배포 기준
  - custom domain 기준
  - 현재 env/CORS 운영 방식의 핵심 전제
- 단순 명령어 목록만 나열하지 않고, **무엇을 확인하기 위한 검증이었는지**를 함께 적는다.
- coverage 수치를 남기기 위해 web / bff 각각에 `test:coverage` 스크립트와 Vitest coverage reporter가 준비되어 있어야 한다.

### 5. `docs/releases/0.1.0/known-issues.md`

- 이 문서는 “남아 있는 문제와 후속 후보”를 구분해서 설명해야 한다.
- 최소 섹션은 아래로 고정한다.
  - 현재 남아 있는 한계
  - 외부 의존성으로 인한 제약
  - 다음 버전 후보
- 현재 남아 있는 한계에는 아래와 같은 항목을 우선 후보로 본다.
  - Open API 품질에 따라 검색 결과나 응답 안정성이 달라질 수 있는 점
  - MVP 범위 밖이라 아직 제공하지 않는 기능
  - 의도적으로 미룬 UX/구조 개선
- 사용자 사용을 막는 문제와, 후속 개선 후보를 같은 급으로 섞어 적지 않는다.

## 문서 작성 원칙

- 기술 용어를 쓸 때는 먼저 서비스 맥락으로 설명한다.
- “무엇을 만들었는지”보다 “사용자가 무엇을 할 수 있는지”를 먼저 쓴다.
- 새로 투입된 개발자가 바로 판단할 수 있게, 핵심 기능과 기술 선택 이유를 함께 남긴다.
- phase 번호, 파일 경로, 내부 레이어 이름만 연속해서 나열하지 않는다.
- 문서마다 짧은 도입 문단을 두고, 해당 문서가 어떤 질문에 답하는 문서인지 먼저 밝힌다.
- 구현 세부사항은 필요한 만큼만 남기고, 파일별 변경 기록처럼 쓰지 않는다.
- 추상적인 표현보다 현재 구현된 흐름과 상태를 그대로 설명한다.

## 구현 완료 기준

- `docs/releases/index.md`가 생성되어 `0.1.0`으로 진입할 수 있어야 한다.
- `docs/releases/0.1.0/overview.md` 하나만 읽고 서비스 목표와 핵심 사용자 플로우를 이해할 수 있어야 한다.
- `docs/releases/0.1.0/changes.md` 하나만 읽고 `0.1.0`에 무엇이 포함됐는지 이해할 수 있어야 한다.
- `docs/releases/0.1.0/verification.md` 하나만 읽고 배포 가능 근거를 이해할 수 있어야 한다.
- `docs/releases/0.1.0/verification.md`에 web / bff coverage 기준선이 함께 기록돼 있어야 한다.
- `docs/releases/0.1.0/known-issues.md` 하나만 읽고 남은 리스크와 다음 후보를 이해할 수 있어야 한다.
- 이 spec만 읽고도 implementer가 문서 구조, 문체, 복사 대상, 포함 내용에 대한 추가 결정을 하지 않아야 한다.

## 테스트 기준

- 문서 생성 전후로 `docs/phases/` 원본은 수정하지 않는다.
- 생성된 각 릴리즈 문서는 아래 질문 중 하나에 혼자 답할 수 있어야 한다.
  - `overview.md`: 이 서비스는 무엇을 하고, 사용자는 어떤 흐름으로 쓰는가?
  - `changes.md`: `0.1.0`에서 무엇이 완성됐는가?
  - `verification.md`: 왜 이 버전을 배포 가능 상태로 보는가?
  - `known-issues.md`: 지금 무엇이 남아 있고, 다음엔 무엇을 볼 것인가?
- `verification.md`에는 실제 재실행한 검증과 coverage 기준선만 들어가야 한다.
