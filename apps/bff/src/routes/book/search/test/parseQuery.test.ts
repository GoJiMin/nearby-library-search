import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookSearchParseQueryModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../parseQuery.js');
}

describe('book search parse query', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('검색 조건이 올바르면 도서 검색 요청으로 해석한다', async () => {
    const {parseBookSearchQuery} = await importBookSearchParseQueryModule();

    expect(
      parseBookSearchQuery({
        page: '2',
        title: ' 파친코 ',
      }),
    ).toEqual({
      ok: true,
      value: {
        author: undefined,
        isbn13: undefined,
        page: 2,
        pageSize: 10,
        title: '파친코',
      },
    });
  });

  it('검색 조건이 없으면 요청을 거절한다', async () => {
    const {parseBookSearchQuery} = await importBookSearchParseQueryModule();

    expect(parseBookSearchQuery({page: '1'})).toEqual({
      error: {
        detail: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_QUERY_MISSING',
      },
      ok: false,
    });
  });

  it('형식이 잘못된 isbn13은 요청을 거절한다', async () => {
    const {parseBookSearchQuery} = await importBookSearchParseQueryModule();

    expect(
      parseBookSearchQuery({
        isbn13: '1234',
      }),
    ).toEqual({
      error: {
        detail: 'ISBN13은 13자리 숫자 문자열이어야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_ISBN13_INVALID',
      },
      ok: false,
    });
  });
});
