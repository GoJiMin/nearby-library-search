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

async function createAppWithLibraryAvailabilityFixtures(fixtureResolver?: AppFixtures['libraryAvailability']) {
  const {createApp} = await import('../../../../app/createApp.js');

  return createApp({
    fixtures: {
      libraryAvailability: fixtureResolver,
    },
  });
}

function createLibraryAvailabilityFixtureResolver(
  value = {
    hasBook: 'Y' as const,
    isbn13: '9781234567890',
    libraryCode: 'LIB9001',
    loanAvailable: 'N' as const,
  },
): AppFixtures['libraryAvailability'] {
  return {
    resolve() {
      return {
        ok: true,
        value,
      };
    },
  };
}

describe('library availability route integration', () => {
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

  it('도서관에 책이 있으면 대출 가능 여부를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).toHaveBeenCalledWith({
      endpoint: '/bookExist',
      queryParams: {
        isbn13: '9791190157551',
        libCode: 'LIB0001',
      },
      requiredQueryParams: ['libCode', 'isbn13'],
    });
    expect(fetchLibraryApiMock).toHaveBeenCalledTimes(1);

    await app.close();
  });

  it('준비된 대출 가능 여부가 있으면 응답을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibraryAvailabilityFixtures(createLibraryAvailabilityFixtureResolver());

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB9001/books/9781234567890/availability',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      hasBook: 'Y',
      isbn13: '9781234567890',
      libraryCode: 'LIB9001',
      loanAvailable: 'N',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('준비된 대출 가능 여부를 사용할 수 없으면 표준 에러를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibraryAvailabilityFixtures({
      resolve: () => ({
        error: {
          detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
        },
        ok: false,
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/LIB9001/books/9781234567890/availability',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('형식이 잘못된 책 번호로 대출 가능 여부를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('비어 있는 도서관 코드로 대출 가능 여부를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('형식이 잘못된 도서관 코드로 대출 가능 여부를 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
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
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('대출 가능 여부 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../../app/createApp.js');
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

  it('대출 가능 여부 요청이 중간에 실패해도 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockRejectedValue(new Error('network down'));

    const {createApp} = await import('../../../../app/createApp.js');
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

  it('대출 가능 여부 응답을 해석할 수 없으면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          response: {},
        },
        'https://example.com/bookExist?libCode=LIB0001&isbn13=9791190157551',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
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
