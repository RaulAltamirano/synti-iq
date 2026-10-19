import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import type { ObservabilityService } from '../observability/observability.service';

describe('GlobalExceptionFilter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('records HTTP metrics with elapsed duration when metricsStartTimeMs is set', () => {
    const recordHttpRequest = jest.fn();
    const observability = {
      recordHttpRequest,
      getTraceContext: jest.fn().mockReturnValue({}),
    } as unknown as ObservabilityService;

    const filter = new GlobalExceptionFilter(observability);

    const start = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValueOnce(start + 42);

    const request = {
      method: 'GET',
      path: '/api/test',
      url: '/api/test',
      route: undefined,
      metricsStartTimeMs: start,
    };

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    };

    filter.catch(new HttpException('Bad Request', HttpStatus.BAD_REQUEST), host as never);

    expect(recordHttpRequest).toHaveBeenCalledWith('GET', '/api/test', HttpStatus.BAD_REQUEST, 42);
  });

  it('records zero duration when metricsStartTimeMs is missing', () => {
    const recordHttpRequest = jest.fn();
    const observability = {
      recordHttpRequest,
      getTraceContext: jest.fn().mockReturnValue({}),
    } as unknown as ObservabilityService;

    const filter = new GlobalExceptionFilter(observability);

    jest.spyOn(Date, 'now').mockReturnValue(9_999_999);

    const request = {
      method: 'POST',
      path: '/x',
      url: '/x',
      route: undefined,
    };

    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    };

    filter.catch(new HttpException('Nope', HttpStatus.NOT_FOUND), host as never);

    expect(recordHttpRequest).toHaveBeenCalledWith('POST', '/x', HttpStatus.NOT_FOUND, 0);
  });
});
