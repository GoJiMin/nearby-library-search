import type {BookDetailResponse} from '@nearby-library-search/contracts';
import type {AppFixtures} from '../../../../app/fixtures.types.js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {requestLibraryApiMock} = vi.hoisted(() => ({
  requestLibraryApiMock: vi.fn(),
}));

vi.mock('../../../../libraryApi/requestLibraryApi.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../../../libraryApi/requestLibraryApi.js')>();

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

function createBookDetailUpstreamPayload({
  book = {
    authors: '이민진',
    bookImageURL: 'https://example.com/books/pachinko.jpg',
    bookname: '파친코',
    class_nm: '문학',
    class_no: '813.6',
    description: '재일조선인 가족의 삶을 그린 소설',
    isbn: '895468215X',
    isbn13: '9788954682155',
    publication_date: '2018-03-09',
    publication_year: '2018',
    publisher: '문학사상',
  },
  loanInfo = [
    {
      Total: {
        loanCnt: '120',
        name: '전체',
        ranking: '1',
      },
    },
  ],
}: {
  book?: Record<string, unknown>;
  loanInfo?: Array<Record<string, unknown>>;
} = {}) {
  return {
    response: {
      detail: [{book}],
      loanInfo,
    },
  };
}

async function createAppWithBookDetailFixtures(fixtureResolver?: AppFixtures['bookDetail']) {
  const {createApp} = await import('../../../../app/createApp.js');

  return createApp({
    fixtures: {
      bookDetail: fixtureResolver,
    },
  });
}

function createBookDetailFixtureResolver(
  value: BookDetailResponse = {
    book: {
      author: '준비된 저자',
      className: '문학',
      classNumber: '813.6',
      description: '준비된 책 설명입니다.',
      imageUrl: 'https://example.com/books/prepared-book.jpg',
      isbn: '1234567890',
      isbn13: '9781234567890',
      publicationDate: '2024-01-01',
      publicationYear: '2024',
      publisher: '준비된 출판사',
      title: '준비된 상세',
    },
    loanInfo: {
      byAge: [
        {
          loanCount: 12,
          name: '20대',
          rank: 1,
        },
      ],
      total: {
        loanCount: 34,
        name: '전체',
        rank: 1,
      },
    },
  },
): NonNullable<AppFixtures['bookDetail']> {
  return {
    resolve() {
      return {
        ok: true,
        value,
      };
    },
  };
}

