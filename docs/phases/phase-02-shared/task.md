# Phase 2. Shared 레이어 구성 Task

## 1. 공통 API 요청 기반 준비

- [x] 공통 API 요청 구조에 필요한 의존성과 기본 디렉터리를 정리한다.
- [x] `src/shared/request` 슬라이스와 내부 `lib` 구조를 만든다.
- [x] `requestType.ts`에 메서드, 헤더, body, query param, 응답 옵션 타입을 정의한다.
- [x] `RequestError`, `RequestGetError` 기준의 에러 타입 구조를 정리한다.

## 2. request core 구현

- [x] query string 직렬화 기준을 request core에서 사용할 수 있게 정리한다.
- [x] 공통 헤더 병합과 JSON/FormData body 처리를 담당하는 request init 생성 함수를 구현한다.
- [x] base URL과 endpoint를 조합하는 request URL 생성 로직을 구현한다.
- [x] 실패 응답을 `RequestError`, `RequestGetError`로 변환하는 공통 에러 처리 로직을 구현한다.
- [x] 인증 없는 현재 프로젝트 기준으로 `request` 코어 함수를 구현한다.
- [x] `requestGet`, `requestPost` 공개 함수를 구현한다.
- [x] `src/shared/request/index.ts`에서 request 관련 공개 API를 정리한다.

## 3. shadcn/ui 기반 공통 UI 준비

- [x] `shadcn/ui` 기반 공통 UI에 필요한 의존성과 설정을 추가한다.
- [x] `lucide-react`를 설치하고 공통 UI에서 사용하는 기준을 정리한다.
- [x] `src/shared/ui` 디렉터리와 단일 엔트리 `index.ts`를 만든다.
- [x] `button.tsx`, `input.tsx`, `dialog.tsx`를 공통 UI 기준으로 추가한다.
- [x] 공통 UI import가 `@/shared/ui` 단일 엔트리로만 가능하도록 정리한다.

## 4. 공통 피드백 UI 정리

- [x] 기존 `shared/feedback` 슬라이스를 `shadcn/ui` 톤과 현재 스타일 토큰 기준으로 정리한다.
- [x] `LoadingState`, `EmptyState`, `ErrorState` 표현을 공통 UI 기준과 일관되게 맞춘다.
- [x] 필요 시 `lucide-react` 아이콘을 피드백 UI에 반영한다.

## 5. Shared 사용 규칙 반영

- [x] `entities`, `features`, `pages`가 `shared/request`를 사용하도록 문서 기준을 정리한다.
- [x] `entities`, `features`, `pages`가 `@/shared/env`만 사용하도록 문서 기준을 정리한다.
- [ ] 공통 UI가 `@/shared/ui` 단일 엔트리로만 import되도록 문서에 반영한다.
- [ ] Shared 레이어가 도메인 지식을 가지지 않는다는 기준을 문서에 반영한다.

## 6. 테스트 작성

- [ ] request core의 query string, headers, JSON body, `FormData` 처리 테스트를 작성한다.
- [ ] 실패 응답이 `RequestError`, `RequestGetError`로 구분되는지 테스트한다.
- [ ] `shadcn/ui`처럼 이미 검증된 UI 기반 컴포넌트에는 불필요한 테스트를 추가하지 않는다.

## 7. 검증

- [ ] `pnpm test:run`이 성공한다.
- [ ] `pnpm exec tsc -p tsconfig.app.json`가 성공한다.
- [ ] `pnpm build`가 성공한다.
- [ ] request 공개 함수와 공통 UI import가 의도한 단일 엔트리 경로로만 동작하는지 확인한다.

## 8. 문서 반영

- [ ] 구현 결과가 `spec.md`의 범위와 완료 기준을 충족하는지 점검한다.
- [ ] 필요 시 Phase 2 결정 사항을 `spec.md`에 보완 반영한다.
- [ ] 다음 단계인 `entities` 레이어 작업으로 이어질 준비 상태를 확인한다.
