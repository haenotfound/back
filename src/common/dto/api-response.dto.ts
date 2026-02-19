// 뭐든 reponce가 있으면 dto다 그래서 dto는 생략한다.
// 일관성 있는 응답
export class ApiResponse<T = any> {
  message: string;
  data?: T

  // 초기화 생성자
  constructor(message:string, data?: T){
    this.message = message;
    this.data = data;
  }
}