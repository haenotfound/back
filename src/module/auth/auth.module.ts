import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from 'src/service/auth/auth.service';
import { MemberModule } from '../member/member.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from 'src/controller/auth/auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';

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
    GoogleStrategy,
    KakaoStrategy,
    NaverStrategy
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {;}
