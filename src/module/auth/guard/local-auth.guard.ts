// Guard : 컨트롤러가 호출되면 Local  전략을 실행시키기 위한 역할

import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";



@Injectable()
export class LocalAuthGuard extends AuthGuard('local'){;}