import {parseSearchBooksParams, type BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from './bookSearchStart';

type CreateBookSearchStartParamsProps = {
  queryText: string;
  searchMode: BookSearchMode;
};

function createBookSearchStartParams({
  queryText,
  searchMode,
}: CreateBookSearchStartParamsProps): BookSearchParams {
  const normalizedQuery = queryText.trim();

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
