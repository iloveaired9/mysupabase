# 🌟 커뮤니티 인기글 모아보기 (Community Hot Posts Aggregator)

[![GitHub](https://img.shields.io/badge/GitHub-iloveaired9%2Fmysupabase-blue?logo=github)](https://github.com/iloveaired9/mysupabase)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](docker-compose.yml)

여러 온라인 커뮤니티의 인기글을 한 곳에서 모아볼 수 있는 **PostgREST 기반 API** 프로젝트입니다.

**📍 GitHub Repository**: https://github.com/iloveaired9/mysupabase

## 📋 프로젝트 개요

- **기술 스택**: PostgreSQL + PostgREST + Docker Compose
- **아키텍처**: 스키마 기반 자동 API 생성 (Supabase 방식)
- **API 문서**: Swagger UI (커스텀 CSS 브랜딩 적용)
- **관리 인터페이스**: 통합 Admin Dashboard

## 🚀 빠른 시작

### 1. 서비스 시작

```bash
docker-compose up
```

### 2. 모든 서비스 확인

브라우저에서 다음 링크들을 열어보세요:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **💾 mysupabase Console** | http://localhost:5055 | Firebase 스타일 DB 관리 UI |
| **📊 Admin Dashboard** | http://localhost:5500/admin | 모든 서비스 관리 및 접근 |
| **📚 API 문서 (Swagger UI)** | http://localhost:8080 | 상호작용 가능한 API 문서 |
| **🔌 PostgREST API** | http://localhost:3001 | REST API 엔드포인트 |
| **🗄️ pgAdmin** | http://localhost:5050 | 데이터베이스 관리 |
| **PostgreSQL** | localhost:5432 | 데이터베이스 |
| **📧 MailHog** | http://localhost:8025 | 개발용 메일 서버 |

---

## 🎯 주요 기능

### ✅ PostgREST API
- 데이터베이스 스키마에서 자동 생성되는 REST API
- 필터링, 정렬, 페이지네이션 기본 지원
- RPC 함수를 통한 집계 통계 조회

### ✅ 상세한 API 문서
- Swagger UI에서 각 엔드포인트별 마크다운 설명
- cURL, JavaScript 코드 샘플
- 다양한 시나리오별 요청/응답 예시
- 프로젝트 브랜드 색상 적용

### ✅ Admin Dashboard
- 모든 마이크로서비스 한 곳에서 관리
- 포트, URL, 접속 정보 즉시 확인
- 개발 환경 자격증명 공개 (개발 용도)
- 빠른 명령어 참고

### ✅ mysupabase Console - Firebase 스타일 DB 관리 UI
- **데이터베이스 탐색**: 모든 테이블 목록 조회 및 선택
- **스키마 뷰어**: 테이블 구조, 컬럼 타입, 제약조건 표시
- **데이터 관리**: 페이지네이션과 함께 레코드 조회 및 추가
- **동적 폼**: PostgreSQL 컬럼 타입에 따른 입력 필드 자동 생성
- **SQL 쿼리 실행**: SELECT 쿼리 테스트 및 결과 JSON 표시
- **테마 관리**: Light/Dark 테마 토글 with localStorage 지속성
- **응답형 디자인**: 데스크톱/태블릿/모바일 완벽 지원
- **보안**: 파라미터화된 쿼리로 SQL Injection 방지

---

## 📡 API 사용 방법

### GET /posts - 게시글 조회

**최신순 조회 (기본)**
```bash
curl -X GET 'http://localhost:3001/posts?limit=6&order=created_at.desc' \
  -H 'Prefer: count=exact'
```

**카테고리 필터링**
```bash
curl -X GET 'http://localhost:3001/posts?categories.name=eq.tech&limit=10&order=likes.desc'
```

**검색 (제목 또는 요약)**
```bash
curl -X GET 'http://localhost:3001/posts?or=(title.ilike.*AI*,excerpt.ilike.*AI*)'
```

**JavaScript로 호출**
```javascript
async function getPosts(limit = 6, order = 'created_at.desc') {
  const response = await fetch(
    `http://localhost:3001/posts?limit=${limit}&order=${order}`,
    { headers: { 'Prefer': 'count=exact' } }
  );
  const posts = await response.json();
  const total = response.headers.get('content-range')?.split('/')[1];
  return { posts, total };
}
```

### POST /rpc/get_posts_stats - 통계 조회

```bash
curl -X POST 'http://localhost:3001/rpc/get_posts_stats' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

