import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { users } from '@asset-flow/database';
import { eq } from 'drizzle-orm';
import { UpdateUserRoleDto, UpdateUserStatusDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async findAll() {
    return this.db.select().from(users);
  }

  async findOne(id: string) {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateRole(id: string, updateUserRoleDto: UpdateUserRoleDto) {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        role: updateUserRoleDto.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async updateStatus(id: string, updateUserStatusDto: UpdateUserStatusDto) {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        status: updateUserStatusDto.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }
}
