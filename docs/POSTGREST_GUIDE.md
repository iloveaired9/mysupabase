# 📚 PostgREST 완벽 가이드

## 목차
1. [PostgREST란?](#postgrest란)
2. [기본 개념](#기본-개념)
3. [아키텍처](#아키텍처)
4. [API 자동 생성 원리](#api-자동-생성-원리)
5. [자주 묻는 질문](#자주-묻는-질문)

---

## PostgREST란?

### 정의
**PostgREST**는 PostgreSQL 데이터베이스의 스키마에서 **자동으로 REST API를 생성**하는 도구입니다.

### 가장 중요한 특징: 백엔드 코드 불필요! 🎉

```
전통적인 방식:
데이터베이스 → Express.js (백엔드 코드 작성) → REST API

PostgREST 방식:
데이터베이스 → PostgREST (자동 생성) → REST API
           (코드 작성 불필요!)
```

---

## 기본 개념

### 1️⃣ 스키마 (Schema)
**스키마**는 데이터베이스의 구조를 정의합니다.

```sql
-- public 스키마에 posts 테이블 생성
CREATE TABLE public.posts (
    id SERIAL PRIMARY KEY,           -- ID 고유 번호
    title VARCHAR(500) NOT NULL,     -- 제목 (필수)
    excerpt TEXT,                    -- 요약
    likes INTEGER DEFAULT 0,         -- 추천 수 (기본값: 0)
    created_at TIMESTAMP DEFAULT NOW()  -- 작성 시간 (현재 시간)
);
```

### 2️⃣ 테이블 (Table)
**테이블**은 데이터를 행과 열로 저장하는 구조입니다.

```
posts 테이블의 예:
┌────┬────────────────┬──────────┬───────┐
│ id │ title          │ likes    │ ...   │
├────┼────────────────┼──────────┼───────┤
│ 1  │ AI의 미래       │ 1245     │ ...   │
│ 2  │ 클라우드 기초   │ 856      │ ...   │
│ 3  │ Python 팁      │ 2134     │ ...   │
└────┴────────────────┴──────────┴───────┘
```

### 3️⃣ 열 (Column)
**열**은 데이터의 속성을 나타냅니다.

```sql
CREATE TABLE posts (
    id          -- 열 이름
    SERIAL      -- 데이터 타입 (자동 번호)
    PRIMARY KEY -- 제약조건 (유일한 식별자)
);
```

---

## 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                   클라이언트 (브라우저)                   │
│              http://localhost:5500                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTP 요청
                         │ GET /posts
                         │ POST /comments
                         │ PATCH /posts?id=eq.1
                         │
┌────────────────────────▼────────────────────────────────┐
│                   PostgREST 엔진                        │
│              http://localhost:3001                      │
│          (코드 작성 없이 자동으로 API 제공)              │
│                                                         │
│  역할:                                                  │
│  1. HTTP 요청 수신                                      │
│  2. 데이터베이스 스키마 읽음                             │
│  3. SQL 쿼리 자동 생성                                  │
│  4. 데이터 반환                                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ SQL 쿼리 실행
                         │ SELECT * FROM posts
                         │ INSERT INTO comments ...
                         │
┌────────────────────────▼────────────────────────────────┐
│              PostgreSQL 데이터베이스                     │
│              localhost:5432                             │
│                                                         │
│  public 스키마:                                         │
│  ├─ posts (게시글)                                      │
│  ├─ comments (댓글)                                     │
│  ├─ users (사용자)                                      │
│  └─ ...                                                 │
└─────────────────────────────────────────────────────────┘
```

### 데이터 흐름 예시

```
1️⃣ 클라이언트가 요청 보냄
   브라우저: GET http://localhost:3001/posts?limit=10

2️⃣ PostgREST가 스키마 분석
   "posts 테이블이 있고, id, title, likes 열이 있네"

3️⃣ SQL 쿼리 자동 생성
   SELECT * FROM posts LIMIT 10

4️⃣ 데이터베이스 실행
   PostgreSQL이 10개 행 반환

5️⃣ JSON으로 변환 후 응답
   [
     { "id": 1, "title": "AI의 미래", ... },
     { "id": 2, "title": "클라우드 기초", ... },
     ...
   ]
```

---

## API 자동 생성 원리

### 규칙: 테이블 1개 = REST API 1세트

PostgreSQL에 새 테이블을 만들면 **자동으로** API 엔드포인트가 생성됩니다.

#### 예: comments 테이블 추가

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER,
    author VARCHAR(100),
    content TEXT
);
```

**자동으로 생성되는 API:**

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/comments` | 모든 댓글 조회 |
| GET | `/comments?post_id=eq.1` | post_id가 1인 댓글만 조회 |
| POST | `/comments` | 새 댓글 추가 |
| PATCH | `/comments?id=eq.1` | ID 1인 댓글 수정 |
| DELETE | `/comments?id=eq.1` | ID 1인 댓글 삭제 |

### CRUD 자동 생성

```
테이블 생성 → PostgREST가 감지 → CRUD API 자동 생성

┌────────────────────────────────────────┐
│         CRUD 작업                      │
├────────────────────────────────────────┤
│ C (Create): POST /테이블명             │
│ R (Read):   GET /테이블명              │
│ U (Update): PATCH /테이블명?id=eq.1   │
│ D (Delete): DELETE /테이블명?id=eq.1  │
└────────────────────────────────────────┘
```

---

## 실제 동작 예시

### 1단계: 테이블 생성

```sql
-- PostgreSQL에서 실행
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    rating INTEGER,           -- 1~5점
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2단계: 권한 설정

```sql
-- 익명 사용자도 접근 가능하도록 설정
GRANT SELECT ON reviews TO anon;
GRANT INSERT ON reviews TO anon;
```

### 3단계: 즉시 사용 가능!

```bash
# 모든 리뷰 조회
curl http://localhost:3001/reviews

# 특정 게시글의 리뷰만 조회
curl http://localhost:3001/reviews?post_id=eq.1

# 높은 평점의 리뷰만 조회
curl http://localhost:3001/reviews?rating=gte.4

# 새 리뷰 추가
curl -X POST http://localhost:3001/reviews \
  -H "Content-Type: application/json" \
  -d '{"post_id": 1, "rating": 5, "comment": "최고!"}'

# 리뷰 수정
curl -X PATCH http://localhost:3001/reviews?id=eq.1 \
  -H "Content-Type: application/json" \
  -d '{"rating": 4}'

# 리뷰 삭제
curl -X DELETE http://localhost:3001/reviews?id=eq.1
```

**코드 작성 필요 없음!** ✨

---

## 주요 개념 설명

### 1️⃣ REST API

REST는 웹에서 데이터를 다루는 **표준 방식**입니다.

```
REST의 기본 규칙:
- GET:    데이터 읽기 (조회)
- POST:   데이터 생성 (추가)
- PATCH:  데이터 수정 (일부 변경)
- DELETE: 데이터 삭제 (제거)

URL의 의미:
GET /posts          → 모든 posts 조회
GET /posts?id=eq.1  → id가 1인 post 조회
POST /posts         → 새 post 추가
PATCH /posts?id=eq.1 → id 1인 post 수정
DELETE /posts?id=eq.1 → id 1인 post 삭제
```

### 2️⃣ HTTP 메서드

각 메서드는 특정 작업을 나타냅니다.

```
┌──────────┬──────────────────┬────────────────────┐
│ 메서드    │ 작업             │ 예                 │
├──────────┼──────────────────┼────────────────────┤
│ GET      │ 데이터 조회      │ 게시글 읽기        │
│ POST     │ 데이터 생성      │ 새 댓글 작성       │
│ PATCH    │ 데이터 수정      │ 댓글 내용 수정     │
│ DELETE   │ 데이터 삭제      │ 댓글 삭제          │
└──────────┴──────────────────┴────────────────────┘
```

### 3️⃣ 쿼리 파라미터 (필터링)

URL 뒤에 `?`를 붙여 조건을 지정합니다.

```sql
-- SQL: WHERE 절
SELECT * FROM posts WHERE created_at > '2026-01-01';

-- REST API: 쿼리 파라미터
GET /posts?created_at=gt.2026-01-01

-- 여러 조건
GET /posts?post_id=eq.1&rating=gte.4

-- SQL 해석
SELECT * FROM posts
WHERE post_id = 1 AND rating >= 4;
```

---

## PostgREST vs 전통적 백엔드

### 비교표

```
┌────────────────────┬──────────────────┬──────────────────┐
│ 항목               │ 전통 방식         │ PostgREST        │
│                    │ (Express 등)     │                  │
├────────────────────┼──────────────────┼──────────────────┤
│ 백엔드 코드        │ 필수 작성         │ 불필요!          │
│                    │ (매우 많음)      │                  │
├────────────────────┼──────────────────┼──────────────────┤
│ 새 테이블 추가     │ API 코드 추가     │ SQL만 실행        │
│                    │ 필요              │                  │
├────────────────────┼──────────────────┼──────────────────┤
│ 개발 속도          │ 느림              │ 매우 빠름!        │
├────────────────────┼──────────────────┼──────────────────┤
│ 유지보수           │ 복잡함            │ 간단함            │
├────────────────────┼──────────────────┼──────────────────┤
│ 스케일링           │ 필요시 재작성     │ 데이터만 추가     │
├────────────────────┼──────────────────┼──────────────────┤
│ 학습 곡선          │ 가파름            │ 완만함            │
└────────────────────┴──────────────────┴──────────────────┘
```

### 코드량 비교

**Express (전통 방식)**
```javascript
// server.js - 수백 줄의 코드
app.get('/comments', async (req, res) => {
  const { post_id, limit, offset } = req.query;
  // SQL 생성, 파라미터 검증, 에러 처리...
  const result = await db.query(sql, params);
  res.json(result);
});

app.post('/comments', async (req, res) => {
  // 데이터 검증, INSERT 쿼리, 에러 처리...
  const result = await db.query(sql, [post_id, author, content]);
  res.json(result);
});

// ... 더 많은 엔드포인트
```

**PostgREST (현재 방식)**
```sql
-- schema.sql - 몇 줄의 SQL만 필요
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER,
    author VARCHAR(100),
    content TEXT
);

GRANT SELECT, INSERT ON comments TO anon;
```

**결과: 모든 API 자동 생성!** 🎉

---

## 자주 묻는 질문

### Q1: 새 테이블 추가 시 PostgREST 재시작이 필요한가요?
**A:** 아니요! PostgREST가 자동으로 감지합니다. 즉시 사용 가능합니다.

### Q2: 백엔드 로직이 필요한 경우는?
**A:** PostgreSQL의 **RPC 함수** (Remote Procedure Call)를 사용하세요.
```sql
-- 통계 계산 함수
CREATE FUNCTION get_posts_stats()
RETURNS TABLE (total_posts bigint, avg_likes float)
AS $$
  SELECT COUNT(*), AVG(likes) FROM posts;
$$ LANGUAGE SQL;

-- API로 사용 가능
POST /rpc/get_posts_stats
```

### Q3: 보안은 어떻게 설정하나요?
**A:** PostgreSQL의 `GRANT` 명령어로 권한을 제어합니다.
```sql
-- 익명 사용자: SELECT만 가능
GRANT SELECT ON posts TO anon;

-- 로그인 사용자: 모든 작업 가능
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO authenticated;

-- 관리자만: 테이블 수정 가능
GRANT ALL ON posts TO admin;
```

### Q4: 성능이 좋은가요?
**A:** 매우 좋습니다. PostgreSQL + PostgREST는:
- 매우 빠른 쿼리 실행
- 인덱스 자동 활용
- 동시성 지원
- 캐싱 가능

### Q5: 프론트엔드에서 어떻게 호출하나요?
**A:** 일반 HTTP 요청으로 호출합니다.
```javascript
// Fetch API (모든 프레임워크)
const response = await fetch('http://localhost:3001/comments');
const data = await response.json();

// Axios
const { data } = await axios.get('http://localhost:3001/comments');

// Supabase.js (PostgREST 클라이언트)
const { data } = await supabase
  .from('comments')
  .select('*');
```

---

## 핵심 요약

```
┌─────────────────────────────────────────┐
│  PostgREST의 가장 큰 장점               │
├─────────────────────────────────────────┤
│  1. 백엔드 코드 작성 필요 없음           │
│  2. 데이터베이스 스키마만으로 API 생성  │
│  3. 새 기능 추가 시 매우 빠름           │
│  4. 유지보수가 간단함                   │
│  5. 개발자 경험이 좋음                  │
└─────────────────────────────────────────┘
```

이것이 Supabase가 PostgREST를 사용하는 이유입니다! 🚀

---

## 다음 단계

1. [새 테이블 추가 가이드](NEW_TABLE_GUIDE.md) - 실제로 테이블 추가하는 방법
2. [데이터베이스 스키마 관리](DATABASE_SCHEMA.md) - 스키마 설계 팁
3. [API 가이드](API_GUIDE.md) - API 사용 상세 방법