응답:
```json
[{
  "total_posts": 150,
  "avg_likes": 1256.33,
  "max_likes": 5432,
  "avg_comments": 298.5,
  "max_comments": 1200,
  "total_likes": 188450
}]
```

---

## 📚 상세 API 문서

### 📖 Swagger UI (인터랙티브)
**http://localhost:8080**

- 모든 엔드포인트 상호작용 가능
- "Try it out" 버튼으로 직접 테스트
- cURL/JavaScript 코드 샘플 포함
- 파라미터별 설명 및 예시

### 📄 마크다운 문서
**`docs/API_GUIDE.md`**

상세한 API 사용 가이드:
- 쿼리 문법 설명
- 필터링 연산자
- 페이지네이션 방법
- JavaScript 예제
- 문제 해결

### 🔧 OpenAPI 스펙
**`docs/swagger.json`**

- OpenAPI 3.0.0 표준 형식
- 모든 엔드포인트, 파라미터, 응답 정의
- 다른 API 문서 생성기와 호환

---

## 📖 학습 및 개발 가이드

### 🪟 Windows 11 Pro 설치 가이드
**`docs/WINDOWS_SETUP_GUIDE.md`**

Windows 11 Pro에서 프로젝트를 처음부터 설정하는 방법:
- Hyper-V 활성화
- Docker Desktop 설치 및 최적화
- Git 설정 및 SSH 키 생성
- 프로젝트 클론 및 Docker Compose 실행
- 서비스 접근 확인 및 API 테스트
- 포트 충돌, 권한, WSL 2 등 문제 해결

### 🚀 PostgREST 완벽 가이드
**`docs/POSTGREST_GUIDE.md`**

PostgREST 개념을 쉽게 이해하는 학습 자료:
- PostgREST란 무엇인가?
- REST API 자동 생성 원리
- 기본 SQL 개념 (Schema, Table, Column)
- CRUD 연산과 HTTP 메서드
- 실제 테이블 추가 예시
- 자주 묻는 질문 (FAQ)

### 🎯 새 테이블 추가 가이드
**`docs/NEW_TABLE_GUIDE.md`**

테이블을 생성하고 즉시 REST API를 사용하는 방법:
- psql 연결 방법 (Docker exec, 로컬 CLI)
- SQL 테이블 생성 문법 및 데이터 타입
- PostgreSQL 권한 설정 (GRANT)
- cURL, Swagger UI, JavaScript로 API 테스트
- 5가지 실제 사례 (피드백, 댓글, 뉴스레터, 외부키, 다대다 관계)
- 자주 하는 실수와 베스트 프랙티스

### 📊 데이터베이스 스키마 설계
**`docs/DATABASE_SCHEMA.md`**

좋은 데이터베이스 설계를 위한 완벽한 가이드:
- 정규화 원칙 (1NF, 2NF, 3NF)
- 현재 프로젝트 데이터베이스 구조
- 데이터 타입 선택 가이드
- 관계 설계 (1:N, N:N)
- 인덱스와 성능 최적화
- 설계 패턴 (Soft Delete, Audit Trail, 비정규화 등)
- PostgREST 특수 고려사항 (뷰, RPC 함수)

### 💾 데이터 유지 및 백업 가이드
**`docs/DATA_PERSISTENCE_GUIDE.md`**

데이터 유지와 백업 전략의 완벽한 가이드:
- Named Volume vs Bind Mount 비교
- 데이터 유지 원리 (컨테이너 삭제 시)
- SQL 덤프를 통한 백업 (pg_dump)
- 자동 백업 스크립트 (PowerShell + Task Scheduler)
- 복구 방법 (부분 복구, 재해 복구)
- 개발/프로덕션 환경 백업 전략
- 클라우드 백업 (AWS S3 선택사항)
- 백업 검증 및 정기 테스트
- 문제 해결 (권한, 마이그레이션 등)

### ☁️ AWS EC2 배포 가이드
**`docs/AWS_DEPLOYMENT_GUIDE.md`**

AWS에서 프로젝트를 배포하고 운영하는 완벽한 가이드:
- EC2 인스턴스 생성 및 설정 (권장 사양)
- Docker 및 Docker Compose 설치
- 프로젝트 배포 (단계별)
- 환경 변수 설정
- 보안 그룹 설정 (포트 허용)
- 서비스 상태 확인 및 헬스 체크
- 외부 접근 설정 (퍼블릭 IP 연결)
- 종합 문제 해결 (10가지 시나리오)
  * version 경고 제거
  * 컨테이너 실행 오류
  * PostgreSQL 연결 실패
  * API 접근 불가
  * 디스크/메모리 부족
