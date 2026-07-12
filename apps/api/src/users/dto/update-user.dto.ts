import { IsEnum, IsNotEmpty } from 'class-validator';
import { roleEnum } from '@asset-flow/database';

export class UpdateUserRoleDto {
  @IsEnum(roleEnum.enumValues)
  @IsNotEmpty()
  role: 'Employee' | 'Department Head' | 'Asset Manager' | 'Admin';
}
