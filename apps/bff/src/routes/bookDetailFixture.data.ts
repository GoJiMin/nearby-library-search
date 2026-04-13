import type {
  BookDetail,
  BookDetailLoanInfo,
  BookDetailLoanStat,
  BookDetailResponse,
  BookSearchItem,
  Isbn13,
} from '@nearby-library-search/contracts';

type BookDetailFixtureScenario = 'empty' | 'error' | 'success-minimal' | 'success-rich';

type BookDetailFixtureItem = {
  isbn13: Isbn13;
  response?: BookDetailResponse;
  scenario: BookDetailFixtureScenario;
};

const bookDetailFixtureSeedItems: ReadonlyArray<BookSearchItem> = [
  {
    author: '이민진',
    detailUrl: 'https://example.com/books/9788954682155',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788954682155',
    loanCount: 1240,
    publicationYear: '2018',
    publisher: '문학사상',
    title: '파친코',
  },
  {
    author: '손원평',
    detailUrl: 'https://example.com/books/9791196447182',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791196447182',
    loanCount: 842,
    publicationYear: '2017',
    publisher: '창비',
    title: '아몬드',
  },
  {
    author: '한강',
    detailUrl: 'https://example.com/books/9788936434124',
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788936434124',
    loanCount: 915,
    publicationYear: '2007',
    publisher: '창비',
    title: '채식주의자',
  },
  {
    author: '프리다 맥파든',
    detailUrl: 'https://example.com/books/9791192389479',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791192389479',
    loanCount: 311,
    publicationYear: '2023',
    publisher: '북플라자',
    title: '하우스메이드',
  },
];

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

function resolveFixtureClassName(item: BookSearchItem) {
  const publisher = item.publisher ?? '';
  const architectureKeyword = ['건축', '도시', '공간'].some(keyword => item.title.includes(keyword));

  if (architectureKeyword || publisher.includes('건축') || publisher.includes('아키')) {
    return '건축';
  }

  return '문학';
}

function resolveFixtureClassNumber(item: BookSearchItem) {
  return resolveFixtureClassName(item) === '건축' ? '540' : '813.6';
}

function createGenericLoanInfo(item: BookSearchItem): BookDetailLoanInfo {
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

function createBookDetailFixtureBook(item: BookSearchItem, overrides?: Partial<BookDetail>): BookDetail {
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

function createRichBookDetailFixtureResponse(item: BookSearchItem): BookDetailResponse {
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

function createMinimalBookDetailFixtureResponse(item: BookSearchItem): BookDetailResponse {
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

function createBookDetailFixtureItem(item: BookSearchItem): BookDetailFixtureItem {
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

const bookDetailFixtureItems: ReadonlyArray<BookDetailFixtureItem> = bookDetailFixtureSeedItems.map(
  createBookDetailFixtureItem,
);

export {bookDetailFixtureItems, resolveBookDetailFixtureScenario};
export type {BookDetailFixtureItem, BookDetailFixtureScenario};
