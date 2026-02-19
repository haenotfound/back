import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from 'src/module/auth/guard/local-auth.guard';
import type { AuthRequest } from 'src/type/auth.type';

@Controller('auth')
export class AuthController {

  // 로그인
  @Post("login")
  @UseGuards(LocalAuthGuard) 
  // request -> guard -> local.strategy -> validate -> return -> req.user 
  async login(@Req() req:AuthRequest){
    // console.log("controller", req)
    console.log("controller", req.user)
    return {
      message: "로그인 성공",
      user: req.user
    }
  }



}
