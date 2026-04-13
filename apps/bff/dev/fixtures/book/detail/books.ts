import type {Isbn13} from '@nearby-library-search/contracts';

type BookDetailFixtureBookSeed = {
  author: string;
  imageUrl: string | null;
  isbn13: Isbn13;
  loanCount: number | null;
  publicationYear: string | null;
  publisher: string | null;
  title: string;
};

const bookDetailFixtureBooks: ReadonlyArray<BookDetailFixtureBookSeed> = [
  {
    author: '이민진',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788954682155',
    loanCount: 1240,
    publicationYear: '2018',
    publisher: '문학사상',
    title: '파친코',
  },
  {
    author: '손원평',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791196447182',
    loanCount: 842,
    publicationYear: '2017',
    publisher: '창비',
    title: '아몬드',
  },
  {
    author: '한강',
    imageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=320&q=80',
    isbn13: '9788936434124',
    loanCount: 915,
    publicationYear: '2007',
    publisher: '창비',
    title: '채식주의자',
  },
  {
    author: '프리다 맥파든',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=320&q=80',
    isbn13: '9791192389479',
    loanCount: 311,
    publicationYear: '2023',
    publisher: '북플라자',
    title: '하우스메이드',
  },
];

export {bookDetailFixtureBooks};
export type {BookDetailFixtureBookSeed};
