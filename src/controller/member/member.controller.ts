import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import type { MemberRegisterDTO, MemberUpdateDTO, MulterFile } from 'src/domain/member/dto/member.dto';
import { MemberResponse } from 'src/domain/member/dto/member.response';
import { MemberService } from 'src/service/member/member.service';

@Controller('members')
// 화면에서 요청하면 응답해주는게 컨트롤러임
export class MemberController {
  constructor(private readonly memberService:MemberService){;}

  @ApiOperation({summary: "회원가입 서비스"})
  @Post("join") // join이라고 요청을 보내면
  @HttpCode(201) // 응답 상태코드를 성정
  // join 메서드를 호출한다.
  async join(@Body() member:MemberRegisterDTO){
    // 컨트롤러에서 provider를 심는다.
    await this.memberService.join({...member, memberProvider:AuthProvider.LOCAL})
    // return 값이 nest에서는 자동응답(JSON)
    return new ApiResponse("회원가입이 완료되었습니다.")
  }

  // X 로그인 (이건 인증이라 auth에 있어야 함)

  // 회원 전체 목록 조회(원래 서비스X)
  @ApiOperation({summary:"회원 전체 목록 조회"})
  @Get("")
  @HttpCode(200)
  async getMembers():Promise<ApiResponse>{
    const members:MemberResponse[] = await this.memberService.getMembers()
    return new ApiResponse("회원전체 조회 완료되었습니다", members)
    
  }

  // 프로필 사진 수정(AWS)
  @Put("/profile/:id")
  // react 쪽에서 form-data의 key 이름을 "thumbnail"로 보낼 경우 가로챈다
  @UseInterceptors(FileInterceptor("thumbnail"))
  async updateProfile(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() thumbnail: MulterFile,
    @Body() member:MemberUpdateDTO
  ){
    console.log("전송된 데이터 body :", member);
    console.log("업로드된 파일 데이터 :", thumbnail);

    const updatedMember =await this.memberService.updateProfile(id, thumbnail, member);
    return new ApiResponse("회원 정보가 수정되었습니다.", updatedMember)
  }







  // 회원정보 수정
  @Put(":id")
  @ApiOperation({summary:"회원 정보 수정"})
  @HttpCode(200)
  async modify(
    @Param('id', ParseIntPipe) id: number,
    @Body() member:MemberUpdateDTO
  ):Promise<ApiResponse>{
    const updatedMember =  await this.memberService.modify(id, member)
    return new ApiResponse("회원 정보 수정 완료", updatedMember)
  }

  // 회원 탈퇴
  @ApiOperation({summary:"회원 탈퇴"})
  @HttpCode(204)
  @Delete(":id")
  async withdraw(@Param('id', ParseIntPipe) id:number):Promise<ApiResponse>{
    await this.memberService.withdraw(id);
    return new ApiResponse("회원 탈퇴가 완료되었습니다.")
  }

}
