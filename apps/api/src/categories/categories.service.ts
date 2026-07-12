import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { categories } from '@asset-flow/database';
import { eq } from 'drizzle-orm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const [newCategory] = await this.db.insert(categories).values(createCategoryDto).returning();
    return newCategory;
  }

  async findAll() {
    return this.db.select().from(categories);
  }

  async findOne(id: string) {
    const [category] = await this.db.select().from(categories).where(eq(categories.id, id));
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const [updatedCategory] = await this.db
      .update(categories)
      .set({
        ...updateCategoryDto,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  async remove(id: string) {
    const [deletedCategory] = await this.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deletedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return deletedCategory;
  }
}
