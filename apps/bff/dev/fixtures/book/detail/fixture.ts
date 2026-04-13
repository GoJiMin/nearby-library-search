import type {
  BookDetail,
  BookDetailLoanInfo,
  BookDetailLoanStat,
  BookDetailResponse,
  Isbn13,
} from '@nearby-library-search/contracts';
import type {BookDetailParams} from '../../../../src/schemas/book.js';
import {createRetryableUpstreamRequestError, createRetryableUpstreamResponseError} from '../../../../src/utils/error.js';
import type {Result} from '../../../../src/utils/result.types.js';
import {bookDetailFixtureBooks} from './books.js';
import type {BookDetailFixtureBookSeed} from './books.js';

type BookDetailFixtureScenario = 'empty' | 'error' | 'success-minimal' | 'success-rich';

type BookDetailFixtureItem = {
  isbn13: Isbn13;
  response?: BookDetailResponse;
  scenario: BookDetailFixtureScenario;
};

const FIXTURE_SCENARIO_BY_ISBN13: Readonly<Partial<Record<Isbn13, BookDetailFixtureScenario>>> = {
  '9788936434124': 'empty',
  '9788954682155': 'success-rich',
  '9791192389479': 'error',
  '9791196447182': 'success-minimal',
};

function resolveBookDetailFixtureScenario(isbn13: Isbn13): BookDetailFixtureScenario {
  return FIXTURE_SCENARIO_BY_ISBN13[isbn13] ?? 'success-rich';
}

function createLoanStat(name: string, loanCount: number | null, rank: number | null): BookDetailLoanStat {
  return {
    loanCount,
    name,
    rank,
  };
}

function resolveFixtureClassName(item: BookDetailFixtureBookSeed) {
  const publisher = item.publisher ?? '';
  const architectureKeyword = ['건축', '도시', '공간'].some(keyword => item.title.includes(keyword));

  if (architectureKeyword || publisher.includes('건축') || publisher.includes('아키')) {
    return '건축';
  }

  return '문학';
}

function resolveFixtureClassNumber(item: BookDetailFixtureBookSeed) {
  return resolveFixtureClassName(item) === '건축' ? '540' : '813.6';
}

function createGenericLoanInfo(item: BookDetailFixtureBookSeed): BookDetailLoanInfo {
  const totalLoanCount = item.loanCount ?? 0;

  if (totalLoanCount <= 0) {
    return {
      byAge: [],
      total: null,
    };
  }

  return {
    byAge: [
      createLoanStat('20대', Math.max(Math.round(totalLoanCount * 0.38), 1), 1),
      createLoanStat('30대', Math.max(Math.round(totalLoanCount * 0.27), 1), 2),
      createLoanStat('40대', Math.max(Math.round(totalLoanCount * 0.16), 1), 3),
    ],
    total: createLoanStat('전체', totalLoanCount, 1),
  };
}

function createBookDetailFixtureBook(item: BookDetailFixtureBookSeed, overrides?: Partial<BookDetail>): BookDetail {
  return {
    author: item.author,
    className: resolveFixtureClassName(item),
    classNumber: resolveFixtureClassNumber(item),
    description: `${item.title}의 상세 정보를 확인할 수 있는 개발용 fixture 응답입니다.`,
    imageUrl: item.imageUrl,
    isbn: item.isbn13.slice(-10),
    isbn13: item.isbn13,
    publicationDate: item.publicationYear ? `${item.publicationYear}-01-01` : null,
    publicationYear: item.publicationYear,
    publisher: item.publisher,
    title: item.title,
    ...overrides,
  };
}

function createRichBookDetailFixtureResponse(item: BookDetailFixtureBookSeed): BookDetailResponse {
  if (item.isbn13 === '9788954682155') {
    return {
      book: createBookDetailFixtureBook(item, {
        className: '문학',
        classNumber: '813.6',
        description: '재일조선인 가족의 삶을 세대에 걸쳐 따라가는 장편소설입니다.',
        isbn: '895468215X',
        publicationDate: '2018-03-09',
      }),
      loanInfo: {
        byAge: [
          createLoanStat('20대', 430, 1),
          createLoanStat('30대', 315, 2),
          createLoanStat('40대', 188, 3),
        ],
        total: createLoanStat('전체', 1240, 1),
      },
    };
  }

  return {
    book: createBookDetailFixtureBook(item),
    loanInfo: createGenericLoanInfo(item),
  };
}

function createMinimalBookDetailFixtureResponse(item: BookDetailFixtureBookSeed): BookDetailResponse {
  return {
    book: createBookDetailFixtureBook(item, {
      className: null,
      classNumber: null,
      description: null,
      isbn: null,
      publicationDate: null,
    }),
    loanInfo: {
      byAge: [],
      total: null,
    },
  };
}

function createEmptyBookDetailFixtureResponse(): BookDetailResponse {
  return {
    book: null,
    loanInfo: {
      byAge: [],
      total: null,
    },
  };
}

function createBookDetailFixtureItem(item: BookDetailFixtureBookSeed): BookDetailFixtureItem {
  const scenario = resolveBookDetailFixtureScenario(item.isbn13);

  switch (scenario) {
    case 'success-rich':
      return {
        isbn13: item.isbn13,
        response: createRichBookDetailFixtureResponse(item),
        scenario,
      };
    case 'success-minimal':
      return {
        isbn13: item.isbn13,
        response: createMinimalBookDetailFixtureResponse(item),
        scenario,
      };
    case 'empty':
      return {
        isbn13: item.isbn13,
        response: createEmptyBookDetailFixtureResponse(),
        scenario,
      };
    case 'error':
      return {
        isbn13: item.isbn13,
        scenario,
      };
  }
}

const bookDetailFixtureItems: ReadonlyArray<BookDetailFixtureItem> = bookDetailFixtureBooks.map(createBookDetailFixtureItem);

function getBookDetailFixtureResult(params: BookDetailParams): Result<BookDetailResponse> {
  const fixtureItem = bookDetailFixtureItems.find(item => item.isbn13 === params.isbn13);

  if (fixtureItem === undefined) {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError('BOOK_DETAIL_RESPONSE_INVALID', '도서 상세'),
    };
  }

  switch (fixtureItem.scenario) {
    case 'success-rich':
    case 'success-minimal':
    case 'empty':
      if (fixtureItem.response === undefined) {
        return {
          ok: false,
          error: createRetryableUpstreamResponseError('BOOK_DETAIL_RESPONSE_INVALID', '도서 상세'),
        };
      }

      return {
        ok: true,
        value: fixtureItem.response,
      };
    case 'error':
      return {
        ok: false,
        error: createRetryableUpstreamRequestError('BOOK_DETAIL_UPSTREAM_ERROR', '도서 상세'),
      };
  }
}

export {getBookDetailFixtureResult};
