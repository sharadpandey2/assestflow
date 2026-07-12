import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database.module';
import { bookings } from '@asset-flow/database';
import { eq, and, lt, gt, ne } from 'drizzle-orm';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  async createBooking(createBookingDto: CreateBookingDto) {
    const { assetId, startTime, endTime } = createBookingDto;
    const requestedStart = new Date(startTime);
    const requestedEnd = new Date(endTime);

    // Overlap validation: Two people can't book the same asset at overlapping times.
    // Logic: Existing start < New end AND Existing end > New start
    const overlappingBookings = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.assetId, assetId),
          ne(bookings.status, 'Cancelled'),
          lt(bookings.startTime, requestedEnd),
          gt(bookings.endTime, requestedStart),
        ),
      );

    if (overlappingBookings.length > 0) {
      throw new ConflictException(
        `This asset is already booked during the requested time slot. Please choose another time.`,
      );
    }

    const [newBooking] = await this.db
      .insert(bookings)
      .values({
        ...createBookingDto,
        startTime: requestedStart,
        endTime: requestedEnd,
        status: 'Upcoming',
      })
      .returning();

    return newBooking;
  }

  async getBookingsForAsset(assetId: string) {
    return this.db.select().from(bookings).where(eq(bookings.assetId, assetId));
  }

  async cancelBooking(id: string) {
    const [cancelledBooking] = await this.db
      .update(bookings)
      .set({ status: 'Cancelled' })
      .where(eq(bookings.id, id))
      .returning();

    if (!cancelledBooking) throw new NotFoundException('Booking not found');
    return cancelledBooking;
  }
}
