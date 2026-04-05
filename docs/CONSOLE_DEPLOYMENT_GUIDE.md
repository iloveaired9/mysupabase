# 💾 mysupabase Console - 배포 가이드

Firebase Console 스타일의 Database Management UI를 로컬 및 AWS 환경에서 배포하는 완벽한 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [로컬 배포 (Docker Compose)](#로컬-배포-docker-compose)
3. [AWS EC2 배포](#aws-ec2-배포)
4. [기능 검증](#기능-검증)
5. [문제 해결](#문제-해결)

---

## 개요

### Console이란?

**mysupabase Console**은 PostgreSQL 데이터베이스를 웹 기반으로 관리하는 프로페셔널한 UI입니다.

**특징:**
- Firebase Console과 유사한 사용자 경험
- React 없이 순수 Vanilla JavaScript로 구현
- 응답형 디자인 (모바일, 태블릿, 데스크톱)
- Light/Dark 테마 지원
- SQL Injection 방지 (파라미터화된 쿼리)
- 동적 폼 생성 (PostgreSQL 타입 기반)

### 포트 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| mysupabase Console | 5055 | Database Management UI |
| Admin Dashboard | 5500 | Service Overview |
| Swagger UI | 8080 | API Documentation |
| Backend API | 3000 | Express.js Server |
| PostgREST API | 3001 | Auto-generated REST API |

---

## 로컬 배포 (Docker Compose)

### 전제 조건

```bash
# Docker 설치 확인
docker --version
# Docker Compose 설치 확인
docker-compose --version
```

### 1단계: 프로젝트 클론

```bash
git clone https://github.com/iloveaired9/mysupabase.git
cd mysupabase
```

### 2단계: Docker Compose 시작

```bash
# 모든 서비스 시작
docker-compose up

# 또는 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f console
```

### 3단계: Console 접속

브라우저에서 **http://localhost:5055** 열기

**예상 화면:**
- 상단 네비게이션 바: "💾 Database Console"
- 좌측 사이드바: 테이블 목록 (categories, sources, posts)
- 중앙: 빈 상태 메시지 ("테이블을 선택해주세요")

### 4단계: 첫 번째 테이블 탐색

1. **사이드바에서 'posts' 테이블 클릭**
   - 테이블 로드 (약 1-2초)
   - 중앙에 Data, Schema, Query, Settings 탭 표시

2. **Data 탭 - 레코드 확인**
   ```
   ✓ 50개 샘플 데이터 표시 (10개씩 페이지)
   ✓ id, title, excerpt, created_at 등의 컬럼 표시
   ✓ 페이지네이션: Previous/Next 버튼
   ```

3. **Schema 탭 - 테이블 구조 확인**
   ```
   ✓ 각 컬럼의 타입 표시 (integer, text, timestamp 등)
   ✓ Nullable 여부
   ✓ Primary Key (PK) 배지
   ✓ Default 값
   ```

4. **Query 탭 - SQL 실행**
   ```sql
   SELECT * FROM posts LIMIT 5;
   ```
   - [Execute] 버튼 또는 Ctrl+Enter
   - 결과가 테이블로 표시됨

5. **Settings 탭 - 테이블 정보**
   ```
   ✓ 테이블명: posts
   ✓ 레코드 수: 50
   ✓ 컬럼 수: 7
   ```

### 5단계: 새 레코드 추가

1. **Data 탭에서 [+ Add Record] 버튼 클릭**
2. **모달 폼 표시됨**
   ```
   □ title (text input)
   □ excerpt (text input)
   □ content (textarea)
   □ category_id (number input)
   □ source_id (number input)
   □ likes (number input)
   □ comments (number input)
   ```
3. **값 입력 후 [Save] 클릭**
   ```
   title: "Test Post"
   excerpt: "A test post for console verification"
   content: "Full content here..."
   category_id: 1
   source_id: 1
   likes: 0
   comments: 0
   ```
4. **성공 토스트 표시 및 테이블 자동 새로고침**

### 6단계: 테마 전환

1. **상단 우측 🌙 아이콘 클릭**
   - Dark 테마로 전환
2. **다시 ☀️ 아이콘 클릭**
   - Light 테마로 복귀
3. **새로고침해도 설정이 유지됨** (localStorage)

### 로컬 배포 검증 체크리스트

- [ ] Console이 http://localhost:5055에서 로드됨
- [ ] 테이블 목록이 사이드바에 표시됨
- [ ] 테이블 클릭 시 데이터 로드됨
- [ ] 페이지네이션이 작동함
- [ ] 새 레코드 추가 폼이 표시됨
- [ ] 레코드 저장이 성공함
- [ ] 테마 전환이 작동함
- [ ] Query 탭에서 SELECT 쿼리 실행 가능
- [ ] 브라우저 콘솔에 에러 없음

---

## AWS EC2 배포

### 전제 조건

- AWS EC2 인스턴스 (t2.micro 이상, Ubuntu 20.04 LTS)
- 탄력적 IP 주소 할당
- 보안 그룹: 인바운드 규칙 설정

### 1단계: 보안 그룹 규칙 설정

**AWS 콘솔에서:**

```
인바운드 규칙 추가:
├─ SSH (22)          from 0.0.0.0/0 또는 특정 IP
├─ HTTP (80)         from 0.0.0.0/0
├─ HTTPS (443)       from 0.0.0.0/0
├─ Console (5055)    from 0.0.0.0/0
├─ Admin (5500)      from 0.0.0.0/0
├─ Swagger UI (8080) from 0.0.0.0/0
└─ Backend (3000)    from 0.0.0.0/0
```

### 2단계: EC2 연결 및 환경 설정

```bash
# EC2 인스턴스에 SSH 연결
ssh -i your-key.pem ec2-user@your-instance-ip

# 또는 Ubuntu의 경우
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 3단계: Docker 설치

```bash
# 패키지 업데이트
sudo yum update -y
# 또는 Ubuntu의 경우
sudo apt-get update -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker 권한 설정
sudo usermod -aG docker $USER
newgrp docker

# Docker 버전 확인
docker --version
```

### 4단계: Docker Compose 설치

```bash
# Docker Compose 다운로드 및 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 실행 권한 부여
sudo chmod +x /usr/local/bin/docker-compose

# 버전 확인
docker-compose --version
```

### 5단계: 프로젝트 클론

```bash
# 프로젝트 디렉토리로 이동
cd /home/ec2-user  # 또는 /home/ubuntu
# 또는 /opt 디렉토리 사용
sudo mkdir -p /opt/mysupabase
cd /opt/mysupabase

# GitHub에서 클론
git clone https://github.com/iloveaired9/mysupabase.git .

# 파일 확인
ls -la
```

### 6단계: 환경 변수 설정

```bash
# .env 파일 생성
cat > .env << 'EOF'
# PostgreSQL
POSTGRES_DB=supabase
POSTGRES_USER=supabase
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432

# pgAdmin
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin

# Node.js Environment
NODE_ENV=production
EOF

# 파일 확인
cat .env
```

### 7단계: Docker Compose 시작

```bash
# 모든 서비스 시작
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f console

# 특정 서비스 로그
docker-compose logs backend
```

### 8단계: Console 접속 확인

**브라우저에서 다음 URL 접속:**

```
http://54.180.52.120:5055
```

또는

```
http://your-elastic-ip:5055
```

**예상 화면:**
- Database Console UI 로드됨
- 테이블 목록이 사이드바에 표시됨

### 9단계: 자동 시작 설정 (선택)

```bash
# systemd 서비스 파일 생성
sudo tee /etc/systemd/system/mysupabase.service > /dev/null << 'EOF'
[Unit]
Description=mysupabase Docker Compose Services
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/mysupabase
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable mysupabase
sudo systemctl start mysupabase

# 상태 확인
sudo systemctl status mysupabase
```

### AWS 배포 검증 체크리스트

- [ ] EC2 인스턴스가 실행 중
- [ ] 보안 그룹 규칙이 올바르게 설정됨
- [ ] Docker 설치됨
- [ ] Docker Compose 설치됨
- [ ] 프로젝트 클론 완료
- [ ] docker-compose up -d 성공
- [ ] http://your-ip:5055 접속 가능
- [ ] Console UI 로드됨
- [ ] 테이블 목록 표시됨
- [ ] 데이터 조회 가능

---

## 기능 검증

### 1. 테이블 목록 조회

```bash
# curl로 API 확인
curl -s http://your-ip:3000/api/db/tables | jq '.'

# 응답 예시:
# {
#   "success": true,
#   "data": [
#     { "name": "categories", "rowCount": 5 },
#     { "name": "sources", "name": "posts" },
#     { "name": "posts", "rowCount": 50 }
#   ]
# }
```

### 2. 스키마 조회

```bash
curl -s http://your-ip:3000/api/db/tables/posts/schema | jq '.'

# 응답 예시:
# {
#   "success": true,
#   "data": {
#     "columns": [
#       {
#         "name": "id",
#         "type": "integer",
#         "nullable": false,
#         "isPrimaryKey": true,
#         "default": null
#       },
#       ...
#     ]
#   }
# }
```

### 3. 레코드 조회 (페이지네이션)

```bash
curl -s 'http://your-ip:3000/api/db/tables/posts/records?page=1&limit=10' | jq '.'

# 응답에 pagination 정보 포함:
# {
#   "success": true,
#   "data": [ ... 10 records ... ],
#   "pagination": {
#     "page": 1,
#     "pages": 5,
#     "limit": 10,
#     "total": 50
#   }
# }
```

### 4. 레코드 삽입

```bash
curl -X POST http://your-ip:3000/api/db/tables/posts/records \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Test Post",
    "excerpt": "Test excerpt",
    "content": "Test content",
    "category_id": 1,
    "source_id": 1,
    "likes": 0,
    "comments": 0
  }'

# 성공 응답:
# {
#   "success": true,
#   "message": "Record inserted successfully"
# }
```

### 5. 쿼리 실행

```bash
curl -X POST http://your-ip:3000/api/db/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT * FROM posts LIMIT 5;"}'

# 응답:
# {
#   "success": true,
#   "data": [ ... query results ... ]
# }
```

---

## 문제 해결

### 1. Console이 로드되지 않음

**증상:** 브라우저에서 http://localhost:5055 또는 http://ip:5055 접속 시 "연결 거부" 오류

**원인:**
- Console 서비스가 시작되지 않음
- 포트 5055가 이미 사용 중
- 방화벽/보안 그룹 규칙 미설정

**해결방법:**

```bash
# 서비스 상태 확인
docker-compose ps

# console 서비스 상태 확인
docker-compose ps console

# 로그 확인
docker-compose logs console

# 포트 확인
netstat -tuln | grep 5055
# 또는 lsof
lsof -i :5055

# 서비스 재시작
docker-compose restart console
```

### 2. "테이블을 로드할 수 없습니다" 오류

**증상:** 사이드바에서 "Failed to load tables" 에러 메시지

**원인:**
- Backend API가 응답하지 않음
- 데이터베이스 연결 실패
- CORS 문제

**해결방법:**

```bash
# Backend 서비스 상태 확인
docker-compose ps backend

# Backend 로그 확인
docker-compose logs backend

# API 직접 테스트
curl -s http://localhost:3000/api/db/tables

# 데이터베이스 연결 확인
docker-compose logs postgres
```

### 3. 레코드 추가 실패

**증상:** "Save" 버튼 클릭 후 "Error: Record insertion failed" 토스트 표시

**원인:**
- 필수 필드 누락
- 데이터 타입 불일치
- 외래키 제약조건 위반

**해결방법:**

```bash
# 요청 데이터 확인 (브라우저 DevTools Network 탭)
# POST /api/db/tables/posts/records 요청 검토

# 컬럼 타입 확인
curl -s http://localhost:3000/api/db/tables/posts/schema | jq '.data.columns'

# 기본값이 있는 컬럼 확인
curl -s http://localhost:3000/api/db/tables/posts/schema | jq '.data.columns[] | {name, nullable, default}'
```

### 4. Query 탭에서 SELECT 쿼리만 실행 가능

**증상:** DELETE, UPDATE, INSERT 쿼리 실행 시 "Only SELECT queries are allowed" 오류

**의도된 동작입니다.** Query 탭은 읽기 전용(SELECT)입니다. 데이터 수정은:
- Data 탭의 [+ Add Record] 버튼 사용
- pgAdmin 또는 psql CLI 사용

### 5. Dark 테마가 저장되지 않음

**증상:** 페이지 새로고침 후 Light 테마로 돌아감

**원인:**
- localStorage 비활성화
- 쿠키 정책 제한
- Private/Incognito 모드 사용

**해결방법:**

```javascript
// 브라우저 콘솔에서 localStorage 확인
localStorage.getItem('console-theme')

// 수동으로 설정
localStorage.setItem('console-theme', 'dark')
```

### 6. 모바일에서 UI가 깨짐

**해결방법:**

```css
/* 반응형 테스트 */
- 데스크톱: 1920px 이상 (정상)
- 태블릿: 768px-1024px (사이드바 숨김)
- 모바일: 480px 이하 (전체 스택)

/* 브라우저 DevTools에서 확인 */
- F12 → Toggle device toolbar → 모바일/태블릿 선택
```

### 7. "Network Error" 또는 CORS 오류

**원인:**
- Backend API가 다른 호스트에서 실행 중
- CORS 설정 오류
- 포트 미매칭

**해결방법:**

```bash
# Backend API 주소 확인
docker-compose logs backend | grep "listening on"

# CORS 설정 확인
curl -i -X OPTIONS http://localhost:3000/api/db/tables \
  -H "Origin: http://localhost:5055"

# 응답에 다음 헤더 포함 확인:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### 8. "페이지를 로드할 수 없습니다" (nginx 오류)

**원인:**
- app/console 디렉토리가 마운트되지 않음
- 파일 권한 문제
- nginx 설정 오류

**해결방법:**

```bash
# 마운트 확인
docker-compose ps console
docker inspect supabase-console | grep -A 10 Mounts

# 파일 확인
ls -la app/console/
ls -la app/console/index.html

# 컨테이너 내부 확인
docker exec supabase-console ls -la /usr/share/nginx/html/
```

---

## 성능 최적화

### 1. 큰 테이블 성능 개선

```bash
# 페이지당 레코드 수 조정 (backend/server.js)
# recordsPerPage를 20-50으로 설정

# 인덱스 추가 (자주 검색되는 컬럼)
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_category_id ON posts(category_id);
```

### 2. 데이터베이스 최적화

```bash
# Vacuum 실행
docker-compose exec postgres psql -U supabase -d supabase -c "VACUUM;"

# 통계 갱신
docker-compose exec postgres psql -U supabase -d supabase -c "ANALYZE;"

# 인덱스 재구축
docker-compose exec postgres psql -U supabase -d supabase -c "REINDEX DATABASE supabase;"
```

### 3. 브라우저 캐싱

Console 정적 파일은 이미 nginx에서 캐싱됩니다.
추가 캐싱을 원하면:

```bash
# docker-compose.yml에서 nginx 서비스 수정
# volumes:
#   - ./app/console:/usr/share/nginx/html:ro
#   - ./nginx-cache.conf:/etc/nginx/conf.d/default.conf:ro
```

---

## 다음 단계

1. **모니터링 설정**: Prometheus + Grafana
2. **백업 자동화**: cron job으로 일일 백업
3. **로깅 강화**: ELK Stack (Elasticsearch, Logstash, Kibana)
4. **버전 업그레이드**: 정기적 패치 및 보안 업데이트

---

## 지원 및 문의

- GitHub Issues: https://github.com/iloveaired9/mysupabase/issues
- 문서: https://github.com/iloveaired9/mysupabase/docs
- README: https://github.com/iloveaired9/mysupabase/README.md

---

**마지막 업데이트:** 2026년 4월 5일
**버전:** 1.0.0
