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

function createLibrarySearchUpstreamPayload({
  numFound = '1',
  resultNum = '1',
  pageNo = '1',
  pageSize = '10',
  libs = [
    {
      lib: {
        address: '서울특별시 마포구 성산로 128',
        closed: '월요일',
        fax: '02-300-1001',
        homepage: 'https://mapo.example.com',
        latitude: '37.5638',
        libCode: 'LIB0001',
        libName: '마포중앙도서관',
        longitude: '126.9084',
        operatingTime: '09:00~22:00',
        tel: '02-300-1000',
      },
    },
  ],
}: {
  numFound?: string;
  resultNum?: string;
  pageNo?: string;
  pageSize?: string;
  libs?: Array<Record<string, unknown>>;
} = {}) {
  return {
    response: {
      libs,
      numFound,
      pageNo,
      pageSize,
      resultNum,
    },
  };
}

async function createAppWithLibrarySearchFixtures(fixtureResolver?: AppFixtures['librarySearch']) {
  const {createApp} = await import('../../../../app/createApp.js');

  return createApp({
    fixtures: {
      librarySearch: fixtureResolver,
    },
  });
}

function createFixtureLibrary(code: string, name: string) {
  return {
    address: null,
    closedDays: null,
    code,
    fax: null,
    homepage: null,
    latitude: null,
    longitude: null,
    name,
    operatingTime: null,
    phone: null,
  };
}

function createLibrarySearchFixtureResolver(
  response = {
    detailRegion: '11140',
    isbn: '9781234567890',
    items: [createFixtureLibrary('LIB9001', '준비된도서관')],
    page: 1,
    pageSize: 10,
    region: '11',
    resultCount: 1,
    totalCount: 1,
  },
): AppFixtures['librarySearch'] {
  return {
    resolve() {
      return {
        ok: true,
        value: response,
      };
    },
  };
}

describe('library search route integration', () => {
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

  it('도서 정보 없이 도서관을 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?region=11',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'isbn은 13자리 숫자 문자열이어야 합니다.',
      status: 400,
      title: 'LIBRARY_SEARCH_ISBN_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('지역 정보 없이 도서관을 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'region은 2자리 숫자 문자열이어야 합니다.',
      status: 400,
      title: 'LIBRARY_SEARCH_REGION_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('선택한 지역과 맞지 않는 세부 지역은 요청할 수 없다', async () => {
    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11&detailRegion=26140',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      detail: 'detailRegion은 region에 속하는 5자리 숫자 문자열이어야 합니다.',
      status: 400,
      title: 'LIBRARY_SEARCH_DETAIL_REGION_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관을 찾으면 일치하는 목록을 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createLibrarySearchUpstreamPayload(),
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11&dtl_region=11140',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11&detailRegion=11140',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [
        {
          address: '서울특별시 마포구 성산로 128',
          closedDays: '월요일',
          code: 'LIB0001',
          fax: '02-300-1001',
          homepage: 'https://mapo.example.com/',
          latitude: 37.5638,
          longitude: 126.9084,
          name: '마포중앙도서관',
          operatingTime: '09:00~22:00',
          phone: '02-300-1000',
        },
      ],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 1,
      totalCount: 1,
    });
    expect(fetchLibraryApiMock).toHaveBeenCalledWith({
      endpoint: '/libSrchByBook',
      queryParams: {
        dtl_region: '11140',
        isbn: '9788954682155',
        pageNo: 1,
        pageSize: 10,
        region: '11',
      },
      requiredQueryParams: ['isbn', 'region'],
    });

    await app.close();
  });

  it('검색 결과가 없으면 빈 목록을 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createLibrarySearchUpstreamPayload({
          libs: [],
          numFound: '0',
          pageNo: '3',
          pageSize: '10',
          resultNum: '0',
        }),
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11&dtl_region=11140&pageNo=3',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11&detailRegion=11140&page=3',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 3,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    await app.close();
  });

  it('준비된 도서관 검색 결과가 있으면 응답을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures(createLibrarySearchFixtureResolver());

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9781234567890&region=11&detailRegion=11140&page=1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      detailRegion: '11140',
      isbn: '9781234567890',
      items: [
        createFixtureLibrary('LIB9001', '준비된도서관'),
      ],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 1,
      totalCount: 1,
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('준비된 도서관 검색 결과를 사용할 수 없으면 표준 에러를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures({
      resolve: () => ({
        error: {
          detail: '도서관 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'LIBRARY_SEARCH_RESPONSE_INVALID',
        },
        ok: false as const,
      }),
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11&detailRegion=11140&page=2',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서관 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_SEARCH_RESPONSE_INVALID',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        {
          detail: 'upstream failed',
          status: 503,
          title: 'UPSTREAM_FAILURE',
        },
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11',
        503,
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서관 조회 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_SEARCH_UPSTREAM_ERROR',
    });

    await app.close();
  });

  it('도서관 검색 응답을 해석할 수 없으면 표준 에러를 반환한다', async () => {
    fetchLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createLibrarySearchUpstreamPayload({
          numFound: 'invalid',
        }),
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11',
      ),
    );

    const {createApp} = await import('../../../../app/createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11',
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      detail: '도서관 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 502,
      title: 'LIBRARY_SEARCH_RESPONSE_INVALID',
    });

    await app.close();
  });
});
