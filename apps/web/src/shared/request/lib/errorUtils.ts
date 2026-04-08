import {COMMON_REQUEST_ERROR_MESSAGE, DEFAULT_SERVER_ERROR_MESSAGE, SERVER_ERROR_MESSAGE_MAP} from './errorMessage';
import {RequestError} from './requestError';

function isRequestError(error: unknown): error is RequestError {
  return error instanceof RequestError;
}

function isServerRequestError(error: unknown): error is RequestError {
  return isRequestError(error) && error.status >= 500;
}

function getServerErrorDisplayMessage(error: unknown) {
  if (!isServerRequestError(error)) {
    return COMMON_REQUEST_ERROR_MESSAGE;
  }

  return SERVER_ERROR_MESSAGE_MAP[error.name as keyof typeof SERVER_ERROR_MESSAGE_MAP] ?? DEFAULT_SERVER_ERROR_MESSAGE;
}

export {getServerErrorDisplayMessage, isRequestError, isServerRequestError};
