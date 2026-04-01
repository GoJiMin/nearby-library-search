# Phase 4. Entities 레이어 구성

## 목표

- `entities` 레이어에 `book`, `library`, `region` 도메인 슬라이스를 정의한다.
- BFF와 `packages/contracts`를 기준으로 웹 앱이 직접 엔드포인트나 raw 응답 구조를 알지 않도록 엔티티 경계를 고정한다.
- 이후 `features`, `pages`가 요청 데이터는 선언형으로 소비하고, 정적 참조 데이터는 엔티티 공개 모델로 재사용하도록 기준을 표준화한다.
- 도메인별 요청 함수, 쿼리 키, 쿼리 옵션, 서스펜스 훅, 정적 상수, 최소 검증 helper, 최소 비즈니스 로직을 각 슬라이스 내부로 정리한다.

## 기술 결정

- 엔티티 슬라이스: `book`, `library`, `region`
- 슬라이스 내부 세그먼트
  - `book`, `library`: `api`, `model`
  - `region`: `model`
- 서버 상태 접근: 요청이 필요한 엔티티는 `@tanstack/react-query`의 `useSuspenseQuery`
- 공통 요청 경계: `@/shared/request`의 `requestGet`
- 공통 계약 타입: `@nearby-library-search/contracts`
- 입력 검증: `zod`
- 공통 validation 유틸: `@/shared/validation`
- 웹 앱이 참조하는 BFF 엔드포인트
  - `/api/books/search`
  - `/api/books/:isbn13`
  - `/api/libraries/search`
- 지역 데이터 소스: Phase 3 `open_api_spec.md`의 `지역 코드 전체 (region)`, `세부 지역 코드 전체 (dtl_region)` 섹션
- 웹 앱에서 외부 Open API raw 응답을 직접 파싱하는 로직: 도입하지 않음
- `features`, `pages`에서 엔티티 API 함수를 직접 호출하는 방식: 허용하지 않음

## 구현 범위

- `entities/book`에 도서 검색과 도서 상세 조회 모델을 정의한다.
- `entities/library`에 ISBN + 지역 기준 도서관 조회 모델을 정의한다.
- `entities/region`에 지역 및 세부 지역 선택용 정적 데이터 모델과 검증 helper를 정의한다.
- `book`, `library`에는 API 함수, 쿼리 키 팩터리, 쿼리 옵션 팩터리, 서스펜스 훅을 정의한다.
- `region`에는 상수와 helper를 정의한다.
- BFF 응답을 앱 내부에서 그대로 재사용할 수 있는 영역과 파생 모델이 필요한 영역의 경계를 정의한다.
- 엔티티 레이어에서 로딩과 에러를 직접 처리하지 않고 상위 Suspense/Error Boundary에 위임하는 기준을 정리한다.
- Phase 4 구현을 바로 분해할 수 있는 `task.md` 작성 기준을 마련한다.

## 비범위

- 검색 폼, 지역 선택 다이얼로그, 결과 목록, 지도 표시 같은 `features`/`pages` UI 구현
- Suspense boundary와 route-level fallback 조립
- 카카오맵 스크립트 로딩과 지도 마커 렌더링
- 쓰기 요청과 mutation 설계
- 외부 Open API raw 타입을 웹 앱에 직접 노출하는 작업
- 지역 데이터의 BFF 엔드포인트화
- Phase 4 문서 내부에 지역 코드 원본 데이터를 중복 복사하는 작업

## 현재 기반 상태

- `apps/web/src/entities/book`, `apps/web/src/entities/library`, `apps/web/src/entities/region` 슬라이스 엔트리만 준비된 상태다.
- `apps/web/src/shared/request`는 `requestGet`, `requestPost`, `RequestGetError`를 공개하고 있다.
- `apps/web/src/app/providers/ReactQueryProvider.tsx`에서 공통 `QueryClientProvider`가 이미 연결되어 있다.
- `packages/contracts`는 `BookSearchResponse`, `BookDetailResponse`, `LibrarySearchResponse`, `RegionCode`, `DetailRegionCode`, `ErrorResponse` 타입을 제공한다.
- BFF는 `book search`, `book detail`, `library search` 엔드포인트를 이미 제공한다.

## 디렉터리 기준

- `src/entities/book`
  - `api`: 도서 검색, 도서 상세 BFF 요청 함수
  - `model`: 입력 타입, 쿼리 키, 쿼리 옵션, 서스펜스 훅, 파생 비즈니스 로직
  - `index.ts`: 슬라이스 공개 API
