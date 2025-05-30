import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  Get,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CashierScheduleAssignmentService } from './cashier-schedule-assignment.service';
import { CreateAssignmentDto, RequestShiftSwapDto } from './dto/create-assignment.dto';
import { AssignmentFilterDto } from './dto/assignment-filter.dto';
import { PaginatedResponse } from 'src/pagination/interfaces/PaginatedResponse';
import { CashierScheduleAssignment } from './entities/cashier-schedule-assignment.entity';

@Controller('cashier-schedules')
export class CashierScheduleAssignmentController {
  constructor(
    private readonly assignmentService: CashierScheduleAssignmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentService.createTimeBlockAndAssign(createAssignmentDto);
  }

  @Get()
  async findAll(@Query() filters: AssignmentFilterDto): Promise<PaginatedResponse<CashierScheduleAssignment>> {
    return this.assignmentService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CashierScheduleAssignment> {
    return this.assignmentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateAssignmentDto>,
  ): Promise<CashierScheduleAssignment> {
    return this.assignmentService.updateAssignment(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.assignmentService.remove(id);
  }

  @Get('cashiers/:cashierId/schedules')
  async getCashierSchedules(
    @Param('cashierId') cashierId: string,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ): Promise<CashierScheduleAssignment[]> {
    return this.assignmentService.getCashierAssignments(cashierId, startDate, endDate);
  }

  @Post('swap/request')
  @HttpCode(HttpStatus.OK)
  async requestShiftSwap(
    @Body() requestShiftSwapDto: RequestShiftSwapDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.assignmentService.requestShiftSwap(requestShiftSwapDto);
  }

  @Post('swap/:assignmentId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmShiftSwap(
    @Param('assignmentId') assignmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.assignmentService.confirmShiftSwap(assignmentId);
  }
}
