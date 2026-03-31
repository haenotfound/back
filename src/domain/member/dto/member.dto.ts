import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider, MemberRole } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MemberRegisterDTO {
  // model Member
  @ApiProperty({ example: 'test123@gmail.com', description: '회원 이메일' })
  @IsString()
  memberEmail: string;

  @ApiProperty({ example: '홍길동', description: '회원 이름' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @ApiProperty({
    example: 'https://myprofile.com/myprofile.jpg',
    description: '회원 이미지',
  })
  @IsString()
  @IsOptional()
  memberProfile?: string;

  // model AuthAccount
  @ApiProperty({ example: 'LOCAL', description: '회원 가입 경로' })
  @IsEnum(AuthProvider)
  memberProvider: AuthProvider;

  @ApiProperty({ example: 'test123!@#', description: '회원 비밀번호' })
  @IsString()
  @IsOptional()
  memberPassword?: string;

  @ApiProperty({ example: '10011004184', description: '소셜 고유 아이디' })
  @IsString()
  @IsOptional()
  memberProviderId?: string;
}

export class MemberUpdateDTO {
  @ApiProperty({ example: '홍길동', description: '회원 이름' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @ApiProperty({ example: '하리보', description: '회원 닉네임' })
  @IsString()
  @IsOptional()
  memberNickname?: string;

  @ApiProperty({
    example: '안녕하세요, 하리보입니다.',
    description: '회원 한 줄 소개',
  })
  @IsString()
  @IsOptional()
  memberIntro?: string;

  @ApiProperty({
    example: 'https://myprofile.com/myprofile.jpg',
    description: '회원 이미지',
  })
  @IsString()
  @IsOptional()
  memberProfile?: string;

  @ApiProperty({ example: 'test123!@#', description: '회원 비밀번호' })
  @IsString()
  @IsOptional()
  memberPassword?: string;
}

// 로컬에서 로그인 하는 경우
export class LocalLoginDTO {
  @ApiProperty({ example: 'test123@gmail.com', description: '회원 이메일' })
  @IsString()
  memberEmail: string;

  @ApiProperty({ example: 'test123!@#', description: '회원 비밀번호' })
  @IsString()
  memberPassword: string;
}

// 소셜 로그인
export class OAuthLoginDTO {
  // model Member
  @ApiProperty({ example: 'test123@gmail.com', description: '회원 이메일' })
  @IsString()
  memberEmail: string;

  @ApiProperty({ example: '홍길동', description: '회원 이름' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @ApiProperty({
    example: 'https://myprofile.com/myprofile.jpg',
    description: '회원 이미지',
  })
  @IsString()
  @IsOptional()
  memberProfile?: string;

  // model AuthAccount
  @ApiProperty({ example: 'LOCAL', description: '회원 가입 경로' })
  @IsEnum(AuthProvider)
  memberProvider: AuthProvider;

  @ApiProperty({ example: '10011004184', description: '소셜 고유 아이디' })
  @IsString()
  @IsOptional()
  memberProviderId?: string;
}

// 회원 조회
export class MemberResponseDTO {
  // model Member
  @ApiProperty({ example: 'USER', enum: MemberRole, description: '회원 권한' })
  @IsEnum(MemberRole)
  memberRole: MemberRole;

  @ApiProperty({ example: '하리보', description: '회원 닉네임' })
  @IsString()
  @IsOptional()
  memberNickname?: string;

  @ApiProperty({
    example: '안녕하세요, 하리보입니다.',
    description: '회원 한 줄 소개',
  })
  @IsString()
  @IsOptional()
  memberIntro?: string;

  @ApiProperty({ example: true, description: '회원 탈퇴 여부' })
  @IsBoolean()
  @IsOptional()
  memberInactive?: boolean;

  @ApiProperty({ example: '탈퇴 사유', description: '회원 탈퇴 사유' })
  @IsString()
  @IsOptional()
  inactiveReason?: string;

  @ApiProperty({ example: '2026-03-31', description: '회원 가입 일자' })
  @IsDate()
  @IsOptional()
  memberCreateAt: Date;
  // model Member
  @ApiProperty({ example: 1, description: '아이디' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'test123@gmail.com', description: '회원 이메일' })
  @IsString()
  memberEmail: string;

  @ApiProperty({ example: '홍길동', description: '회원 이름' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @ApiProperty({
    example: 'https://myprofile.com/myprofile.jpg',
    description: '회원 이미지',
  })
  @IsString()
  @IsOptional()
  memberProfile?: string;
}
// 파일 입출력용 추가
export type MulterFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
};
