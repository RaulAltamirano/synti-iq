import { Test, TestingModule } from '@nestjs/testing';
import { TimeBlockTemplateService } from './time-block-template.service';

describe('TimeBlockTemplateService', () => {
  let service: TimeBlockTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeBlockTemplateService],
    }).compile();

    service = module.get<TimeBlockTemplateService>(TimeBlockTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
