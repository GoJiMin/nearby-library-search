import type {
  BookDetailResponse,
  BookSearchResponse,
  LibraryAvailabilityResponse,
  LibrarySearchResponse,
} from '@nearby-library-search/contracts';
import type {BookDetailParams} from '../routes/book/detail/bookDetailParamsSchema.js';
import type {BookSearchQuery} from '../routes/book/search/bookSearchQuerySchema.js';
import type {LibraryAvailabilityParams} from '../routes/library/availability/libraryAvailabilityParamsSchema.js';
import type {LibrarySearchQuery} from '../routes/library/search/librarySearchQuerySchema.js';
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
