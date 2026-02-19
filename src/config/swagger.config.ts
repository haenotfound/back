// src/config/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// http://localhost:10000/api-docs
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('My API 문서')
    .setDescription('NestJS Swagger API 문서입니다.')
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증 필요 시
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // JWT 토큰 유지
    },
  });

}