- `src/entities/library`
  - `api`: 도서관 조회 BFF 요청 함수
  - `model`: 입력 타입, 쿼리 키, 쿼리 옵션, 서스펜스 훅, 파생 비즈니스 로직
  - `index.ts`: 슬라이스 공개 API
- `src/entities/region`
  - `model`: 옵션 타입, 정적 상수, 지역 종속 로직
  - `index.ts`: 슬라이스 공개 API

각 슬라이스는 슬라이스 바깥에서 `index.ts`만 공개 진입점으로 사용한다. 세그먼트 디렉터리 내부에는 별도 barrel export를 두지 않는다.

## Entities 레이어 상세 설계

### 1. 공통 규칙

- 엔티티는 `shared/request`와 `packages/contracts` 위에서 도메인별 읽기 모델을 제공하는 레이어다.
- `entities`, `features`, `pages`는 `fetch`를 직접 사용하지 않는다.
- 네트워크 요청이 필요한 엔티티 API 함수는 모두 `requestGet`만 사용한다.
- 요청이 필요한 데이터 소비는 모두 React Query를 통하고, 상위 레이어는 API 함수 대신 엔티티 훅을 사용한다.
- `book`, `library`의 기본 읽기 훅은 모두 `useSuspenseQuery`를 사용한다.
- 요청 입력 검증은 각 엔티티 `model`에서 `zod` 스키마로 수행한다.
- 문자열 trim, 양의 정수 기본값 처리처럼 재사용 가능성이 있는 정규화/검증 로직은 `shared/validation`에서 범용 유틸로 제공하고, 도메인 규칙은 엔티티 스키마에서 조합한다.
- 엔티티 훅은 로딩 UI와 에러 UI를 직접 처리하지 않는다.
- 읽기 요청 실패는 `RequestGetError`와 Error Boundary 경로로 위임한다.
- 쿼리 키는 훅 파일 안에서 인라인으로 선언하지 않고, `model` 내부 별도 팩터리 객체에서만 관리한다.
- 쿼리 옵션도 훅 파일 안에서 인라인으로 만들지 않고, `model` 내부 별도 팩터리 객체에서만 관리한다.
- `bookQueries.ts`, `libraryQueries.ts`는 쿼리 키/옵션 팩터리 전용 파일로 유지한다.
- React Query 훅 이름은 역할이 드러나게 `useGet...` 형식으로 명시한다.
- 정적 참조 데이터는 React Query로 감싸지 않고 `model` 상수와 helper로 공개한다.
- 슬라이스 `index.ts`는 훅, 쿼리 키, 쿼리 옵션, 입력 스키마, parse helper, 상수, helper, 슬라이스 공개 타입만 export한다.
- `book`, `library`의 `index.ts`는 내부 `api` 요청 함수를 export하지 않는다.
- 재사용 가능한 도메인 계약 타입은 `packages/contracts`를 우선 사용한다.
- 엔티티 내부 전용 파생 타입은 contracts 타입으로 표현할 수 없을 때만 추가한다.
- BFF가 이미 정규화한 응답을 전제로 하므로, 웹 앱에서는 외부 provider 응답 모양을 다시 해석하지 않는다.

### 2. React Query 규칙

- `book`, `library`의 모든 쿼리 키는 직렬화 가능한 값만 포함한다.
- 객체 기반 query key는 입력 경계에서 이미 정규화된 canonical params만 사용한다.
- 입력 경계는 엔티티가 공개하는 `zod` 스키마로 기본값과 trim 처리를 한 번만 수행한다.
- `page` 기본값은 BFF 스키마와 동일하게 입력 경계에서 정규화한다.
  - 도서 검색: `page=1`
  - 도서관 조회: `page=1`
- `pageSize`는 Phase 4에서 엔티티 내부 상수 `10`으로 고정하고 공개 입력 파라미터로 노출하지 않는다.
- `book search`, `library search`처럼 페이지네이션이 있는 쿼리도 Phase 4에서는 `useSuspenseQuery`를 기준으로 통일한다.
- 현재 설치된 React Query v5의 `useSuspenseQuery`는 `enabled`, `throwOnError`, `placeholderData`를 받지 않으므로 `book`, `library` 엔티티 훅은 항상 실행 가능한 입력만 받도록 설계한다.
- 조건부 조회가 필요한 경우 상위 레이어가 유효한 입력이 준비된 뒤에만 해당 훅을 호출한다.

