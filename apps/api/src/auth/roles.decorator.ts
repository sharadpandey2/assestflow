import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (
  ...roles: ('Admin' | 'Asset Manager' | 'Department Head' | 'Employee')[]
) => SetMetadata(ROLES_KEY, roles);
