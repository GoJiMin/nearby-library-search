import {create} from 'zustand';
import type {Isbn13} from '@nearby-library-search/contracts';

type BookDetailDialogPayload = {
  detailUrl: string | null;
  isbn13: Isbn13;
};

type BookDetailDialogState = {
  selectedBookDetail: BookDetailDialogPayload | null;
};

type BookDetailDialogActions = {
  closeBookDetailDialog: () => void;
  openBookDetailDialog: (payload: BookDetailDialogPayload) => void;
  resetBookDetailDialog: () => void;
};

type BookDetailDialogStore = BookDetailDialogState & BookDetailDialogActions;

function createInitialState(): BookDetailDialogState {
  return {
    selectedBookDetail: null,
  };
}

const useBookDetailDialogStore = create<BookDetailDialogStore>(set => ({
  ...createInitialState(),
  closeBookDetailDialog: () => {
    set({
      selectedBookDetail: null,
    });
  },
  openBookDetailDialog: payload => {
    set({
      selectedBookDetail: payload,
    });
  },
  resetBookDetailDialog: () => {
    set(createInitialState());
  },
}));

export {useBookDetailDialogStore};
export type {BookDetailDialogActions, BookDetailDialogPayload, BookDetailDialogState, BookDetailDialogStore};
