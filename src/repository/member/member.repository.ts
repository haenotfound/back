import { Injectable } from '@nestjs/common';
import {
  MemberRegisterDTO,
  MemberUpdateDTO,
  OAuthLoginDTO,
} from 'src/domain/member/dto/member.dto';
import { MemberEntity } from 'src/domain/member/entity/member.entity';
import { PrismaService } from 'src/service/prisma/prisma.service';

@Injectable()
export class MemberRepository {
  // 생성자 주입
  constructor(private readonly prisma: PrismaService) {}

  // 회원 추가
  async save(member: MemberRegisterDTO): Promise<MemberEntity> {
    const memberCreate = {
      memberEmail: member.memberEmail,
      memberName: member.memberName,
      memberAge: member.memberAge,
      memberAddress: member.memberAddress,
      memberProfile: member.memberProfile,
    };

    // 소셜
    const memberSocialCreate = {
      memberProviderId: member.memberProviderId,
      memberProvider: member.memberProvider,
      memberPassword: member.memberPassword,
    };

    return await this.prisma.member.create({
      data: {
        ...memberCreate,
        socials: {
          create: memberSocialCreate,
        },
      },
      include: {
        socials: true,
      },
    });
  }

  // 회원 전체 조회
  async findMemberAll(): Promise<MemberEntity[]> {
    return await this.prisma.member.findMany({
      include: {
        socials: true,
      },
    });
  }

  // 회원 단일 조회 (ID)
  async findMemberById(id: number): Promise<MemberEntity | null> {
    return await this.prisma.member.findUnique({
      where: { id },
      include: { socials: true },
    });
  }

  // 회원 단일 조회 (memberEmail)
  async findMemberByEmail(memberEmail: string): Promise<MemberEntity | null> {
    return await this.prisma.member.findFirst({
      where: { memberEmail },
      include: { socials: true },
    });
  }

  // 소셜 로그인으로 로그인했을 때 회원을 조회하는 방법!
  // kakao : test123@gmail.com
  // naver : test123@gmail.com
  // google : test123@gmail.com
  // 동일한 이메일을 사용하더라도 서로 다른 회원으로 인식해야 한다!
  // 회원 단일 조회 (provider)
  async findByProvider(
    socailMember: OAuthLoginDTO,
  ): Promise<MemberEntity | null> {
    return await this.prisma.member.findFirst({
      where: {
        socials: {
          some: {
            memberProviderId: socailMember.memberProviderId,
            memberProvider: socailMember.memberProvider,
          },
        },
      },
      include: { socials: true },
    });
  }

  // 회원 비밀번호 수정
  async updatePassword(id: number, memberPassword: string):Promise<void> {
    await this.prisma.authAccount.update({
      where: { id },
      data: { memberPassword },
    });
  }

  // 회원 정보 수정
  async updateProfile(
    id: number,
    member: MemberUpdateDTO,
  ): Promise<MemberEntity | null> {
    const { memberPassword, ...removedPasswordMember } = member;

    await this.prisma.member.update({
      data: removedPasswordMember,
      where: { id },
    });
    return await this.findMemberById(id);
  }

  // 회원 삭제
  async delete(id: number) {
    try {
      await this.prisma.member.delete({
        where: { id },
      });
      return true;
    } catch (err) {
      // try, catch 단축키 감쌀거 드래그cmd+shift+t
      console.log('member respository delete failed');
      return false;
    }
  }
}
