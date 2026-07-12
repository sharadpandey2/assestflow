import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  reportedByUserId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['Low', 'Medium', 'High'])
  @IsNotEmpty()
  priority: 'Low' | 'Medium' | 'High';

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
