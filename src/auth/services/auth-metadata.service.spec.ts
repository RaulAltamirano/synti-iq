import { Test, type TestingModule } from '@nestjs/testing';
import { AuthMetadataService } from './auth-metadata.service';
import type { Request } from 'express';

describe('AuthMetadataService', () => {
  let service: AuthMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthMetadataService],
    }).compile();

    service = module.get(AuthMetadataService);
  });

  it('returns minimal metadata when request is undefined', () => {
    const meta = service.extractSessionMetadata(undefined);
    expect(meta.lastUsed).toBeInstanceOf(Date);
    expect(meta.deviceInfo).toBeUndefined();
  });

  it('extracts ip from x-forwarded-for and user-agent', () => {
    const req = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Test)',
        'x-forwarded-for': '203.0.113.5, 10.0.0.1',
      },
    } as unknown as Request;

    const meta = service.extractSessionMetadata(req);
    expect(meta.deviceInfo?.ipAddress).toBe('203.0.113.5');
    expect(meta.deviceInfo?.userAgent).toBe('Mozilla/5.0 (Test)');
    expect(meta.deviceInfo?.deviceType).toBe('desktop');
  });
});
