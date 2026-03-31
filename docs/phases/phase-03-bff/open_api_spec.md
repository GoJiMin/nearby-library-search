# 도서 Open API 명세

## 1. 개요

이 문서는 `data4library` Open API 중 현재 서비스에서 반드시 사용하는 3개의 API 명세를 정리한 문서다.

### Base URL

```
http://data4library.kr/api
```

### 공통 필수 쿼리 파라미터

모든 요청에는 아래 두 개의 쿼리 파라미터가 반드시 포함되어야 한다.

- `authKey`: Open API secret key
- `format`: 응답 형식. 항상 `"json"` 고정

### 공통 요청 예시

```
GET {BASE_URL}/{path}?authKey={AUTH_KEY}&format=json
```

---

## 2. API 목록

현재 사용하는 API는 아래 3개다.

1. 도서 검색
2. 도서 상세 조회
3. 도서 소장 도서관 조회

---

# 3. 도서 검색

## 설명

빅데이터 분석 플랫폼에서 수집된 장서 및 대출 정보를 기반으로 도서를 검색한다.

사용자가 입력한 키워드를 기반으로 도서 목록을 조회할 때 사용한다.

## 요청 정보

### Path

```
/srchBooks
```

### Query Parameters

### 필수 파라미터

- `authKey` (string): Open API secret key
- `format` (string): `"json"` 고정

### 선택 파라미터

- `title` (string): 도서명
- `author` (string): 저자명
- `isbn13` (number | string): 13자리 ISBN
- `pageNo` (number): 페이지 번호
- `pageSize` (number): 한 페이지당 결과 개수

## 요청 예시

```
GET http://data4library.kr/api/srchBooks?authKey=key&title=하우스메이드&pageNo=1&pageSize=10&format=json
```

## 응답 구조

```tsx
type SearchBooksResponse = {
  response: {
    request: {
      title?: string;
      author?: string;
      isbn13?: string;
      pageNo?: number;
      pageSize?: number;
      format: "json";
    };
    numFound: number;
    docs: Array<{
      doc: {
        bookname: string;          // 도서명
        authors: string;           // 저자명
        publisher: string;         // 출판사
        publication_year: string;  // 출판년도
        isbn13: string;            // 13자리 ISBN
        addition_symbol: string;   // 부가기호
        vol: string;               // 권 정보
        class_no: string;          // 주제분류 코드
        class_nm: string;          // 주제분류명
        bookImageURL: string;      // 책 표지 URL
        bookDtlUrl: string;        // 도서 상세 페이지 URL
        loan_count: string;        // 대출 건수
      };
    }>;
  };
};
```

## 주요 응답 필드 설명

- `response.numFound`: 전체 검색 결과 수
- `response.docs`: 검색된 도서 목록
- `doc.bookname`: 도서명
- `doc.authors`: 저자명
- `doc.publisher`: 출판사
- `doc.publication_year`: 출판년도
- `doc.isbn13`: 13자리 ISBN
- `doc.bookImageURL`: 책 표지 이미지 URL
- `doc.bookDtlUrl`: 도서 상세 페이지 URL
- `doc.loan_count`: 대출 건수

## 응답 예시

```json
{
  "response": {
    "request": {
      "title": "하우스메이드",
      "sort": "loan_count",
      "direction": "desc",
      "exactMatch": false,
      "pageNo": 1,
      "pageSize": 10,
      "format": "json"
    },
    "numFound": 2,
    "docs": [
      {
        "doc": {
          "bookname": "하우스 메이드 ",
          "authors": "프리다 맥파든 지음 ;김은영 옮김",
          "publisher": "Book Plaza(북플라자)",
          "publication_year": "2023",
          "isbn13": "9791190157551",
          "addition_symbol": "03840",
          "vol": "",
          "class_no": "843.6",
          "class_nm": "문학 > 영미문학 > 소설",
          "bookImageURL": "https://image.aladin.co.kr/product/31427/37/cover/k532832215_1.jpg",
          "bookDtlUrl": "https://data4library.kr/bookV?seq=6668806",
          "loan_count": "19383"
        }
      }
    ]
  }
}
```

---

# 4. 도서 상세 조회

## 설명

특정 도서의 상세한 서지 정보와 대출 정보를 조회한다.

도서 상세 페이지에서 기본 정보와 함께 대출 통계를 보여줄 때 사용한다.

## 요청 정보

### Path

```
/srchDtlList
```

### Query Parameters

### 필수 파라미터

- `authKey` (string): Open API secret key
- `isbn13` (number | string): 13자리 ISBN
- `format` (string): `"json"` 고정

### 선택 파라미터

- `loaninfoYN` (string): 대출 상세 정보 포함 여부
    - `Y`: 제공
    - `N`: 미제공
    - 기본값: `N`
