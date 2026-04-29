import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 좌표 한 점
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// 시설 개수 결과
export interface FacilityCounts {
  cctvCount: number;
  policeCount: number;
  streetlightCount: number;
  crimeProneCount: number;
}

@Injectable()
export class PublicDataService {
  private readonly logger = new Logger(PublicDataService.name);

  // 출처별 API 키 (환경변수에서 로드)
  private readonly publicDataKey: string; // CCTV (공공데이터포털)
  private readonly safemapKey: string; // 범죄주의구간 (생활안전지도)
  private readonly policeKey: string; // 경찰시설 (재난안전공유플랫폼)
  private readonly streetlightKey: string; // 가로등 (재난안전공유플랫폼)

  // 검색 반경 (단위: m)
  private readonly RADIUS_METERS = 500;

  constructor(private readonly configService: ConfigService) {
    this.publicDataKey =
      this.configService.get<string>('PUBLIC_DATA_KEY') ?? '';
    this.safemapKey = this.configService.get<string>('SAFEMAP_API_KEY') ?? '';
    this.policeKey = this.configService.get<string>('POLICE_API_KEY') ?? '';
    this.streetlightKey =
      this.configService.get<string>('STREETLIGHT_API_KEY') ?? '';
  }

  // ==========================================================
  // 공통 유틸
  // ==========================================================

  // 두 좌표 사이 거리(m) - Haversine 공식
  private haversine(a: GeoPoint, b: GeoPoint): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // items 배열에서 반경 내 항목들의 좌표 배열만 추출
  private filterWithinRadius(
    items: any[],
    center: GeoPoint,
    latField: string,
    lngField: string,
  ): GeoPoint[] {
    const result: GeoPoint[] = [];
    for (const item of items) {
      const lat = parseFloat(item?.[latField]);
      const lng = parseFloat(item?.[lngField]);
      if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
      const distance = this.haversine(center, {
        latitude: lat,
        longitude: lng,
      });
      if (distance <= this.RADIUS_METERS) {
        result.push({ latitude: lat, longitude: lng });
      }
    }
    return result;
  }

  // items 안에 있는 첫 번째 객체에서 후보 필드 중 존재하는 키를 골라줌
  private pickField(items: any[], candidates: string[]): string | null {
    if (!items || items.length === 0) return null;
    const sample = items[0];
    for (const key of candidates) {
      if (sample?.[key] !== undefined) return key;
    }
    return null;
  }

  // fetch 호출 + 에러는 null 반환 (호출 측에서 더미로 폴백)
  private async safeFetchJson(url: string): Promise<any | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`API 응답 실패 (${res.status}): ${url}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      this.logger.warn(`API 호출 실패: ${(err as Error).message}`);
      return null;
    }
  }

  // ==========================================================
  // 1) CCTV - 공공데이터포털 (전국CCTV표준데이터)
  // ==========================================================
  async listCctvPoints(center: GeoPoint): Promise<GeoPoint[]> {
    if (!this.publicDataKey) {
      return this.generateDummyPoints(center, 12);
    }

    // TODO: 실제 신청한 API 상세 페이지의 정확한 URL로 교체!
    const url =
      `https://api.odcloud.kr/api/15013094/v1/uddi:35e1bbcf-91fd-43e2-9059-657a76f48b3b` +
      `?page=1&perPage=1000` +
      `&serviceKey=${encodeURIComponent(this.publicDataKey)}`;

    const data = await this.safeFetchJson(url);
    if (!data) return this.generateDummyPoints(center, 12);

    const items: any[] = data?.data || data?.response?.body?.items || [];
    const latField =
      this.pickField(items, ['위도', 'WGS84위도', 'lat', 'LAT']) ?? '위도';
    const lngField =
      this.pickField(items, ['경도', 'WGS84경도', 'lon', 'LON', 'lng']) ??
      '경도';

