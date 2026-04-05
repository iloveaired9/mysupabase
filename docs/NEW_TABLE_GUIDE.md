# 🚀 새 테이블 추가 가이드

## 목차
1. [개요](#개요)
2. [준비 사항](#준비-사항)
3. [Step 1: psql로 직접 연결](#step-1-psql로-직접-연결)
4. [Step 2: SQL 테이블 생성](#step-2-sql-테이블-생성)
5. [Step 3: 권한 설정](#step-3-권한-설정)
6. [Step 4: API 즉시 테스트](#step-4-api-즉시-테스트)
7. [실제 예시들](#실제-예시들)
8. [주의사항](#주의사항)

---

## 개요

PostgREST의 가장 큰 장점은 **새 테이블을 추가하면 자동으로 REST API가 생성**된다는 것입니다.

```
1. SQL로 테이블 생성
   ↓
2. 권한 설정 (GRANT)
   ↓
3. 즉시 완전한 REST API 사용 가능! 🎉
   (백엔드 코드 작성 불필요)
```

이 가이드는 새 테이블을 단계별로 추가하는 방법을 설명합니다.

---

## 준비 사항

### 필요한 것
- Docker Compose가 실행 중 (모든 서비스 활성)
- 터미널 또는 CLI 도구
- 기본 SQL 문법 이해

### 서비스 확인
```bash
docker-compose up
# 이 명령어로 모든 서비스 시작

# 다른 터미널에서 확인
docker-compose ps

# 예상 출력:
# supabase-db        (PostgreSQL 5432)
# postgrest          (PostgREST API 3001)
# swagger-ui         (Swagger 문서 8080)
```

---

## Step 1: psql로 직접 연결

### 방법 1: Docker exec를 통한 연결 (권장)

```bash
# PostgreSQL 컨테이너에 접속
docker exec -it supabase-db psql -U postgres -d postgres

# 또는 특정 데이터베이스에 직접 접속
docker exec -it supabase-db psql -U postgres -d mysupabase

# psql 프롬프트에 진입하면:
postgres=#
```

### 방법 2: 로컬 psql 설치 (대안)

만약 로컬에 PostgreSQL이 설치되어 있다면:

```bash
# 로컬 psql로 Docker 데이터베이스에 접속
psql -h localhost -U postgres -d mysupabase -p 5432

# 프롬프트:
mysupabase=#
```

### 기본 psql 명령어

```sql
-- 현재 데이터베이스의 모든 테이블 보기
\dt

-- 특정 테이블의 구조 보기
\d 테이블명

-- 데이터베이스 목록 보기
\l

-- 사용자 목록 보기
\du

-- psql 종료
\q
```

---

## Step 2: SQL 테이블 생성

### 기본 테이블 생성 문법

```sql
CREATE TABLE 테이블명 (
    id SERIAL PRIMARY KEY,           -- 자동 증가하는 고유 ID
    컬럼명 데이터타입 제약조건,       -- 각 컬럼 정의
    created_at TIMESTAMP DEFAULT NOW()  -- 생성 시간 (자동)
);
```

### 실제 예시: tags 테이블 추가

```sql
-- psql> 에서 이 명령어 실행
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,                          -- 고유 ID
    name VARCHAR(100) NOT NULL UNIQUE,              -- 태그 이름 (필수, 중복 불가)
    description TEXT,                               -- 태그 설명
    color VARCHAR(7) DEFAULT '#0066cc',             -- 색상 (기본값: 파란색)
    count INTEGER DEFAULT 0,                        -- 사용 횟수
    created_at TIMESTAMP DEFAULT NOW(),             -- 생성 시간
    updated_at TIMESTAMP DEFAULT NOW()              -- 수정 시간
);
```

### 데이터 타입 선택 가이드

```sql
-- 텍스트
VARCHAR(길이)          -- 최대 길이가 정해진 문자열 (예: VARCHAR(100))
TEXT                   -- 길이 제한 없는 문자열
CHAR(길이)             -- 고정 길이 문자열

-- 숫자
INTEGER                -- 정수 (-2억 ~ +2억)
BIGINT                 -- 큰 정수 (64비트)
SERIAL                 -- 자동 증가 정수
DECIMAL(자리, 소수)    -- 정확한 소수점 (예: DECIMAL(10,2))

-- 날짜/시간
DATE                   -- 날짜 (2026-04-04)
TIME                   -- 시간 (14:30:00)
TIMESTAMP              -- 날짜 + 시간 (2026-04-04 14:30:00)

-- 기타
BOOLEAN                -- true/false
JSON                   -- JSON 데이터 구조
ARRAY                  -- 배열 (예: INTEGER[])
```

### 테이블 생성 확인

```sql
-- 생성한 테이블 확인
\d tags

-- 예상 출력:
-- Table "public.tags"
-- Column  |  Type   | Collation | Nullable | Default
-- --------+---------+-----------+----------+--------
-- id      | integer |           | not null | nextval(...)
-- name    | varchar |           | not null |
-- ...
```

---

## Step 3: 권한 설정

### 권한 설정이 필요한 이유

PostgREST는 데이터베이스 **권한**을 따릅니다. 권한을 설정하지 않으면 API로 접근 불가능합니다.

```sql
-- 기본 권한 설정 (익명 사용자)
GRANT SELECT ON tags TO anon;
GRANT INSERT ON tags TO anon;
GRANT UPDATE ON tags TO anon;
GRANT DELETE ON tags TO anon;
```

### 권한 종류

| 권한 | 의미 | API 메서드 |
|------|------|----------|
| SELECT | 조회 가능 | GET |
| INSERT | 추가 가능 | POST |
| UPDATE | 수정 가능 | PATCH |
| DELETE | 삭제 가능 | DELETE |

### 실제 권한 설정 예시

```sql
-- 1️⃣ 모두에게 조회만 허용 (읽기 전용)
GRANT SELECT ON tags TO anon;

-- 2️⃣ 모두에게 전체 권한 허용 (완전 공개)
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO anon;

-- 3️⃣ 로그인한 사용자만 전체 권한
GRANT SELECT, INSERT, UPDATE, DELETE ON tags TO authenticated;

-- 4️⃣ 관리자만 권한 허용
GRANT ALL ON tags TO admin;
```

### 권한 확인 및 취소

```sql
-- 테이블의 모든 권한 확인
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'tags';

-- 권한 취소
REVOKE INSERT ON tags FROM anon;  -- INSERT 권한 취소
REVOKE ALL ON tags FROM anon;     -- 모든 권한 취소
```

---

## Step 4: API 즉시 테스트

### 1️⃣ cURL로 테스트

```bash
# 모든 tags 조회
curl http://localhost:3001/tags

# 특정 조건으로 조회 (이름에 'python' 포함)
curl "http://localhost:3001/tags?name=ilike.*python*"

# 새 tag 추가
curl -X POST http://localhost:3001/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "python", "description": "Python 프로그래밍", "color": "#3776ab"}'

# tag 수정
curl -X PATCH "http://localhost:3001/tags?id=eq.1" \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'

# tag 삭제
curl -X DELETE "http://localhost:3001/tags?id=eq.1"
```

### 2️⃣ Swagger UI로 테스트

1. http://localhost:8080 열기
2. 페이지를 새로고침 하면 tags 엔드포인트가 자동으로 나타남
3. **GET /tags** 클릭
4. **Try it out** 버튼 클릭
5. **Execute** 버튼 클릭
6. 응답 확인

### 3️⃣ JavaScript/fetch로 테스트

```javascript
// 모든 tags 조회
const response = await fetch('http://localhost:3001/tags');
const data = await response.json();
console.log(data);
// 출력: [{ id: 1, name: 'python', ... }]

// 새 tag 추가
const newTag = {
  name: 'javascript',
  description: 'JavaScript 프로그래밍',
  color: '#f7df1e'
};

const addResponse = await fetch('http://localhost:3001/tags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newTag)
});

const addedTag = await addResponse.json();
console.log(addedTag);
```

---

## 실제 예시들

### 예시 1: 사용자 피드백 테이블

```sql
-- 테이블 생성
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    message TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, read, replied
    created_at TIMESTAMP DEFAULT NOW()
);

-- 권한 설정
GRANT SELECT, INSERT ON feedback TO anon;

-- 테스트 (새 피드백 추가)
curl -X POST http://localhost:3001/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "홍길동",
    "email": "hong@example.com",
    "message": "정말 좋은 서비스입니다!",
    "rating": 5
  }'
```

### 예시 2: 댓글 시스템

```sql
-- 테이블 생성
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 권한 설정
GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO anon;

-- API 테스트
# 특정 게시글의 모든 댓글 조회
curl "http://localhost:3001/comments?post_id=eq.1&order=created_at.desc"

# 새 댓글 추가
curl -X POST http://localhost:3001/comments \
  -H "Content-Type: application/json" \
  -d '{"post_id": 1, "author": "김철수", "content": "좋은 글이네요!"}'
```

### 예시 3: 뉴스레터 구독 테이블

```sql
-- 테이블 생성
CREATE TABLE newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100),
    subscribe_date TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    categories TEXT[] DEFAULT ARRAY[]  -- 배열 타입으로 여러 카테고리 저장
);

-- 권한 설정
GRANT SELECT, INSERT, UPDATE ON newsletter_subscribers TO anon;

-- API 테스트
# 활성 구독자만 조회
curl "http://localhost:3001/newsletter_subscribers?is_active=eq.true"

# 새 구독자 추가
curl -X POST http://localhost:3001/newsletter_subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "사용자",
    "categories": ["tech", "design"]
  }'
```

### 예시 4: 외부 키(Foreign Key) 관계

```sql
-- 카테고리 테이블 (부모)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 게시글 테이블 (자식)
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 권한 설정
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON posts TO anon;

-- API 테스트
# 카테고리별 게시글 조회
curl "http://localhost:3001/posts?category_id=eq.1"

# 카테고리 정보와 함께 게시글 조회 (관계 조회)
curl "http://localhost:3001/posts?select=*,categories(*)"
```

---

## 주의사항

### ⚠️ 중요한 규칙들

**1. 테이블 이름 규칙**
```sql
-- ❌ 피해야 할 것
CREATE TABLE User;        -- 대문자
CREATE TABLE user-info;   -- 하이픈
CREATE TABLE 2users;      -- 숫자로 시작

-- ✅ 권장하는 방식
CREATE TABLE users;       -- 소문자, 복수형
CREATE TABLE user_info;   -- 언더스코어
CREATE TABLE posts;       -- 명확한 이름
```

**2. 컬럼명 규칙**
```sql
-- ❌ 피해야 할 것
CREATE TABLE users (
    "User ID" INTEGER,    -- 공백, 대문자
    userName VARCHAR(100)  -- camelCase
);

-- ✅ 권장하는 방식
CREATE TABLE users (
    user_id INTEGER,      -- snake_case
    user_name VARCHAR(100),
    email VARCHAR(255)
);
```

**3. 제약조건**
```sql
-- NOT NULL: 필수 필드
name VARCHAR(100) NOT NULL

-- UNIQUE: 중복 불가
email VARCHAR(255) UNIQUE

-- DEFAULT: 기본값
is_active BOOLEAN DEFAULT true

-- CHECK: 값의 범위 검사
age INTEGER CHECK (age > 0 AND age < 150)

-- REFERENCES: 외부 키
post_id INTEGER REFERENCES posts(id)
```

### ❌ 자주 하는 실수들

**1. 권한 설정 없음**
```sql
-- 이렇게만 하면 API로 접근 불가!
CREATE TABLE my_table (...);
-- GRANT 명령어가 필요합니다!
```

**2. 잘못된 권한 설정**
```sql
-- ❌ 잘못된 것
GRANT SELECT ON my_table TO PUBLIC;

-- ✅ 올바른 것
GRANT SELECT ON my_table TO anon;
```

**3. 외부 키 삭제 설정 누락**
```sql
-- ❌ 부모 삭제 시 문제 발생
post_id INTEGER REFERENCES posts(id);

-- ✅ 부모 삭제 시 자동 삭제
post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE;
```

**4. PRIMARY KEY 누락**
```sql
-- ❌ 권장되지 않음 (UPDATE/DELETE가 불안정)
CREATE TABLE items (
    name VARCHAR(100),
    price DECIMAL(10,2)
);

-- ✅ PRIMARY KEY 필수
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);
```

---

## 복잡한 시나리오: 다대다(Many-to-Many) 관계

### 예시: 게시글과 태그의 관계

```sql
-- 1. 태그 테이블
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 2. 게시글 테이블
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT
);

-- 3. 중간 테이블 (접합 테이블)
CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(post_id, tag_id)  -- 같은 게시글에서 중복 태그 방지
);

-- 권한 설정
GRANT SELECT, INSERT, DELETE ON post_tags TO anon;

-- API 사용 예시
# 게시글 1의 모든 태그 조회
curl "http://localhost:3001/post_tags?post_id=eq.1&select=tag_id,tags(*)"

# 태그 'react'가 붙은 모든 게시글 조회
curl "http://localhost:3001/post_tags?tags.name=eq.react&select=post_id,posts(*)"

# 게시글에 태그 추가
curl -X POST http://localhost:3001/post_tags \
  -H "Content-Type: application/json" \
  -d '{"post_id": 1, "tag_id": 3}'
```

---

## 정리: 새 테이블 추가 5단계 체크리스트

```
☐ Step 1: psql 연결
  docker exec -it supabase-db psql -U postgres -d mysupabase

☐ Step 2: CREATE TABLE 실행
  CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    ...
  );

☐ Step 3: 권한 설정
  GRANT SELECT, INSERT ON my_table TO anon;

☐ Step 4: API 테스트
  curl http://localhost:3001/my_table

☐ Step 5: Swagger UI에서 확인
  http://localhost:8080
  (새로고침하면 자동으로 엔드포인트 표시됨)
```

**결과: 완전한 REST API가 자동으로 생성되었습니다!** ✨

더 자세한 정보는 [API 가이드](./API_GUIDE.md)와 [PostgREST 완벽 가이드](./POSTGREST_GUIDE.md)를 참고하세요.
