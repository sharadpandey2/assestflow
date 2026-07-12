import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, CreateTransferRequestDto } from './dto/create-allocation.dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

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
    return this.allocationsService.resolveTransferRequest(id, status, resolvedByUserId);
  }
}
