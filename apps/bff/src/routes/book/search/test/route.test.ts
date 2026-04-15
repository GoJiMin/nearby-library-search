import type {AppFixtures} from '../../../../app/fixtures.types.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {fetchLibraryApiMock} = vi.hoisted(() => ({
  fetchLibraryApiMock: vi.fn(),
}));

vi.mock('../../../../libraryApi/fetchLibraryApi.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../../libraryApi/fetchLibraryApi.js')>();

  return {
    ...actual,
    fetchLibraryApi: fetchLibraryApiMock,
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

function createTextResponse(body: string, url: string, status = 200) {
  const response = new Response(body, {status});

  Object.defineProperty(response, 'url', {
    value: url,
  });

  return response;
}

async function createAppWithBookSearchFixtures(fixtureResolver?: AppFixtures['bookSearch']) {
  const {createApp} = await import('../../../../app/createApp.js');

  return createApp({
    fixtures: {
      bookSearch: fixtureResolver,
    },
  });
}

function createBookSearchFixtureResolver(
  response = {
    items: [
      {
        author: '준비된 저자',
        detailUrl: 'https://example.com/books/9781234567890',
        imageUrl: 'https://example.com/books/prepared-book.jpg',
        isbn13: '9781234567890',
        loanCount: 42,
        publicationYear: '2024',
        publisher: '준비된 출판사',
        title: '준비된 책',
      },
    ],
    totalCount: 1,
  },
): NonNullable<AppFixtures['bookSearch']> {
  return {
    resolve() {
      return {
        ok: true,
        value: response,
      };
    },
  };
}

describe('book search route integration', () => {
  beforeEach(() => {
    fetchLibraryApiMock.mockReset();
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

  it('검색 조건 없이 도서를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('조건에 맞는 도서가 없으면 빈 목록을 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).toHaveBeenCalledWith({
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

  it('준비된 도서 검색 결과가 있으면 응답을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookSearchFixtures(createBookSearchFixtureResolver());

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=prepared',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [
        {
          author: '준비된 저자',
          detailUrl: 'https://example.com/books/9781234567890',
          imageUrl: 'https://example.com/books/prepared-book.jpg',
          isbn13: '9781234567890',
          loanCount: 42,
          publicationYear: '2024',
          publisher: '준비된 출판사',
          title: '준비된 책',
        },
      ],
      totalCount: 1,
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('준비된 도서 검색 결과를 사용할 수 없으면 표준 에러를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookSearchFixtures({
      resolve: () => ({
        error: {
          detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'BOOK_SEARCH_RESPONSE_INVALID',
        },
        ok: false as const,
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=파친코',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_SEARCH_RESPONSE_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서 검색 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../../app/createApp.js');
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

  it('도서 검색 upstream이 빈 응답 본문을 반환하면 검색어 조합 안내 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(createTextResponse('', 'https://example.com/srchBooks?title=%EC%B1%84%EC%8B%9D%EC%A3%BC%EC%9D%98%EC%9E%90%3A%20%ED%95%9C%EA%B0%95'));

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=%EC%B1%84%EC%8B%9D%EC%A3%BC%EC%9D%98%EC%9E%90%3A%20%ED%95%9C%EA%B0%95',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      detail: '입력한 검색어 조합으로는 결과를 가져오지 못했습니다. 책 제목이나 저자명을 나눠 다시 검색해보세요.',
      status: 502,
      title: 'BOOK_SEARCH_QUERY_NEEDS_REFINEMENT',
    });

    await app.close();
  });

  it('도서 검색 응답을 해석할 수 없으면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../../app/createApp.js');
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

  it('도서 검색 upstream이 비어 있지 않은 비정상 본문을 반환하면 응답 처리 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(createTextResponse('not-json', 'https://example.com/srchBooks?title=react'));

    const {createApp} = await import('../../../../app/createApp.js');
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
