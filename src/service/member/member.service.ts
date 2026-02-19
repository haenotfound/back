import { Injectable } from '@nestjs/common';
import { MemberRepository } from 'src/repository/member/member.repository';
import { AuthService } from '../auth/auth.service';
import {
  MemberRegisterDTO,
  MemberUpdateDTO,
  MulterFile,
} from 'src/domain/member/dto/member.dto';
import MemberException from 'src/exception/exception.member';
import { AuthProvider } from '@prisma/client';
import { MemberResponse } from 'src/domain/member/dto/member.response';
import { S3Service } from '../s3/s3.service';

// 비즈니스 로직
// repository 회원추가 - db
// service 사용자 입장에서는 회원가입
// 회원가입했을때 문자가 간다던가 이런것들 해야함

// 1. 예외 처리(Custom Exception)
// 2. 트랜잭션 처리(Transcation Handler)
// 3. 반환값 처리(일관된 응답 -> 값)
@Injectable()
export class MemberService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly authService: AuthService,
    private readonly s3Service: S3Service,
  ) {}

  // 회원 가입 서비스
  // 1) 회원가입 유무 확인
  // 2) 비밀번호 암호화(bycrypt)
  // yarn add --dev @types/bcrypt bcrypt
  // nest g module module/auth 인증과 관련된건 모두 auth 에서 관리
  // nest g service service/auth

  // 4) 리턴 처리

  async join(member: MemberRegisterDTO): Promise<void> {
    // 1) 회원가입 유무 확인
    const foundMember = await this.memberRepository.findMemberByEmail(
      member.memberEmail,
    );
    if (foundMember) {
      // 3) 예외 처리
      throw new MemberException('이미 존재하는 회원입니다.');
    }

    // 2) 비밀번호 암호화
    let hashedPassword = member.memberPassword;
    if (member.memberProvider === AuthProvider.LOCAL && member.memberPassword) {
      hashedPassword = await this.authService.hashPassword(
        member.memberPassword,
      );
    }

    await this.memberRepository.save({
      ...member,
      memberPassword: hashedPassword,
    });
  }

  // 회원 전체 목록 조회
  async getMembers(): Promise<MemberResponse[]> {
    const members = await this.memberRepository.findMemberAll();
    // 민감한 정보 제거
    const response: MemberResponse[] = members.map((member) => ({
      ...member,
      socials: member.socials.map(({ memberPassword, ...rest }) => rest),
    }));

    return response;
  }

  // 회원 프로필 수정
  async updateProfile(
    id: number,
    thumbnail: MulterFile,
    member: MemberUpdateDTO,
  ) {
    if(thumbnail){
      const s3Result = await this.s3Service.uploadFile(thumbnail, "profiles")

      // 회원정보 검색 및 업데이트
      const foundMember = await this.memberRepository.findMemberById(id)
      if(!foundMember){ throw new MemberException("member service updateProfile 회원 조회 실패")}

      console.log(`S3 업로드 성공 : 원본 URL : ${s3Result.originalUrl}`)
      console.log(`S3 업로드 성공 : 썸네일 URL : ${s3Result.thumbnailUrl}`)
      await this.memberRepository.updateProfile(id, {
        memberName: foundMember.memberName,
        memberProfile: s3Result.originalUrl
      })
    }

    return await this.memberRepository.findMemberById(id);

  }

  // 회원 정보 수정
  async modify(id: number, member: MemberUpdateDTO) {
    const foundMember = await this.memberRepository.findMemberById(id);
    if (!foundMember) {
      console.log('member service modify foundMember error');
      throw new MemberException('회원을 찾을 수 없습니다.');
    }

    const updatedMember = await this.memberRepository.updateProfile(id, member);
    return updatedMember;
  }

  // 회원 탈퇴
  async withdraw(id: number): Promise<void> {
    await this.memberRepository.delete(id);
  }
}
