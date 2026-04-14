import {parseSearchBooksParams, type BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from './bookSearchStart.contract';

type CreateBookSearchStartParamsProps = {
  normalizedQuery: string;
  searchMode: BookSearchMode;
};

function createBookSearchStartParams({
  normalizedQuery,
  searchMode,
}: CreateBookSearchStartParamsProps): BookSearchParams {
  return parseSearchBooksParams(
    searchMode === 'title'
      ? {
          page: 1,
          title: normalizedQuery,
        }
      : {
          author: normalizedQuery,
          page: 1,
        },
  );
}

export {createBookSearchStartParams};
export type {CreateBookSearchStartParamsProps};
