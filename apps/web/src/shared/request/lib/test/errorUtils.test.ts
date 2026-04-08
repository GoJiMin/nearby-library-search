import {describe, expect, it} from 'vitest';
import {RequestError, RequestGetError} from '../../index';
import {COMMON_REQUEST_ERROR_MESSAGE, DEFAULT_SERVER_ERROR_MESSAGE} from '../errorMessage';
import {getServerErrorDisplayMessage, isRequestError, isServerRequestError} from '../errorUtils';

describe('shared/request error utils', () => {
  it('RequestError와 RequestGetError를 요청 에러로 판별한다', () => {
    const requestError = new RequestError({
      endpoint: '/api/books/search',
      message: 'boom',
      method: 'GET',
      name: 'REQUEST_ERROR',
      requestBody: null,
      status: 500,
    });
    const requestGetError = new RequestGetError({
      endpoint: '/api/books/search',
      message: 'boom',
      method: 'GET',
      name: 'BOOK_SEARCH_UPSTREAM_ERROR',
      requestBody: null,
      status: 502,
    });

    expect(isRequestError(requestError)).toBe(true);
    expect(isRequestError(requestGetError)).toBe(true);
    expect(isRequestError(new Error('plain error'))).toBe(false);
  });

  it('500 이상 요청 에러만 서버 에러로 판별한다', () => {
    expect(
      isServerRequestError(
        new RequestGetError({
          endpoint: '/api/books/search',
          message: 'boom',
          method: 'GET',
          name: 'BOOK_SEARCH_UPSTREAM_ERROR',
          requestBody: null,
          status: 502,
        }),
      ),
    ).toBe(true);

    expect(
      isServerRequestError(
        new RequestGetError({
          endpoint: '/api/books/search',
          message: 'boom',
          method: 'GET',
          name: 'BOOK_SEARCH_QUERY_INVALID',
          requestBody: null,
          status: 400,
        }),
      ),
    ).toBe(false);
  });

  it('알려진 서버 에러 title은 매핑된 사용자 문구를 반환한다', () => {
    const error = new RequestGetError({
      endpoint: '/api/books/search',
      message: 'boom',
      method: 'GET',
      name: 'INTERNAL_SERVER_ERROR',
      requestBody: null,
      status: 500,
    });

    expect(getServerErrorDisplayMessage(error)).toBe('현재 서버가 원활하지 않아요. 잠시 후 다시 시도해주세요.');
  });

  it('알 수 없는 서버 에러 title은 서버 fallback 문구를 반환한다', () => {
    const error = new RequestGetError({
      endpoint: '/api/books/search',
      message: 'boom',
      method: 'GET',
      name: 'SOMETHING_NEW',
      requestBody: null,
      status: 500,
    });

    expect(getServerErrorDisplayMessage(error)).toBe(DEFAULT_SERVER_ERROR_MESSAGE);
  });

  it('서버 에러가 아니면 공통 fallback 문구를 반환한다', () => {
    const clientError = new RequestGetError({
      endpoint: '/api/books/search',
      message: 'boom',
      method: 'GET',
      name: 'BOOK_SEARCH_QUERY_INVALID',
      requestBody: null,
      status: 400,
    });

    expect(getServerErrorDisplayMessage(clientError)).toBe(COMMON_REQUEST_ERROR_MESSAGE);
    expect(getServerErrorDisplayMessage(new Error('plain error'))).toBe(COMMON_REQUEST_ERROR_MESSAGE);
  });
});
