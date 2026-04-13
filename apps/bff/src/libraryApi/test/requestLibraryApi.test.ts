import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('../../config/env.js', () => ({
  libraryApiConfig: {
    authKey: 'test-auth-key',
    baseUrl: 'https://example.com/openapi',
  },
}));

import {LibraryApiRequestConfigError, requestLibraryApi} from '../requestLibraryApi.js';

describe('requestLibraryApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('공통 인증 파라미터를 붙이고 Accept 헤더 없이 GET 요청을 보낸다', async () => {
    fetchMock.mockResolvedValue(new Response('{}', {status: 200}));

    await requestLibraryApi({
      endpoint: '/srchBooks',
      queryParams: {
        pageNo: 1,
        title: '  하우스메이드  ',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [URL, RequestInit];

    expect(requestUrl.toString()).toBe(
      'https://example.com/openapi/srchBooks?authKey=test-auth-key&format=json&pageNo=1&title=%ED%95%98%EC%9A%B0%EC%8A%A4%EB%A9%94%EC%9D%B4%EB%93%9C',
    );
    expect(requestInit.method).toBe('GET');
    expect(requestInit.headers).toBeUndefined();
    expect(requestInit.redirect).toBe('error');
  });

  it('bookExist endpoint도 같은 공통 인증 파라미터 규칙으로 요청한다', async () => {
    fetchMock.mockResolvedValue(new Response('{}', {status: 200}));

    await requestLibraryApi({
      endpoint: '/bookExist',
      queryParams: {
        isbn13: '9791190157551',
        libCode: 'LIB0001',
      },
      requiredQueryParams: ['libCode', 'isbn13'],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [URL, RequestInit];

    expect(requestUrl.toString()).toBe(
      'https://example.com/openapi/bookExist?authKey=test-auth-key&format=json&isbn13=9791190157551&libCode=LIB0001',
    );
    expect(requestInit.method).toBe('GET');
    expect(requestInit.headers).toBeUndefined();
    expect(requestInit.redirect).toBe('error');
  });

  it('빈 문자열 파라미터는 제외하고 필수 파라미터 누락은 설정 오류로 막는다', async () => {
    await expect(() =>
      requestLibraryApi({
        endpoint: '/libSrchByBook',
        queryParams: {
          isbn: '9791190157551',
          region: ' ',
        },
        requiredQueryParams: ['isbn', 'region'],
      }),
    ).rejects.toBeInstanceOf(LibraryApiRequestConfigError);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
