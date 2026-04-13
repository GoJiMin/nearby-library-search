import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importLibrarySearchFixtureModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('./fixture.js');
}

describe('library search fixture', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('선택한 지역과 세부 지역에 맞는 도서관 목록을 반환한다', async () => {
    const {getLibrarySearchFixtureResult} = await importLibrarySearchFixtureModule();

    expect(
      getLibrarySearchFixtureResult({
        isbn: '9788954682155',
        page: 2,
        pageSize: 10,
        region: '11',
        detailRegion: '11140',
      }),
    ).toEqual({
      ok: true,
      value: {
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
      },
    });
  });

  it('조건에 맞는 도서관이 없으면 빈 목록을 반환한다', async () => {
    const {getLibrarySearchFixtureResult} = await importLibrarySearchFixtureModule();

    expect(
      getLibrarySearchFixtureResult({
        isbn: '9788954682155',
        page: 1,
        pageSize: 10,
        region: '26',
      }),
    ).toEqual({
      ok: true,
      value: {
        isbn: '9788954682155',
        items: [],
        page: 1,
        pageSize: 10,
        region: '26',
        resultCount: 0,
        totalCount: 0,
      },
    });
  });

  it('도서관 목록을 준비할 수 없으면 표준 에러를 반환한다', async () => {
    const {getLibrarySearchFixtureResult} = await importLibrarySearchFixtureModule();

    expect(
      getLibrarySearchFixtureResult(
        {
          isbn: '9788954682155',
          page: 1,
          pageSize: 10,
          region: '11',
        },
        {
          createResponse() {
            throw new Error('fixture failed');
          },
        },
      ),
    ).toEqual({
      error: {
        detail: '도서관 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'LIBRARY_SEARCH_RESPONSE_INVALID',
      },
      ok: false,
    });
  });

  it('형식이 맞지 않는 도서관 목록은 표준 에러로 다룬다', async () => {
    const {getLibrarySearchFixtureResult} = await importLibrarySearchFixtureModule();

    expect(
      getLibrarySearchFixtureResult(
        {
          isbn: '9788954682155',
          page: 1,
          pageSize: 10,
          region: '11',
        },
        {
          createResponse() {
            return {
              isbn: '9788954682155',
              items: [{code: null, name: '마포중앙도서관'}],
              page: 1,
              pageSize: 10,
              region: '11',
              resultCount: '1',
              totalCount: 1,
            };
          },
        },
      ),
    ).toEqual({
      error: {
        detail: '도서관 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'LIBRARY_SEARCH_RESPONSE_INVALID',
      },
      ok: false,
    });
  });
});
