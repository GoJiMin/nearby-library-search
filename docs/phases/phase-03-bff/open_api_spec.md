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
      title?: string
      author?: string
      isbn13?: string
      pageNo?: number
      pageSize?: number
      format: 'json'
    }
    numFound: number
    docs: Array<{
      doc: {
        bookname: string // 도서명
        authors: string // 저자명
        publisher: string // 출판사
        publication_year: string // 출판년도
        isbn13: string // 13자리 ISBN
        addition_symbol: string // 부가기호
        vol: string // 권 정보
        class_no: string // 주제분류 코드
        class_nm: string // 주제분류명
        bookImageURL: string // 책 표지 URL
        bookDtlUrl: string // 도서 상세 페이지 URL
        loan_count: string // 대출 건수
      }
    }>
  }
}
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
      isbn13: string
      loaninfoYN?: 'Y' | 'N'
      displayInfo?: 'gender' | 'age' | 'region'
      format: 'json'
    }
    detail: Array<{
      book: {
        no: number
        bookname: string
        authors: string
        publisher: string
        publication_date: string
        publication_year: string
        isbn: string
        isbn13: string
        addition_symbol: string
        vol: string
        class_no: string
        class_nm: string
        description: string
        bookImageURL: string
      }
    }>
    loanInfo?: Array<{
      Total?: {
        ranking: number
        name: string
        loanCnt: number
      }
      regionResult?: Array<{
        region: {
          ranking: number
          name: string
          loanCnt: number
        }
      }>
      ageResult?: Array<{
        age: {
          ranking: number
          name: string
          loanCnt: number
        }
      }>
      genderResult?: Array<{
        gender: {
          ranking: number
          name: string
          loanCnt: number
        }
      }>
    }>
  }
}
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

### 선택 파라미터

- `dtl_region` (number | string): 세부 지역 코드
- `pageNo` (number): 페이지 번호
- `pageSize` (number): 페이지 크기

## 지역 코드 (`region`)

```tsx
const REGION_LIST = [
  { value: '11', label: '서울' },
  { value: '21', label: '부산' },
  { value: '22', label: '대구' },
  { value: '23', label: '인천' },
  { value: '24', label: '광주' },
  { value: '25', label: '대전' },
  { value: '26', label: '울산' },
  { value: '29', label: '세종' },
  { value: '31', label: '경기' },
  { value: '32', label: '강원' },
  { value: '33', label: '충북' },
  { value: '34', label: '충남' },
  { value: '35', label: '전북' },
  { value: '36', label: '전남' },
  { value: '37', label: '경북' },
  { value: '38', label: '경남' },
  { value: '39', label: '제주' },
]
```

## 세부 지역 코드 (`dtl_region`)

세부 지역 코드는 지역(`region`)에 종속된다.

예를 들어 충청북도(`33`)의 흥덕구는 `33043`이다.

```tsx
const REGION_DETAIL_LIST = {
  33: [
    { value: '33020', label: '충주시' },
    { value: '33030', label: '제천시' },
    { value: '33041', label: '청주시 상당구' },
    { value: '33042', label: '청주시 서원구' },
    { value: '33043', label: '청주시 흥덕구' },
    { value: '33044', label: '청주시 청원구' },
    { value: '33520', label: '보은군' },
    { value: '33530', label: '옥천군' },
    { value: '33540', label: '영동군' },
    { value: '33550', label: '진천군' },
    { value: '33560', label: '괴산군' },
    { value: '33570', label: '음성군' },
    { value: '33580', label: '단양군' },
    { value: '33590', label: '증평군' },
  ],
}
```

#### 지역 코드 전체 (region)

```tsx
const REGION_LIST = [
  { value: '11', label: '서울' },
  { value: '21', label: '부산' },
  { value: '22', label: '대구' },
  { value: '23', label: '인천' },
  { value: '24', label: '광주' },
  { value: '25', label: '대전' },
  { value: '26', label: '울산' },
  { value: '29', label: '세종' },
  { value: '31', label: '경기' },
  { value: '32', label: '강원' },
  { value: '33', label: '충북' },
  { value: '34', label: '충남' },
  { value: '35', label: '전북' },
  { value: '36', label: '전남' },
  { value: '37', label: '경북' },
  { value: '38', label: '경남' },
  { value: '39', label: '제주' },
]
```