### 3. 쿼리 키/옵션 패턴

다음 패턴을 요청이 있는 `book`, `library` 슬라이스에 공통 적용한다.

```ts
export const booksQueryKeys = {
  all: () => ['books'] as const,

  search: {
    all: () => [...booksQueryKeys.all(), 'search'] as const,
    list: (params: BookSearchParams) =>
      [...booksQueryKeys.search.all(), params] as const,
  },

  detail: {
    all: () => [...booksQueryKeys.all(), 'detail'] as const,
    byIsbn13: (isbn13: Isbn13) =>
      [...booksQueryKeys.detail.all(), isbn13] as const,
  },
}

export const booksQueryOptions = {
  search: (params: BookSearchParams) => ({
    queryKey: booksQueryKeys.search.list(params),
    queryFn: () => getBooks(params),
  }),

  detail: (isbn13: Isbn13) => ({
    queryKey: booksQueryKeys.detail.byIsbn13(isbn13),
    queryFn: () => getBookDetail(isbn13),
  }),
}

export function useGetSearchBooks(params: BookSearchParams) {
  const { data } = useSuspenseQuery(booksQueryOptions.search(params))

  return data
}
```

- 키 팩터리 이름은 슬라이스 단위 복수형을 사용한다.
  - `booksQueryKeys`
  - `librariesQueryKeys`
- 옵션 팩터리도 같은 규칙을 따른다.
  - `booksQueryOptions`
  - `librariesQueryOptions`

## 슬라이스별 설계

### 1. `entities/book`

#### 책임

- 도서 검색과 도서 상세 조회를 하나의 도메인 슬라이스에서 제공한다.
- BFF의 도서 관련 엔드포인트를 호출하는 내부 API 함수를 제공한다.
- 입력 경계에서 사용할 스키마, 쿼리 키 생성, 서스펜스 훅 제공을 담당한다.
- 기본 모델 파일은 `bookSchema.ts`, `bookQueries.ts`, `useGetSearchBooks.ts`, `useGetBookDetail.ts`로 구성한다.
- 도서 상세 응답 해석용 순수 로직이 필요할 때만 `bookDetail.ts`를 추가한다.

#### API 세그먼트

- `getBooks(params)`는 `/api/books/search`를 `requestGet<BookSearchResponse>`로 호출한다.
- `getBookDetail(isbn13)`는 `/api/books/:isbn13`를 `requestGet<BookDetailResponse>`로 호출한다.
- `getBooks`는 query string에 `title`, `author`, `isbn13`, `page`를 전달하고, `pageSize`는 엔티티 내부 상수 `10`으로 고정한다.
- `getBookDetail`는 `isbn13`을 path param으로 전달한다.
- API 함수는 `requestGet` 기본 에러 처리 전략인 `errorBoundary`를 유지한다.

#### 모델 세그먼트

- contracts 재사용 타입
  - `BookSearchItem`
  - `BookSearchResponse`
  - `BookDetail`
  - `BookDetailLoanInfo`
  - `BookDetailResponse`
  - `Isbn13`
- 엔티티 내부 타입
  - `BookSearchParams`
    - `title?: string`
    - `author?: string`
    - `isbn13?: Isbn13`
    - `page: number`
- `bookSchema.ts`는 도서 엔티티에서 사용하는 입력 스키마를 한 곳에 모은다.
- `searchBooksParamsSchema`는 `zod` 기반으로 입력을 검증하고 canonical `BookSearchParams`를 만든다.
  - `title`, `author`: trim 후 optional, 최대 100자
  - `isbn13`: trim 후 optional, 13자리 숫자 문자열
  - `page`: 기본값 1, 1 이상 정수
  - `title`, `author`, `isbn13` 중 하나는 반드시 존재해야 한다.
- `bookDetailParamsSchema`는 `zod` 기반으로 상세 조회 입력을 검증하고 canonical `BookDetailParams`를 만든다.
  - `isbn13`: trim 후 13자리 숫자 문자열
