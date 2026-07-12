import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { maintenanceRequests, assets } from '@asset-flow/database';
import { eq } from 'drizzle-orm';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const [request] = await this.db
      .insert(maintenanceRequests)
      .values({
        ...createMaintenanceDto,
        status: 'Pending',
        requestDate: new Date(),
      })
      .returning();

    return request;
  }

  async updateStatus(
    id: string,
    status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled',
    resolvedByUserId: string,
  ) {
    const [updatedRequest] = await this.db
      .update(maintenanceRequests)
      .set({
        status,
        resolvedDate: ['Completed', 'Cancelled', 'Rejected'].includes(status) ? new Date() : undefined,
      })
      .where(eq(maintenanceRequests.id, id))
      .returning();

    if (!updatedRequest) throw new NotFoundException('Maintenance request not found');

    // Business Logic: Auto-update Asset Status based on Maintenance Workflow
    if (status === 'Approved' || status === 'In Progress') {
      await this.db.update(assets).set({ status: 'Under Maintenance' }).where(eq(assets.id, updatedRequest.assetId));
    } else if (status === 'Completed') {
      await this.db.update(assets).set({ status: 'Available' }).where(eq(assets.id, updatedRequest.assetId));
    }

    return updatedRequest;
  }

  async findAll() {
    return this.db.select().from(maintenanceRequests);
  }
}
