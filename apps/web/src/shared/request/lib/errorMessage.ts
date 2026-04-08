const COMMON_REQUEST_ERROR_MESSAGE = '일시적인 연결 문제일 수 있으니 잠시 후 다시 시도해 주세요.';
const DEFAULT_SERVER_ERROR_MESSAGE = '현재 서버가 원활하지 않아요. 잠시 후 다시 시도해주세요.';

const SERVER_ERROR_MESSAGE_MAP = {
  BOOK_DETAIL_RESPONSE_INVALID: '도서 상세 데이터를 처리하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  BOOK_DETAIL_UPSTREAM_ERROR: '도서 상세 서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.',
  BOOK_SEARCH_RESPONSE_INVALID: '도서 검색 데이터를 처리하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  BOOK_SEARCH_UPSTREAM_ERROR: '도서 검색 서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.',
  INTERNAL_SERVER_ERROR: '현재 서버가 원활하지 않아요. 잠시 후 다시 시도해주세요.',
  LIBRARY_SEARCH_RESPONSE_INVALID: '도서관 조회 데이터를 처리하는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
  LIBRARY_SEARCH_UPSTREAM_ERROR: '도서관 조회 서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.',
  REQUEST_ERROR: '일시적인 연결 문제일 수 있으니 다시 시도해 주세요.',
  UPSTREAM_ERROR: '외부 서비스와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.',
} as const;

export {COMMON_REQUEST_ERROR_MESSAGE, DEFAULT_SERVER_ERROR_MESSAGE, SERVER_ERROR_MESSAGE_MAP};
