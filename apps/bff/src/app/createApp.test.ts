import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {requestLibraryApiMock} = vi.hoisted(() => ({
  requestLibraryApiMock: vi.fn(),
}));

vi.mock('../libraryApi/requestLibraryApi.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../libraryApi/requestLibraryApi.js')>();

  return {
    ...actual,
    requestLibraryApi: requestLibraryApiMock,
  };
});

function createJsonResponse(body: unknown, url: string, status = 200) {
  const response = new Response(JSON.stringify(body), {
    headers: {'Content-Type': 'application/json'},
    status,
  });

  Object.defineProperty(response, 'url', {
    value: url,
  });

  return response;
}

describe('createApp route integration', () => {
  beforeEach(() => {
    requestLibraryApiMock.mockReset();
    vi.resetModules();
    delete process.env.ALLOW_DEV_CORS_ORIGINS;
    delete process.env.USE_DEV_FIXTURES;
    process.env.WEB_APP_ORIGIN = 'https://app.example.com';
    process.env.LIBRARY_API_BASE_URL = 'https://example.com';
    process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('도서관 대출 가능 여부 조회 success 응답을 정규화하고 bookExist upstream을 한 번만 호출한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {
            result: {
              hasBook: 'Y',
              loanAvailable: 'N',
            },
          },
        },
        'https://example.com/bookExist?libCode=LIB0001&isbn13=9791190157551',
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'N',
    });
    expect(requestLibraryApiMock).toHaveBeenCalledWith({
      endpoint: '/bookExist',
      queryParams: {
        isbn13: '9791190157551',
        libCode: 'LIB0001',
      },
      requiredQueryParams: ['libCode', 'isbn13'],
    });
    expect(requestLibraryApiMock).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it('개발용 fixture 모드가 켜져 있으면 도서관 대출 가능 여부를 외부 호출 없이 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/9791192389479/availability',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      hasBook: 'Y',
      isbn13: '9791192389479',
      libraryCode: 'LIB0001',
      loanAvailable: 'Y',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('개발용 fixture 모드에서 대출 불가 시나리오를 외부 호출 없이 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0002/books/9791192389479/availability',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      hasBook: 'Y',
      isbn13: '9791192389479',
      libraryCode: 'LIB0002',
      loanAvailable: 'N',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('개발용 fixture 모드에서 에러 시나리오를 외부 호출 없이 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0003/books/9791192389479/availability',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '대출 가능 여부 조회 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('개발용 fixture 모드에서 미소장 시나리오를 외부 호출 없이 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0004/books/9791192389479/availability',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      hasBook: 'N',
      isbn13: '9791192389479',
      libraryCode: 'LIB0004',
      loanAvailable: 'N',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('잘못된 isbn13이면 외부 호출 없이 400 availability 에러를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/1234/availability',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'isbn13은 13자리 숫자 문자열이어야 합니다.',
      status: 400,
      title: 'LIBRARY_AVAILABILITY_ISBN13_INVALID',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('비어 있는 libraryCode면 외부 호출 없이 400 availability 에러를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/%20%20%20/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
      status: 400,
      title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('하이픈이 포함된 libraryCode면 외부 호출 없이 400 availability 에러를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB-0001/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
      status: 400,
      title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관 대출 가능 여부 조회에서 upstream이 non-ok 응답을 반환하면 502 표준 에러로 정규화한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          detail: 'upstream failed',
          status: 503,
          title: 'UPSTREAM_FAILURE',
        },
        'https://example.com/bookExist?libCode=LIB0001&isbn13=9791190157551',
        503,
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '대출 가능 여부 조회 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('도서관 대출 가능 여부 조회에서 upstream 호출이 throw되면 502 표준 에러로 정규화한다', async () => {
    requestLibraryApiMock.mockRejectedValue(new Error('network down'));

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '대출 가능 여부 조회 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('도서관 대출 가능 여부 조회 비정상 응답을 502 표준 에러로 정규화한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {},
        },
        'https://example.com/bookExist?libCode=LIB0001&isbn13=9791190157551',
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB0001/books/9791190157551/availability',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
    });

    await app.close();
  });

});