- `displayInfo` (string): 대출 정보 조회 대상
    - `gender`: 성별
    - `age`: 연령별
    - `region`: 지역별

## 동작 규칙

- `loaninfoYN`이 없으면 기본값은 `N`
- `displayInfo`는 `loaninfoYN=Y`인 경우에만 사용 가능
- `displayInfo`가 없으면 성별/연령별/지역별 대출정보를 모두 제공
- 특정 항목만 원할 경우 `displayInfo`에 지정해서 요청

### 예시

- 전체 대출 상세 정보 조회

```
loaninfoYN=Y
```

- 지역별 대출 정보만 조회

```
loaninfoYN=Y&displayInfo=region
```

## 요청 예시

```
GET https://data4library.kr/api/srchDtlList?authKey=key&isbn13=9791190157551&loaninfoYN=Y&displayInfo=age&format=json
```

## 응답 구조

```tsx
type SearchBookDetailResponse = {
  response: {
    request: {
      isbn13: string;
      loaninfoYN?: "Y" | "N";
      displayInfo?: "gender" | "age" | "region";
      format: "json";
    };
    detail: Array<{
      book: {
        no: number;
        bookname: string;
        authors: string;
        publisher: string;
        publication_date: string;
        publication_year: string;
        isbn: string;
        isbn13: string;
        addition_symbol: string;
        vol: string;
        class_no: string;
        class_nm: string;
        description: string;
        bookImageURL: string;
      };
    }>;
    loanInfo?: Array<{
      Total?: {
        ranking: number;
        name: string;
        loanCnt: number;
      };
      regionResult?: Array<{
        region: {
          ranking: number;
          name: string;
          loanCnt: number;
        };
      }>;
      ageResult?: Array<{
        age: {
          ranking: number;
          name: string;
          loanCnt: number;
        };
      }>;
      genderResult?: Array<{
        gender: {
          ranking: number;
          name: string;
          loanCnt: number;
        };
      }>;
    }>;
  };
};
```

## 주요 응답 필드 설명

### `detail[].book`

- `bookname`: 도서명
- `authors`: 저자명
- `publisher`: 출판사
- `publication_date`: 출판일자
- `publication_year`: 출판년도
- `isbn`: ISBN
- `isbn13`: 13자리 ISBN
- `description`: 책 소개
- `bookImageURL`: 책 표지 URL

### `loanInfo`

- `Total`: 전체 대출 정보
- `regionResult`: 지역별 대출 정보
- `ageResult`: 연령별 대출 정보
- `genderResult`: 성별 대출 정보

## 대출 정보 관련 참고사항

- 대출 정보는 **최근 90일 기준**
- 각 조건별 **상위 1,000위까지** 제공
- 특정 조건에서 순위가 1,001위 이하인 경우 응답에서 제공되지 않을 수 있음

## 응답 예시

```json
{
  "response": {
    "request": {
      "isbn13": "9791190157551",
      "loaninfoYN": "Y",
      "displayInfo": "age",
      "format": "json"
    },
    "detail": [
      {
        "book": {
          "no": 1,
          "bookname": "하우스 메이드 ",
          "authors": "프리다 맥파든 지음 ;김은영 옮김",
          "publisher": "Book Plaza(북플라자)",
          "publication_date": "2023",
          "publication_year": "2023",
          "isbn": "1190157551",
          "isbn13": "9791190157551",
          "addition_symbol": "03840",
          "vol": "",
          "class_no": "843.6",
          "class_nm": "문학 > 영미문학 > 소설",
          "description": "전과를 가지고 있는 밀리는 자신의 삶을 새롭게 시작할 수 있는 마지막 기회를 잡기 위해 정체를 숨긴 채 윈체스터가에 가정부로 들어간다. 하지만 그 가족에 숨겨진 비밀이 밀리의 숨통을 조여오기 시작한다.",
          "bookImageURL": "https://image.aladin.co.kr/product/31427/37/cover/k532832215_1.jpg"
        }
      }
    ],
    "loanInfo": [
      {
        "Total": {
          "ranking": 224,
          "name": "전체",
          "loanCnt": 3846
        }
      },
      {
        "ageResult": [
          {
            "age": {
              "ranking": 494,
              "name": "청소년(14~19)",
              "loanCnt": 106
            }
          },
          {
            "age": {
              "ranking": 198,
              "name": "20대",
              "loanCnt": 257
            }
          }
        ]
      }
    ]
  }
}
```

---

# 5. 도서 소장 도서관 조회

## 설명

특정 도서를 소장하고 있는 도서관 목록을 조회한다.

도서 상세 페이지에서 사용자가 선택한 지역 기준으로 소장 도서관을 보여줄 때 사용한다.

## 요청 정보

### Path

```
/libSrchByBook
```