- `parseSearchBooksParams`는 form, URL query parsing, 직접 링크 진입 같은 입력 경계에서 호출한다.
- `parseBookDetailParams`는 route params 같은 상세 입력 경계에서 호출한다.
- `booksQueryKeys.search`와 `booksQueryOptions.search`는 이미 정규화된 `BookSearchParams`만 받으며 내부에서 다시 정규화하지 않는다.
- `booksQueryKeys.detail`와 `booksQueryOptions.detail`는 scalar `isbn13`을 기준으로 상세 캐시 키와 요청 선언을 만든다.
- `booksQueryKeys`는 search/detail 하위 네임스페이스를 분리한다.
- `booksQueryOptions.search`와 `booksQueryOptions.detail`는 내부 API 함수만 호출한다.
- `useGetSearchBooks(params)`와 `useGetBookDetail(isbn13)`를 공개한다.
- `bookDetail.ts`는 `book === null` 해석, 대출 정보 파생 상태 계산 같은 순수 상세 도메인 로직이 실제로 필요할 때만 둔다.
- 검색 파라미터 유효성 검증 실패는 `ZodError`로 상위 Error Boundary 경로에 위임하고, BFF 400 응답도 엔티티에서 삼키지 않는다.

#### 앱 내부 모델 규칙

- BFF가 이미 검색 결과와 상세 정보를 정규화하므로 응답 본문은 contracts 타입을 그대로 재사용한다.
- 검색 결과 없음은 `items.length === 0`과 `totalCount === 0` 조합으로 판단한다.
- 도서 상세는 `book`이 `null`일 수 있으므로 상위 레이어는 `loanInfo`와 분리해 해석해야 한다.
- 도서 검색 입력 상태와 검색 폼 UX 상태는 `features` 범위로 두고 `entities/book`에는 포함하지 않는다.

#### 공개 API

- `useGetSearchBooks`
- `useGetBookDetail`
- `booksQueryKeys`
- `booksQueryOptions`
- `bookDetailParamsSchema`
- `searchBooksParamsSchema`
- `parseBookDetailParams`
- `parseSearchBooksParams`
- `BookDetailParams`
- `BookSearchParams`
- contracts에서 재사용할 도서 타입

### 2. `entities/library`

#### 책임

- 선택한 ISBN과 지역 기준으로 도서관 목록을 조회한다.
- 도서관 목록 응답을 지도/목록 화면이 소비하기 쉬운 형태로 노출한다.
- 지역 코드, 세부 지역 코드, 페이지 정보가 캐시 키에 안정적으로 반영되도록 관리한다.
- `librarySchema.ts`, `libraryQueries.ts`, `useGetSearchLibraries.ts`, `librarySearch.ts`로 모델 책임을 분리한다.

#### API 세그먼트

- `getLibraries(params)`는 `/api/libraries/search`를 `requestGet<LibrarySearchResponse>`로 호출한다.
- 전달 query는 `isbn`, `region`, `detailRegion`, `page`다.
- `pageSize`는 엔티티 내부 상수 `10`으로 고정한다.
- `detailRegion`은 값이 있을 때만 query string에 포함한다.
- API 함수는 내부에서 `fetch`를 직접 사용하지 않는다.

#### 모델 세그먼트

- contracts 재사용 타입
  - `LibrarySearchItem`
  - `LibrarySearchResponse`
  - `Isbn`
  - `RegionCode`
  - `DetailRegionCode`
- 엔티티 내부 타입
  - `LibrarySearchParams`
    - `isbn: Isbn`
    - `region: RegionCode`
    - `detailRegion?: DetailRegionCode`
    - `page: number`
- `librarySchema.ts`는 도서관 엔티티 입력 스키마를 한 곳에 모은다.
- `searchLibrariesParamsSchema`는 `zod` 기반으로 입력을 검증하고 canonical `LibrarySearchParams`를 만든다.
  - `isbn`: trim 후 13자리 숫자 문자열
  - `region`: trim 후 2자리 숫자 문자열
  - `detailRegion`: trim 후 optional, 5자리 숫자 문자열
  - `page`: 기본값 1, 1 이상 정수
  - `detailRegion`이 있으면 반드시 선택한 `region` 코드로 시작해야 한다.
- `parseSearchLibrariesParams`는 form, URL query parsing, navigation state 같은 입력 경계에서 호출한다.
- `librariesQueryKeys`는 `search.all`, `search.list(params)` 구조를 사용한다.
- `librariesQueryOptions.search(params)`는 `getLibraries(params)`를 queryFn으로 사용한다.
- `useGetSearchLibraries(params)`를 공개한다.
- `librarySearch.ts`는 contracts 응답 위에서만 동작하는 순수 helper를 제공한다.
  - `hasLibraryCoordinates`
  - `isEmptyLibrarySearchResult`

#### 앱 내부 모델 규칙

