import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { LocalAuthGuard } from 'src/module/auth/guard/local-auth.guard';
import { AuthService } from 'src/service/auth/auth.service';
import type { AuthRequest } from 'src/type/auth.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 로그인
  @Post('login')
  @UseGuards(LocalAuthGuard)
  // request -> guard -> local.strategy -> validate -> return -> req.user
  // auth login ->
  async login(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('controller', req.user);

    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    // 토큰 프론트로 보내긴하는데.. 쥐도새도 모르게 프론트는 모른다.
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    return new ApiResponse('로그인이 성공하였습니다');
  }
}
