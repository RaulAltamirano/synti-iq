import { Test, TestingModule } from '@nestjs/testing';
import { TimeBlockTemplateController } from './time-block-template.controller';
import { TimeBlockTemplateService } from './time-block-template.service';

describe('TimeBlockTemplateController', () => {
  let controller: TimeBlockTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeBlockTemplateController],
      providers: [TimeBlockTemplateService],
    }).compile();

    controller = module.get<TimeBlockTemplateController>(TimeBlockTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
