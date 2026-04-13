import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookDetailNormalizeResponseModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('./normalizeResponse.js');
}

function createBookDetailPayload({
  detail = [
    {
      book: {
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
    },
  ],
  loanInfo = [
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
    },
  ],
}: {
  detail?: Array<Record<string, unknown>>;
  loanInfo?: Array<Record<string, unknown>>;
} = {}) {
  return {
    response: {
      detail,
      loanInfo,
    },
  };
}

describe('book detail normalize response', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('정상 응답을 도서 상세 결과로 정규화한다', async () => {
    const {normalizeBookDetailResponse} = await importBookDetailNormalizeResponseModule();

    expect(normalizeBookDetailResponse(createBookDetailPayload())).toEqual({
      ok: true,
      value: {
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
          total: {
            loanCount: 120,
            name: '전체',
            rank: 1,
          },
        },
      },
    });
  });

  it('책 정보가 없으면 null book으로 정리한다', async () => {
    const {normalizeBookDetailResponse} = await importBookDetailNormalizeResponseModule();

    expect(
      normalizeBookDetailResponse(
        createBookDetailPayload({
          detail: [],
          loanInfo: [],
        }),
      ),
    ).toEqual({
      ok: true,
      value: {
        book: null,
        loanInfo: {
          byAge: [],
          total: null,
        },
      },
    });
  });

  it('응답 루트가 비어 있으면 표준 에러를 반환한다', async () => {
    const {normalizeBookDetailResponse} = await importBookDetailNormalizeResponseModule();

    expect(normalizeBookDetailResponse({response: {}})).toEqual({
      error: {
        detail: '도서 상세 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'BOOK_DETAIL_RESPONSE_INVALID',
      },
      ok: false,
    });
  });
});
