import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { allocations, assets, transferRequests } from '@asset-flow/database';
import { eq, and, isNull } from 'drizzle-orm';
import { CreateAllocationDto, CreateTransferRequestDto } from './dto/create-allocation.dto';

@Injectable()
export class AllocationsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async allocateAsset(createAllocationDto: CreateAllocationDto) {
    // 1. Conflict Rule: Check if asset is already allocated and not returned
    const existingAllocation = await this.db
      .select()
      .from(allocations)
      .where(
        and(
          eq(allocations.assetId, createAllocationDto.assetId),
          isNull(allocations.actualReturnDate)
        )
      );

    if (existingAllocation.length > 0) {
      throw new ConflictException(
        `Asset ${createAllocationDto.assetId} is already allocated. Please create a transfer request instead.`
      );
    }

    // 2. Insert new allocation
    const [newAllocation] = await this.db
      .insert(allocations)
      .values({
        ...createAllocationDto,
        allocationDate: new Date(),
      })
      .returning();

    // 3. Update asset status to 'Allocated'
    await this.db
      .update(assets)
      .set({ status: 'Allocated' })
      .where(eq(assets.id, createAllocationDto.assetId));

    return newAllocation;
  }

  async createTransferRequest(createTransferDto: CreateTransferRequestDto) {
    const [request] = await this.db
      .insert(transferRequests)
      .values({
        ...createTransferDto,
        status: 'Requested',
        requestDate: new Date(),
      })
      .returning();
    return request;
  }

  async resolveTransferRequest(id: string, status: 'Approved' | 'Rejected', resolvedByUserId: string) {
    const [updated] = await this.db
      .update(transferRequests)
      .set({
        status,
        resolvedByUserId,
        resolvedDate: new Date(),
      })
      .where(eq(transferRequests.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Transfer request not found');
    return updated;
  }
}
