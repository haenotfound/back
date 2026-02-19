import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // prisma 객체를 메모리 할당
  async onModuleInit() {
    await this.$connect();
  }

  // prisma 객체 메모리 해제
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
