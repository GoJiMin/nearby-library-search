import type {AppFixtures} from '../../../app/fixtures.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {requestLibraryApiMock} = vi.hoisted(() => ({
  requestLibraryApiMock: vi.fn(),
}));

vi.mock('../../../libraryApi/requestLibraryApi.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../libraryApi/requestLibraryApi.js')>();

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

async function createAppWithBookSearchFixtures(fixtureResolver?: AppFixtures['bookSearch']) {
  const {createApp} = await import('../../../app/createApp.js');

  return createApp({
    fixtures: {
      bookSearch: fixtureResolver,
    },
  });
}

function createPreparedBookSearchFixtureResolver(): NonNullable<AppFixtures['bookSearch']> {
  return {
    resolve(query) {
      if (query.title === '파친코') {
        return {
          ok: true,
          value: {
            items: [
              {
                author: '이민진',
                detailUrl: 'https://example.com/books/9788954682155',
                imageUrl:
                  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&q=80',
                isbn13: '9788954682155',
                loanCount: 1240,
                publicationYear: '2018',
                publisher: '문학사상',
                title: '파친코',
              },
            ],
            totalCount: 1,
          },
        };
      }

      if (query.author === '건축연구회' && query.page === 2) {
        return {
          ok: true,
          value: {
            items: Array.from({length: 10}, (_, index) => {
              const itemNumber = index + 11;
              const isbn13 = `9791198800${String(itemNumber).padStart(3, '0')}`;

              return {
                author: '건축연구회',
                detailUrl: `https://example.com/books/architecture-lab/${isbn13}`,
                imageUrl:
                  index % 3 === 0
                    ? 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=320&q=80'
                    : index % 3 === 1
                      ? 'https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=320&q=80'
                      : 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=320&q=80',
                isbn13,
                loanCount: 48 + (itemNumber - 1) * 7,
                publicationYear: String(2000 + itemNumber),
                publisher: '아키텍처 프레스',
                title: `건축 연습 ${String(itemNumber).padStart(2, '0')}`,
              };
            }),
            totalCount: 24,
          },
        };
      }

      return {
        ok: true,
        value: {
          items: [],
          totalCount: 0,
        },
      };
    },
  };
}

describe('book search route integration', () => {
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

  it('검색 조건 없이 도서를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../app/createApp.js');
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

  it('조건에 맞는 도서가 없으면 빈 목록을 반환한다', async () => {
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

    const {createApp} = await import('../../../app/createApp.js');
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

  it('도서 제목으로 찾으면 일치하는 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookSearchFixtures(createPreparedBookSearchFixtureResolver());

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

  it('검색 결과가 여러 페이지면 요청한 페이지의 목록만 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookSearchFixtures(createPreparedBookSearchFixtureResolver());

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?author=%EA%B1%B4%EC%B6%95%EC%97%B0%EA%B5%AC%ED%9A%8C&page=2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 11',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 12',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 13',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 14',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 15',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 16',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 17',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 18',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 19',
        }),
        expect.objectContaining({
          author: '건축연구회',
          title: '건축 연습 20',
        }),
      ],
      totalCount: 24,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서 검색 결과를 준비할 수 없으면 표준 에러를 반환한다', async () => {
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
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서 검색 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
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

    const {createApp} = await import('../../../app/createApp.js');
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

  it('도서 검색 응답을 해석할 수 없으면 표준 에러를 반환한다', async () => {
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

    const {createApp} = await import('../../../app/createApp.js');
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
