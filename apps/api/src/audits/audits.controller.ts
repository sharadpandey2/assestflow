import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AuditsService } from './audits.service';
import {
  CreateAuditCycleDto,
  CreateAuditRecordDto,
} from './dto/create-audit.dto';

@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  createCycle(@Body() createAuditCycleDto: CreateAuditCycleDto) {
    return this.auditsService.createCycle(createAuditCycleDto);
  }

  @Post('records')
  addRecord(@Body() createAuditRecordDto: CreateAuditRecordDto) {
    return this.auditsService.addRecord(createAuditRecordDto);
  }

  @Patch(':id/close')
  closeCycle(@Param('id') id: string) {
    return this.auditsService.closeCycle(id);
  }
}
