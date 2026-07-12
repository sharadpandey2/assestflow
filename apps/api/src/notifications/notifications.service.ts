import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { notifications } from '@asset-flow/database';
import { eq, desc } from 'drizzle-orm';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async getAllNotifications() {
    return this.db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }


  async create(createNotificationDto: CreateNotificationDto) {
    const [notification] = await this.db
      .insert(notifications)
      .values(createNotificationDto)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string) {
    return this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markAsRead(id: string) {
    const [updated] = await this.db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Notification not found');
    return updated;
  }
}
