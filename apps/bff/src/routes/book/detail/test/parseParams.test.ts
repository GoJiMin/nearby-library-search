import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookDetailParseParamsModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../parseParams.js');
}

describe('book detail parse params', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('형식이 올바르면 도서 상세 요청 경로로 해석한다', async () => {
    const {parseBookDetailParams} = await importBookDetailParseParamsModule();

    expect(
      parseBookDetailParams({
        isbn13: ' 9788954682155 ',
      }),
    ).toEqual({
      ok: true,
      value: {
        isbn13: '9788954682155',
      },
    });
  });

  it('형식이 잘못된 책 번호는 요청을 거절한다', async () => {
    const {parseBookDetailParams} = await importBookDetailParseParamsModule();

    expect(
      parseBookDetailParams({
        isbn13: '1234',
      }),
    ).toEqual({
      error: {
        detail: 'isbn13은 13자리 숫자 문자열이어야 합니다.',
        status: 400,
        title: 'BOOK_DETAIL_ISBN13_INVALID',
      },
      ok: false,
    });
  });

  it('경로 객체 자체가 비정상이면 요청을 거절한다', async () => {
    const {parseBookDetailParams} = await importBookDetailParseParamsModule();

    expect(parseBookDetailParams(null)).toEqual({
      error: {
        detail: '도서 상세 요청 경로가 올바르지 않습니다.',
        status: 400,
        title: 'BOOK_DETAIL_PARAMS_INVALID',
      },
      ok: false,
    });
  });
});
