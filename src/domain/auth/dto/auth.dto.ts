import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenDTO {
  @ApiProperty({ example: 'testtokentesttokentesttoken' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'testtokentesttokentesttoken' })
  @IsString()
  refreshToken: string;
}
