import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { departments } from '@asset-flow/database';
import { eq } from 'drizzle-orm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    const [newDept] = await this.db.insert(departments).values(createDepartmentDto).returning();
    return newDept;
  }

  async findAll() {
    return this.db.select().from(departments);
  }

  async findOne(id: string) {
    const [dept] = await this.db.select().from(departments).where(eq(departments.id, id));
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return dept;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const [updatedDept] = await this.db
      .update(departments)
      .set({
        ...updateDepartmentDto,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id))
      .returning();

    if (!updatedDept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return updatedDept;
  }

  async remove(id: string) {
    const [deletedDept] = await this.db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();

    if (!deletedDept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return deletedDept;
  }
}
