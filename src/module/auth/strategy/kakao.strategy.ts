import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-kakao";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  
  constructor() {
    super({
      clientID: process.env.KAKAO_REST_API_KEY!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      callbackURL: process.env.KAKAO_CALLBACK_URL!,
    });
  }
  async validate(accessToken:string, refreshToken:string, profile:any, done:any) {
    
    const {id, username,_json} = profile;

    const user = {
      id:id,
      userName: username,
      email: _json?.kakao_account?.email,
      profileImage: _json?.properties?.profile_image
    }
    done(null, user)
  }
}