import type { Type } from '@nestjs/common';

export interface ResponseSpec {
  status: number;
  description: string;
  type?: Type<unknown>;
  schema?: Record<string, unknown>;
}

export interface ParamSpec {
  name: string;
  description?: string;
  type?: string;
}

export interface EndpointDocSpec {
  summary: string;
  description?: string;
  operationId?: string;
  responses?: ResponseSpec[];
  body?: Type<unknown>;
  params?: ParamSpec[];
  query?: ParamSpec[];
  cookieAuth?: boolean;
}