- 모니터링 및 유지보수
  * systemd 자동 재시작
  * 자동 백업 (cron)
  * 로그 모니터링
  * 보안 업데이트

### 🔧 Backend API 서버 가이드
**`docs/BACKEND_API_GUIDE.md`**

Node.js Express 기반 Backend API 서버 가이드:
- Docker Compose를 통한 자동 빌드
- 프로젝트 구조 (Dockerfile, package.json)
- API 엔드포인트 (POST /api/posts, GET /api/categories 등)
- 환경 변수 설정
- PostgreSQL 연결 설정
- 로컬 개발 환경 (npm dev, nodemon)
- 포트 구성 (3000: Backend, 3001: PostgREST)
- Docker로 로컬 실행 방법
- AWS RDS 연결 설정
- 자동 재시작 (systemd)
- 문제 해결 (연결 실패, 포트 충돌 등)
- PostgREST vs Backend API 비교

### 💾 mysupabase Console 배포 가이드
**`docs/CONSOLE_DEPLOYMENT_GUIDE.md`**

Firebase Console 스타일 Database Management UI 배포:
- 로컬 Docker Compose 배포 (단계별)
- AWS EC2 배포 및 설정
- Console 기능 상세 가이드 (테이블, 스키마, 쿼리, 설정)
- API 엔드포인트 검증 (curl 예제)
- 보안 그룹 규칙 설정
- 자동 시작 설정 (systemd)
- 기능 검증 체크리스트
- 10가지 문제 해결 시나리오
- 성능 최적화 전략

### 💾 mysupabase Console 아키텍처 가이드
**`docs/CONSOLE_ARCHITECTURE.md`**

Console 개발자 및 기여자를 위한 아키텍처 문서:
- Vanilla JavaScript 모듈식 설계
- 6개 JavaScript 모듈 상세 설명 (api-client, theme-manager 등)
- 4개 CSS 파일 계층 구조
- Light/Dark 테마 구현
- 데이터 흐름 다이어그램
- 기능 확장 가이드 (UI 컴포넌트, API 엔드포인트, 새 탭 추가)
- 성능 최적화 팁
- 디버깅 기법
- 기여 가이드

### 💾 mysupabase Console 빠른 참조
**`docs/CONSOLE_QUICK_REFERENCE.md`**

콘솔 사용자를 위한 빠른 참조 가이드:
- 10초 빠른 시작 가이드
- 주요 작업 (데이터 조회, 레코드 추가, 쿼리 실행)
- curl 예제를 통한 API 사용법
- FAQ 및 문제 해결
- 키보드 단축키
- 포트 정리
- 백업 및 내보내기

---

## 🎨 API 엔드포인트

### Posts (게시글)
- `GET /posts` - 게시글 목록 (필터링, 정렬 가능)
- `GET /posts/{id}` - 특정 게시글 상세 조회

### Categories (카테고리)
- `GET /categories` - 전체 카테고리 목록

### Sources (출처)
- `GET /sources` - 전체 출처 목록

### Statistics (통계)
- `POST /rpc/get_posts_stats` - 게시글 통계
- `POST /rpc/get_categories_with_count` - 카테고리별 통계
- `POST /rpc/get_sources_with_count` - 출처별 통계

---

## 🛠️ 관리 명령어

### 서비스 제어

```bash
# 모든 서비스 시작
docker-compose up

# 백그라운드 실행
docker-compose up -d

# 모든 서비스 중지 (데이터 유지)
docker-compose down

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f postgrest
docker-compose logs -f swagger-ui
```

### 데이터베이스 작업

```bash
# PostgreSQL 접속
docker exec -it supabase-postgres psql -U supabase -d supabase

# SQL 파일 실행
docker exec -i supabase-postgres psql -U supabase -d supabase < schema.sql

# 데이터 백업
docker exec supabase-postgres pg_dump -U supabase -d supabase > backup.sql

# 데이터 복원
cat backup.sql | docker exec -i supabase-postgres psql -U supabase -d supabase
```

---

## 📊 Admin Dashboard (http://localhost:5500/admin)

### 기능

✅ **모든 서비스 한눈에 보기**
- 서비스 이름, 포트, 프로토콜
- 상태 배지 (Running/Stopped)
- 직접 접속 가능한 클릭 링크

