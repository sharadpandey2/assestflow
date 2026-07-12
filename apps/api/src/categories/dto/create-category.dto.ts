import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  customFieldsSchema?: Record<string, any>;
}