- BFF 응답의 `items`는 이미 위도/경도를 `number | null`로 정규화했으므로 web에서는 문자열 좌표를 다시 파싱하지 않는다.
- 빈 결과는 정상 응답으로 취급하고 에러로 바꾸지 않는다.
- `resultCount`와 `totalCount`는 BFF 응답을 그대로 신뢰한다.
- 지도 표시용 파생 데이터는 `LibrarySearchItem`을 버리지 않고 helper로 필터링해 만든다.

#### 공개 API

- `useGetSearchLibraries`
- `librariesQueryKeys`
- `librariesQueryOptions`
- `searchLibrariesParamsSchema`
- `parseSearchLibrariesParams`
- `hasLibraryCoordinates`
- `isEmptyLibrarySearchResult`
- `LibrarySearchParams`
- `LibrarySearchItemWithCoordinates`
- contracts에서 재사용할 도서관 타입

### 3. `entities/region`

#### 책임

- 지역 선택 UI가 사용할 시도/세부 지역 데이터를 제공한다.
- 선택한 `region` 코드로 세부 지역 목록에 즉시 접근할 수 있는 정적 keyed object를 제공한다.
- 현재 Phase 4에서는 네트워크 엔드포인트가 아니라 정적 데이터 소스를 직접 사용한다.

#### 데이터 소스 결정

- 현재 저장소에는 region 전용 BFF 엔드포인트가 없다.
- Phase 4에서는 Phase 3 `open_api_spec.md`의 `지역 코드 전체 (region)`, `세부 지역 코드 전체 (dtl_region)` 섹션을 기준으로 정적 데이터 모델을 채택한다.
- 지역/세부 지역 코드의 문서 원본은 `open_api_spec.md` 하나로 유지한다.
- Phase 4 `spec.md`와 같은 후속 문서에는 전체 코드 목록을 다시 복사하지 않고, 원본 섹션을 구현 기준으로 참조만 한다.
- 전체 시도 목록과 세부 지역 목록은 `entities/region/model` 내부 상수로 관리한다.
- 실제 구현 시에는 `open_api_spec.md`의 전체 코드 목록을 `entities/region/model` 상수로 옮기되, 문서 원본과 의미가 달라지지 않도록 동일한 코드 체계를 유지한다.
- 이후 region 데이터가 서버 관리 대상으로 바뀌면 그때 `api` 세그먼트와 query 모델을 추가한다.

#### 모델 세그먼트

- contracts 재사용 타입
  - `RegionCode`
  - `DetailRegionCode`
- 엔티티 내부 타입
  - `RegionOption`
    - `code: RegionCode`
    - `label: string`
  - `DetailRegionOption`
    - `code: DetailRegionCode`
    - `region: RegionCode`
    - `label: string`
- `REGION_OPTIONS`는 전체 시도 목록 상수다.
- `DETAIL_REGION_OPTIONS_BY_REGION`는 시도 코드별 세부 지역 목록 상수다.
- `isDetailRegionOfRegion(region, detailRegion)`는 세부 지역 코드가 선택된 시도에 속하는지 판별하는 helper다.
- `detailRegion` 데이터는 반드시 상위 `region` 코드와 함께 보관한다.
- 특정 `region`에 세부 지역 데이터가 없으면 `DETAIL_REGION_OPTIONS_BY_REGION[region] ?? []` 형태로 빈 배열을 사용하고 에러를 만들지 않는다.

#### 앱 내부 모델 규칙

- 지역 선택용 데이터는 contracts의 코드 타입을 재사용하되 label은 엔티티 내부 모델이 소유한다.
- `DetailRegionOption.region`은 항상 `DetailRegionOption.code`의 앞 2자리와 동일해야 한다.
- 지역 선택에 필요한 정렬과 표기명은 상수 정의 단계에서 고정하고, 조회 시점에 다시 계산하지 않는다.
- UI는 `REGION_OPTIONS`를 1차 select 데이터로, `DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []`를 2차 select 데이터로 직접 사용한다.

#### 공개 API

- `REGION_OPTIONS`
- `DETAIL_REGION_OPTIONS_BY_REGION`
- `isDetailRegionOfRegion`
- `RegionOption`
- `DetailRegionOption`

## 공개 경계 규칙

