import {ZodError} from 'zod';
import {parseSearchBooksParams, type BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from './useBookSearchStart';

type RecoveryUiHint = 'silent' | 'inline' | 'toast' | 'redirect';

type RecoverableResult<TData, TReason extends string = string> =
  | {data: TData; kind: 'ok'}
  | {kind: 'empty'}
  | {
      defaultUiHint: RecoveryUiHint;
      kind: 'recoverable';
      message?: string;
      reason: TReason;
    };

type BookSearchResultUrlState = {
  params: BookSearchParams;
  queryText: string;
  searchMode: BookSearchMode;
};

type BookSearchResultUrlStateReason = 'invalid-search-params' | 'multiple-query-types';

type BookSearchResultUrlStateResult = RecoverableResult<BookSearchResultUrlState, BookSearchResultUrlStateReason>;

const INVALID_BOOK_SEARCH_RESULT_URL_MESSAGE = '잘못된 검색 주소입니다. 검색어를 다시 입력해주세요.';

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

function createRecoverableBookSearchResultUrlState(reason: BookSearchResultUrlStateReason): BookSearchResultUrlStateResult {
  return {
    defaultUiHint: 'inline',
    kind: 'recoverable',
    message: INVALID_BOOK_SEARCH_RESULT_URL_MESSAGE,
    reason,
  };
}

function readBookSearchResultUrlState(searchParams: URLSearchParams): BookSearchResultUrlStateResult {
  const rawTitle = searchParams.get('title');
  const rawAuthor = searchParams.get('author');
  const title = normalizeSearchQueryParam(rawTitle);
  const author = normalizeSearchQueryParam(rawAuthor);

  if (title && author) {
    return createRecoverableBookSearchResultUrlState('multiple-query-types');
  }

  if (!title && !author) {
    return rawTitle !== null || rawAuthor !== null
      ? createRecoverableBookSearchResultUrlState('invalid-search-params')
      : {kind: 'empty'};
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
        data: {
          params,
          queryText: title,
          searchMode: 'title',
        },
        kind: 'ok',
      };
    }

    if (author) {
      return {
        data: {
          params,
          queryText: author,
          searchMode: 'author',
        },
        kind: 'ok',
      };
    }

    return {kind: 'empty'};
  } catch (error) {
    if (error instanceof ZodError) {
      return createRecoverableBookSearchResultUrlState('invalid-search-params');
    }

    throw error;
  }
}

export {readBookSearchResultUrlState};
export type {
  BookSearchResultUrlState,
  BookSearchResultUrlStateReason,
  BookSearchResultUrlStateResult,
  RecoverableResult,
  RecoveryUiHint,
};
