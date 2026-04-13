import {describe, expect, it} from 'vitest';
import {LibraryApiRequestConfigError, toLibraryApiErrorResponse} from '../toLibraryApiErrorResponse.js';

describe('toLibraryApiErrorResponse', () => {
  it('library api 설정 오류를 표준 에러 응답으로 바꾼다', () => {
    const error = new LibraryApiRequestConfigError(['isbn13']);

    expect(
      toLibraryApiErrorResponse(error, {
        detail: 'fallback',
        status: 502,
        title: 'BOOK_DETAIL_UPSTREAM_ERROR',
      }),
    ).toEqual({
      detail: '필수 요청 파라미터가 누락되었습니다: isbn13',
      status: 400,
      title: 'LIBRARY_API_REQUIRED_PARAM_MISSING',
    });
  });

  it('provider 설정 오류가 아니면 fallback 에러를 그대로 돌려준다', () => {
    const fallbackError = {
      detail: 'fallback',
      status: 502,
      title: 'BOOK_DETAIL_UPSTREAM_ERROR' as const,
    };

    expect(toLibraryApiErrorResponse(new Error('network down'), fallbackError)).toEqual(fallbackError);
  });
});
