import { BadRequestException } from "@nestjs/common";

// 커스텀 예외 생성
export default class MemberException extends BadRequestException{
  constructor(message:string){
    super(message)
  }
}