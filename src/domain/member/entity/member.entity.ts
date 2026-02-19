// Entity란?
//    - 엔터티란 현실 세계의 객체, 어떠한 대상, 개체를 의미한다. 
//    현실 세계의 어떤 것도 엔터티라고 할 수 있지만    SQL에서는 업무에 쓰이는 정보들   
//    즉, 데이터의 집합을 의미한다

import { AuthAccount, Member } from "@prisma/client";

export type MemberEntity = Member & {socials: AuthAccount[]};