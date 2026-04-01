# Phase 4. Entities 레이어 구성 Task

## 1. Entities 공통 구조 준비

- [x] `apps/web/src/entities/book/api`, `apps/web/src/entities/book/model` 디렉터리를 추가한다.
- [x] `apps/web/src/entities/library/api`, `apps/web/src/entities/library/model` 디렉터리를 추가한다.
- [x] `apps/web/src/entities/region/model` 디렉터리를 추가한다.
- [x] 각 슬라이스의 외부 공개 진입점을 `index.ts` 하나로 유지하도록 구조를 정리한다.
- [x] `book`, `library` query key/query options 네이밍 규칙을 코드 기준으로 고정한다.

## 2. `book` API 구현

- [x] `apps/web/src/entities/book/api/bookApi.ts`를 추가한다.
- [x] `getBooks`를 `requestGet<BookSearchResponse>` 기반으로 구현한다.
- [x] `getBookDetail`을 `requestGet<BookDetailResponse>` 기반으로 구현한다.
- [x] 도서 검색 query param 매핑을 `title`, `author`, `isbn13`, `page`와 내부 고정 `pageSize=10`으로 정리한다.
- [x] 도서 상세 endpoint가 `/api/books/:isbn13` 규칙을 따르도록 정리한다.

## 3. `book` 검색 모델 구현

- [x] `apps/web/src/shared/validation` 슬라이스를 추가하고 재사용 가능한 문자열/정수 정규화 유틸을 정의한다.
- [x] `apps/web/src/entities/book/model/bookSchema.ts`를 추가한다.
- [x] `BookSearchParams` 타입을 canonical params 기준으로 정의하고 `pageSize`를 공개 입력 파라미터에서 제거한다.
- [x] `searchBooksParamsSchema`를 `zod` 기반으로 정의한다.
- [x] `parseSearchBooksParams`를 구현해 form, URL query parsing 같은 입력 경계에서 canonical params를 만들 수 있게 한다.
- [x] `apps/web/src/entities/book/model/bookQueries.ts`에 `booksQueryKeys.search`를 구현한다.
- [x] `apps/web/src/entities/book/model/bookQueries.ts`에 `booksQueryOptions.search`를 구현한다.
- [x] `apps/web/src/entities/book/model/useGetSearchBooks.ts`를 추가한다.
- [x] `useGetSearchBooks`를 `useSuspenseQuery` 기반으로 구현한다.

## 3-1. `book` 검색 모델 리팩터링

- [x] `bookQueries.ts`와 `useGetSearchBooks.ts`가 입력 정규화를 다시 수행하지 않고 canonical `BookSearchParams`만 받도록 정리한다.
- [x] `book` 검색 요청의 `pageSize`를 엔티티 내부 상수 `10`으로 고정한다.
- [x] 입력 경계에서 사용할 스키마 파일 이름을 `bookSchema.ts`로 명확히 정리한다.

## 4. `book` 상세 모델 구현

- [x] `apps/web/src/entities/book/model/bookSchema.ts`에 상세 조회용 입력 스키마를 추가한다.
- [x] `apps/web/src/entities/book/model/bookQueries.ts`에 `booksQueryKeys.detail`를 구현한다.
- [x] `apps/web/src/entities/book/model/bookQueries.ts`에 `booksQueryOptions.detail`를 구현한다.
- [x] `apps/web/src/entities/book/model/useGetBookDetail.ts`를 추가한다.
- [x] `useGetBookDetail`을 `useSuspenseQuery` 기반으로 구현한다.
- [x] 도서 상세 응답의 `book === null` 해석에 필요한 추가 순수 helper는 현재 불필요함을 확인한다.

## 5. `library` API 및 모델 구현