- `features`와 `pages`는 엔티티 슬라이스의 `index.ts`만 import한다.
- `features`와 `pages`는 `book`, `library` 슬라이스의 `api` 파일을 직접 import하지 않는다.
- `features`와 `pages`는 query key가 필요할 때도 슬라이스 `index.ts`를 통해 공개된 팩터리만 사용한다.
- 슬라이스 외부에서 `model` 내부 개별 파일 경로를 직접 import하지 않는다.
- `shared` 레이어는 도메인 지식이 없으므로 `book`, `library`, `region`별 상수와 타입은 `entities`에서 소유한다.
- `shared/validation`은 trim, 정수 coercion 같은 범용 입력 처리만 제공하고 도메인 스키마는 소유하지 않는다.
- form, URL, navigation state 같은 입력 경계는 슬라이스가 공개하는 스키마/parse helper를 통해 canonical params를 만든 뒤 엔티티 훅에 전달한다.

## 산출물

- `entities/book` 슬라이스 설계
- `entities/library` 슬라이스 설계
- `entities/region` 슬라이스 설계
- 엔티티 공통 query key/query options 패턴
- BFF 응답과 엔티티 모델 사이의 경계 규칙
- Suspense 기반 읽기 모델 사용 규칙
- Phase 4 `task.md` 작성 기준

## 완료 기준

- `book`, `library` 슬라이스는 `api`, `model`, `index.ts` 구조로 정리된다.
- `region` 슬라이스는 `model`, `index.ts` 구조로 정리된다.
- `book`, `library` 엔티티 요청 함수는 `requestGet`만 사용한다.
- `features`, `pages`는 요청 데이터는 엔티티 훅으로, 지역 참조 데이터는 엔티티 상수/helper로 사용하도록 구조가 정리된다.
- `book`, `library` 읽기 훅은 query key factory와 query options factory를 거쳐 `useSuspenseQuery`를 사용한다.
- `book`, `library` 입력 검증은 `zod` 기반 모델 스키마로 수행되고, 공통 정규화 로직은 `shared/validation`을 통해 재사용된다.
- 지역 선택 데이터가 정적 모델로 문서화되고, 이후 BFF로 이동 가능한 교체 지점이 남아 있다.
- 지역/세부 지역 코드의 문서 원본 위치가 `open_api_spec.md`로 명확히 고정된다.
- 엔티티 레이어가 `packages/contracts` 타입을 기준으로 동작한다.

## 테스트 기준

- 엔티티 레이어에서는 API 요청 함수 자체나 React Query 같은 외부 라이브러리 동작을 직접 검증하지 않는다.
- `book`의 schema parse helper와 query key 조합은 현재 Phase 4에서 별도 유닛 테스트 대상으로 확장하지 않는다.
- `region` 정적 데이터는 `detailRegion`의 상위 `region` 관계를 만족한다.
- `library`의 좌표 존재 여부, 빈 결과 판별 helper 같은 명확한 순수 로직은 단위 테스트로 검증한다.
- `region`의 `isDetailRegionOfRegion` 같은 명확한 순수 helper는 단위 테스트로 검증한다.
- 통합 사용자 플로우 테스트는 Phase 5에서 수행하고, 엔티티의 실제 연결성은 그 통합 테스트에서 자연스럽게 검증한다.

## 후속 연결 포인트

- Phase 5에서는 `entities` 훅을 `features` 검색 폼, 지역 선택 다이얼로그, 도서관 결과 목록, 지도 렌더링에 연결한다.
- Suspense fallback과 Error Boundary 조립은 Phase 5 화면 구성에서 확정한다.
- region 데이터가 서버 관리 대상으로 바뀌면 그때 `entities/region`에 `api`와 query 모델을 추가한다.
- region 정적 데이터 변경이 필요하면 Phase 4 문서를 먼저 복제하지 않고 `open_api_spec.md` 원본 섹션부터 갱신한다.

## 기본 가정

- Phase 3 기준 BFF와 contracts 구조는 이미 안정적으로 준비되어 있다.
- `entities/book`은 도서 검색과 도서 상세를 separate slice로 나누지 않고 하나의 슬라이스로 유지한다.
- `entities/region`은 Phase 4에서 정적 데이터 모델을 사용하고 BFF 엔드포인트나 React Query 훅을 새로 만들지 않는다.
- 지역/세부 지역 코드의 문서상 source of truth는 `docs/phases/phase-03-bff/open_api_spec.md`다.
- Phase 4에서는 서스펜스 기반 읽기 모델 표준화가 우선이며, 페이지 전환 최적화나 prefetch 고도화는 다음 단계에서 다룬다.
