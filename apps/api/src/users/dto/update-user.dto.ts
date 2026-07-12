import { IsEnum, IsNotEmpty } from 'class-validator';
import { roleEnum, statusEnum } from '@asset-flow/database';

export class UpdateUserRoleDto {
  @IsEnum(roleEnum.enumValues)
  @IsNotEmpty()
  role: 'Employee' | 'Department Head' | 'Asset Manager' | 'Admin';
}

export class UpdateUserStatusDto {
  @IsEnum(statusEnum.enumValues)
  @IsNotEmpty()
  status: 'Active' | 'Inactive';
}
