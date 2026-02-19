import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from 'src/service/auth/auth.service';
import { MemberModule } from '../member/member.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from 'src/controller/auth/auth.controller';

// 순환참조 해결
@Module({
  imports: [
    // 순환참조 해결을 위해 forwardRef 사용
    forwardRef(() => MemberModule),
    PassportModule.register({session:false})
  ],
  providers: [
    AuthService,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {;}
