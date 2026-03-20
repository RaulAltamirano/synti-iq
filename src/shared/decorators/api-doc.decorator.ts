import { applyDecorators, Logger } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { EndpointDocSpec } from './interfaces/endpoint-doc-spec.interface';

export function ApiDoc(docs: Record<string, EndpointDocSpec>, endpointId: string): MethodDecorator {
  const spec = docs[endpointId];

  if (!spec) {
    if (process.env.NODE_ENV !== 'production') {
      Logger.warn(
        `[ApiDoc] Endpoint "${endpointId}" not found in docs. Available: ${Object.keys(docs).join(', ')}`,
        'ApiDoc',
      );
    }
    return applyDecorators();
  }

  const decorators: MethodDecorator[] = [ApiOperation({ summary: spec.summary })];

  if (spec.responses?.length) {
    for (const res of spec.responses) {
      decorators.push(
        ApiResponse({
          status: res.status,
          description: res.description,
          ...(res.type && { type: res.type }),
          ...(res.schema && { schema: res.schema }),
        }) as MethodDecorator,
      );
    }
  }

  if (spec.body) {
    decorators.push(ApiBody({ type: spec.body }) as MethodDecorator);
  }

  if (spec.params?.length) {
    for (const param of spec.params) {
      decorators.push(
        ApiParam({
          name: param.name,
          description: param.description,
          type: param.type,
        }) as MethodDecorator,
      );
    }
  }

  if (spec.query?.length) {
    for (const q of spec.query) {
      decorators.push(
        ApiQuery({
          name: q.name,
          description: q.description,
          type: q.type,
        }) as MethodDecorator,
      );
    }
  }

  if (spec.cookieAuth) {
    decorators.push(ApiCookieAuth('access_token') as MethodDecorator);
  }

  return applyDecorators(...decorators);
}
