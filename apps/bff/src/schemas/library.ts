import type {DetailRegionCode, Isbn, RegionCode} from '@nearby-library-search/contracts';
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

type LibrarySearchQuery = z.infer<typeof librarySearchQuerySchema> & {
  detailRegion?: DetailRegionCode;
  isbn: Isbn;
  region: RegionCode;
};

export {
  DEFAULT_LIBRARY_SEARCH_PAGE,
  DEFAULT_LIBRARY_SEARCH_PAGE_SIZE,
  librarySearchQuerySchema,
  MAX_LIBRARY_SEARCH_PAGE_SIZE,
};
export type {LibrarySearchQuery};
