import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for the frontend
  await app.listen(process.env.PORT ?? 3001); // Run on 3001 so it doesn't conflict with Next.js on 3000
}
bootstrap();
