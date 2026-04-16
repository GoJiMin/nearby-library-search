# Phase 7-1. 0.1.0 릴리즈 스냅샷 작성

## 목표

- 현재 MVP 상태를 `0.1.0`으로 정의하고, 새로 투입되는 개발자가 문서만 읽고도 서비스와 구현 범위를 빠르게 이해할 수 있는 릴리즈 문서 세트를 만든다.
- `docs/phases/`에 흩어져 있는 작업 문서와 `README.md`의 프로젝트 소개를 그대로 복사하지 않고, **0.1.0 시점의 서비스 목표, 사용자 플로우, 핵심 기능, 기술 선택 이유, 검증 상태**를 버전 기준으로 다시 정리한다.
- `docs/releases/0.1.0/artifacts/`에는 해당 버전에 실제로 연결되는 phase 문서 복사본을 보관해, 이후 문서가 바뀌더라도 `0.1.0` 시점 기준을 재확인할 수 있게 한다.

## 1차 source of truth

- 루트 `.impeccable.md`
- 루트 `AGENTS.md`
- `plan.md`의 `Phase 7`, `Phase 7-1`
- `README.md`
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
- 릴리즈 문서의 1차 독자는 **새로 투입되는 개발자**다.
  - 개발 경험은 있다고 가정하지만, 이 프로젝트의 배경과 결정은 모른다고 본다.
  - 문서는 기술적 정확성을 유지하되, 서비스 설명 없이 용어만 나열하지 않는다.
- 문서는 한국어로 작성한다.
- 릴리즈 문서는 changelog보다 **온보딩 가능한 버전 스냅샷**에 가깝다.
  - “무엇이 바뀌었는지”만 적지 않고, “이 서비스가 무엇을 하고, 어떤 흐름이 동작하며, 왜 이런 구조를 택했는지”를 함께 적는다.
- 각 문서는 **혼자 읽혀도 이해 가능**해야 한다.
  - 다른 릴리즈 문서를 꼭 열어봐야만 이해되는 구조로 쓰지 않는다.
- `docs/releases/0.1.0/artifacts/`는 링크 모음이 아니라 **복사본 스냅샷**으로 관리한다.
  - 원본이 이후 변경돼도 `0.1.0` 시점 문서를 그대로 다시 확인할 수 있어야 한다.

## 구현 범위

- `docs/releases/index.md` 작성
- `docs/releases/0.1.0/overview.md` 작성
- `docs/releases/0.1.0/changes.md` 작성
- `docs/releases/0.1.0/verification.md` 작성
- `docs/releases/0.1.0/known-issues.md` 작성
- `docs/releases/0.1.0/artifacts/` 생성 및 `0.1.0` 관련 phase 문서 복사

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
- 기술 설명은 허용하지만, 사용자 플로우 설명보다 앞에 오면 안 된다.

### 3. `docs/releases/0.1.0/changes.md`

- `0.1.0`에서 제공되는 내용을 **사용자 관점**과 **구현 관점**으로 나눠 정리한다.
- 최소 섹션은 아래로 고정한다.
  - 사용자 관점 변경
  - 구현 관점 변경
  - 이번 버전에 포함되지 않은 것
- 사용자 관점에서는 화면 이름과 기능 흐름 중심으로 설명한다.
- 구현 관점에서는 아래 내용을 반드시 포함한다.
  - React web + Fastify BFF 분리 구조
  - URL 기반 `/books` 결과 흐름
  - 지역 선택 / 도서관 결과 / availability / 상세 보기 흐름
  - `Phase 6-3` 번들 최적화 결과
  - Vercel 배포 기준
- 커밋 제목이나 파일 수정 목록 중심으로 쓰지 않는다.

### 4. `docs/releases/0.1.0/verification.md`

- 이 문서는 “왜 `0.1.0`을 배포 가능 상태로 보는지”를 설명해야 한다.
- 최소 섹션은 아래로 고정한다.
  - 자동 검증
  - 수동 확인
  - 배포/운영 확인
- 자동 검증에는 아래 범주의 결과가 반드시 들어가야 한다.
  - 타입체크
  - web build
  - bff build
  - 핵심 사용자 흐름 관련 web 테스트
  - 핵심 route 관련 bff 테스트
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

### 6. `docs/releases/0.1.0/artifacts/`

- 이 디렉터리는 `0.1.0` 시점의 phase 문서 복사본을 보관한다.
- 복사 기준은 “이 릴리즈의 기능과 직접 연결되는 문서”로 고정한다.
- `0.1.0`에서는 아래 문서를 복사 대상으로 고정한다.

```text
docs/phases/phase-04-2-ux-ui-design/spec.md
docs/phases/phase-05-1-home-search-start/spec.md
docs/phases/phase-05-1-home-search-start/task.md
docs/phases/phase-05-1a-home-visual-refresh/spec.md
docs/phases/phase-05-1a-home-visual-refresh/task.md
docs/phases/phase-05-2-book-search-result-and-selection/spec.md
docs/phases/phase-05-2-book-search-result-and-selection/task.md
docs/phases/phase-05-3-region-selection-dialog/spec.md
docs/phases/phase-05-3-region-selection-dialog/task.md
docs/phases/phase-05-4-library-search-result-dialog/spec.md
docs/phases/phase-05-4-library-search-result-dialog/task.md
docs/phases/phase-05-5-library-availability-check/spec.md
docs/phases/phase-05-5-library-availability-check/task.md
docs/phases/phase-05-6-book-detail-dialog/spec.md
docs/phases/phase-05-6-book-detail-dialog/task.md
docs/phases/phase-06-3-web-bundle-optimization/spec.md
docs/phases/phase-06-3-web-bundle-optimization/task.md
```

- 복사본은 원본과 같은 파일명을 유지한다.
- `artifacts/` 안에서는 phase 폴더 구조를 유지해, 어떤 phase에서 온 문서인지 바로 알 수 있어야 한다.

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
- `docs/releases/0.1.0/known-issues.md` 하나만 읽고 남은 리스크와 다음 후보를 이해할 수 있어야 한다.
- `docs/releases/0.1.0/artifacts/`에서 `0.1.0` 시점의 핵심 phase 문서 복사본을 다시 확인할 수 있어야 한다.
- 이 spec만 읽고도 implementer가 문서 구조, 문체, 복사 대상, 포함 내용에 대한 추가 결정을 하지 않아야 한다.

## 테스트 기준

- 문서 생성 전후로 `docs/phases/` 원본은 수정하지 않는다.
- `artifacts/`에 들어가는 문서는 링크가 아니라 실제 복사본이어야 한다.
- 생성된 각 릴리즈 문서는 아래 질문 중 하나에 혼자 답할 수 있어야 한다.
  - `overview.md`: 이 서비스는 무엇을 하고, 사용자는 어떤 흐름으로 쓰는가?
  - `changes.md`: `0.1.0`에서 무엇이 완성됐는가?
  - `verification.md`: 왜 이 버전을 배포 가능 상태로 보는가?
  - `known-issues.md`: 지금 무엇이 남아 있고, 다음엔 무엇을 볼 것인가?

