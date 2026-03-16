import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import MemberException from "src/exception/exception.member";
import { MemberRepository } from "src/repository/member/member.repository";
import { AuthService } from "src/service/auth/auth.service";
import { JwtPayload } from "src/type/auth.type";

//strategy 전략을 등록하고 동작하게 만드는 미들웨어
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly memberRepository: MemberRepository
  ) {
    // 화면에서 보내는 데이터의 key와 일치
    super({
      usernameField: "memberEmail",
      passwordField: "memberPassword"
    })
  }


  // 요청을 가로채서 validate를 실행시킴!
  async validate(loginMemberEmail:string, loginMemberPassword:string) {
    const foundMember = await this.memberRepository.findMemberByMemberEmail(loginMemberEmail);
    if (!foundMember) {
      throw new MemberException("회원을 찾을 수 없습니다")
    }

    const memberPassword = foundMember
      .socials
      .find(({ memberProvider }) => memberProvider === "LOCAL")
      ?.memberPassword
    
    const isMatch = await this.authService.comparePassword(loginMemberPassword, memberPassword!)
    if (!isMatch) throw new MemberException("비밀번호가 일치하지 않습니다.")
    
    const jwtPayload: JwtPayload = {
      id: foundMember.id,
      memberEmail: loginMemberEmail,
    }
    return jwtPayload
  }
}
