import { forwardRef, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'src/type/auth.type';
import { TokenDTO } from 'src/domain/auth/dto/auth.dto';
import { JwtTokenService } from '../jwt/jwt.service';
import { RedisService } from '../redis/redis.service';
import { MemberService } from '../member/member.service';
import { MemberResponse } from 'src/domain/member/dto/member.response';
import {
  MemberRegisterDTO,
  OAuthLoginDTO,
} from 'src/domain/member/dto/member.dto';
import { AuthProvider } from '@prisma/client';

// 회원 검증과 관련된 서비스
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => MemberService))
    private readonly memberService: MemberService,
  ) {}

  // 비밀번호 해싱
  private readonly saltRounds = 10;

  // 암호화
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  // 비밀번호 검사
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // 로그인
  async login(payload: JwtPayload): Promise<TokenDTO> {
    const accessToken = await this.jwtTokenService.generateAccesstoken(payload);
    const refreshToken =
      await this.jwtTokenService.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  // 로그아웃
  async logout(refreshToken: string) {
    let isLogout = false;
    try {
      const payload =
        await this.jwtTokenService.verifyAndExtractPayload(refreshToken);
      await this.redisService.deleteRefreshToken(payload);
      isLogout = true;
    } catch (err) {
      isLogout = false;
    }
    return isLogout;
  }

  async me(accessToken: string): Promise<MemberResponse> {
    const payload =
      await this.jwtTokenService.verifyAndExtractPayload(accessToken);
    return await this.memberService.getMember(payload.id);
  }

  async refresh(refreshToken: string): Promise<TokenDTO> {
    const payload =
      await this.jwtTokenService.validateRefreshToken(refreshToken);
    const accessToken = await this.jwtTokenService.generateAccesstoken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 소셜 로그인
  async socialLogin(socialMember: OAuthLoginDTO) {
    const {
      memberEmail,
      memberName,
      memberProfile,
      memberProvider,
      memberProviderId,
    } = socialMember;

    // 1. memberProvider, memberProviderId 멤버로 조회
    const foundSocialMember =
      await this.memberService.getMemberByMemberProvider(socialMember);
    const foundLocalMember =
      await this.memberService.getMemberByMemberEmail(memberEmail);

    // 이미 가입된 회원이라면 -> 토큰 발급
    if (foundSocialMember) {
      const payload: JwtPayload = {
        id: foundSocialMember.id,
        memberEmail: foundSocialMember.memberEmail,
      };

      const accessToken =
        await this.jwtTokenService.generateAccesstoken(payload);
      const refreshToken =
        await this.jwtTokenService.generateRefreshToken(payload);

      return {
        status: 'LOGIN',
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }

    // 2. 같은 이메일의 LOCAL 계정이 있는 경우 예외 처리
    if (foundLocalMember) {
      return {
        status: 'NEED_LINK',
        memberProvider: AuthProvider.LOCAL,
      };
    }

    // 3. 최초 소셜 로그인 -> 회원가입
    // - 계정 병합은 로그인된 상태에서만 처리
    const newMember: MemberRegisterDTO = {
      memberEmail: memberEmail,
      memberName: memberName ?? '멘탈이 약한 개복치',
      memberProvider: memberProvider,
      memberProviderId: memberProviderId,
      memberProfile: memberProfile,
    };

    await this.memberService.join(newMember);
    const newIsertedMember =
      await this.memberService.getMemberByMemberEmail(memberEmail);

    // 4. 토큰 발급 응답
    if (newIsertedMember) {
      const payload: JwtPayload = {
        id: newIsertedMember.id,
        memberEmail: newIsertedMember.memberEmail,
      };

      const accessToken =
        await this.jwtTokenService.generateAccesstoken(payload);
      const refreshToken =
        await this.jwtTokenService.generateRefreshToken(payload);

      return {
        status: 'JOIN',
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    }

    return { status: 'NOT_FOUND' };
  }
}
