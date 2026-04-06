import {parseSearchBooksParams, type BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from './useBookSearchStart';

type BookSearchResultUrlState = {
  params: BookSearchParams;
  queryText: string;
  searchMode: BookSearchMode;
};

function normalizeSearchQueryParam(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function normalizeSearchPageParam(value: string | null) {
  if (value === null) {
    return undefined;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isInteger(parsedValue) && parsedValue >= 1 ? parsedValue : undefined;
}

function readBookSearchResultUrlState(searchParams: URLSearchParams): BookSearchResultUrlState | null {
  const title = normalizeSearchQueryParam(searchParams.get('title'));
  const author = normalizeSearchQueryParam(searchParams.get('author'));

  if ((title && author) || (!title && !author)) {
    return null;
  }

  try {
    const params = parseSearchBooksParams(
      title
        ? {
            page: normalizeSearchPageParam(searchParams.get('page')),
            title,
          }
        : {
            author,
            page: normalizeSearchPageParam(searchParams.get('page')),
          },
    );

    if (title) {
      return {
        params,
        queryText: title,
        searchMode: 'title',
      };
    }

    if (author) {
      return {
        params,
        queryText: author,
        searchMode: 'author',
      };
    }

    return null;
  } catch {
    return null;
  }
}

export {readBookSearchResultUrlState};
export type {BookSearchResultUrlState};