describe('book detail route integration', () => {
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

  it('형식이 잘못된 책 번호로 상세를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/1234',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'isbn13은 13자리 숫자 문자열이어야 합니다.',
      status: 400,
      title: 'BOOK_DETAIL_ISBN13_INVALID',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('책 상세를 찾으면 책 정보와 대출 통계를 함께 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createBookDetailUpstreamPayload({
          loanInfo: [
            {
              Total: {
                loanCnt: '120',
                name: '전체',
                ranking: '1',
              },
              ageResult: [
                {
                  age: {
                    loanCnt: '80',
                    name: '20대',
                    ranking: '1',
                  },
                },
                {
                  age: {
                    loanCnt: '30',
                    name: '30대',
                    ranking: '2',
                  },
                },
              ],
            },
          ],
        }),
        'https://example.com/srchDtlList?isbn13=9788954682155',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      book: {
        author: '이민진',
        className: '문학',
        classNumber: '813.6',
        description: '재일조선인 가족의 삶을 그린 소설',
        imageUrl: 'https://example.com/books/pachinko.jpg',
        isbn: '895468215X',
        isbn13: '9788954682155',
        publicationDate: '2018-03-09',
        publicationYear: '2018',
        publisher: '문학사상',
        title: '파친코',
      },
      loanInfo: {
        byAge: [
          {
            loanCount: 80,
            name: '20대',
            rank: 1,
          },
          {
            loanCount: 30,
            name: '30대',
            rank: 2,
          },
        ],
        total: {
          loanCount: 120,
          name: '전체',
          rank: 1,
        },
      },
    });

    await app.close();
  });

  it('책 상세 응답에는 연령별 대출 통계만 남는다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createBookDetailUpstreamPayload({
          loanInfo: [
            {
              Total: {
                loanCnt: '120',
                name: '전체',
                ranking: '1',
              },
              ageResult: [
                {
                  age: {
                    loanCnt: '80',
                    name: '20대',
                    ranking: '1',
                  },
                },
              ],
              genderResult: [
                {
                  gender: {
                    loanCnt: '70',
                    name: '여성',
                    ranking: '1',
                  },
                },
              ],
              regionResult: [
                {
                  region: {
                    loanCnt: '90',
                    name: '서울',
                    ranking: '1',
                  },
                },
              ],
            },
          ],
        }),
        'https://example.com/srchDtlList?isbn13=9788954682155',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().loanInfo).not.toHaveProperty('byGender');
    expect(response.json().loanInfo).not.toHaveProperty('byRegion');

    await app.close();
  });

  it('일부 대출 통계가 비어 있어도 안전하게 정리된 결과를 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createBookDetailUpstreamPayload({
          loanInfo: [
            {
              ageResult: [
                {
                  age: {
                    loanCnt: '80',
                    name: '20대',
                    ranking: '1',
                  },
                },
                {
                  age: {
                    loanCnt: '50',
                    ranking: '2',
                  },
                },
                {
                  invalid: {
                    loanCnt: '10',
                    name: '잘못된 값',
                  },
                },
              ],
            },
          ],
        }),
        'https://example.com/srchDtlList?isbn13=9788954682155',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      book: {
        author: '이민진',
        className: '문학',
        classNumber: '813.6',
        description: '재일조선인 가족의 삶을 그린 소설',
        imageUrl: 'https://example.com/books/pachinko.jpg',
        isbn: '895468215X',
        isbn13: '9788954682155',
        publicationDate: '2018-03-09',
        publicationYear: '2018',
        publisher: '문학사상',
        title: '파친코',
      },
      loanInfo: {
        byAge: [
          {
            loanCount: 80,
            name: '20대',
            rank: 1,
          },
        ],
        total: null,
      },
    });

    await app.close();
  });

  it('책 상세 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          detail: 'upstream failed',
          status: 503,
          title: 'UPSTREAM_FAILURE',
        },
        'https://example.com/srchDtlList?isbn13=9788954682155',
        503,
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_DETAIL_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('책 상세 요청이 중간에 실패해도 표준 에러를 반환한다', async () => {
    requestLibraryApiMock.mockRejectedValue(new Error('network down'));

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_DETAIL_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('책 상세 응답을 해석할 수 없으면 표준 에러를 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {},
        },
        'https://example.com/srchDtlList?isbn13=9788954682155',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9788954682155',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서 상세 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_DETAIL_RESPONSE_INVALID',
    });

    await app.close();
  });

  it('준비된 책 상세 정보가 있으면 응답을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookDetailFixtures(createBookDetailFixtureResolver());

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9781234567890',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      book: {
        author: '준비된 저자',
        className: '문학',
        classNumber: '813.6',
        description: '준비된 책 설명입니다.',
        imageUrl: 'https://example.com/books/prepared-book.jpg',
        isbn: '1234567890',
        isbn13: '9781234567890',
        publicationDate: '2024-01-01',
        publicationYear: '2024',
        publisher: '준비된 출판사',
        title: '준비된 상세',
      },
      loanInfo: {
        byAge: [
          {
            loanCount: 12,
            name: '20대',
            rank: 1,
          },
        ],
        total: {
          loanCount: 34,
          name: '전체',
          rank: 1,
        },
      },
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('준비된 책 상세 정보가 없으면 빈 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookDetailFixtures(
      createBookDetailFixtureResolver({
        book: null,
        loanInfo: {
          byAge: [],
          total: null,
        },
      }),
    );

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9781234567890',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      book: null,
      loanInfo: {
        byAge: [],
        total: null,
      },
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('준비된 책 상세 정보를 사용할 수 없으면 표준 에러를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithBookDetailFixtures({
      resolve: () => ({
        error: {
          detail: '도서 상세 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'BOOK_DETAIL_RESPONSE_INVALID',
        },
        ok: false,
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/9781234567890',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서 상세 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'BOOK_DETAIL_RESPONSE_INVALID',
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });
});
