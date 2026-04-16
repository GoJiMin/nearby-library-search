# 0.1.0 Verification

이 문서는 `0.1.0`을 배포 가능 상태로 판단할 때 사용한 근거를 정리한 릴리즈 검증 문서입니다. 아래 내용은 모두 Task 4 시점에 다시 실행하거나 다시 확인한 결과만 사용했습니다.

## 0.1.0 검증 기준

`0.1.0` 검증은 네 갈래로 나눠 다시 확인했습니다. 첫째, workspace 타입 경계와 production build가 현재 코드 기준으로 다시 통과하는지 확인했습니다. 둘째, 검색 시작부터 책 상세 보기, 지역 선택, 도서관 결과, 대출 가능 여부 조회까지 이어지는 핵심 회귀 테스트를 다시 실행했습니다. 셋째, web과 bff 전체 suite coverage를 다시 측정해 `0.1.0` 시점의 기준선을 남겼습니다. 넷째, 운영 URL과 API URL에 대해 시나리오 smoke check를 다시 수행해 현재 배포 경계가 실제로 응답하는지 확인했습니다.

## 자동 검증

- `pnpm exec tsc -b tsconfig.json`
  - web, bff, contracts 사이의 타입 경계가 현재 코드 기준으로 다시 맞는지 확인했습니다.
  - 결과: 통과
- `pnpm --filter @nearby-library-search/web build`
  - 현재 web 앱이 production 산출물을 다시 만들 수 있는지 확인했습니다.
  - 결과: 통과
- `pnpm --filter @nearby-library-search/bff build`
  - contracts build를 포함해 bff production build가 다시 통과하는지 확인했습니다.
  - 결과: 통과
- `pnpm --filter @nearby-library-search/web exec vitest run src/app/router/router.integration.test.tsx src/features/book-search/ui/search-start/test/BookSearchStart.test.tsx src/features/book-search/ui/search-result/test/BookSearchResult.test.tsx src/features/region/ui/test/RegionSelectDialog.test.tsx src/features/library/ui/test/LibrarySearchResultDialog.test.tsx`
  - 홈 검색 시작, `/books` 결과 복원, 지역 선택, 도서관 결과 다이얼로그까지 사용자가 직접 보게 되는 핵심 흐름 회귀를 다시 확인했습니다.
  - 결과: 5개 테스트 파일, 144개 테스트 통과
- `pnpm --filter @nearby-library-search/bff exec vitest run src/routes/book/search/test/route.test.ts src/routes/book/detail/test/route.test.ts src/routes/library/search/test/route.test.ts src/routes/library/availability/test/route.test.ts`
  - 책 검색, 책 상세, 도서관 검색, 대출 가능 여부 조회 route가 현재 계약 기준으로 다시 동작하는지 확인했습니다.
  - 결과: 4개 테스트 파일, 36개 테스트 통과

## 테스트 커버리지

- web 전체 suite 기준
  - statements: `91.65%`
  - branches: `85.82%`
  - functions: `90.11%`
  - lines: `91.39%`
- bff 전체 suite 기준
  - statements: `92.44%`
  - branches: `83.94%`
  - functions: `99.20%`
  - lines: `92.34%`

이 수치는 `0.1.0` 시점의 기준선으로 기록합니다. 현재는 release blocking threshold를 걸지 않았고, 이후 버전에서 품질 변화를 비교할 때 참고하는 기준으로 사용합니다.

## 수동 확인

이번 Task 4에서는 비-GUI 터미널 환경 때문에 브라우저 클릭 기반 점검 대신, 운영 URL과 API URL에 대해 시나리오 smoke check를 다시 수행했습니다. 즉 화면을 직접 조작한 검증은 아니지만, 현재 배포된 web 진입점과 BFF 경로가 실제로 응답하는지 운영 기준으로 다시 확인했습니다.

1. `https://nearlib.com`
   - 결과: `200`
   - 확인 내용: 운영 web 도메인이 정상 응답합니다.
   - 관찰 사항: 현재 HTML `<title>`은 아직 `동네 도서관 찾기`로 응답합니다. 브랜드명 `니어립` 반영은 최신 web 배포에서 다시 확인이 필요합니다.
2. `https://nearlib.com/books?title=파친코&page=1`
   - 결과: `200`
   - 확인 내용: `/books` deep link 진입 자체는 현재 운영 web에서 정상 응답합니다.
3. `https://api.nearlib.com/api/books/search?title=파친코`
   - 결과: `200`
   - 확인 내용: 검색 결과 조회가 정상 응답하며 `totalCount`는 `13`이었습니다.
   - 관찰 값: 첫 번째 책 `파친코 :이민진 장편소설`, `isbn13=9788970129815`
4. `https://api.nearlib.com/api/books/9788970129815`
   - 결과: `200`
   - 확인 내용: 책 상세 조회가 정상 응답합니다.
5. `https://api.nearlib.com/api/libraries/search?isbn=9788970129815&region=11`
   - 결과: `200`
   - 확인 내용: 지역 코드를 포함한 도서관 검색이 정상 응답하며 `totalCount`는 `261`이었습니다.
   - 관찰 값: 첫 번째 도서관 `KB국민은행과 함께하는 나무 작은도서관`, `code=711618`
6. `https://api.nearlib.com/api/libraries/711618/books/9788970129815/availability`
   - 결과: `200`
   - 확인 내용: 특정 도서관 기준 대출 가능 여부 조회가 정상 응답합니다.
   - 관찰 값: `loanAvailable=N`

## 배포/운영 확인

- web과 bff는 현재 분리된 Vercel 프로젝트를 기준으로 운영합니다.
  - web 도메인: `https://nearlib.com`
  - bff 도메인: `https://api.nearlib.com`
- 현재 [vercel.json](/Users/gojimin/Desktop/ai/apps/web/vercel.json)은 SPA fallback만 유지하고 `/api` rewrite는 제거된 상태입니다.
  - 운영 기준에서는 web이 BFF를 직접 호출해야 합니다.
  - 운영 web 환경값 기준도 `VITE_API_BASE_URL=https://api.nearlib.com`입니다.
- bff는 [env.ts](/Users/gojimin/Desktop/ai/apps/bff/src/config/env.ts) 기준으로 아래 운영 전제를 가집니다.
  - `WEB_APP_ORIGIN`은 `https`만 허용하고, path/query/hash가 없는 exact origin이어야 합니다.
  - `WEB_APP_ORIGIN`은 `localhost`나 `127.0.0.1`를 허용하지 않습니다.
  - `LIBRARY_API_BASE_URL`은 `https`만 허용합니다.
  - `ALLOW_DEV_CORS_ORIGINS`는 운영 기준에서 `false`여야 합니다.
- 현재 운영 smoke 결과를 기준으로 보면 web 진입점, `/books` deep link, BFF의 검색/상세/도서관 검색/대출 가능 여부 조회는 모두 응답합니다.
- 다만 운영 web의 HTML title이 아직 이전 이름으로 응답하고 있으므로, 브랜드명 `니어립`과 메타데이터 변경이 최신 배포에 반영됐는지는 별도 확인이 필요합니다.
