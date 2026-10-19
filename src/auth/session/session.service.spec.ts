import { Test, type TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { UserSessionService } from 'src/user-session/user-session.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import { createMockObservabilityService } from 'src/auth/__tests__/mocks';

describe('SessionService', () => {
  let service: SessionService;
  const userSessionService = {
    getActiveSessions: jest.fn(),
    invalidateSession: jest.fn(),
    invalidateAllSessions: jest.fn(),
    validateSessionOwnership: jest.fn(),
    updateSessionLastUsed: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: UserSessionService, useValue: userSessionService },
        { provide: ObservabilityService, useValue: createMockObservabilityService() },
      ],
    }).compile();

    service = module.get(SessionService);
  });

  it('delegates listActive to UserSessionService.getActiveSessions', async () => {
    const filters = { page: 1, limit: 10 };
    const paginated = { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    userSessionService.getActiveSessions.mockResolvedValue(paginated);

    await expect(service.listActive('user-1', filters)).resolves.toBe(paginated);
    expect(userSessionService.getActiveSessions).toHaveBeenCalledWith('user-1', filters);
  });

  it('delegates invalidateOne to UserSessionService.invalidateSession', async () => {
    await service.invalidateOne('user-1', 'sid-1');
    expect(userSessionService.invalidateSession).toHaveBeenCalledWith('user-1', 'sid-1');
  });

  it('delegates invalidateAll to UserSessionService.invalidateAllSessions', async () => {
    await service.invalidateAll('user-1');
    expect(userSessionService.invalidateAllSessions).toHaveBeenCalledWith('user-1');
  });

  it('delegates validateSessionOwnership to UserSessionService', async () => {
    userSessionService.validateSessionOwnership.mockResolvedValue(true);
    await expect(service.validateSessionOwnership('u1', 's1')).resolves.toBe(true);
    expect(userSessionService.validateSessionOwnership).toHaveBeenCalledWith('u1', 's1');
  });

  it('delegates updateSessionLastUsed to UserSessionService', async () => {
    await service.updateSessionLastUsed('u1', 's1');
    expect(userSessionService.updateSessionLastUsed).toHaveBeenCalledWith('u1', 's1');
  });
});
