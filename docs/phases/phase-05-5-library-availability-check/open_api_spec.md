# 6. 도서관별 도서 소장여부 및 대출 가능여부 조회

## 설명

빅데이터 분석 플랫폼에서 수집된 대출 정보를 기반으로  
특정 도서관의 도서 소장 여부 및 대출 가능 여부를 조회한다.

도서관 목록에서 특정 도서를 실제로 이용할 수 있는지 확인할 때 사용한다.

## 요청 정보

### Path

```
/bookExist
```

### Query Parameters

### 필수 파라미터

- `authKey` (string): Open API secret key
- `libCode` (number | string): 도서관 코드
- `isbn13` (number | string): 13자리 ISBN
- `format` (string): `"json"` 고정

## 요청 예시

```
GET http://data4library.kr/api/bookExist?authKey=key&libCode=111007&isbn13=9791190157551&format=json
```

## 응답 구조

```tsx
type BookExistResponse = {
  response: {
    result: {
      hasBook: 'Y' | 'N'; // 도서 소장 여부
      loanAvailable: 'Y' | 'N'; // 대출 가능 여부
    };
  };
};
```

## 주요 응답 필드 설명

- `result.hasBook`: 도서 소장 여부
  - `Y`: 소장
  - `N`: 미소장

- `result.loanAvailable`: 대출 가능 여부
  - `Y`: 대출 가능
  - `N`: 대출 불가

도서 소장여부는 ISBN 기준으로 제공.
대출 가능여부는 조회일 기준 전날의 대출 상태를 기준으로 제공.

## 응답 예시

```json
{
  "response": {
    "result": {
      "hasBook": "Y",
      "loanAvailable": "N"
    }
  }
}
```