✅ **개발 환경 자격증명**
- pgAdmin: admin@admin.com / admin
- PostgreSQL: supabase / postgres
- 복사 버튼으로 쉽게 복사

✅ **자주 사용하는 명령어**
```bash
# Docker 상태 확인
docker-compose ps

# API 테스트
curl http://localhost:3001/posts?limit=6

# 포트 확인
lsof -i :3001  # (Mac/Linux)
netstat -ano | findstr :3001  # (Windows)
```

✅ **프로젝트 정보**
- 모달로 프로젝트 설명 확인
- 빠른 링크 모음

---

## 💾 mysupabase Console (http://localhost:5055)

Firebase Console 스타일의 전문적인 데이터베이스 관리 UI입니다.

### 주요 기능

#### 1️⃣ 테이블 목록 조회
- 사이드바에서 모든 테이블 한눈에 보기
- 각 테이블의 레코드 수 즉시 표시
- 테이블 선택 시 자동으로 데이터 로드

#### 2️⃣ 📊 Data 탭 - 데이터 조회 및 추가
```
✓ 테이블의 모든 레코드를 페이지네이션으로 표시
✓ 각 컬럼별 스마트 값 포맷팅 (NULL, JSON, 긴 텍스트 등)
✓ [+ Add Record] 버튼으로 새 레코드 추가
✓ 동적 폼 생성 (PostgreSQL 컬럼 타입 기반)
  - text → textarea
  - integer/numeric → number input
  - boolean → checkbox
  - timestamp → datetime picker
  - varchar(n) → text input (maxlength 자동 적용)
```

#### 3️⃣ 📋 Schema 탭 - 테이블 구조 확인
```
✓ 모든 컬럼의 이름, 타입, 제약조건 표시
✓ Nullable 여부 표시
✓ Default 값 표시
✓ Primary Key 배지 표시
```

#### 4️⃣ 🔍 Query 탭 - SQL 쿼리 실행
```
✓ SELECT 쿼리만 실행 가능 (보안)
✓ 쿼리 실행 및 결과를 테이블로 표시
✓ 결과를 JSON 또는 CSV로 다운로드
✓ Ctrl+Enter로 빠른 실행
✓ 샘플 쿼리 제공
```

#### 5️⃣ ⚙️ Settings 탭 - 테이블 정보
```
✓ 테이블 이름, 레코드 수, 컬럼 수 표시
✓ 테이블 메타정보 한눈에 확인
```

### 사용 예시

#### 1. 테이블 데이터 조회
```
1. 사이드바에서 'posts' 테이블 클릭
2. Data 탭이 자동으로 열림
3. 페이지네이션으로 레코드 탐색
```

#### 2. 새 게시글 추가
```
1. Data 탭에서 [+ Add Record] 버튼 클릭
2. 동적 폼이 모달로 표시됨 (title, excerpt, content 등)
3. 값 입력 후 [Save] 버튼 클릭
4. 성공 토스트 표시 및 테이블 자동 새로고침
```

#### 3. 카테고리별 게시글 검색
```
1. Query 탭으로 이동
2. 다음 쿼리 입력:
   SELECT p.id, p.title, c.name
   FROM posts p
   JOIN categories c ON p.category_id = c.id
   WHERE c.name = 'tech'
   LIMIT 10;
3. [Execute] 버튼 또는 Ctrl+Enter 실행
4. 결과를 JSON으로 다운로드
```

#### 4. 테마 전환
```
1. 상단 네비게이션 바의 🌙 (달) 또는 ☀️ (해) 아이콘 클릭
2. 테마 자동 전환 (Light ↔ Dark)
3. 설정 localStorage에 자동 저장
```

### 기술 스택

**Frontend:**
- HTML5 + Vanilla JavaScript (No frameworks)
- CSS Custom Properties (색상, 폰트, 간격)
- Responsive Grid Layout
- localStorage for theme persistence

**Backend:**
- Node.js Express API
- PostgreSQL information_schema 활용
- Parameterized queries (SQL Injection 방지)
- Pagination support (limit, offset)

**Docker:**
- nginx:alpine으로 정적 파일 제공
- Backend API와 독립적으로 실행
- 포트 5055에서 서비스

### 보안 고려사항

✓ **SQL Injection 방지**: 모든 쿼리 파라미터화
✓ **SELECT Only**: Query 탭에서 SELECT 쿼리만 실행
✓ **테이블명 검증**: 정규식으로 테이블명 검증
✓ **시스템 테이블 제외**: pg_*, information_schema 테이블 숨김
✓ **Type Safety**: PostgreSQL 컬럼 타입 기반 입력 검증

