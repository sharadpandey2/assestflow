import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';

// For simplicity, we define the enums here or we could import them from the DB package.
export enum AssetStatus {
  Available = 'Available',
  Allocated = 'Allocated',
  Reserved = 'Reserved',
  UnderMaintenance = 'Under Maintenance',
  Lost = 'Lost',
  Retired = 'Retired',
  Disposed = 'Disposed',
}

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsDateString()
  @IsOptional()
  acquisitionDate?: string;

  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @IsString()
  @IsNotEmpty()
  condition: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsBoolean()
  @IsOptional()
  isSharedBookable?: boolean;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsOptional()
  customAttributes?: any;
}