    const points = this.filterWithinRadius(items, center, latField, lngField);
    return points.length > 0 ? points : this.generateDummyPoints(center, 12);
  }

  private async countCctv(center: GeoPoint): Promise<number> {
    return (await this.listCctvPoints(center)).length;
  }

  // ==========================================================
  // 2) 경찰시설 - 재난안전공유플랫폼 (행정안전부_공통POI_경찰)
  //    키: POLICE_API_KEY
  // ==========================================================
  async listPolicePoints(center: GeoPoint): Promise<GeoPoint[]> {
    if (!this.policeKey) {
      return this.generateDummyPoints(center, 3);
    }

    // TODO: 발급받은 활용가이드의 실제 service URL로 교체!
    // 재난안전공유플랫폼은 보통 service ID(DSSP-IF-XXXX) 형태
    const url =
      `https://www.safetydata.go.kr/V2/api/DSSP-IF-10942` +
      `?serviceKey=${encodeURIComponent(this.policeKey)}` +
      `&numOfRows=1000&pageNo=1&returnType=json`;

    const data = await this.safeFetchJson(url);
    if (!data) return this.generateDummyPoints(center, 3);

    const items: any[] =
      data?.body || data?.response?.body?.items?.item || data?.items || [];

    const latField =
      this.pickField(items, ['lat', 'LAT', 'wgsLat', 'Y']) ?? 'lat';
    const lngField =
      this.pickField(items, ['lon', 'LON', 'lng', 'wgsLon', 'X']) ?? 'lon';

    const points = this.filterWithinRadius(items, center, latField, lngField);
    return points.length > 0 ? points : this.generateDummyPoints(center, 3);
  }

  private async countPolice(center: GeoPoint): Promise<number> {
    return (await this.listPolicePoints(center)).length;
  }

  // ==========================================================
  // 3) 가로등 - 재난안전공유플랫폼 (행정안전부_공통POI_가로등)
  //    키: STREETLIGHT_API_KEY
  // ==========================================================
  async listStreetlightPoints(center: GeoPoint): Promise<GeoPoint[]> {
    if (!this.streetlightKey) {
      return this.generateDummyPoints(center, 30);
    }

    // TODO: 발급받은 활용가이드의 실제 service URL로 교체!
    const url =
      `https://www.safetydata.go.kr/V2/api/DSSP-IF-10941` +
      `?serviceKey=${encodeURIComponent(this.streetlightKey)}` +
      `&numOfRows=1000&pageNo=1&returnType=json`;

    const data = await this.safeFetchJson(url);
    if (!data) return this.generateDummyPoints(center, 30);

    const items: any[] =
      data?.body || data?.response?.body?.items?.item || data?.items || [];

    const latField =
      this.pickField(items, ['lat', 'LAT', 'wgsLat', 'Y']) ?? 'lat';
    const lngField =
      this.pickField(items, ['lon', 'LON', 'lng', 'wgsLon', 'X']) ?? 'lon';

    const points = this.filterWithinRadius(items, center, latField, lngField);
    return points.length > 0 ? points : this.generateDummyPoints(center, 30);
  }

  private async countStreetlight(center: GeoPoint): Promise<number> {
    return (await this.listStreetlightPoints(center)).length;
  }

  // ==========================================================
  // 4) 범죄주의구간 - 생활안전지도 (safemap.go.kr) 오픈API
  //    키: SAFEMAP_API_KEY
  // ==========================================================
  async listCrimeProneAreas(center: GeoPoint): Promise<GeoPoint[]> {
    if (!this.safemapKey) {
      return this.generateDummyPoints(center, 4);
    }

    // TODO: 신청한 생활안전지도 OpenAPI URL로 교체!
    const url =
      `https://www.safemap.go.kr/openApi/api/getCriminalCase.do` +
      `?authKey=${encodeURIComponent(this.safemapKey)}` +
      `&dataType=json&numOfRows=1000&pageNo=1`;

    const data = await this.safeFetchJson(url);
    if (!data) return this.generateDummyPoints(center, 4);

    const items: any[] =
      data?.response?.body?.items?.item || data?.body || data?.items || [];

    const latField =
      this.pickField(items, ['lat', 'LAT', 'WGS84_LAT', 'wgsLat', 'Y']) ??
      'lat';
    const lngField =
      this.pickField(items, [
        'lon',
        'LON',
        'WGS84_LON',
        'wgsLon',
        'lng',
        'X',
      ]) ?? 'lon';

    const points = this.filterWithinRadius(items, center, latField, lngField);
    return points.length > 0 ? points : this.generateDummyPoints(center, 4);
  }

  private async countCrimeProne(center: GeoPoint): Promise<number> {
    return (await this.listCrimeProneAreas(center)).length;
  }

  // ==========================================================
  // 한 좌표에 대해 4개 항목 동시 조회 (안전점수 계산용)
  // ==========================================================
  async countNearbyFacilities(center: GeoPoint): Promise<FacilityCounts> {
    const [cctvCount, policeCount, streetlightCount, crimeProneCount] =
      await Promise.all([
        this.countCctv(center),
        this.countPolice(center),
        this.countStreetlight(center),
        this.countCrimeProne(center),
      ]);

    this.logger.log(
      `[안전점수 시설 카운트] CCTV=${cctvCount}, 경찰=${policeCount}, ` +
        `가로등=${streetlightCount}, 범죄주의=${crimeProneCount}`,
    );

    return { cctvCount, policeCount, streetlightCount, crimeProneCount };
  }

  // ==========================================================
  // 더미 포인트: 반경 안에서 균등하게 N개 흩뿌리기 (API 키 없을 때 폴백)
  // ==========================================================
  private generateDummyPoints(center: GeoPoint, count: number): GeoPoint[] {
    const points: GeoPoint[] = [];
    const latPerMeter = 1 / 111000;
    const lngPerMeter =
      1 / (111000 * Math.cos((center.latitude * Math.PI) / 180));

    for (let i = 0; i < count; i++) {
      const angle = (i * 137) % 360;
      const distance = 100 + ((i * 43) % (this.RADIUS_METERS - 50));
      const dx = Math.cos((angle * Math.PI) / 180) * distance;
      const dy = Math.sin((angle * Math.PI) / 180) * distance;
      points.push({
        latitude: center.latitude + dy * latPerMeter,
        longitude: center.longitude + dx * lngPerMeter,
      });
    }
    return points;
  }
}
