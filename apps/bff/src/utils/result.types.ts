import type {ErrorResponse} from '@nearby-library-search/contracts';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

export type {Result};
