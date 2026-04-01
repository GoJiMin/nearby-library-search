import type {RequestBody, RequestErrorHandling, RequestMethod} from './requestType';

type RequestErrorOptions = {
  endpoint: string;
  message: string;
  method: RequestMethod;
  name: string;
  requestBody: RequestBody;
  status: number;
};

type RequestGetErrorOptions = RequestErrorOptions & {
  errorHandlingType?: RequestErrorHandling;
};

class RequestError extends Error {
  endpoint;
  method;
  requestBody;
  status;

  constructor({name, message, status, endpoint, method, requestBody}: RequestErrorOptions) {
    super(message);

    this.name = name;
    this.status = status;
    this.endpoint = endpoint;
    this.method = method;
    this.requestBody = requestBody;
  }
}

class RequestGetError extends RequestError {
  errorHandlingType;

  constructor({errorHandlingType = 'errorBoundary', ...rest}: RequestGetErrorOptions) {
    super(rest);

    this.errorHandlingType = errorHandlingType;
  }
}

export {RequestError, RequestGetError};
export type {RequestErrorOptions, RequestGetErrorOptions};
