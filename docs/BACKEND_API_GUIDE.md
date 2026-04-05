# 🔧 Backend API 서버 가이드

## 목차
1. [개요](#개요)
2. [구조](#구조)
3. [Docker Compose로 실행](#docker-compose로-실행)
4. [API 엔드포인트](#api-엔드포인트)
5. [로컬 개발 환경](#로컬-개발-환경)
6. [배포](#배포)

---

## 개요

Backend API 서버는 **Node.js + Express + PostgreSQL**로 구축된 REST API입니다.

### 특징
```
✅ Express.js 기반 REST API
✅ PostgreSQL 데이터베이스 연결
✅ CORS 지원
✅ 페이지네이션, 필터링, 정렬
✅ 상대시간 표시 (예: "2시간 전")
✅ Docker로 쉽게 배포
```

### 포트 구성

```
┌─────────────────────────────────────┐
│ 호스트 (Host)                       │
├─────────────────────────────────────┤
│ 3000: Backend API ← PostgREST 대체용  │
│ 3001: PostgREST API                 │
│ 8080: Swagger UI                    │
│ 5432: PostgreSQL                    │
│ 5050: pgAdmin                       │
│ 1025/8025: MailHog                  │
└─────────────────────────────────────┘
```

---

## 구조

```
backend/
├── Dockerfile          # Docker 이미지 빌드 설정
├── package.json        # Node.js 의존성
├── .env                # 환경 변수
└── server.js           # Express 서버 (메인)
```

### 파일별 설명

#### **Dockerfile**
```dockerfile
FROM node:20-alpine     # Node.js 20 사용
WORKDIR /app            # 작업 디렉토리
COPY package*.json ./   # package.json 복사
RUN npm install         # 의존성 설치
COPY . .                # 애플리케이션 코드 복사
COPY .env .env          # 환경 변수 복사
EXPOSE 3000             # 포트 3000 노출
CMD ["npm", "start"]    # npm start 실행
```

#### **package.json**
```json
{
  "name": "hot-posts-api",
  "dependencies": {
    "express": "^4.18.2",    // Web 프레임워크
    "pg": "^8.9.0",          // PostgreSQL 드라이버
    "cors": "^2.8.5",        // CORS 지원
    "dotenv": "^16.0.3"      // 환경 변수 로드
  }
}
```

#### **.env**
```bash
# PostgreSQL 연결
DB_HOST=postgres        # 호스트 (docker-compose에서 postgres 서비스)
DB_PORT=5432            # 포트
DB_USER=supabase        # 사용자명
DB_PASSWORD=postgres    # 비밀번호
DB_NAME=supabase        # 데이터베이스명

# Express 설정
PORT=3000               # 서버 포트
NODE_ENV=development    # 개발 모드

# CORS 설정
CORS_ORIGIN=http://localhost:5500  # 클라이언트 주소
```

---

## Docker Compose로 실행

### 1️⃣ 모든 서비스 시작 (권장)

```bash
# 최상위 디렉토리에서
docker-compose up -d

# 로그 확인
docker-compose logs -f backend

# 예상 출력:
# ✅ PostgreSQL 데이터베이스 연결 성공
# Backend API server running on port 3000
```

### 2️⃣ Backend만 재빌드

```bash
# 최상위 디렉토리에서
docker-compose build backend

# 또는 캐시 무시하고 재빌드
docker-compose build --no-cache backend
```

### 3️⃣ Backend만 재시작

```bash
docker-compose restart backend

# 또는
docker-compose down backend
docker-compose up -d backend
```

### 4️⃣ Backend 로그 보기

```bash
# 실시간 로그
docker-compose logs -f backend

# 최근 50줄
docker-compose logs --tail=50 backend

# 특정 시간 이후 로그
docker-compose logs --since 2026-01-01T00:00:00Z backend
```

---

## API 엔드포인트

### GET /api/posts - 게시글 목록 조회

```bash
# 기본 조회 (최신순, 6개)
curl http://localhost:3000/api/posts?limit=6&offset=0&sort_by=created_at&order=DESC

# 응답 예시:
{
  "posts": [
    {
      "id": 1,
      "title": "AI가 코딩하는 세상이 온다",
      "excerpt": "ChatGPT가 프로그래밍을 완전히 바꾸고 있습니다...",
      "category": "기술",
      "source": "HackerNews",
      "likes": 1245,
      "created_at_relative": "2시간 전"
    }
  ],
  "total": 150
}
```

**파라미터**:
```
?limit=6          // 한 번에 가져올 개수 (기본값: 6)
?offset=0         // 시작 위치 (기본값: 0)
?sort_by=created_at  // 정렬 기준 (created_at, likes)
?order=DESC       // 정렬 순서 (DESC, ASC)
?search=AI        // 검색어 (title, excerpt)
?category=기술    // 카테고리 필터
?source=HackerNews // 출처 필터
```

### GET /api/posts/:id - 게시글 상세 조회

```bash
curl http://localhost:3000/api/posts/1

# 응답:
{
  "id": 1,
  "title": "AI가 코딩하는 세상이 온다",
  "excerpt": "...",
  "content": "...",
  "category": "기술",
  "source": "HackerNews",
  "likes": 1245,
  "created_at": "2026-04-04T10:30:00Z",
  "created_at_relative": "2시간 전"
}
```

### GET /api/categories - 카테고리 목록

```bash
curl http://localhost:3000/api/categories

# 응답:
{
  "categories": [
    {
      "id": 1,
      "name": "기술",
      "icon": "🚀",
      "post_count": 145
    }
  ]
}
```

### GET /api/sources - 출처 목록

```bash
curl http://localhost:3000/api/sources

# 응답:
{
  "sources": [
    {
      "id": 1,
      "name": "HackerNews",
      "icon": "📰",
      "url": "https://news.ycombinator.com"
    }
  ]
}
```

---

## 로컬 개발 환경

### 1️⃣ Docker 없이 로컬 실행

```bash
# backend 디렉토리로 이동
cd backend

# 의존성 설치
npm install

# 개발 서버 시작 (nodemon - 코드 변경 시 자동 재시작)
npm run dev

# 또는 일반 실행
npm start

# 접근
curl http://localhost:3000/api/posts
```

### 2️⃣ Docker로 로컬 개발

```bash
# Docker로 빌드 (처음 한 번만)
docker build -t mysupabase-backend ./backend

# 실행
docker run -it \
  --name backend \
  --network host \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_USER=supabase \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=supabase \
  mysupabase-backend
```

### 3️⃣ 환경 변수 커스터마이징

**backend/.env 수정**:
```bash
# 다른 호스트/포트 사용
DB_HOST=your-db-server.com
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db

# CORS 설정 변경
CORS_ORIGIN=https://example.com
```

---

## 배포

### AWS EC2에 배포

```bash
# 1. EC2 인스턴스 SSH 접속
ssh -i your-key.pem ec2-user@your-instance-ip

# 2. Docker Compose 실행
cd /home/ec2-user/docker/mysupabase
docker-compose up -d

# 3. 보안 그룹에서 포트 3000 열기
# AWS Console → Security Groups → Inbound Rules
# Add rule: Custom TCP, Port 3000, Source 0.0.0.0/0
```

### 환경 변수 설정 (AWS)

**.env 파일 (프로덕션 환경)**:
```bash
# AWS RDS PostgreSQL 사용 예시
DB_HOST=your-rds-instance.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=mysupabase

# CORS 설정 (프론트엔드 도메인)
CORS_ORIGIN=https://yourdomain.com

# 환경
NODE_ENV=production
```

### 자동 재시작 설정

```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/docker-compose-mysupabase.service
```

```ini
[Unit]
Description=Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
User=ec2-user
WorkingDirectory=/home/ec2-user/docker/mysupabase
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable docker-compose-mysupabase
sudo systemctl start docker-compose-mysupabase
```

---

## 문제 해결

### ❌ "PostgreSQL 연결 실패"

```
Error: connect ECONNREFUSED postgres:5432
```

**확인**:
```bash
# PostgreSQL 컨테이너 실행 중인지 확인
docker-compose ps postgres

# 로그 확인
docker-compose logs postgres

# PostgreSQL 직접 접속 테스트
docker-compose exec postgres psql -U supabase -d supabase -c "SELECT 1"
```

**해결**:
```bash
# PostgreSQL 재시작
docker-compose restart postgres

# 또는 전체 재시작
docker-compose down
docker-compose up -d
```

### ❌ "포트 이미 사용 중"

```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**해결**:
```bash
# 포트 사용 프로세스 확인
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 프로세스 종료
kill -9 <PID>

# 또는 docker-compose.yml에서 포트 변경
# ports:
#   - "3001:3000"  # 호스트 포트를 3001로 변경
```

### ❌ "npm install 실패"

```
npm ERR! code ERESOLVE
```

**해결**:
```bash
# Dockerfile에서 npm install --legacy-peer-deps 사용
RUN npm install --legacy-peer-deps
```

### ❌ "환경 변수 인식 안 됨"

```bash
# 컨테이너 환경 변수 확인
docker-compose exec backend env | grep DB_

# 또는 컨테이너 재빌드
docker-compose build --no-cache backend
docker-compose up -d backend
```

---

## 개발 팁

### 1️⃣ 코드 변경 시 자동 재시작

```bash
# 로컬 개발: nodemon 사용 (이미 설정됨)
npm run dev

# Docker 개발: volumes로 코드 마운트 (docker-compose.yml에 설정됨)
volumes:
  - ./backend:/app
  - /app/node_modules
```

### 2️⃣ 데이터베이스 초기화

```bash
# 모든 테이블 초기화
docker-compose down -v

# 데이터 보존하고 시작
docker-compose down
docker-compose up -d
```

### 3️⃣ 빠른 테스트

```bash
# API 빠르게 테스트
curl -s http://localhost:3000/api/posts | jq .

# 또는 REST Client 확장 사용 (VS Code)
# Create: test.http 파일

###
GET http://localhost:3000/api/posts?limit=10

###
GET http://localhost:3000/api/posts/1

###
GET http://localhost:3000/api/categories
```

---

## 체크리스트

```
☑ Backend 서비스 이해
  ☑ Dockerfile 확인
  ☑ package.json 의존성 확인
  ☑ .env 파일 설정

☑ Docker Compose 실행
  ☑ docker-compose up -d
  ☑ 모든 컨테이너 실행 확인
  ☑ Backend 로그 확인

☑ API 테스트
  ☑ curl로 /api/posts 조회
  ☑ /api/categories 확인
  ☑ /api/sources 확인

☑ 개발 환경 설정
  ☑ 코드 변경 시 자동 재시작 작동 확인
  ☑ 환경 변수 로드 확인

☑ 배포 준비
  ☑ 프로덕션 .env 파일 준비
  ☑ AWS RDS 연결 테스트
  ☑ 자동 재시작 설정
```

---

## PostgREST vs Backend API

```
┌──────────────────────────────────────┐
│ PostgREST (포트 3001)                │
├──────────────────────────────────────┤
│ ✅ 자동 REST API 생성                │
│ ✅ 복잡한 쿼리 가능                  │
│ ❌ 커스터마이징 어려움                │
│ ❌ 비즈니스 로직 구현 제한            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Backend API (포트 3000)              │
├──────────────────────────────────────┤
│ ✅ 커스터마이징 가능                  │
│ ✅ 비즈니스 로직 구현 자유            │
│ ✅ 응답 포맷 제어 가능                │
│ ❌ 수동으로 구현해야 함               │
└──────────────────────────────────────┘

권장: 두 가지 모두 사용!
- PostgREST: 빠른 프로토타입, 간단한 CRUD
- Backend API: 복잡한 로직, 커스터마이징
```

---

더 자세한 정보는 [AWS 배포 가이드](AWS_DEPLOYMENT_GUIDE.md)를 참고하세요.

Happy Coding! 🚀
