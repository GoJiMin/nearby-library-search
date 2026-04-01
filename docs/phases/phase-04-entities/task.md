# Phase 4. Entities 레이어 구성 Task

## 1. Entities 공통 구조 준비

- [x] `apps/web/src/entities/book/api`, `apps/web/src/entities/book/model` 디렉터리를 추가한다.
- [x] `apps/web/src/entities/library/api`, `apps/web/src/entities/library/model` 디렉터리를 추가한다.
- [x] `apps/web/src/entities/region/model` 디렉터리를 추가한다.
- [x] 각 슬라이스의 외부 공개 진입점을 `index.ts` 하나로 유지하도록 구조를 정리한다.
- [x] `book`, `library` query key/query options 네이밍 규칙을 코드 기준으로 고정한다.

## 2. `book` API 구현

- [ ] `apps/web/src/entities/book/api/bookApi.ts`를 추가한다.
- [ ] `getBooks`를 `requestGet<BookSearchResponse>` 기반으로 구현한다.
- [ ] `getBookDetail`을 `requestGet<BookDetailResponse>` 기반으로 구현한다.
- [ ] 도서 검색 query param 매핑을 `title`, `author`, `isbn13`, `page`, `pageSize`로 고정한다.
- [ ] 도서 상세 endpoint가 `/api/books/:isbn13` 규칙을 따르도록 정리한다.

## 3. `book` 검색 모델 구현

- [ ] `apps/web/src/entities/book/model/bookSearch.ts`를 추가한다.
- [ ] `BookSearchParams` 타입을 정의한다.
- [ ] `normalizeBookSearchParams`에 공백 제거와 기본값 `page=1`, `pageSize=10` 규칙을 반영한다.
- [ ] `booksQueryKeys.search`를 구현한다.
- [ ] `booksQueryOptions.search`를 구현한다.
- [ ] `useBookSearchQuery`를 `useSuspenseQuery` 기반으로 구현한다.

## 4. `book` 상세 모델 구현

- [ ] `apps/web/src/entities/book/model/bookDetail.ts`를 추가한다.
- [ ] `booksQueryKeys.detail`를 구현한다.
- [ ] `booksQueryOptions.detail`를 구현한다.
- [ ] `useBookDetailQuery`를 `useSuspenseQuery` 기반으로 구현한다.
- [ ] 도서 상세 응답의 `book === null` 해석에 필요한 최소 helper 또는 타입 기준을 정리한다.

## 5. `library` API 및 모델 구현

- [ ] `apps/web/src/entities/library/api/libraryApi.ts`를 추가한다.
- [ ] `getLibraries`를 `requestGet<LibrarySearchResponse>` 기반으로 구현한다.
- [ ] `apps/web/src/entities/library/model/librarySearch.ts`를 추가한다.
- [ ] `LibrarySearchParams` 타입을 정의한다.
- [ ] `normalizeLibrarySearchParams`에 기본값 `page=1`, `pageSize=10` 규칙을 반영한다.
- [ ] `librariesQueryKeys.search`를 구현한다.
- [ ] `librariesQueryOptions.search`를 구현한다.
- [ ] `useLibrarySearchQuery`를 `useSuspenseQuery` 기반으로 구현한다.
- [ ] 좌표 존재 여부 판별 helper를 구현한다.
- [ ] 빈 결과 판별 helper를 구현한다.

## 6. `region` 정적 데이터 모델 구현

- [ ] `apps/web/src/entities/region/model/regionData.ts`를 추가한다.
- [ ] `RegionOption` 타입을 정의한다.
- [ ] `DetailRegionOption` 타입을 정의한다.
- [ ] `open_api_spec.md`의 `지역 코드 전체 (region)` 데이터를 `REGION_OPTIONS` 상수로 옮긴다.
- [ ] `open_api_spec.md`의 `세부 지역 코드 전체 (dtl_region)` 데이터를 `DETAIL_REGION_OPTIONS_BY_REGION` 상수로 옮긴다.
- [ ] `DetailRegionOption.region` 필드를 포함해 상위 region 종속 관계를 명시한다.
- [ ] 문서 원본과 코드 상수의 값 체계가 일치하는지 대조한다.

## 7. `region` selector/helper 구현

- [ ] `apps/web/src/entities/region/model/regionSelectors.ts`를 추가한다.
- [ ] 전체 시도 목록을 반환하는 `getRegionOptions` selector를 구현한다.
- [ ] 특정 `region`의 세부 지역 목록을 반환하는 `getDetailRegionOptions` selector를 구현한다.
- [ ] 세부 지역이 없는 경우 빈 배열을 반환하도록 정리한다.
- [ ] 선택된 `detailRegion`이 `region`에 속하는지 판별하는 `isDetailRegionOfRegion` helper를 구현한다.

## 8. 슬라이스 공개 API 정리

- [ ] `apps/web/src/entities/book/index.ts`가 훅, query key, query options, 공개 타입만 export하도록 정리한다.
- [ ] `apps/web/src/entities/library/index.ts`가 훅, query key, query options, 공개 타입만 export하도록 정리한다.
- [ ] `apps/web/src/entities/region/index.ts`가 상수, selector, helper, 공개 타입만 export하도록 정리한다.
- [ ] 슬라이스 외부에서 내부 파일 직접 import가 필요하지 않도록 공개 경계를 고정한다.

## 9. 순수 로직 중심 테스트 작성

- [ ] `book`에서 순수 정규화 로직이 분리되면 해당 로직만 최소 유닛 테스트로 검증한다.
- [ ] `library`에서 좌표 판별이나 빈 결과 판별 helper가 분리되면 해당 로직만 최소 유닛 테스트로 검증한다.
- [ ] `region`의 selector/helper와 region-detailRegion 종속 관계를 유닛 테스트로 검증한다.
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
