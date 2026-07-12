import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for the frontend
  const port = process.env.PORT ?? 3001;
  await app.listen(port); // Run on 3001 so it doesn't conflict with Next.js on 3000
  console.log(`Server started at http://localhost:${port}`);
}
bootstrap();
