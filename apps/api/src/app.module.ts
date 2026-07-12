import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DepartmentsModule } from './departments/departments.module';
import { CategoriesModule } from './categories/categories.module';
import { AssetsModule } from './assets/assets.module';
import { AllocationsModule } from './allocations/allocations.module';
import { BookingsModule } from './bookings/bookings.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { AuditsModule } from './audits/audits.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    CategoriesModule,
    AssetsModule,
    AllocationsModule,
    BookingsModule,
    MaintenanceModule,
    AuditsModule,
    ReportsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
