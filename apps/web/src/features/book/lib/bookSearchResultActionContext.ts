import {createContext, useContext} from 'react';
import type {BookDetailActionPayload, BookSelectionActionPayload} from '../model/bookSearchResult.contract';

type BookSearchResultActionContextValue = {
  onOpenBookDetail?: (payload: BookDetailActionPayload) => void;
  onSelectBook?: (payload: BookSelectionActionPayload) => void;
};

const BookSearchResultActionContext = createContext<BookSearchResultActionContextValue | null>(null);

function useBookSearchResultActions() {
  return useContext(BookSearchResultActionContext) ?? {};
}

export {BookSearchResultActionContext, useBookSearchResultActions};
export type {BookSearchResultActionContextValue};
