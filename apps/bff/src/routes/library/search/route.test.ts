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
  const {createApp} = await import('../../../app/createApp.js');

  if (fixtureResolver) {
    return createApp({
      fixtures: {
        librarySearch: fixtureResolver,
      },
    });
  }

  const {resolveLibrarySearchFixtureResult} = await import('../../librarySearchFixture.js');

  return createApp({
    fixtures: {
      librarySearch: {
        resolve: resolveLibrarySearchFixtureResult,
      },
    },
  });
}

describe('library search route integration', () => {
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

  it('도서 정보 없이 도서관을 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../app/createApp.js');
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
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('지역 정보 없이 도서관을 찾으려 하면 요청이 거절된다', async () => {
    const {createApp} = await import('../../../app/createApp.js');
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
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('선택한 지역과 맞지 않는 세부 지역은 요청할 수 없다', async () => {
    const {createApp} = await import('../../../app/createApp.js');
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
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관을 찾으면 일치하는 목록을 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createLibrarySearchUpstreamPayload(),
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11&dtl_region=11140',
      ),
    );

    const {createApp} = await import('../../../app/createApp.js');
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
    expect(requestLibraryApiMock).toHaveBeenCalledWith({
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
    requestLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../app/createApp.js');
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

  it('선택한 지역과 세부 지역에 맞는 도서관 목록을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=11&detailRegion=11140&page=2',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [
        expect.objectContaining({
          code: 'LIB0011',
          name: '공덕자료보관실',
        }),
        expect.objectContaining({
          code: 'LIB0012',
          name: '신촌아카이브',
        }),
      ],
      page: 2,
      pageSize: 10,
      region: '11',
      resultCount: 2,
      totalCount: 12,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('서울 전체에서 도서관을 찾으면 첫 페이지 목록을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9791192389479&region=11&page=1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      isbn: '9791192389479',
      items: [
        expect.objectContaining({
          code: 'LIB0001',
          name: '마포중앙도서관',
        }),
        expect.objectContaining({
          code: 'LIB0002',
          name: '합정열람실',
        }),
        expect.objectContaining({
          code: 'LIB0003',
          name: '서강책마루',
        }),
        expect.objectContaining({
          code: 'LIB0004',
          name: '토정정보도서관',
        }),
        expect.objectContaining({
          code: 'LIB0005',
          name: '성산서고',
        }),
        expect.objectContaining({
          code: 'LIB0006',
          name: '상암미디어도서관',
        }),
        expect.objectContaining({
          code: 'LIB0007',
          name: '망원책나루',
        }),
        expect.objectContaining({
          code: 'LIB0008',
          name: '연남문고',
        }),
        expect.objectContaining({
          code: 'LIB0009',
          name: '서교정보서재',
        }),
        expect.objectContaining({
          code: 'LIB0010',
          name: '홍대창작자료실',
        }),
      ],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 10,
      totalCount: 96,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('서울 전체에서 다음 페이지를 요청하면 이어지는 목록을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9791192389479&region=11&page=5',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      isbn: '9791192389479',
      items: [
        expect.objectContaining({
          code: 'LIB1119005',
          name: '영등포 성산서고',
        }),
        expect.objectContaining({
          code: 'LIB1119006',
          name: '영등포 상암미디어도서관',
        }),
        expect.objectContaining({
          code: 'LIB1119007',
          name: '영등포 망원책나루',
        }),
        expect.objectContaining({
          code: 'LIB1119008',
          name: '영등포 연남문고',
        }),
        expect.objectContaining({
          code: 'LIB1119009',
          name: '영등포 서교정보서재',
        }),
        expect.objectContaining({
          code: 'LIB1119010',
          name: '영등포 홍대창작자료실',
        }),
        expect.objectContaining({
          code: 'LIB1119011',
          name: '영등포 공덕자료보관실',
        }),
        expect.objectContaining({
          code: 'LIB1119012',
          name: '영등포 신촌아카이브',
        }),
        expect.objectContaining({
          code: 'LIB1120001',
          name: '동작 마포중앙도서관',
        }),
        expect.objectContaining({
          code: 'LIB1120002',
          name: '동작 합정열람실',
        }),
      ],
      page: 5,
      pageSize: 10,
      region: '11',
      resultCount: 10,
      totalCount: 96,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('조건에 맞는 도서관이 없으면 빈 목록을 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const app = await createAppWithLibrarySearchFixtures();

    const response = await app.inject({
      method: 'GET',
      url: '/api/libraries/search?isbn=9788954682155&region=26&page=1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '26',
      resultCount: 0,
      totalCount: 0,
    });
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관 검색 결과를 준비할 수 없으면 표준 에러를 반환한다', async () => {
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
    expect(requestLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('도서관 정보를 불러오지 못하면 표준 에러를 반환한다', async () => {
    requestLibraryApiMock.mockResolvedValue(
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

    const {createApp} = await import('../../../app/createApp.js');
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
    requestLibraryApiMock.mockResolvedValue(
      createJsonResponse(
        createLibrarySearchUpstreamPayload({
          numFound: 'invalid',
        }),
        'https://example.com/libSrchByBook?isbn=9788954682155&region=11',
      ),
    );

    const {createApp} = await import('../../../app/createApp.js');
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
