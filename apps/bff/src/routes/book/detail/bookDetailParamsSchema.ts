import type {Isbn13} from '@nearby-library-search/contracts';
import {z} from 'zod';
import {normalizeOptionalInputString} from '../../shared/schema.js';

const bookDetailParamsSchema = z.object({
  isbn13: z.preprocess(normalizeOptionalInputString, z.string().regex(/^\d{13}$/)),
});

type BookDetailParams = {
  isbn13: Isbn13;
};

export {bookDetailParamsSchema};
export type {BookDetailParams};
