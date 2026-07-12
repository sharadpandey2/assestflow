import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { auditCycles, auditRecords, assets, auditAuditors } from '@asset-flow/database';
import { eq, inArray, and } from 'drizzle-orm';
import {
  CreateAuditCycleDto,
  CreateAuditRecordDto,
} from './dto/create-audit.dto';

@Injectable()
export class AuditsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async getAllCycles() {
    const cycles = await this.db.select().from(auditCycles);
    const records = await this.db.select().from(auditRecords);
    const auditors = await this.db.select().from(auditAuditors);

    return cycles.map((cycle: any) => {
      const cycleAuditors = auditors
        .filter((a: any) => a.auditCycleId === cycle.id)
        .map((a: any) => a.auditorId);
        
      const cycleRecordsList = records.filter((r: any) => r.auditCycleId === cycle.id);
      const recordsMap: Record<string, any> = {};
      for (const r of cycleRecordsList) {
        recordsMap[r.assetId] = {
          status: r.status,
          notes: r.notes,
          auditedAt: r.loggedAt,
          auditedBy: r.auditorId,
        };
      }

      return {
        ...cycle,
        auditors: cycleAuditors,
        records: recordsMap,
      };
    });
  }

  async createCycle(createAuditCycleDto: CreateAuditCycleDto) {
    const scopeType = createAuditCycleDto.departmentScopeId
      ? 'Department'
      : 'All';
    const scopeId = createAuditCycleDto.departmentScopeId || null;

    const [cycle] = await this.db
      .insert(auditCycles)
      .values({
        name: createAuditCycleDto.name,
        scopeType,
        scopeId,
        startDate: createAuditCycleDto.startDate,
        endDate: createAuditCycleDto.endDate,
        status: 'Open',
      })
      .returning();
    return cycle;
  }

  async addRecord(createAuditRecordDto: CreateAuditRecordDto) {
    const [record] = await this.db
      .insert(auditRecords)
      .values({
        auditCycleId: createAuditRecordDto.auditId,
        assetId: createAuditRecordDto.assetId,
        auditorId: createAuditRecordDto.auditorUserId,
        status: createAuditRecordDto.status,
        notes: createAuditRecordDto.notes,
      })
      .returning();
    return record;
  }

  async closeCycle(id: string) {
    // 1. Mark cycle as closed
    const [updatedCycle] = await this.db
      .update(auditCycles)
      .set({ status: 'Closed' })
      .where(eq(auditCycles.id, id))
      .returning();

    if (!updatedCycle) throw new NotFoundException('Audit cycle not found');

    // 2. Discrepancy rule: Find all missing assets in this cycle
    const missingRecords = await this.db
      .select()
      .from(auditRecords)
      .where(
        and(
          eq(auditRecords.auditCycleId, id),
          eq(auditRecords.status, 'Missing'),
        ),
      );

    // 3. Update those assets to 'Lost'
    if (missingRecords.length > 0) {
      const missingAssetIds = missingRecords.map((r: any) => r.assetId);
      await this.db
        .update(assets)
        .set({ status: 'Lost' })
        .where(inArray(assets.id, missingAssetIds));
    }

    return {
      message: 'Audit cycle closed and missing assets marked as Lost.',
      updatedCycle,
    };
  }
}
