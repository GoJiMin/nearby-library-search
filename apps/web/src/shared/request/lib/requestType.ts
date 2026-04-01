type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestHeaders = Record<string, string>;

type RequestJsonBody = Record<string, unknown>;

type RequestBody = FormData | RequestJsonBody | null;

type RequestQueryValue = string | number | boolean | null | undefined;

type RequestQueryParams = Record<string, RequestQueryValue>;

type RequestResponseOption = {
  withResponse?: boolean;
};

type RequestInitWithMethod = Omit<RequestInit, 'body' | 'headers' | 'method'> & {
  body?: BodyInit | null;
  headers?: HeadersInit;
  method: RequestMethod;
};

type CreateRequestInitProps = {
  body?: RequestBody;
  headers?: RequestHeaders;
  method: RequestMethod;
};

type RequestProps = RequestResponseOption & {
  baseUrl?: string;
  body?: RequestBody;
  endpoint: string;
  headers?: RequestHeaders;
  method: RequestMethod;
  queryParams?: RequestQueryParams;
};

type RequestMethodProps = Omit<RequestProps, 'method'>;

type RequestErrorHandling = 'errorBoundary' | 'toast';

type RequestErrorInfo = {
  detail: string;
  status: number;
  title: string;
};

type WithErrorHandling<P = object> = P & {
  errorHandlingType?: RequestErrorHandling;
};

type CreateRequestErrorProps = WithErrorHandling<{
  body: RequestBody;
  requestInit: RequestInitWithMethod;
  response: Response;
}>;

export type {
  CreateRequestErrorProps,
  CreateRequestInitProps,
  RequestBody,
  RequestErrorHandling,
  RequestErrorInfo,
  RequestHeaders,
  RequestInitWithMethod,
  RequestJsonBody,
  RequestMethod,
  RequestMethodProps,
  RequestProps,
  RequestQueryParams,
  RequestQueryValue,
  RequestResponseOption,
  WithErrorHandling,
};