### API 엔드포인트 (Backend)

Console에서 사용하는 API 엔드포인트:

```
GET  /api/db/tables                         # 모든 테이블 목록
GET  /api/db/tables/:tableName/schema       # 테이블 스키마
GET  /api/db/tables/:tableName/records      # 페이지네이션 레코드
POST /api/db/tables/:tableName/records      # 레코드 삽입
POST /api/db/query                          # SELECT 쿼리 실행
```

자세한 API 문서는 **Swagger UI (http://localhost:8080)** 참조

---

## 🔑 데이터베이스 자격증명

| 서비스 | 사용자명 | 비밀번호 | 호스트 | 포트 |
|--------|---------|---------|--------|------|
| PostgreSQL | supabase | postgres | localhost | 5432 |
| pgAdmin | admin@admin.com | admin | - | - |
| MailHog | (인증 없음) | - | - | 8025 |

---

## 📁 프로젝트 구조

```
mysupabase/
├── docker-compose.yml          # Docker 설정
├── .env                        # 환경 변수
│
├── docs/                       # API 문서
│   ├── swagger.json           # OpenAPI 3.0 스펙
│   ├── API_GUIDE.md           # 상세 가이드
│   ├── index.html             # Swagger UI (커스텀)
│   └── swagger-ui-custom.css  # 브랜드 스타일
│
├── postgres/
│   ├── init.sql               # 데이터베이스 초기화
│   └── schema.sql             # 테이블 스키마
│
├── app/
│   ├── step5/                 # 프론트엔드 앱
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   └── admin/                 # Admin Dashboard
│       └── index.html
│
└── README.md                   # 이 파일
```

---

## 🔗 API 쿼리 예시

### 페이지네이션

```javascript
// 2페이지 조회 (1페이지에 6개씩)
const page = 2;
const limit = 6;
const offset = (page - 1) * limit;

fetch(`http://localhost:3001/posts?limit=${limit}&offset=${offset}`);
```

### 고급 필터링

```javascript
// 기술 카테고리 + 최근 1주일 + 추천순
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

fetch(`http://localhost:3001/posts?
  categories.name=eq.tech&
  created_at=gte.${weekAgo}&
  order=likes.desc&
  limit=20`);
```

### 관계 데이터 로드

```javascript
// 게시글과 함께 카테고리, 출처 정보 로드
fetch(`http://localhost:3001/posts?
  select=id,title,likes,comments,categories(name,icon),sources(name,icon_emoji)`);
```

---

## 🎨 Swagger UI 커스터마이징

### 색상 팔레트

| 용도 | 색상 | 사용처 |
|------|------|--------|
| Primary | #0066cc | 제목, 주요 버튼, GET |
| Dark | #1a1a1a | 상단 바, 헤더 |
| Light | #f5f5f5 | 섹션 배경 |
| Success | #28a745 | POST 메서드 |
| Warning | #ffc107 | PUT 메서드 |
| Danger | #dc3545 | DELETE 메서드 |

### 폰트

- **본문**: Segoe UI, Roboto, sans-serif
- **제목**: Roboto Bold
- **코드**: Roboto Mono

### 파일 수정

커스터마이징을 변경하려면:
1. `docs/swagger-ui-custom.css` 수정
2. `docker-compose restart swagger-ui`

---

## 📱 반응형 디자인

모든 UI가 반응형으로 설계되었습니다:
- 📱 **모바일** (375px 이상)
- 📱 **태블릿** (768px 이상)
- 💻 **데스크톱** (1024px 이상)

---

## 🐛 문제 해결

### Swagger UI가 로드되지 않음

```bash
# 1. 컨테이너 확인
docker-compose ps swagger-ui

# 2. 로그 확인
docker-compose logs swagger-ui

# 3. 재시작
docker-compose restart swagger-ui
```

### API 응답이 없음

```bash
# 1. PostgREST 상태
docker-compose ps postgrest

# 2. 로그 확인
docker-compose logs postgrest

# 3. 포트 확인
curl http://localhost:3001/

# 4. 데이터베이스 확인
docker exec -it supabase-postgres psql -U supabase -d supabase -c "SELECT COUNT(*) FROM posts;"
```

### 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -i :3001      # Mac/Linux
netstat -ano | findstr :3001  # Windows

# 포트 변경 (.env 파일 수정)
POSTGREST_PORT=3002
```

---

## 📚 문서 및 학습 자료

### 📖 프로젝트 문서
- **[마스터 README](README.md)** - 프로젝트 전체 개요 (이 파일)
- **[API 가이드](docs/API_GUIDE.md)** - 상세한 API 사용 방법
- **[API 스펙](docs/swagger.json)** - OpenAPI 3.0 정의
- **[Step별 가이드](app/step1/README.md)** - 단계별 학습

### 🔗 GitHub 페이지
- **[저장소](https://github.com/iloveaired9/mysupabase)** - 소스 코드
- **[Issues](https://github.com/iloveaired9/mysupabase/issues)** - 버그 신고 및 기능 요청
- **[Discussions](https://github.com/iloveaired9/mysupabase/discussions)** - 질문 및 토론
- **[Wiki](https://github.com/iloveaired9/mysupabase/wiki)** - 추가 문서
- **[Releases](https://github.com/iloveaired9/mysupabase/releases)** - 버전 이력

### 📚 기초 개념
- **PostgREST**: PostgreSQL 스키마 기반 자동 API 생성
- **OpenAPI**: API 문서 표준
- **Docker**: 컨테이너 기반 개발 환경

### 🌐 외부 자료
- [PostgREST 공식 문서](https://postgrest.org)
- [Swagger UI 가이드](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 스펙](https://spec.openapis.org/oas/v3.0.0)
- [Docker 공식 문서](https://docs.docker.com/)

---

## 🚀 다음 단계

### 1. 프론트엔드 연결
```javascript
// 프로젝트 프론트엔드에서 API 호출
const API_BASE = 'http://localhost:3001';

fetch(`${API_BASE}/posts?limit=10&order=likes.desc`)
  .then(res => res.json())
  .then(posts => console.log(posts));
```

### 2. 인증 추가
- JWT 토큰 기반 인증
- PostgREST 역할(Role) 권한 관리

### 3. 실시간 기능
- Realtime 플러그인 추가
- WebSocket 구독

### 4. 배포
- Docker 이미지 빌드
- 클라우드 호스팅 (AWS, DigitalOcean, etc.)

---

## 📞 지원 및 피드백

문제 발생 시:
1. **로그 확인**: `docker-compose logs -f`
2. **Admin Dashboard**: http://localhost:5500/admin
3. **Swagger UI**: http://localhost:8080 (API 테스트)

---

## 🤝 기여하기

이 프로젝트에 기여하고 싶으신가요?

1. [저장소를 Fork](https://github.com/iloveaired9/mysupabase/fork)하세요
2. 새로운 브랜치를 만드세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 Commit하세요 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치에 Push하세요 (`git push origin feature/amazing-feature`)
5. [Pull Request를 생성](https://github.com/iloveaired9/mysupabase/pull/new/main)하세요

### 커밋 메시지 규칙
- `feat:` - 새로운 기능
- `fix:` - 버그 수정
- `docs:` - 문서 변경
- `style:` - 코드 포맷팅 (기능 변화 없음)
- `refactor:` - 코드 리팩토링
- `test:` - 테스트 추가/수정
- `chore:` - 빌드/의존성 관련

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스** 하에 있습니다.
자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 연락처 및 지원

### 도움이 필요하신가요?

| 방법 | 링크 |
|------|------|
| **🐛 버그 신고** | [GitHub Issues](https://github.com/iloveaired9/mysupabase/issues) |
| **💡 기능 제안** | [GitHub Discussions](https://github.com/iloveaired9/mysupabase/discussions) |
| **❓ 질문** | [GitHub Discussions - Q&A](https://github.com/iloveaired9/mysupabase/discussions/categories/q-a) |

---

## 📊 프로젝트 통계

- **주요 언어**: SQL, JavaScript, HTML/CSS
- **데이터베이스**: PostgreSQL
- **API 프레임워크**: PostgREST
- **문서화**: OpenAPI 3.0 + Swagger UI
- **컨테이너화**: Docker Compose

---

## 🚀 앞으로의 계획

- [ ] 사용자 인증 시스템 추가
- [ ] 실시간 업데이트 (WebSocket)
- [ ] 고급 검색 기능
- [ ] 데이터 내보내기 (CSV, JSON)
- [ ] 분석 대시보드
- [ ] 모바일 앱

---

**Happy coding! 🎉**

마지막 업데이트: 2026-04-04
GitHub: https://github.com/iloveaired9/mysupabase
