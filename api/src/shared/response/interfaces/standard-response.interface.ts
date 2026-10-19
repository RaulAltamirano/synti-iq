export interface ResponseMeta {
  requestId: string;
  traceId?: string;
  spanId?: string;
  timestamp: string;
  path: string;
  statusCode: number;
}

export interface StandardResponse<T = any> {
  status: 'success';
  data: T;
  meta: ResponseMeta;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  code: string;
  data: null;
  errors?: Array<{
    field?: string;
    code?: string;
    message: string;
  }>;
  meta: ResponseMeta;
}

export function isStandardResponse<T>(response: any): response is StandardResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    response.status === 'success' &&
    'data' in response &&
    'meta' in response &&
    typeof response.meta === 'object' &&
    'requestId' in response.meta
  );
}

export function isErrorResponse(response: any): response is ErrorResponse {
  return (
    response &&
    typeof response === 'object' &&
    response.status === 'error' &&
    'message' in response &&
    'code' in response &&
    'meta' in response
  );
}
