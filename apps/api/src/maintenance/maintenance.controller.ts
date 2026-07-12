import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled',
    @Body('resolvedByUserId') resolvedByUserId: string,
  ) {
    return this.maintenanceService.updateStatus(id, status, resolvedByUserId);
  }
}
