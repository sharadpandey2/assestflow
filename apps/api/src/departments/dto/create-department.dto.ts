import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  parentDepartmentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
