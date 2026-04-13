import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookSearchFixtureModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../fixture.js');
}

describe('book search fixture', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('검색 결과 fixture를 반환한다', async () => {
    const {getBookSearchFixtureResult} = await importBookSearchFixtureModule();

    expect(
      getBookSearchFixtureResult({
        page: 1,
        pageSize: 10,
        title: '파친코',
      }),
    ).toEqual({
      ok: true,
      value: {
        items: [
          expect.objectContaining({
            author: '이민진',
            title: '파친코',
          }),
        ],
        totalCount: 1,
      },
    });
  });

  it('조건에 맞는 fixture가 없으면 빈 결과를 반환한다', async () => {
    const {getBookSearchFixtureResult} = await importBookSearchFixtureModule();

    expect(
      getBookSearchFixtureResult({
        page: 1,
        pageSize: 10,
        title: '없는 책',
      }),
    ).toEqual({
      ok: true,
      value: {
        items: [],
        totalCount: 0,
      },
    });
  });

  it('준비된 응답을 만들지 못하면 표준 에러를 반환한다', async () => {
    const {getBookSearchFixtureResult} = await importBookSearchFixtureModule();

    expect(
      getBookSearchFixtureResult(
        {
          page: 1,
          pageSize: 10,
          title: '파친코',
        },
        {
          createResponse() {
            throw new Error('fixture failed');
          },
        },
      ),
    ).toEqual({
      error: {
        detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'BOOK_SEARCH_RESPONSE_INVALID',
      },
      ok: false,
    });
  });

  it('형식이 올바르지 않은 준비된 응답이면 표준 에러를 반환한다', async () => {
    const {getBookSearchFixtureResult} = await importBookSearchFixtureModule();

    expect(
      getBookSearchFixtureResult(
        {
          page: 1,
          pageSize: 10,
          title: '파친코',
        },
        {
          createResponse() {
            return {
              items: [{author: null, title: '파친코'}],
              totalCount: '1',
            };
          },
        },
      ),
    ).toEqual({
      error: {
        detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'BOOK_SEARCH_RESPONSE_INVALID',
      },
      ok: false,
    });
  });
});
