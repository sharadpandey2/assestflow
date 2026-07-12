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
          eq(allocations.status, 'Active')
        )
      );

    if (existingAllocation.length > 0) {
      throw new ConflictException(
        `Asset ${createAllocationDto.assetId} is already allocated. Please create a transfer request instead.`
      );
    }

    const assigneeType = createAllocationDto.assignedUserId ? 'User' : 'Department';
    const assigneeId = createAllocationDto.assignedUserId || createAllocationDto.assignedDepartmentId;

    if (!assigneeId) {
      throw new ConflictException('Assignee ID is required (either assignedUserId or assignedDepartmentId)');
    }

    // 2. Insert new allocation
    const [newAllocation] = await this.db
      .insert(allocations)
      .values({
        assetId: createAllocationDto.assetId,
        assigneeType,
        assigneeId,
        assignedById: 'emp-1', // Default system admin ID or system-wide default during seed
        expectedReturnDate: createAllocationDto.expectedReturnDate,
        status: 'Active',
        createdAt: new Date(),
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
    // Find current holder
    const [activeAlloc] = await this.db
      .select()
      .from(allocations)
      .where(
        and(
          eq(allocations.assetId, createTransferDto.assetId),
          eq(allocations.status, 'Active')
        )
      );

    if (!activeAlloc) {
      throw new NotFoundException('Asset is not currently allocated. Cannot request a transfer.');
    }

    const [request] = await this.db
      .insert(transferRequests)
      .values({
        assetId: createTransferDto.assetId,
        requesterId: createTransferDto.requestedByUserId,
        currentHolderId: activeAlloc.assigneeId,
        status: 'Requested',
        createdAt: new Date(),
      })
      .returning();
    return request;
  }

  async resolveTransferRequest(id: string, status: 'Approved' | 'Rejected', resolvedByUserId: string) {
    const [req] = await this.db
      .select()
      .from(transferRequests)
      .where(eq(transferRequests.id, id));

    if (!req) {
      throw new NotFoundException('Transfer request not found');
    }

    const [updated] = await this.db
      .update(transferRequests)
      .set({
        status,
        approvedById: resolvedByUserId,
        resolvedAt: new Date(),
      })
      .where(eq(transferRequests.id, id))
      .returning();

    if (status === 'Approved') {
      // 1. Terminate old allocation
      await this.db
        .update(allocations)
        .set({
          status: 'Returned',
          returnedAt: new Date(),
          returnConditionNotes: 'Transferred to another user',
        })
        .where(
          and(
            eq(allocations.assetId, req.assetId),
            eq(allocations.status, 'Active')
          )
        );

      // 2. Create new allocation for requester
      await this.db
        .insert(allocations)
        .values({
          assetId: req.assetId,
          assigneeType: 'User',
          assigneeId: req.requesterId,
          assignedById: resolvedByUserId,
          status: 'Active',
          createdAt: new Date(),
        });
    }

    return updated;
  }
}
