import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { auditCycles, auditRecords, assets } from '@asset-flow/database';
import { eq, inArray, and } from 'drizzle-orm';
import { CreateAuditCycleDto, CreateAuditRecordDto } from './dto/create-audit.dto';

@Injectable()
export class AuditsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async createCycle(createAuditCycleDto: CreateAuditCycleDto) {
    const [cycle] = await this.db
      .insert(auditCycles)
      .values({
        ...createAuditCycleDto,
        startDate: new Date(createAuditCycleDto.startDate),
        endDate: new Date(createAuditCycleDto.endDate),
        status: 'Planned',
      })
      .returning();
    return cycle;
  }

  async addRecord(createAuditRecordDto: CreateAuditRecordDto) {
    const [record] = await this.db
      .insert(auditRecords)
      .values({
        ...createAuditRecordDto,
        scannedAt: new Date(),
      })
      .returning();
    return record;
  }

  async closeCycle(id: string) {
    // 1. Mark cycle as closed
    const [updatedCycle] = await this.db
      .update(auditCycles)
      .set({ status: 'Completed', updatedAt: new Date() })
      .where(eq(auditCycles.id, id))
      .returning();

    if (!updatedCycle) throw new NotFoundException('Audit cycle not found');

    // 2. Discrepancy rule: Find all missing assets in this cycle
    const missingRecords = await this.db
      .select()
      .from(auditRecords)
      .where(and(eq(auditRecords.auditId, id), eq(auditRecords.status, 'Missing')));

    // 3. Update those assets to 'Lost'
    if (missingRecords.length > 0) {
      const missingAssetIds = missingRecords.map((r: any) => r.assetId);
      await this.db
        .update(assets)
        .set({ status: 'Lost' })
        .where(inArray(assets.id, missingAssetIds));
    }

    return { message: 'Audit cycle closed and missing assets marked as Lost.', updatedCycle };
  }
}
