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
