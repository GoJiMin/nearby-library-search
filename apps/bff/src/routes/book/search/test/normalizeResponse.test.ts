import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookSearchNormalizeResponseModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../normalizeResponse.js');
}

function createBookSearchPayload({
  docs = [
    {
      doc: {
        authors: '이민진',
        bookDtlUrl: 'https://example.com/books/9788954682155',
        bookImageURL: 'https://example.com/books/pachinko.jpg',
        bookname: '파친코',
        isbn13: '9788954682155',
        loan_count: '1240',
        publication_year: '2018',
        publisher: '문학사상',
      },
    },
  ],
  numFound = 1,
}: {
  docs?: Array<Record<string, unknown>>;
  numFound?: number;
} = {}) {
  return {
    response: {
      docs,
      numFound,
    },
  };
}

describe('book search normalize response', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('정상 응답을 도서 검색 결과로 정규화한다', async () => {
    const {normalizeBookSearchResponse} = await importBookSearchNormalizeResponseModule();

    expect(normalizeBookSearchResponse(createBookSearchPayload())).toEqual({
      ok: true,
      value: {
        items: [
          {
            author: '이민진',
            detailUrl: 'https://example.com/books/9788954682155',
            imageUrl: 'https://example.com/books/pachinko.jpg',
            isbn13: '9788954682155',
            loanCount: 1240,
            publicationYear: '2018',
            publisher: '문학사상',
            title: '파친코',
          },
        ],
        totalCount: 1,
      },
    });
  });

  it('조건에 맞는 도서가 없으면 빈 목록으로 정규화한다', async () => {
    const {normalizeBookSearchResponse} = await importBookSearchNormalizeResponseModule();

    expect(
      normalizeBookSearchResponse(
        createBookSearchPayload({
          docs: [],
          numFound: 0,
        }),
      ),
    ).toEqual({
      ok: true,
      value: {
        items: [],
        totalCount: 0,
      },
    });
  });

  it('유효한 도서 항목이 없으면 표준 에러를 반환한다', async () => {
    const {normalizeBookSearchResponse} = await importBookSearchNormalizeResponseModule();

    expect(
      normalizeBookSearchResponse(
        createBookSearchPayload({
          docs: [
            {
              doc: {
                authors: '이민진',
                bookname: '파친코',
                isbn13: '1234',
              },
            },
          ],
          numFound: 1,
        }),
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
