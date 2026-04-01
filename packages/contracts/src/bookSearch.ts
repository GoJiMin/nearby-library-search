import type {Isbn13} from './identifiers.js';

export type BookSearchItem = {
  title: string;
  author: string;
  publisher: string | null;
  publicationYear: string | null;
  isbn13: Isbn13;
  imageUrl: string | null;
  detailUrl: string | null;
  loanCount: number | null;
};

export type BookSearchResponse = {
  totalCount: number;
  items: BookSearchItem[];
};
