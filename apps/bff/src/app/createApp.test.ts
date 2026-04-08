import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {requestLibraryApiMock} = vi.hoisted(() => ({
  requestLibraryApiMock: vi.fn(),
}));

vi.mock('../libraryApi/requestLibraryApi.js', () => ({
  requestLibraryApi: requestLibraryApiMock,
}));

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

describe('createApp integration', () => {
  beforeEach(() => {
    requestLibraryApiMock.mockReset();
    vi.resetModules();
    delete process.env.USE_DEV_FIXTURES;
    process.env.LIBRARY_API_BASE_URL = 'https://example.com';
    process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('헬스체크 라우트가 no-store 헤더와 ok 상태를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.json()).toEqual({
      status: 'ok',
    });

    await app.close();
  });

  it('도서 검색 조건이 없으면 외부 호출 없이 400 에러를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      detail: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
      status: 400,
      title: 'BOOK_SEARCH_QUERY_MISSING',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서 검색 0건 응답을 빈 목록으로 정규화한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {
            docs: [],
            numFound: 0,
          },
        },
        'https://example.com/srchBooks?title=react',
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=react',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [],
      totalCount: 0,
    });
    expect(requestLibraryApiMock).toHaveBeenCalledWith({
      endpoint: '/srchBooks',
      queryParams: {
        author: undefined,
        isbn13: undefined,
        pageNo: 1,
        pageSize: 10,
        title: 'react',
      },
    });

    await app.close();
  });

  it('개발용 fixture 모드가 켜져 있으면 외부 호출 없이 검색 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=파친코',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [
        expect.objectContaining({
          author: '이민진',
          title: '파친코',
        }),
      ],
      totalCount: 1,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서 검색 업스트림 실패를 502 표준 에러로 정규화한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          detail: 'upstream failed',
          status: 503,
          title: 'UPSTREAM_FAILURE',
        },
        'https://example.com/srchBooks?title=react',
        503,
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=react',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      detail: '도서 검색 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_SEARCH_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('도서 검색 비정상 응답을 502 표준 에러로 정규화한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {
            docs: [],
            numFound: 'invalid',
          },
        },
        'https://example.com/srchBooks?title=react',
      ),
    );

    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=react',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_SEARCH_RESPONSE_INVALID',
    });

    await app.close();
  });
});
