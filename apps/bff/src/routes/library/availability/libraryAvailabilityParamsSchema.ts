import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';
import {z} from 'zod';
import {normalizeOptionalInputString} from '../../shared/schema.js';

const libraryAvailabilityParamsSchema = z.object({
  isbn13: z.preprocess(normalizeOptionalInputString, z.string().regex(/^\d{13}$/)),
  libraryCode: z.preprocess(normalizeOptionalInputString, z.string().regex(/^[A-Za-z0-9]{1,20}$/)),
});

type LibraryAvailabilityParams = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
};

export {libraryAvailabilityParamsSchema};
export type {LibraryAvailabilityParams};
