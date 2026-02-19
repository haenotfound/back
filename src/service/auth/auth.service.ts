import { Injectable } from '@nestjs/common';
import { MemberRepository } from 'src/repository/member/member.repository';
import bcrypt from "bcrypt"
import { JwtPayload } from 'src/type/auth.type';
import { TokenDTO } from 'src/domain/auth/dto/auth.dto';
import { JwtTokenService } from '../jwt/jwt.service';
// 회원 검증과 관련된 서비스
@Injectable()
export class AuthService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly jwtTokenService:JwtTokenService
  ){;}

  // 비밀번호 해싱
  private readonly saltRounds = 10;

  // 암호화
  async hashPassword(password: string):Promise<string>{
    return bcrypt.hash(password, this.saltRounds)
  }

  // 비밀번호 검사(원본을 노출시키지 않고 해시된 애들끼리 비교)
  async comparePassword(password:string, hashPassword:string):Promise<boolean>{
    return bcrypt.compare(password, hashPassword)
  }

  // 로그인
  async login(payload: JwtPayload):Promise<TokenDTO>{
    const accessToken = await this.jwtTokenService.generateAccesstoken(payload)
    const refreshToken = await this.jwtTokenService.generateAccesstoken(payload)

    return {accessToken, refreshToken}
  }

  // 로그아웃
  

}
