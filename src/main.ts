import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger 설정
  setupSwagger(app);
  
  // CORS 허용
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 10000);
}

bootstrap();
