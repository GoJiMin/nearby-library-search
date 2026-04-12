import type {DetailRegionCode, Isbn, Isbn13, LibraryCode, RegionCode} from '@nearby-library-search/contracts';
import {z} from 'zod';
import {createPositiveIntegerSchema, normalizeOptionalString} from '@/shared/validation';

const DEFAULT_SEARCH_LIBRARIES_PAGE = 1;
const LIBRARY_SEARCH_PAGE_SIZE = 10;

type LibrarySearchParams = {
  detailRegion?: DetailRegionCode;
  isbn: Isbn;
  page: number;
  region: RegionCode;
};

type LibraryAvailabilityParams = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
};

const searchLibrariesParamsSchema = z
  .object({
    detailRegion: z.preprocess(
      normalizeOptionalString,
      z
        .string()
        .regex(/^\d{5}$/)
        .optional(),
    ),
    isbn: z.preprocess(normalizeOptionalString, z.string().regex(/^\d{13}$/)),
    page: createPositiveIntegerSchema(DEFAULT_SEARCH_LIBRARIES_PAGE),
    region: z.preprocess(normalizeOptionalString, z.string().regex(/^\d{2}$/)),
  })
  .refine(({detailRegion, region}) => detailRegion === undefined || detailRegion.startsWith(region), {
    message: 'detailRegion은 선택한 region 코드에 속해야 합니다.',
    path: ['detailRegion'],
  });

function parseSearchLibrariesParams(params: unknown): LibrarySearchParams {
  return searchLibrariesParamsSchema.parse(params);
}

export {LIBRARY_SEARCH_PAGE_SIZE, parseSearchLibrariesParams, searchLibrariesParamsSchema};
export type {LibraryAvailabilityParams, LibrarySearchParams};
