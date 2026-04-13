import {z} from 'zod';
import {normalizeOptionalInputString} from '../../shared/schema.js';

const bookDetailParamsSchema = z.object({
  isbn13: z.preprocess(normalizeOptionalInputString, z.string().regex(/^\d{13}$/)),
});

type BookDetailParams = z.infer<typeof bookDetailParamsSchema>;

export {bookDetailParamsSchema};
export type {BookDetailParams};
