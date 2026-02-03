import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EndpointDocSpec } from './interfaces/endpoint-doc-spec.interface';

export function ApiDoc(docs: Record<string, EndpointDocSpec>, endpointId: string): MethodDecorator {
  const spec = docs[endpointId];

  if (!spec) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[ApiDoc] Endpoint "${endpointId}" not found in docs. Available: ${Object.keys(docs).join(', ')}`,
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

  if (spec.bearerAuth) {
    decorators.push(ApiBearerAuth() as MethodDecorator);
  }

  return applyDecorators(...decorators);
}
