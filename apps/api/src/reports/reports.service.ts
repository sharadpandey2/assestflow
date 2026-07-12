import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { assets, maintenanceRequests } from '@asset-flow/database';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async getDashboardKPIs() {
    // Total Assets
    const [{ count: totalAssets }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(assets);

    // Available Assets
    const [{ count: availableAssets }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(eq(assets.status, 'Available'));

    // Allocated Assets
    const [{ count: allocatedAssets }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(eq(assets.status, 'Allocated'));

    // Active Maintenance
    const [{ count: activeMaintenance }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(maintenanceRequests)
      .where(
        sql`${maintenanceRequests.status} IN ('Pending', 'Approved', 'In Progress')`,
      );

    return {
      totalAssets: Number(totalAssets),
      availableAssets: Number(availableAssets),
      allocatedAssets: Number(allocatedAssets),
      activeMaintenance: Number(activeMaintenance),
    };
  }
}
