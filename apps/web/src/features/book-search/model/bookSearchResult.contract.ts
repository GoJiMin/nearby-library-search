import type {Isbn13} from '@nearby-library-search/contracts';

type BookSelectionActionPayload = {
  isbn13: Isbn13;
  title: string;
  author: string;
};

export type {BookSelectionActionPayload};