- [x] `apps/web/src/entities/library/api/libraryApi.ts`를 추가한다.
- [x] `getLibraries`를 `requestGet<LibrarySearchResponse>` 기반으로 구현한다.
- [x] `apps/web/src/entities/library/model/librarySchema.ts`를 추가한다.
- [x] `LibrarySearchParams` 타입을 canonical params 기준으로 정의하고 `pageSize`를 공개 입력 파라미터에서 제거한다.
- [x] `searchLibrariesParamsSchema`를 `zod` 기반으로 정의한다.
- [x] `parseSearchLibrariesParams`를 구현해 입력 경계에서 canonical params를 만들 수 있게 한다.
- [x] `apps/web/src/entities/library/model/libraryQueries.ts`에 `librariesQueryKeys.search`를 구현한다.
- [x] `apps/web/src/entities/library/model/libraryQueries.ts`에 `librariesQueryOptions.search`를 구현한다.
- [x] `apps/web/src/entities/library/model/useGetSearchLibraries.ts`를 추가한다.
- [x] `useGetSearchLibraries`를 `useSuspenseQuery` 기반으로 구현한다.
- [x] `library` 검색 요청의 `pageSize`를 엔티티 내부 상수 `10`으로 고정한다.
- [x] `apps/web/src/entities/library/model/librarySearch.ts`에 좌표 존재 여부 판별 helper를 구현한다.
- [x] `apps/web/src/entities/library/model/librarySearch.ts`에 빈 결과 판별 helper를 구현한다.

## 6. `region` 정적 데이터 모델 구현

- [x] `apps/web/src/entities/region/model/regionData.ts`를 추가한다.
- [x] `RegionOption` 타입을 정의한다.
- [x] `DetailRegionOption` 타입을 정의한다.
- [x] `open_api_spec.md`의 `지역 코드 전체 (region)` 데이터를 `REGION_OPTIONS` 상수로 옮긴다.
- [x] `open_api_spec.md`의 `세부 지역 코드 전체 (dtl_region)` 데이터를 `DETAIL_REGION_OPTIONS_BY_REGION` 상수로 옮긴다.
- [x] `DetailRegionOption.region` 필드를 포함해 상위 region 종속 관계를 명시한다.
- [x] 문서 원본과 코드 상수의 값 체계가 일치하는지 대조한다.

## 7. `region` helper 구현

- [x] `apps/web/src/entities/region/model`에 `isDetailRegionOfRegion` helper를 구현한다.
- [x] `DETAIL_REGION_OPTIONS_BY_REGION[region] ?? []` 패턴으로 세부 지역이 없는 경우도 빈 배열로 안전하게 접근할 수 있도록 사용 기준을 정리한다.

## 8. 슬라이스 공개 API 정리

- [x] `apps/web/src/entities/book/index.ts`가 훅, query key, query options, 입력 스키마, parse helper, 공개 타입만 export하도록 정리한다.
- [x] `apps/web/src/entities/library/index.ts`가 훅, query key, query options, 입력 스키마, parse helper, helper, 공개 타입만 export하도록 정리한다.
- [x] `apps/web/src/entities/region/index.ts`가 상수, helper, 공개 타입만 export하도록 정리한다.
- [x] 슬라이스 외부에서 내부 파일 직접 import가 필요하지 않도록 공개 경계를 고정한다.

## 9. 순수 로직 중심 테스트 작성

- [ ] `book`에서 schema parse helper나 순수 로직이 분리되면 해당 로직만 최소 유닛 테스트로 검증한다.
- [ ] `library`에서 좌표 판별이나 빈 결과 판별 helper가 분리되면 해당 로직만 최소 유닛 테스트로 검증한다.
- [ ] `region`의 helper와 region-detailRegion 종속 관계를 유닛 테스트로 검증한다.
- [ ] 엔티티 테스트 범위에 API 요청 함수 검증이 포함되지 않았는지 점검한다.
- [ ] 엔티티 테스트 범위에 React Query 훅이나 외부 라이브러리 동작 검증이 포함되지 않았는지 점검한다.

## 10. 검증

- [ ] `pnpm lint:web`를 실행해 web 패키지 lint를 확인한다.
- [ ] `pnpm test:run`을 실행해 web 테스트를 확인한다.
- [ ] `pnpm typecheck:web`를 실행해 타입 체크를 확인한다.
- [ ] `pnpm build:web`를 실행해 프로덕션 빌드를 확인한다.
- [ ] 엔티티 외부 공개 경계가 `index.ts`만으로 유지되는지 최종 점검한다.

## 11. 문서 정리

- [ ] 구현 결과가 Phase 4 `spec.md`의 범위와 완료 기준을 충족하는지 점검한다.
- [ ] Phase 4 `spec.md`의 테스트 기준이 순수 로직 중심 유닛 테스트 정책과 일치하는지 확인한다.
- [ ] Phase 5 feature 구현이 바로 이어질 수 있도록 엔티티 공개 API를 최종 점검한다.
