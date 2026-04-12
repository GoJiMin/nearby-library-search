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

  it('localhost 개발 origin 요청에 CORS 허용 헤더를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        origin: 'http://127.0.0.1:5173',
      },
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://127.0.0.1:5173');
    expect(response.headers['access-control-allow-methods']).toBe('GET,HEAD,OPTIONS');
    expect(response.headers.vary).toBe('Origin');

    await app.close();
  });

  it('preflight OPTIONS 요청에 204와 허용 헤더를 반환한다', async () => {
    const {createApp} = await import('./createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        'access-control-request-headers': 'content-type',
        origin: 'http://localhost:5173',
      },
      method: 'OPTIONS',
      url: '/api/books/search',
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toBe('GET,HEAD,OPTIONS');
    expect(response.headers['access-control-allow-headers']).toBe('content-type');

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

  it('개발용 fixture 모드에서 페이지네이션 확인용 검색 결과를 여러 페이지로 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

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

  it('개발용 fixture 모드가 켜져 있으면 도서관 검색 결과를 외부 호출 없이 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

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

  it('개발용 fixture 모드에서 서울 전체 선택은 detailRegion 없이도 다중 페이지 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

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

  it('개발용 fixture 모드에서 서울 전체 선택은 중간 페이지 확인용 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

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

  it('개발용 fixture 모드에서 조건에 맞는 도서관이 없으면 빈 결과를 반환한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createApp} = await import('./createApp.js');
    const app = createApp();

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
      detail: 'libraryCode는 비어 있지 않은 문자열이어야 합니다.',
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
