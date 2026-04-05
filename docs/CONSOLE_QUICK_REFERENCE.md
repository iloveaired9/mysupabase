# 💾 mysupabase Console - 빠른 참조 가이드

## 🚀 빠른 시작 (10초)

```bash
# 1. Docker Compose 시작
docker-compose up -d

# 2. Console 열기
http://localhost:5055
```

## 🎯 주요 작업

### 1️⃣ 테이블 데이터 보기

```
1. 사이드바에서 테이블 선택 (예: "posts")
2. "📊 Data" 탭에서 레코드 보기
3. 페이지네이션으로 탐색
```

### 2️⃣ 새 레코드 추가

```
1. Data 탭에서 [+ Add Record] 버튼 클릭
2. 폼 작성 (자동으로 필드가 표시됨)
3. [Save] 버튼 클릭
```

### 3️⃣ 테이블 구조 확인

```
1. 테이블 선택
2. "📋 Schema" 탭 클릭
3. 각 컬럼의 타입, nullable, default 확인
```

### 4️⃣ SQL 쿼리 실행

```
1. "🔍 Query" 탭 클릭
2. SELECT 쿼리 입력:
   SELECT * FROM posts WHERE likes > 100 LIMIT 10;
3. [Execute] 클릭 또는 Ctrl+Enter
4. 결과를 JSON/CSV로 내보내기 (선택)
```

### 5️⃣ 테마 전환

```
상단 우측 🌙 (또는 ☀️) 아이콘 클릭
→ 설정이 자동으로 저장됨
```

## 📊 테이블 정보

| 테이블 | 레코드 수 | 주요 컬럼 |
|--------|-----------|----------|
| posts | 50 | id, title, excerpt, content, likes, comments |
| categories | 5 | id, name, description |
| sources | 5 | id, name, url, icon_emoji |

## 🔗 API 엔드포인트

### 테이블 조회

```bash
# 모든 테이블 목록
curl http://localhost:3000/api/db/tables

# 테이블 스키마
curl http://localhost:3000/api/db/tables/posts/schema

# 페이지네이션 레코드
curl "http://localhost:3000/api/db/tables/posts/records?page=1&limit=10"
```

### 데이터 추가

```bash
curl -X POST http://localhost:3000/api/db/tables/posts/records \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "My Post",
    "excerpt": "Brief description",
    "content": "Full content",
    "category_id": 1,
    "source_id": 1,
    "likes": 0,
    "comments": 0
  }'
```

### 쿼리 실행

```bash
curl -X POST http://localhost:3000/api/db/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT * FROM posts LIMIT 5;"}'
```

## ❓ 자주 묻는 질문

### Q: 왜 INSERT/UPDATE/DELETE가 Query 탭에서 안 되나요?
**A:** 보안상 Query 탭은 SELECT만 가능합니다. 데이터 수정은 Data 탭의 [+ Add Record] 또는 API 사용.

### Q: 모바일에서 사용할 수 있나요?
**A:** 네, 모바일, 태블릿, 데스크톱 모두 지원합니다. 사이드바는 모바일에서 자동으로 숨겨집니다.

### Q: 설정을 초기화하려면?
**A:** 브라우저 DevTools → Application → localStorage에서 `console-theme` 삭제.

### Q: 대용량 테이블에서 느린 이유는?
**A:** 기본적으로 페이지당 10개 레코드만 로드됩니다. 인덱스가 없는 컬럼으로 필터링하면 느릴 수 있습니다.

### Q: 오프라인에서 사용할 수 있나요?
**A:** 아니요, Backend API 서버가 필요합니다. docker-compose up이 선행되어야 합니다.

## 🛠️ 문제 해결

### "테이블을 로드할 수 없습니다" 오류

```bash
# 1. Backend 서비스 확인
docker-compose ps

# 2. 로그 확인
docker-compose logs backend

# 3. 서비스 재시작
docker-compose restart backend
```

### 레코드 추가 실패

- 필수 필드 누락 확인
- 데이터 타입 확인 (숫자는 number, 텍스트는 text)
- 외래키 값이 유효한지 확인 (category_id, source_id)

### 페이지가 안 로드됨

```bash
# 콘솔 서비스 재시작
docker-compose restart console

# 또는 전체 재시작
docker-compose down
docker-compose up -d
```

## 📱 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| Ctrl+Enter | Query 탭에서 쿼리 실행 |
| ESC | 모달 닫기 |
| Tab | 폼 필드 이동 |

## 🎨 색상 참조

| 색상 | 용도 |
|------|------|
| 🔵 파란색 (#667eea) | 주요 버튼, 텍스트 |
| 🟢 녹색 (#28a745) | 성공 메시지 |
| 🔴 빨강색 (#dc3545) | 오류 메시지 |
| 🟠 주황색 (#ffc107) | 경고 메시지 |
| 🔵 파란색 (#17a2b8) | 정보 메시지 |

## 📚 추가 자료

- **배포 가이드**: `docs/CONSOLE_DEPLOYMENT_GUIDE.md`
- **아키텍처**: `docs/CONSOLE_ARCHITECTURE.md`
- **API 문서**: `http://localhost:8080` (Swagger UI)
- **README**: `README.md`

## 🌐 서비스 포트 정리

| 서비스 | 포트 | URL |
|--------|------|-----|
| Console | 5055 | http://localhost:5055 |
| Admin Dashboard | 5500 | http://localhost:5500 |
| Swagger UI | 8080 | http://localhost:8080 |
| Backend API | 3000 | http://localhost:3000 |
| PostgREST API | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | localhost |
| pgAdmin | 5050 | http://localhost:5050 |
| MailHog | 8025 | http://localhost:8025 |

## 💾 백업 및 내보내기

### JSON으로 내보내기
```
Query 탭 → 쿼리 실행 → [JSON 다운로드]
```

### CSV로 내보내기
```
Query 탭 → 쿼리 실행 → [CSV 다운로드]
```

### psql로 백업
```bash
docker-compose exec postgres pg_dump -U supabase supabase > backup.sql
```

### psql로 복원
```bash
docker-compose exec -T postgres psql -U supabase supabase < backup.sql
```

---

**마지막 업데이트:** 2026년 4월 5일
**버전:** 1.0.0
