import { Type } from '@nestjs/common';

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
  responses?: ResponseSpec[];
  body?: Type<unknown>;
  params?: ParamSpec[];
  query?: ParamSpec[];
  bearerAuth?: boolean;
}
