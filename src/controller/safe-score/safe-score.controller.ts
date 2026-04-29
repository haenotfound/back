import {
  Body,
  Controller,
  Get,
  HttpCode,
  ParseFloatPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { SafeScoreRequestDTO } from 'src/domain/safe-score/dto/safe-score.dto';
import { JwtAuthGuard } from 'src/module/auth/guard/jwt-auth.guard';
import { SafeScoreService } from 'src/service/safe-score/safe-score.service';
import type { AuthRequest } from 'src/type/auth.type';

@Controller('safe-score')
@UseGuards(JwtAuthGuard)
export class SafeScoreController {
  constructor(private readonly safeScoreService: SafeScoreService) {}

  // 안전점수 계산
  @ApiOperation({ summary: '안전점수 계산 및 저장' })
  @Post('calculate')
  @HttpCode(200)
  async calculate(
    @Req() req: AuthRequest,
    @Body() dto: SafeScoreRequestDTO,
  ) {
    const memberId = req.user.id;
    const result = await this.safeScoreService.calculate(memberId, dto);
    return new ApiResponse('안전점수 계산 완료', result);
  }

  // 내 최근 안전점수 조회
  @ApiOperation({ summary: '내가 최근 조회한 안전점수 목록' })
  @Get('recent')
  async getRecent(@Req() req: AuthRequest) {
    const memberId = req.user.id;
    const list = await this.safeScoreService.getRecent(memberId);
    return new ApiResponse('최근 안전점수 조회 성공', list);
  }

  // 항목별 시설 좌표 조회 (지도 마커 표시용)
  @ApiOperation({ summary: '반경 내 시설 좌표 목록 (CCTV 등)' })
  @ApiQuery({
    name: 'type',
    enum: ['cctv', 'streetlight', 'police', 'crime'],
    example: 'cctv',
  })
  @ApiQuery({ name: 'lat', type: Number, example: 37.4979 })
  @ApiQuery({ name: 'lng', type: Number, example: 127.0276 })
  @Get('facilities')
  async getFacilities(
    @Query('type') type: string,
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
  ) {
    const points = await this.safeScoreService.getFacilityPoints(type, {
      latitude: lat,
      longitude: lng,
    });
    return new ApiResponse('시설 좌표 조회 성공', points);
  }
}