### Query Parameters

### 필수 파라미터

- `authKey` (string): Open API secret key
- `isbn` (number | string): ISBN
- `region` (number | string): 지역 코드
- `format` (string): `"json"` 고정

> 참고: 원문에는 `isbn: 13자리 isbn`이라고 적혀 있으므로, 실사용 시에는 **13자리 ISBN 문자열**로 통일해서 다루는 것을 권장한다.
> 

### 선택 파라미터

- `dtl_region` (number | string): 세부 지역 코드
- `pageNo` (number): 페이지 번호
- `pageSize` (number): 페이지 크기

## 지역 코드 (`region`)

```tsx
const REGION_LIST = [
  { value: "11", label: "서울" },
  { value: "21", label: "부산" },
  { value: "22", label: "대구" },
  { value: "23", label: "인천" },
  { value: "24", label: "광주" },
  { value: "25", label: "대전" },
  { value: "26", label: "울산" },
  { value: "29", label: "세종" },
  { value: "31", label: "경기" },
  { value: "32", label: "강원" },
  { value: "33", label: "충북" },
  { value: "34", label: "충남" },
  { value: "35", label: "전북" },
  { value: "36", label: "전남" },
  { value: "37", label: "경북" },
  { value: "38", label: "경남" },
  { value: "39", label: "제주" }
];
```

## 세부 지역 코드 (`dtl_region`)

세부 지역 코드는 지역(`region`)에 종속된다.

예를 들어 충청북도(`33`)의 흥덕구는 `33043`이다.

```tsx
const REGION_DETAIL_LIST = {
  33: [
    { value: "33020", label: "충주시" },
    { value: "33030", label: "제천시" },
    { value: "33041", label: "청주시 상당구" },
    { value: "33042", label: "청주시 서원구" },
    { value: "33043", label: "청주시 흥덕구" },
    { value: "33044", label: "청주시 청원구" },
    { value: "33520", label: "보은군" },
    { value: "33530", label: "옥천군" },
    { value: "33540", label: "영동군" },
    { value: "33550", label: "진천군" },
    { value: "33560", label: "괴산군" },
    { value: "33570", label: "음성군" },
    { value: "33580", label: "단양군" },
    { value: "33590", label: "증평군" }
  ]
};
```

> 전체 `REGION_DETAIL_LIST`는 별도 상수 파일로 관리하는 것을 권장한다.
> 

## 요청 예시

```
GET https://data4library.kr/api/libSrchByBook?authKey=key&isbn=9788954682152&region=33&dtl_region=33043&format=json
```

## 응답 구조

```tsx
type SearchLibrariesByBookResponse = {
  response: {
    request: {
      isbn: string;
      region: string;
      dtl_region?: string;
      pageNo?: string | number;
      pageSize?: string | number;
      format: "json";
    };
    pageNo: string | number;
    pageSize: string | number;
    numFound: number;
    resultNum: number;
    libs: Array<{
      lib: {
        libCode: string;        // 도서관 코드
        libName: string;        // 도서관명
        address: string;        // 주소
        tel: string;            // 전화번호
        fax: string;            // FAX
        latitude: string;       // 위도
        longitude: string;      // 경도
        homepage: string;       // 홈페이지 URL
        closed: string;         // 휴관일
        operatingTime: string;  // 운영시간
      };
    }>;
  };
};
```

## 주요 응답 필드 설명

- `pageNo`: 페이지 번호
- `pageSize`: 페이지 크기
- `numFound`: 전체 검색 결과 수
- `resultNum`: 현재 응답 결과 수
- `libs`: 도서관 목록
- `lib.libCode`: 도서관 코드
- `lib.libName`: 도서관명
- `lib.address`: 주소
- `lib.tel`: 전화번호
- `lib.homepage`: 홈페이지 URL
- `lib.closed`: 휴관일
- `lib.operatingTime`: 운영시간

## 응답 예시

```json
{
  "response": {
    "request": {
      "isbn": "9788954682152",
      "region": "33",
      "dtl_region": "33043",
      "pageNo": "",
      "pageSize": "10",
      "format": "json"
    },
    "pageNo": "",
    "pageSize": "10",
    "numFound": 1,
    "resultNum": 1,
    "libs": [
      {
        "lib": {
          "libCode": "143136",
          "libName": "청주가로수도서관",
          "address": "충청북도 청주시 흥덕구 서현서로 5",
          "tel": "043-201-4232",
          "fax": "043-201-9316",
          "latitude": "36.6197723",
          "longitude": "127.4271768",
          "homepage": "https://library.cheongju.go.kr/lib/",
          "closed": "매주 금요일 / 법정공휴일",
          "operatingTime": "평일 09:00~22:00, 주말 09:00~18:00"
        }
      }
    ]
  }
}
```