import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  SafeScoreRequestDTO,
  SafeScoreResponseDTO,
} from 'src/domain/safe-score/dto/safe-score.dto';
import { SafeScoreRepository } from 'src/repository/safe-score/safe-score.repository';
import {
  FacilityCounts,
  GeoPoint,
  PublicDataService,
} from '../public-data/public-data.service';

@Injectable()
export class SafeScoreService {
  private readonly logger = new Logger(SafeScoreService.name);

  constructor(
    private readonly safeScoreRepository: SafeScoreRepository,
    private readonly publicDataService: PublicDataService,
  ) {}

  // 안전점수 계산 + DB 저장
  async calculate(
    memberId: number,
    dto: SafeScoreRequestDTO,
  ): Promise<SafeScoreResponseDTO> {
    // 1) 공공데이터에서 시설 개수 조회
    const realCounts = await this.publicDataService.countNearbyFacilities({
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    // 2) 항목별로 0이면 더미 값으로 채워 넣기 (해당 출처 API 키가 없거나 응답 실패 케이스)
    const dummy = this.generateDummyCounts(dto.latitude, dto.longitude);
    const counts: FacilityCounts = {
      cctvCount: realCounts.cctvCount || dummy.cctvCount,
      policeCount: realCounts.policeCount || dummy.policeCount,
      streetlightCount:
        realCounts.streetlightCount || dummy.streetlightCount,
      crimeProneCount:
        realCounts.crimeProneCount || dummy.crimeProneCount,
    };

    this.logger.log(
      `[안전점수 입력] 실제: ${JSON.stringify(realCounts)} / ` +
        `최종(더미보강): ${JSON.stringify(counts)}`,
    );

    // 2) 시설 개수 -> 항목별 점수
    const cctvScore = this.cctvCountToScore(counts.cctvCount);
    const policeScore = this.policeCountToScore(counts.policeCount);
    const streetlightScore = this.streetlightCountToScore(counts.streetlightCount);
    const crimeProneScore = this.crimeCountToScore(counts.crimeProneCount);

    // 3) 가중 평균으로 종합 점수 계산
    // CCTV 30%, 가로등 25%, 경찰 25%, 범죄주의구간 20%
    const score = Math.round(
      cctvScore * 0.3 +
        streetlightScore * 0.25 +
        policeScore * 0.25 +
        crimeProneScore * 0.2,
    );

    // 4) 메시지 / 백분위
    const safetyMessage = this.scoreToMessage(score);
    const rankingPercentile = Math.max(1, 100 - score);

    const response: SafeScoreResponseDTO = {
      address: dto.address,
      score,
      safetyMessage,
      rankingPercentile,
      cctvScore,
      policeScore,
      streetlightScore,
      crimeProneScore,
      ...counts,
    };

    // 5) DB 저장 (같은 주소가 있으면 업데이트)
    await this.safeScoreRepository.upsertLatestByAddress({
      memberId,
      ...response,
    });

    return response;
  }

  // 내가 최근에 조회한 안전점수 목록
  async getRecent(memberId: number) {
    return this.safeScoreRepository.findRecentByMember(memberId);
  }

  // 항목별 시설 좌표 목록 (지도 마커용)
  async getFacilityPoints(type: string, center: GeoPoint): Promise<GeoPoint[]> {
    switch (type) {
      case 'cctv':
        return this.publicDataService.listCctvPoints(center);
      case 'streetlight':
        return this.publicDataService.listStreetlightPoints(center);
      case 'police':
        return this.publicDataService.listPolicePoints(center);
      case 'crime':
        return this.publicDataService.listCrimeProneAreas(center);
      default:
        throw new BadRequestException(`지원하지 않는 시설 종류입니다: ${type}`);
    }
  }

  // ---------- 점수 변환 공식 ----------

  private cctvCountToScore(count: number): number {
    // 0개=0점, 20개 이상=100점
    return Math.min(100, Math.round((count / 20) * 100));
  }

  private policeCountToScore(count: number): number {
    // 1개=50점, 4개 이상=100점
    if (count === 0) return 0;
    return Math.min(100, 50 + (count - 1) * 17);
  }

  private streetlightCountToScore(count: number): number {
    // 0개=0점, 50개 이상=100점
    return Math.min(100, Math.round((count / 50) * 100));
  }

  // 범죄주의구간은 적을수록 좋음
  private crimeCountToScore(count: number): number {
    // 0개=100점, 5개 이상=0점
    return Math.max(0, 100 - count * 20);
  }

  private scoreToMessage(score: number): string {
    if (score >= 90) return '밤에도 비교적 안전한 지역!';
    if (score >= 70) return '주의가 필요한 시간대가 있어요.';
    if (score >= 50) return '안전 시설이 다소 부족해요.';
    return '안전 시설이 부족한 지역이에요.';
  }

  // ---------- 폴백용 더미 시설 개수 (좌표 시드 기반) ----------

  private hashCoord(lat: number, lng: number): number {
    const value = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  private pickByRange(seed: number, min: number, max: number): number {
    return Math.round(min + seed * (max - min));
  }

  private generateDummyCounts(lat: number, lng: number): FacilityCounts {
    const seedCctv = this.hashCoord(lat, lng);
    const seedPolice = this.hashCoord(lat + 0.001, lng + 0.001);
    const seedLight = this.hashCoord(lat + 0.002, lng - 0.002);
    const seedCrime = this.hashCoord(lat - 0.003, lng + 0.003);

    return {
      cctvCount: this.pickByRange(seedCctv, 0, 30),
      policeCount: this.pickByRange(seedPolice, 0, 5),
      streetlightCount: this.pickByRange(seedLight, 5, 60),
      crimeProneCount: this.pickByRange(seedCrime, 0, 5),
    };
  }
}
