import type {Isbn13} from '@nearby-library-search/contracts';

type BookDetailActionPayload = {
  detailUrl: string | null;
  isbn13: Isbn13;
};

type BookSelectionActionPayload = {
  isbn13: Isbn13;
  title: string;
  author: string;
};

export type {BookDetailActionPayload, BookSelectionActionPayload};
