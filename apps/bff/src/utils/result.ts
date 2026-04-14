import type {Result} from './result.types.js';

function isErrorResult<T>(result: Result<T>): result is Extract<Result<T>, {ok: false}> {
  return result.ok === false;
}

export {isErrorResult};
