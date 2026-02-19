export interface JwtPayload{
  id : number,
  memberEmail? : string;
  iat?: number; // 만들어진 시간
  exp?: number; // 만료 시간
}

export interface AuthRequest extends Request {
  user: JwtPayload
}