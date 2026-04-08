import type {BookSearchItem, BookSearchResponse} from '@nearby-library-search/contracts';
import type {BookSearchQuery} from '../schemas/book.js';

const bookSearchFixtureItems: BookSearchItem[] = [
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
  {
    author: '김영하',
    detailUrl: 'https://example.com/books/9788932021670',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788932021670',
    loanCount: 502,
    publicationYear: '2013',
    publisher: '문학동네',
    title: '살인자의 기억법',
  },
  {
    author: '한강',
    detailUrl: 'https://example.com/books/9788954683374',
    imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788954683374',
    loanCount: 687,
    publicationYear: '2021',
    publisher: '문학동네',
    title: '작별하지 않는다',
  },
  {
    author: '무라카미 하루키',
    detailUrl: 'https://example.com/books/9788937482674',
    imageUrl: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788937482674',
    loanCount: 774,
    publicationYear: '2017',
    publisher: '민음사',
    title: '노르웨이의 숲',
  },
  {
    author: '무라카미 하루키',
    detailUrl: 'https://example.com/books/9788956609952',
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788956609952',
    loanCount: 652,
    publicationYear: '2009',
    publisher: '문학동네',
    title: '1Q84',
  },
  {
    author: '르 코르뷔지에',
    detailUrl: 'https://example.com/books/9788972976519',
    imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788972976519',
    loanCount: 156,
    publicationYear: '2015',
    publisher: '현대건축사',
    title: '건축을 향하여',
  },
  {
    author: '유현준',
    detailUrl: 'https://example.com/books/9791157842728',
    imageUrl: 'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791157842728',
    loanCount: 944,
    publicationYear: '2015',
    publisher: '을유문화사',
    title: '도시는 무엇으로 사는가',
  },
  {
    author: '가스통 바슐라르',
    detailUrl: 'https://example.com/books/9788932471635',
    imageUrl: 'https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788932471635',
    loanCount: 198,
    publicationYear: '2003',
    publisher: '민음사',
    title: '공간의 시학',
  },
  {
    author: '정다은',
    detailUrl: 'https://example.com/books/9791191234567',
    imageUrl: 'https://images.unsplash.com/photo-1516972810927-80185027ca84?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791191234567',
    loanCount: 73,
    publicationYear: '2022',
    publisher: '아키텍스트',
    title: '침묵의 건축',
  },
];

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function matchesBookSearchFixtureItem(item: BookSearchItem, query: BookSearchQuery) {
  if (query.isbn13) {
    return item.isbn13 === query.isbn13;
  }

  if (query.title) {
    return normalizeSearchTerm(item.title).includes(normalizeSearchTerm(query.title));
  }

  if (query.author) {
    return normalizeSearchTerm(item.author).includes(normalizeSearchTerm(query.author));
  }

  return false;
}

function createBookSearchFixtureResponse(query: BookSearchQuery): BookSearchResponse {
  const filteredItems = bookSearchFixtureItems.filter(item => matchesBookSearchFixtureItem(item, query));
  const startIndex = (query.page - 1) * query.pageSize;
  const endIndex = startIndex + query.pageSize;

  return {
    items: filteredItems.slice(startIndex, endIndex),
    totalCount: filteredItems.length,
  };
}

export {createBookSearchFixtureResponse};
