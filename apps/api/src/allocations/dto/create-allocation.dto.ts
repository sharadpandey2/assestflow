import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAllocationDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  assignedDepartmentId?: string;

  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string;
}

export class CreateTransferRequestDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  requestedByUserId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
