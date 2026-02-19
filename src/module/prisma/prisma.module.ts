import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/service/prisma/prisma.service';

// 전역에서 주입을 받을 수 있도록 설정
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {;}
