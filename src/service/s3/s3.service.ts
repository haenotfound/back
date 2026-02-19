import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { basename, extname } from 'path';
import sharp from 'sharp';
import { MulterFile } from 'src/domain/member/dto/member.dto';
import { v4 as uuidv4 } from 'uuid';
// 사용자한테 요청이 들어왔을때 이미지를 업로드를 시켜주는 서비스
@Injectable()
export class S3Service {
  // 환경 변수
  private s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      // 타입 뒤에 !를 붙이면 null이나 undefined가 절대 아님을 보장
    },
  });

  async uploadFile(file: MulterFile, folder: string) {
    const bucket = process.env.AWS_S3_BUCKET!;
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET 환경설정이 설정되지 않았습니다.');
    }

    const now = dayjs();
    const dataPath = now.format('YYYY/MM/DD'); // 2026/02/10

    // 파일 확장자
    const fileExt = extname(file.originalname);

    // 파일 이름
    const nameWithoutExt = basename(file.originalname, fileExt); // 확장자 제거한 파일명

    // 고유한 uuid 생성
    const uniqueId = uuidv4(); // 중복되지 않는 아이디 생성

    // 최종파일 이름
    const baseFilename = `${uniqueId}_${nameWithoutExt}`;

    // S3 Key (경로 + 파일이름 + 확장자)
    const originalKey = `${folder}/${dataPath}/${baseFilename}${fileExt}`;

    // 썸네일 제작 변수 초기화
    let thumbnailUrl = '';

    // 1. 원본 파일을 업로드
    const originalUploadParams: PutObjectCommandInput = {
      Bucket: bucket,
      Key: originalKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(originalUploadParams));

    // 2. 썸네일 파일 업로드
    // 썸네일 Key 생성
    const thumbnailKey = `${folder}/${dataPath}/t_${baseFilename}${fileExt}`;
    try {
      const thumbnailBuffer = await sharp(file.buffer)
        .resize(100, 100, {
          fit: sharp.fit.cover,
        })
        .toBuffer();

      const thumbnailUploadParams: PutObjectCommandInput = {
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: file.mimetype,
      };

      await this.s3.send(new PutObjectCommand(thumbnailUploadParams));

      thumbnailUrl = `https://${bucket}.s3.${process.env.AWS_REGION!}.amazonaws.com/${thumbnailKey}`;

    } catch (err) {
      console.log('s3 service 썸네일 생성 또는 업로드 실패')
    }

    const originalUrl = `https://${bucket}.s3.${process.env.AWS_REGION!}.amazonaws.com/${thumbnailKey}`;

    return {thumbnailUrl, originalUrl}




  }
}
