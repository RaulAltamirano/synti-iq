import { Test, TestingModule } from '@nestjs/testing';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';
import { TimeBlock } from 'src/time-block/entities/time-block.entity';
import { TimeBlockTemplate } from 'src/time-block-template/entities/time-block-template.entity';
import { Store } from 'src/store/entities/store.entity';
import { StoreSchedule } from 'src/store-schedule/entities/store-schedule.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CashierScheduleAssignmentRepository } from './repositories/cashier-schedule-assignment.repository';
import { AssignmentFactory } from './factories/assignment.factory';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentStatus } from './enums/assignment-status.dto';
import { CreateAssignmentDto, RequestShiftSwapDto } from './dto/create-assignment.dto';

describe('CashierScheduleAssignmentService', () => {
  let service: CashierScheduleAssignmentService;
  let repository: CashierScheduleAssignmentRepository;
  let factory: AssignmentFactory;

  const mockRepository = {
    findById: jest.fn(),
    findByStatusAndId: jest.fn(),
    findOverlappingAssignments: jest.fn(),
    findCashierAssignments: jest.fn(),
    findAllWithFilters: jest.fn(),
    save: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockFactory = {
    createAssignment: jest.fn(),
    createSwapRequest: jest.fn(),
  };

  const mockTimeBlockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockTimeBlockTemplateRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEntityManager = {
    findOne: jest.fn(),
    transaction: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CashierScheduleAssignmentService,
        {
          provide: CashierScheduleAssignmentRepository,
          useValue: mockRepository,
        },
        {
          provide: AssignmentFactory,
          useValue: mockFactory,
        },
        {
          provide: getRepositoryToken(TimeBlock),
          useValue: mockTimeBlockRepository,
        },
        {
          provide: getRepositoryToken(TimeBlockTemplate),
          useValue: mockTimeBlockTemplateRepository,
        },
        {
          provide: 'EntityManager',
          useValue: mockEntityManager,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CashierScheduleAssignmentService>(CashierScheduleAssignmentService);
    repository = module.get<CashierScheduleAssignmentRepository>(CashierScheduleAssignmentRepository);
    factory = module.get<AssignmentFactory>(AssignmentFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTimeBlockAndAssign', () => {
    const mockDto: CreateAssignmentDto = {
      cashierId: 'cashier1',
      storeScheduleId: 'schedule1',
      startTime: new Date('2024-01-01T09:00:00'),
      endTime: new Date('2024-01-01T17:00:00'),
      storeId: 'store1',
    };

    it('should create a time block and assignment successfully', async () => {
      mockRepository.findOverlappingAssignments.mockResolvedValue(0);
      mockTimeBlockTemplateRepository.findOne.mockResolvedValue(null);
      mockTimeBlockTemplateRepository.create.mockReturnValue({ id: 'template1' });
      mockTimeBlockTemplateRepository.save.mockResolvedValue({ id: 'template1' });
      mockEntityManager.findOne.mockResolvedValue({ id: 'schedule1' });
      mockTimeBlockRepository.create.mockReturnValue({ id: 'timeBlock1' });
      mockTimeBlockRepository.save.mockResolvedValue({ id: 'timeBlock1' });
      mockFactory.createAssignment.mockReturnValue({ id: 'assignment1' });
      mockRepository.save.mockResolvedValue({ id: 'assignment1' });

      const result = await service.createTimeBlockAndAssign(mockDto);

      expect(result).toEqual({ id: 'assignment1' });
      expect(mockRepository.findOverlappingAssignments).toHaveBeenCalledWith(
        mockDto.cashierId,
        mockDto.startTime,
        mockDto.endTime,
      );
      expect(mockFactory.createAssignment).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if cashier is not available', async () => {
      mockRepository.findOverlappingAssignments.mockResolvedValue(1);

      await expect(service.createTimeBlockAndAssign(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('requestShiftSwap', () => {
    const mockDto: RequestShiftSwapDto = {
      assignmentId: 'assignment1',
      requestedCashierId: 'cashier2',
    };

    it('should request shift swap successfully', async () => {
      const mockAssignment = {
        id: 'assignment1',
        status: AssignmentStatus.SCHEDULED,
        actualStartTime: new Date('2024-01-01T09:00:00'),
        actualEndTime: new Date('2024-01-01T17:00:00'),
      };

      mockRepository.findById.mockResolvedValue(mockAssignment);
      mockRepository.findOverlappingAssignments.mockResolvedValue(0);
      mockFactory.createSwapRequest.mockReturnValue({
        ...mockAssignment,
        status: AssignmentStatus.SWAP_REQUESTED,
        swapRequestedWithId: mockDto.requestedCashierId,
      });
      mockRepository.save.mockResolvedValue({ id: 'assignment1' });

      const result = await service.requestShiftSwap(mockDto);

      expect(result).toEqual({
        success: true,
        message: 'Shift swap request sent successfully',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(mockDto.assignmentId);
      expect(mockFactory.createSwapRequest).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should return error if assignment does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.requestShiftSwap(mockDto);

      expect(result).toEqual({
        success: false,
        message: 'Original assignment does not exist',
      });
    });
  });

  describe('confirmShiftSwap', () => {
    it('should confirm shift swap successfully', async () => {
      const mockAssignment = {
        id: 'assignment1',
        status: AssignmentStatus.SWAP_REQUESTED,
        swapRequestedWithId: 'cashier2',
        cashierId: 'cashier1',
        actualStartTime: new Date('2024-01-01T09:00:00'),
        actualEndTime: new Date('2024-01-01T17:00:00'),
      };

      mockRepository.findByStatusAndId.mockResolvedValue(mockAssignment);
      mockRepository.findOverlappingAssignments.mockResolvedValue(0);
      mockRepository.updateStatus.mockResolvedValue(undefined);

      const result = await service.confirmShiftSwap('assignment1');

      expect(result).toEqual({
        success: true,
        message: 'Shift swap completed successfully',
      });
      expect(mockRepository.findByStatusAndId).toHaveBeenCalledWith(
        'assignment1',
        AssignmentStatus.SWAP_REQUESTED,
      );
      expect(mockRepository.updateStatus).toHaveBeenCalled();
    });

    it('should return error if swap request not found', async () => {
      mockRepository.findByStatusAndId.mockResolvedValue(null);

      const result = await service.confirmShiftSwap('assignment1');

      expect(result).toEqual({
        success: false,
        message: 'Swap request not found or not in SWAP_REQUESTED status',
      });
    });
  });
});
