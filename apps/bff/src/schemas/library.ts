import type {DetailRegionCode, Isbn, Isbn13, LibraryCode, RegionCode} from '@nearby-library-search/contracts';
import {z} from 'zod';
import {createPositiveIntegerQuerySchema, normalizeOptionalQueryString} from './query.js';

const DEFAULT_LIBRARY_SEARCH_PAGE = 1;
const DEFAULT_LIBRARY_SEARCH_PAGE_SIZE = 10;
const MAX_LIBRARY_SEARCH_PAGE_SIZE = 20;

const librarySearchQuerySchema = z
  .object({
    detailRegion: z.preprocess(
      normalizeOptionalQueryString,
      z
        .string()
        .regex(/^\d{5}$/)
        .optional(),
    ),
    isbn: z.preprocess(normalizeOptionalQueryString, z.string().regex(/^\d{13}$/)),
    page: createPositiveIntegerQuerySchema(DEFAULT_LIBRARY_SEARCH_PAGE),
    pageSize: createPositiveIntegerQuerySchema(DEFAULT_LIBRARY_SEARCH_PAGE_SIZE, MAX_LIBRARY_SEARCH_PAGE_SIZE),
    region: z.preprocess(normalizeOptionalQueryString, z.string().regex(/^\d{2}$/)),
  })
  .refine(({region, detailRegion}) => detailRegion === undefined || detailRegion.startsWith(region), {
    message: 'detailRegion은 선택한 region 코드에 속해야 합니다.',
    path: ['detailRegion'],
  });

const libraryAvailabilityParamsSchema = z.object({
  isbn13: z.preprocess(normalizeOptionalQueryString, z.string().regex(/^\d{13}$/)),
  libraryCode: z.preprocess(normalizeOptionalQueryString, z.string().regex(/^[A-Za-z0-9]{1,20}$/)),
});

type LibrarySearchQuery = z.infer<typeof librarySearchQuerySchema> & {
  detailRegion?: DetailRegionCode;
  isbn: Isbn;
  region: RegionCode;
};
type LibraryAvailabilityParams = z.infer<typeof libraryAvailabilityParamsSchema> & {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
};

export {
  DEFAULT_LIBRARY_SEARCH_PAGE,
  DEFAULT_LIBRARY_SEARCH_PAGE_SIZE,
  libraryAvailabilityParamsSchema,
  librarySearchQuerySchema,
  MAX_LIBRARY_SEARCH_PAGE_SIZE,
};
export type {LibraryAvailabilityParams, LibrarySearchQuery};