#### 세부 지역 코드 전체 (dtl_region)

```tsx
const REGION_DETAIL_LIST = {
  // 서울
  11: [
    { value: '11010', label: '종로구' },
    { value: '11020', label: '중구' },
    { value: '11030', label: '용산구' },
    { value: '11040', label: '성동구' },
    { value: '11050', label: '광진구' },
    { value: '11060', label: '동대문구' },
    { value: '11070', label: '중랑구' },
    { value: '11080', label: '성북구' },
    { value: '11090', label: '강북구' },
    { value: '11100', label: '도봉구' },
    { value: '11110', label: '노원구' },
    { value: '11120', label: '은평구' },
    { value: '11130', label: '서대문구' },
    { value: '11140', label: '마포구' },
    { value: '11150', label: '양천구' },
    { value: '11160', label: '강서구' },
    { value: '11170', label: '구로구' },
    { value: '11180', label: '금천구' },
    { value: '11190', label: '영등포구' },
    { value: '11200', label: '동작구' },
    { value: '11210', label: '관악구' },
    { value: '11220', label: '서초구' },
    { value: '11230', label: '강남구' },
    { value: '11240', label: '송파구' },
    { value: '11250', label: '강동구' },
  ],
  // 부산
  21: [
    { value: '21010', label: '중구' },
    { value: '21020', label: '서구' },
    { value: '21030', label: '동구' },
    { value: '21040', label: '영도구' },
    { value: '21050', label: '부산진구' },
    { value: '21060', label: '동래구' },
    { value: '21070', label: '남구' },
    { value: '21080', label: '북구' },
    { value: '21090', label: '해운대구' },
    { value: '21100', label: '사하구' },
    { value: '21110', label: '금정구' },
    { value: '21120', label: '강서구' },
    { value: '21130', label: '연제구' },
    { value: '21140', label: '수영구' },
    { value: '21150', label: '사상구' },
    { value: '21510', label: '기장군' },
  ],
  // 대구
  22: [
    { value: '22010', label: '중구' },
    { value: '22020', label: '동구' },
    { value: '22030', label: '서구' },
    { value: '22040', label: '남구' },
    { value: '22050', label: '북구' },
    { value: '22060', label: '수성구' },
    { value: '22070', label: '달서구' },
    { value: '22510', label: '달성군' },
    { value: '22520', label: '군위군' },
  ],
  // 인천
  23: [
    { value: '23010', label: '중구' },
    { value: '23020', label: '동구' },
    { value: '23040', label: '연수구' },
    { value: '23050', label: '남동구' },
    { value: '23060', label: '부평구' },
    { value: '23070', label: '계양구' },
    { value: '23080', label: '서구' },
    { value: '23090', label: '미추홀구' },
    { value: '23510', label: '강화군' },
    { value: '23520', label: '옹진군' },
  ],
  // 광주
  24: [
    { value: '24010', label: '동구' },
    { value: '24020', label: '서구' },
    { value: '24030', label: '남구' },
    { value: '24040', label: '북구' },
    { value: '24050', label: '광산구' },
  ],
  // 대전
  25: [
    { value: '25010', label: '동구' },
    { value: '25020', label: '중구' },
    { value: '25030', label: '서구' },
    { value: '25040', label: '유성구' },
    { value: '25050', label: '대덕구' },
  ],
  // 울산
  26: [
    { value: '26010', label: '중구' },
    { value: '26020', label: '남구' },
    { value: '26030', label: '동구' },
    { value: '26040', label: '북구' },
    { value: '26510', label: '울주군' },
  ],
  // 세종
  29: [{ value: '29010', label: '세종시' }],
  // 경기도
  31: [
    { value: '31011', label: '수원시 장안구' },
    { value: '31012', label: '수원시 권선구' },
    { value: '31013', label: '수원시 팔달구' },
    { value: '31014', label: '수원시 영통구' },
    { value: '31021', label: '성남시 수정구' },
    { value: '31022', label: '성남시 중원구' },
    { value: '31023', label: '성남시 분당구' },
    { value: '31030', label: '의정부시' },
    { value: '31041', label: '안양시 만안구' },
    { value: '31042', label: '안양시 동안구' },
    { value: '31050', label: '부천시' },
    { value: '31051', label: '부천시 원미구' },
    { value: '31052', label: '부천시 소사구' },
    { value: '31053', label: '부천시 오정구' },
    { value: '31060', label: '광명시' },
    { value: '31070', label: '평택시' },
    { value: '31080', label: '동두천시' },
    { value: '31091', label: '안산시 상록구' },
    { value: '31092', label: '안산시 단원구' },
    { value: '31101', label: '고양시 덕양구' },
    { value: '31103', label: '고양시 일산동구' },
    { value: '31104', label: '고양시 일산서구' },
    { value: '31110', label: '과천시' },
    { value: '31120', label: '구리시' },
    { value: '31130', label: '남양주시' },
    { value: '31140', label: '오산시' },
    { value: '31150', label: '시흥시' },
    { value: '31160', label: '군포시' },
    { value: '31170', label: '의왕시' },
    { value: '31180', label: '하남시' },
    { value: '31191', label: '용인시 처인구' },
    { value: '31192', label: '용인시 기흥구' },
    { value: '31193', label: '용인시 수지구' },
    { value: '31200', label: '파주시' },
    { value: '31210', label: '이천시' },
    { value: '31220', label: '안성시' },
    { value: '31230', label: '김포시' },
    { value: '31240', label: '화성시' },
    { value: '31250', label: '광주시' },
    { value: '31260', label: '양주시' },
    { value: '31270', label: '포천시' },
    { value: '31280', label: '여주시' },
    { value: '31550', label: '연천군' },
    { value: '31570', label: '가평군' },
    { value: '31580', label: '양평군' },
  ],
  // 강원도
  32: [
    { value: '32010', label: '춘천시' },
    { value: '32020', label: '원주시' },
    { value: '32030', label: '강릉시' },
    { value: '32040', label: '동해시' },
    { value: '32050', label: '태백시' },
    { value: '32060', label: '속초시' },
    { value: '32070', label: '삼척시' },
    { value: '32510', label: '홍천군' },
    { value: '32520', label: '횡성군' },
    { value: '32530', label: '영월군' },
    { value: '32540', label: '평창군' },
    { value: '32550', label: '정선군' },
    { value: '32560', label: '철원군' },
    { value: '32570', label: '화천군' },
    { value: '32580', label: '양구군' },
    { value: '32590', label: '인제군' },
    { value: '32600', label: '고성군' },
    { value: '32610', label: '양양군' },
  ],
  // 충청북도
  33: [
    { value: '33020', label: '충주시' },
    { value: '33030', label: '제천시' },
    { value: '33041', label: '청주시 상당구' },
    { value: '33042', label: '청주시 서원구' },
    { value: '33043', label: '청주시 흥덕구' },
    { value: '33044', label: '청주시 청원구' },
    { value: '33520', label: '보은군' },
    { value: '33530', label: '옥천군' },
    { value: '33540', label: '영동군' },
    { value: '33550', label: '진천군' },
    { value: '33560', label: '괴산군' },
    { value: '33570', label: '음성군' },
    { value: '33580', label: '단양군' },
    { value: '33590', label: '증평군' },
  ],
  // 충청남도
  34: [
    { value: '34011', label: '천안시 동남구' },
    { value: '34012', label: '천안시 서북구' },
    { value: '34020', label: '공주시' },
    { value: '34030', label: '보령시' },
    { value: '34040', label: '아산시' },
    { value: '34050', label: '서산시' },
    { value: '34060', label: '논산시' },
    { value: '34070', label: '계룡시' },
    { value: '34080', label: '당진시' },
    { value: '34510', label: '금산군' },
    { value: '34530', label: '부여군' },
    { value: '34540', label: '서천군' },
    { value: '34550', label: '청양군' },
    { value: '34560', label: '홍성군' },
    { value: '34570', label: '예산군' },
    { value: '34580', label: '태안군' },
  ],
  // 전라북도
  35: [
    { value: '35011', label: '전주시 완산구' },
    { value: '35012', label: '전주시 덕진구' },
    { value: '35020', label: '군산시' },
    { value: '35030', label: '익산시' },
    { value: '35040', label: '정읍시' },
    { value: '35050', label: '남원시' },
    { value: '35060', label: '김제시' },
    { value: '35510', label: '완주군' },
    { value: '35520', label: '진안군' },
    { value: '35530', label: '무주군' },
    { value: '35540', label: '장수군' },
    { value: '35550', label: '임실군' },
    { value: '35560', label: '순창군' },
    { value: '35570', label: '고창군' },
    { value: '35580', label: '부안군' },
  ],
  // 전라남도
  36: [
    { value: '36010', label: '목포시' },
    { value: '36020', label: '여수시' },
    { value: '36030', label: '순천시' },
    { value: '36040', label: '나주시' },
    { value: '36060', label: '광양시' },
    { value: '36510', label: '담양군' },
    { value: '36520', label: '곡성군' },
    { value: '36530', label: '구례군' },
    { value: '36550', label: '고흥군' },
    { value: '36560', label: '보성군' },
    { value: '36570', label: '화순군' },
    { value: '36580', label: '장흥군' },
    { value: '36590', label: '강진군' },
    { value: '36600', label: '해남군' },
    { value: '36610', label: '영암군' },
    { value: '36620', label: '무안군' },
    { value: '36630', label: '함평군' },
    { value: '36640', label: '영광군' },
    { value: '36650', label: '장성군' },
    { value: '36660', label: '완도군' },
    { value: '36670', label: '진도군' },
    { value: '36680', label: '신안군' },
  ],
  // 경상북도
  37: [
    { value: '37011', label: '포항시 남구' },
    { value: '37012', label: '포항시 북구' },
    { value: '37020', label: '경주시' },
    { value: '37030', label: '김천시' },
    { value: '37040', label: '안동시' },
    { value: '37050', label: '구미시' },
    { value: '37060', label: '영주시' },
    { value: '37070', label: '영천시' },
    { value: '37080', label: '상주시' },
    { value: '37090', label: '문경시' },
    { value: '37100', label: '경산시' },
    { value: '37520', label: '의성군' },
    { value: '37530', label: '청송군' },
    { value: '37540', label: '영양군' },
    { value: '37550', label: '영덕군' },
    { value: '37560', label: '청도군' },
    { value: '37570', label: '고령군' },
    { value: '37580', label: '성주군' },
    { value: '37590', label: '칠곡군' },
    { value: '37600', label: '예천군' },
    { value: '37610', label: '봉화군' },
    { value: '37620', label: '울진군' },
    { value: '37630', label: '울릉군' },
  ],
  // 경상남도
  38: [
    { value: '38030', label: '진주시' },
    { value: '38050', label: '통영시' },
    { value: '38060', label: '사천시' },
    { value: '38070', label: '김해시' },
    { value: '38080', label: '밀양시' },
    { value: '38090', label: '거제시' },
    { value: '38100', label: '양산시' },
    { value: '38111', label: '창원시 의창구' },
    { value: '38112', label: '창원시 성산구' },
    { value: '38113', label: '창원시 마산합포구' },
    { value: '38114', label: '창원시 마산회원구' },
    { value: '38115', label: '창원시 진해구' },
    { value: '38510', label: '의령군' },
    { value: '38520', label: '함안군' },
    { value: '38530', label: '창녕군' },
    { value: '38540', label: '고성군' },
    { value: '38550', label: '남해군' },
    { value: '38560', label: '하동군' },
    { value: '38570', label: '산청군' },
    { value: '38580', label: '함양군' },
    { value: '38590', label: '거창군' },
    { value: '38600', label: '합천군' },
  ],
  // 제주
  39: [
    { value: '39010', label: '제주특별자치도 제주시' },
    { value: '39020', label: '제주특별자치도 서귀포시' },
  ],
}
```

## 요청 예시

```
GET https://data4library.kr/api/libSrchByBook?authKey=key&isbn=9788954682152&region=33&dtl_region=33043&format=json
```

## 응답 구조

```tsx
type SearchLibrariesByBookResponse = {
  response: {
    request: {
      isbn: string
      region: string
      dtl_region?: string
      pageNo?: string | number
      pageSize?: string | number
      format: 'json'
    }
    pageNo: string | number
    pageSize: string | number
    numFound: number
    resultNum: number
    libs: Array<{
      lib: {
        libCode: string // 도서관 코드
        libName: string // 도서관명
        address: string // 주소
        tel: string // 전화번호
        fax: string // FAX
        latitude: string // 위도
        longitude: string // 경도
        homepage: string // 홈페이지 URL
        closed: string // 휴관일
        operatingTime: string // 운영시간
      }
    }>
  }
}
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
