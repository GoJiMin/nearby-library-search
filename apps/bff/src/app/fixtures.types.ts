import type {
  BookDetailResponse,
  BookSearchResponse,
  LibraryAvailabilityResponse,
  LibrarySearchResponse,
} from '@nearby-library-search/contracts';
import type {BookDetailParams, BookSearchQuery} from '../schemas/book.js';
import type {LibraryAvailabilityParams, LibrarySearchQuery} from '../schemas/library.js';
import type {Result} from '../utils/result.types.js';

type FixtureResolver<TInput, TOutput> = {
  resolve(input: TInput): Result<TOutput>;
};

type AppFixtures = {
  bookDetail?: FixtureResolver<BookDetailParams, BookDetailResponse>;
  bookSearch?: FixtureResolver<BookSearchQuery, BookSearchResponse>;
  libraryAvailability?: FixtureResolver<LibraryAvailabilityParams, LibraryAvailabilityResponse>;
  librarySearch?: FixtureResolver<LibrarySearchQuery, LibrarySearchResponse>;
};

type CreateAppOptions = {
  fixtures?: AppFixtures;
};

export type {AppFixtures, CreateAppOptions, FixtureResolver, Result};
