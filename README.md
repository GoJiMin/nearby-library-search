# 동네 도서관 찾기

책 제목과 지역 정보를 기준으로 내 주변 도서관의 소장 여부와 위치를 빠르게 확인하기 위한 MVP 프로젝트입니다.

## 기술 스택

- React 19
- Vite
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- Vitest
- React Testing Library

## 실행

```bash
pnpm dev
```

## 검증

```bash
pnpm exec tsc -p tsconfig.app.json
pnpm build
```

## 문서

- 전체 개발 계획: `plan.md`
- Phase 1 명세: `docs/phases/phase-01-app/spec.md`
- Phase 1 작업 목록: `docs/phases/phase-01-app/task.md`

## 현재 상태

- Phase 1 app 레이어 표준화 진행 완료
- 다음 단계는 shared 레이어 구성
