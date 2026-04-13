import type {
  BookDetailResponse,
  BookSearchResponse,
  ErrorResponse,
  LibraryAvailabilityResponse,
  LibrarySearchResponse,
} from '@nearby-library-search/contracts';
import type {BookDetailParams, BookSearchQuery} from '../schemas/book.js';
import type {LibraryAvailabilityParams, LibrarySearchQuery} from '../schemas/library.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

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
