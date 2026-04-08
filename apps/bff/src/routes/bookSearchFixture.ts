import type {BookSearchItem, BookSearchResponse} from '@nearby-library-search/contracts';
import type {BookSearchQuery} from '../schemas/book.js';
import {bookSearchFixtureItems} from './bookSearchFixture.data.js';

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function matchesBookSearchFixtureItem(item: BookSearchItem, query: BookSearchQuery) {
  if (query.isbn13) {
    return item.isbn13 === query.isbn13;
  }

  if (query.title) {
    return normalizeSearchTerm(item.title).includes(normalizeSearchTerm(query.title));
  }

  if (query.author) {
    return normalizeSearchTerm(item.author).includes(normalizeSearchTerm(query.author));
  }

  return false;
}

function createBookSearchFixtureResponse(query: BookSearchQuery): BookSearchResponse {
  const filteredItems = bookSearchFixtureItems.filter(item => matchesBookSearchFixtureItem(item, query));
  const startIndex = (query.page - 1) * query.pageSize;
  const endIndex = startIndex + query.pageSize;

  return {
    items: filteredItems.slice(startIndex, endIndex),
    totalCount: filteredItems.length,
  };
}

export {createBookSearchFixtureResponse};
