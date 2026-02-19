import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';

// global infra 담당 역할 모듈
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    S3Module,
  ],
  exports: [
    PrismaModule, 
    S3Module
  ],
})
export class CoreModule {}
