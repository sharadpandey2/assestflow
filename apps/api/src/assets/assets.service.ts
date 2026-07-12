import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { assets } from '@asset-flow/database';
import { eq } from 'drizzle-orm';

@Injectable()
export class AssetsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async create(createAssetDto: CreateAssetDto) {
    // Generate a simple unique asset tag (e.g., AF-1234)
    const randomTag = Math.floor(1000 + Math.random() * 9000);
    const assetTag = `AF-${randomTag}`;

    const [newAsset] = await this.db
      .insert(assets)
      .values({
        ...createAssetDto,
        assetTag,
        acquisitionCost: createAssetDto.acquisitionCost?.toString(), // Drizzle decimal expects string
      })
      .returning();

    return newAsset;
  }

  async findAll() {
    return this.db.select().from(assets);
  }

  async findOne(id: string) {
    const [asset] = await this.db
      .select()
      .from(assets)
      .where(eq(assets.id, id));

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto) {
    const [updatedAsset] = await this.db
      .update(assets)
      .set({
        ...updateAssetDto,
        acquisitionCost: updateAssetDto.acquisitionCost?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id))
      .returning();

    if (!updatedAsset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return updatedAsset;
  }

  async remove(id: string) {
    const [deletedAsset] = await this.db
      .delete(assets)
      .where(eq(assets.id, id))
      .returning();

    if (!deletedAsset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return deletedAsset;
  }
}
