import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import {
  CreateAllocationDto,
  CreateTransferRequestDto,
} from './dto/create-allocation.dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Get()
  getAllocations() {
    return this.allocationsService.getAllocations();
  }

  @Patch(':id')
  updateAllocation(@Param('id') id: string, @Body() data: any) {
    return this.allocationsService.updateAllocation(id, data);
  }


  @Post()
  allocateAsset(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationsService.allocateAsset(createAllocationDto);
  }

  @Post('transfer')
  createTransferRequest(@Body() createTransferDto: CreateTransferRequestDto) {
    return this.allocationsService.createTransferRequest(createTransferDto);
  }

  @Patch('transfer/:id')
  resolveTransferRequest(
    @Param('id') id: string,
    @Body('status') status: 'Approved' | 'Rejected',
    @Body('resolvedByUserId') resolvedByUserId: string,
  ) {
    return this.allocationsService.resolveTransferRequest(
      id,
      status,
      resolvedByUserId,
    );
  }
}
