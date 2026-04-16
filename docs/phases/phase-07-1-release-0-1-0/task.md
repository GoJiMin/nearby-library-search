# Phase 7-1. 0.1.0 릴리즈 스냅샷 작성 Task

## 1. `docs/releases/` 기본 구조와 `index.md`를 만든다.

- [x] `docs/releases/`와 `docs/releases/0.1.0/` 디렉터리를 만든다.
- [x] `docs/releases/0.1.0/artifacts/` 디렉터리를 함께 만든다.
- [x] `docs/releases/index.md`에 `0.1.0` 버전 항목과 한 줄 요약, 링크를 추가한다.
- [x] `index.md`는 버전 탐색 문서 역할만 하도록 상세 기능 설명을 넣지 않는다.

## 2. `overview.md`에 0.1.0 서비스 개요와 핵심 사용자 플로우를 정리한다.

- [x] 서비스의 주 목표와 주 사용자를 설명한다.
- [x] 홈 검색 시작부터 도서 상세 보기까지 핵심 사용자 플로우를 순서대로 정리한다.
- [x] 현재 MVP에서 사용자가 실제로 할 수 있는 핵심 행동을 정리한다.
- [x] `web + bff + contracts` 구조와 BFF 도입 이유를 API 키 보호, provider boundary, 응답 정규화 기준으로 설명한다.

## 3. `changes.md`에 0.1.0의 사용자 관점/구현 관점 변경을 정리한다.

- [ ] 사용자 관점 변경 섹션에 완성된 화면과 기능 흐름을 묶어서 정리한다.
- [ ] 구현 관점 변경 섹션에 web/BFF 분리, `/books` 결과 흐름, dialog 흐름, bundle optimization, 배포 기준을 정리한다.
- [ ] BFF 도입 이유와 API 키 보호 경계를 구현 관점에 포함한다.
- [ ] 이번 버전에 포함되지 않은 기능이나 범위를 별도 섹션으로 정리한다.

## 4. `verification.md`에 배포 가능 근거를 정리한다.

- [ ] 타입체크, web build, bff build, 핵심 테스트 결과를 자동 검증 섹션에 정리한다.
- [ ] 홈 검색부터 availability, 상세 보기까지 수동 확인한 핵심 사용자 플로우를 정리한다.
- [ ] web/BFF 분리 배포, custom domain, env/CORS 전제를 배포/운영 확인 섹션에 정리한다.
- [ ] 단순 명령어 나열이 아니라 무엇을 검증했는지 함께 설명한다.

## 5. `known-issues.md`에 현재 한계와 다음 버전 후보를 정리한다.

- [ ] 현재 남아 있는 한계를 사용자 사용을 막는 문제와 일반 한계로 구분해 정리한다.
- [ ] 외부 Open API 품질이나 외부 의존성으로 인한 제약을 별도 섹션으로 정리한다.
- [ ] 의도적으로 미룬 UX/구조 개선과 다음 버전 후보를 함께 정리한다.
- [ ] 후속 개선 후보를 현재 blocker처럼 보이지 않게 구분해 쓴다.

## 6. `0.1.0` artifacts snapshot 대상을 복사한다.

- [ ] `spec.md`에 고정된 `phase-04-2`, `phase-05-1` ~ `phase-05-6`, `phase-06-3` 문서만 복사 대상으로 사용한다.
- [ ] `spec.md`와 `task.md`를 모두 복사하고, 원본 파일명과 phase 폴더 구조를 유지한다.
- [ ] `artifacts/`에는 링크가 아니라 실제 복사본만 둔다.
- [ ] `docs/phases/` 원본은 수정하지 않는다.

## 7. 전체 릴리즈 문서의 문체와 독자 기준을 맞춘다.

- [ ] 새로 투입되는 개발자가 읽는다는 전제에 맞춰 용어를 서비스 맥락으로 풀어 쓴다.
- [ ] 각 문서에서 사용자 플로우 설명이 기술 설명보다 먼저 오도록 정리한다.
- [ ] 각 문서가 다른 릴리즈 문서를 열지 않아도 이해 가능하도록 독립성을 확인한다.
- [ ] 커밋 목록이나 파일 수정 기록처럼 보이지 않도록 문장을 기능/의미 단위로 정리한다.

## 8. 최종 검증과 문서 동기화를 마감한다.

- [ ] `docs/releases/index.md`에서 `0.1.0`으로 진입 가능한지 확인한다.
- [ ] `overview.md`, `changes.md`, `verification.md`, `known-issues.md`가 각각 독립적으로 읽히는지 확인한다.
- [ ] `artifacts/`에 `spec.md`가 요구한 복사본이 실제로 존재하는지 확인한다.
- [ ] `plan.md`의 `Phase 7-1 내용을 기준으로 필요한 spec.md와 task.md를 작성한다.` 체크를 `[x]`로 반영한다.

## Important Changes

- 이번 phase는 코드 구현이 아니라 `0.1.0` 릴리즈 문서 세트를 작성하는 작업이다.
- 릴리즈 문서의 1차 독자는 새로 투입되는 개발자이며, 서비스 목표와 사용자 플로우 설명을 우선한다.
- `docs/releases/0.1.0/artifacts/`는 링크 모음이 아니라 phase 문서 복사본 스냅샷으로 관리한다.
- `package.json` version `0.1.0` 상향은 이번 phase 비범위다.

## Test Plan

- 문서 구조 검증
  - `docs/releases/index.md`
  - `docs/releases/0.1.0/overview.md`
  - `docs/releases/0.1.0/changes.md`
  - `docs/releases/0.1.0/verification.md`
  - `docs/releases/0.1.0/known-issues.md`
  - `docs/releases/0.1.0/artifacts/`
- 문서 품질 검증
  - `overview.md`만 읽고 서비스 목표와 핵심 사용자 플로우를 이해할 수 있어야 한다.
  - `changes.md`만 읽고 `0.1.0` 기능 범위를 이해할 수 있어야 한다.
  - `verification.md`만 읽고 배포 가능 근거를 이해할 수 있어야 한다.
  - `known-issues.md`만 읽고 남은 한계와 다음 후보를 이해할 수 있어야 한다.
- 스냅샷 검증
  - `artifacts/`는 링크가 아니라 실제 복사본이어야 한다.
  - `docs/phases/` 원본은 변경되지 않아야 한다.

## Assumptions

- `task.md` 경로는 `docs/phases/phase-07-1-release-0-1-0/task.md`로 고정한다.
- `0.1.0`은 문서상 릴리즈 정의이며, package version 동기화는 별도 작업으로 남긴다.
- `artifacts/` 복사 대상은 `spec.md`에 이미 고정된 목록을 그대로 따른다.
- 최종 task 전까지는 릴리즈 문서 작성과 snapshot 복사만 진행하고, 코드 변경은 하지 않는다.
