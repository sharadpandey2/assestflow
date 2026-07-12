import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateAuditCycleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  departmentScopeId?: string;
}

export class CreateAuditRecordDto {
  @IsString()
  @IsNotEmpty()
  auditId: string;

  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  auditorUserId: string;

  @IsEnum(['Verified', 'Missing', 'Damaged'])
  @IsNotEmpty()
  status: 'Verified' | 'Missing' | 'Damaged';

  @IsString()
  @IsOptional()
  notes?: string;
}
