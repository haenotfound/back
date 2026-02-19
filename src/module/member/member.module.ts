import { forwardRef, Module } from '@nestjs/common';
import { MemberController } from 'src/controller/member/member.controller';
import { MemberRepository } from 'src/repository/member/member.repository';
import { MemberService } from 'src/service/member/member.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // 순환참조 해결을 위해 forwardRef 사용
    forwardRef(()=> AuthModule)
  ],
  controllers: [MemberController],
  providers: [MemberRepository, MemberService],
  exports: [MemberRepository, MemberService],
})
export class MemberModule {;}
