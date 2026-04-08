type BookDetailActionPayload = {
  isbn13: string;
};

type BookSelectionActionPayload = {
  isbn13: string;
  title: string;
  author: string;
};

export type {BookDetailActionPayload, BookSelectionActionPayload};
