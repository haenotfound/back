# Backend 작업 정리 (팀장 담당)

## 현재 상황 분석

### 이미 있는 것 (강사님이 준 기본 틀)

- NestJS 11 + Prisma + MySQL 기반 백엔드 구조
- `Member` + `AuthAccount` 2개 모델만 schema에 정의됨
- 로컬 로그인/회원가입 + 소셜 로그인(Google/Kakao/Naver) 기본 구현 완료
- JWT 인증, Redis, S3, Swagger 등 인프라 모듈 세팅 완료
- Controller → Service → Repository 3계층 패턴 확립

### 아직 없는 것 (내가 해야 할 것)

- ERD에 있는 나머지 테이블들이 `schema.prisma`에 전혀 반영되지 않음
- 안전점수 관련 도메인 전체 (모델, DTO, Controller, Service, Repository)
- 팀원들 파트에 해당하는 테이블 스키마도 아직 없음
- `.env`의 DB명이 `nest` (기본값) → 프로젝트에 맞게 변경 필요

---

## 내 담당 파트

- 메인 / 헤더 / 푸터
- 로그인
- 회원가입
- 안전점수

## 공통 담당

- DB 설계 (Prisma Schema)
- Style 선언
- 공통 모듈 / 예외처리 / DTO

---

## 작업 순서

### 1단계: Prisma Schema 설계 (가장 먼저, 전체 팀에 영향)

> 파일: `prisma/schema.prisma`

- ERD Cloud에 설계한 **모든 테이블**을 Prisma 모델로 작성
- 현재 `Member`, `AuthAccount`만 있으니 나머지 전부 추가
- 관계(relation), 인덱스, enum 등 정의
- 안전점수 관련 테이블도 이 단계에서 같이 작성
- 팀원들 파트 테이블도 **내가 다 작성**해서 뿌려야 함

---

### 2단계: DB 환경 설정 및 마이그레이션

> 파일: `.env`, 터미널 명령어

1. `.env`의 `DATABASE_URL`에서 DB명을 프로젝트에 맞게 변경 (현재 `nest` → 예: `safety_project`)
2. 마이그레이션 실행:
   ```bash
   npx prisma migrate dev --name init_all_tables
   npx prisma generate
   ```
3. 팀원들에게 동일한 `.env` 템플릿 공유 (비밀키 제외)

---

### 3단계: 공통 모듈/구조 정비

팀원들이 일관되게 개발할 수 있도록 공통 부분 정리:

| 파일 | 할 일 |
|------|--------|
| `src/common/dto/api-response.dto.ts` | 이미 있음 - 필요시 확장 (페이지네이션 응답 등) |
| `src/exception/` | 공통 예외 클래스 추가 (현재 `MemberException`만 있음) |
| `src/config/swagger.config.ts` | Swagger 그룹/태그 정리 |
| `src/module/core/core.module.ts` | 공통 인프라 모듈 - 이미 세팅됨 |

---

### 4단계: 회원가입 파트 커스터마이징

이미 기본 구현이 있으니, 프로젝트 ERD에 맞게 **수정/확장**:

| 파일 | 할 일 |
|------|--------|
| `prisma/schema.prisma` → Member 모델 | ERD에 맞게 컬럼 추가/수정 (예: 전화번호, 생년월일 등) |
| `src/domain/member/dto/member.dto.ts` | DTO 필드를 스키마에 맞게 수정 |
| `src/domain/member/dto/member.response.ts` | 응답 타입 수정 |
| `src/repository/member/member.repository.ts` | 쿼리 수정 |
| `src/service/member/member.service.ts` | 비즈니스 로직 수정 |
| `src/controller/member/member.controller.ts` | API 엔드포인트 수정 |

---

### 5단계: 로그인 파트 커스터마이징

기본 구현이 있으니 확인/수정:

| 파일 | 할 일 |
|------|--------|
| `src/controller/auth/auth.controller.ts` | 필요시 엔드포인트 수정 |
| `src/service/auth/auth.service.ts` | 로그인 로직 프로젝트에 맞게 조정 |
| `src/module/auth/strategy/*.ts` | 소셜 로그인 전략 설정 확인 |
| `src/module/auth/guard/*.ts` | Guard 설정 확인 |

---

### 6단계: 안전점수 파트 (신규 개발)

완전히 새로 만들어야 하며, 기존 패턴을 따라 구조를 만든다:

```
src/
├── controller/safety/          → safety.controller.ts (새로 생성)
├── domain/safety/
│   ├── dto/                    → safety.dto.ts (새로 생성)
│   └── entity/                 → safety.entity.ts (새로 생성)
├── repository/safety/          → safety.repository.ts (새로 생성)
├── service/safety/             → safety.service.ts (새로 생성)
├── module/safety/              → safety.module.ts (새로 생성)
└── exception/                  → exception.safety.ts (새로 생성)
```

#### 작업 순서:
1. `schema.prisma`에 안전점수 관련 모델 정의 (1단계에서 이미 완료)
2. `safety.entity.ts` - Prisma 타입 기반 엔티티 정의
3. `safety.dto.ts` - 요청/응답 DTO 작성
4. `safety.repository.ts` - DB 접근 로직
5. `safety.service.ts` - 비즈니스 로직
6. `safety.controller.ts` - API 엔드포인트
7. `safety.module.ts` - 모듈 등록
8. `app.module.ts`에 `SafetyModule` import 추가

---

### 7단계: 팀원 배포 준비

1. 위 작업 완료 후 `prisma/schema.prisma` 최종 확인
2. 팀원별 파트에 해당하는 빈 폴더 구조 생성 (선택)
3. 팀원들에게 전달할 것:
   - `schema.prisma` 파일
   - `.env` 템플릿
   - 폴더 구조 컨벤션 (controller/service/repository 패턴)
   - `npx prisma migrate dev` & `npx prisma generate` 실행 안내

---

## 우선순위 요약

| 순서 | 작업 | 중요도 | 비고 |
|------|------|--------|------|
| **1** | schema.prisma에 전체 ERD 반영 | ⭐ 최우선 | 팀 전체 블로킹 |
| **2** | .env 설정 + 마이그레이션 | ⭐ 최우선 | DB 생성 |
| **3** | 공통 모듈/예외/DTO 정비 | 🔴 높음 | 팀 컨벤션 |
| **4** | 회원가입 수정 | 🟡 중간 | 기존 코드 수정 |
| **5** | 로그인 수정 | 🟡 중간 | 기존 코드 수정 |
| **6** | 안전점수 신규 개발 | 🟡 중간 | 완전 신규 |
| **7** | 팀원에게 배포 | 🔴 높음 | 1~3 끝나면 바로 |

> **핵심:** 1번(schema.prisma)이 끝나야 팀원들이 각자 파트 백엔드 작업을 시작할 수 있다!
