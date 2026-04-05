# 📊 데이터베이스 스키마 설계 가이드

## 목차
1. [개요](#개요)
2. [스키마 설계 원칙](#스키마-설계-원칙)
3. [현재 데이터베이스 구조](#현재-데이터베이스-구조)
4. [테이블별 상세 설명](#테이블별-상세-설명)
5. [데이터 타입 선택 가이드](#데이터-타입-선택-가이드)
6. [관계 설계 (Relations)](#관계-설계-relations)
7. [인덱스와 성능](#인덱스와-성능)
8. [설계 패턴과 베스트 프랙티스](#설계-패턴과-베스트-프랙티스)

---

## 개요

좋은 데이터베이스 스키마는 **데이터 무결성**, **성능**, **유지보수성**을 모두 고려해야 합니다.

PostgREST 환경에서는 스키마 설계가 직접 API의 품질과 성능에 영향을 미칩니다.

### 핵심 원칙
```
┌─────────────────────────────────────────────┐
│ 데이터베이스 설계 핵심                      │
├─────────────────────────────────────────────┤
│ 1. 정규화 (Normalization)                  │
│    → 데이터 중복 최소화                     │
│                                             │
│ 2. 무결성 (Integrity)                      │
│    → 제약조건으로 데이터 정확성 보장        │
│                                             │
│ 3. 성능 (Performance)                      │
│    → 인덱스와 조회 최적화                  │
│                                             │
│ 4. 확장성 (Scalability)                    │
│    → 미래 요구사항 고려한 유연한 설계       │
└─────────────────────────────────────────────┘
```

---

## 스키마 설계 원칙

### 1️⃣ 정규화 (Normalization)

**목표**: 데이터 중복을 최소화하여 저장 공간 절약 및 일관성 보장

#### 제1정규형 (1NF)
- 모든 컬럼 값이 원자적(나누어질 수 없음)이어야 함
- 배열이나 복합 데이터는 별도 테이블로 분리

```sql
-- ❌ 나쁜 예: 하나의 컬럼에 여러 값
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    hobbies VARCHAR(200)  -- "독서,게임,영화" → 나누기 어려움
);

-- ✅ 좋은 예: 별도 테이블로 분리
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user_hobbies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hobby VARCHAR(100)
);
```

#### 제2정규형 (2NF)
- 1NF를 만족하면서
- 모든 비키(non-key) 컬럼이 PRIMARY KEY에 완전히 의존

```sql
-- ❌ 나쁜 예: 부분 의존성
CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    product_name VARCHAR(100),  -- product_id에만 의존, order_id는 아님
    PRIMARY KEY (order_id, product_id)
);

-- ✅ 좋은 예: 별도 테이블로 분리
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);
```

#### 제3정규형 (3NF)
- 2NF를 만족하면서
- 비키 컬럼 간에 의존 관계 없음 (추이적 의존성 제거)

```sql
-- ❌ 나쁜 예: 추이적 의존성
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER,
    department_name VARCHAR(100),  -- department_id에 의존, 중복 데이터
    location VARCHAR(100)
);

-- ✅ 좋은 예: 별도 테이블로 분리
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location VARCHAR(100)
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER REFERENCES departments(id)
);
```

### 2️⃣ 무결성 제약 (Integrity Constraints)

```sql
-- PRIMARY KEY: 행 식별
id SERIAL PRIMARY KEY

-- UNIQUE: 중복 방지
email VARCHAR(255) UNIQUE

-- NOT NULL: 필수 필드
name VARCHAR(100) NOT NULL

-- FOREIGN KEY: 관계 보장
department_id INTEGER REFERENCES departments(id)

-- CHECK: 범위 검사
age INTEGER CHECK (age >= 0 AND age <= 150)

-- DEFAULT: 기본값
is_active BOOLEAN DEFAULT true
created_at TIMESTAMP DEFAULT NOW()
```

### 3️⃣ 명명 규칙 (Naming Conventions)

```sql
-- 테이블명: 소문자, 복수형
CREATE TABLE users (...)         -- ✅ 좋음
CREATE TABLE User (...)          -- ❌ 대문자
CREATE TABLE user (...)          -- ❌ 단수형

-- 컬럼명: snake_case
CREATE TABLE users (
    user_id INTEGER,            -- ✅ 좋음
    full_name VARCHAR(100),     -- ✅ 좋음
    createdAt TIMESTAMP,        -- ❌ camelCase
    creation_date TIMESTAMP,    -- ✅ 좋음
);

-- 외부키: 참조_id 형식
post_id INTEGER REFERENCES posts(id)
user_id INTEGER REFERENCES users(id)
category_id INTEGER REFERENCES categories(id)

-- 불린: is_xxx, has_xxx
is_active BOOLEAN
is_deleted BOOLEAN
has_attachments BOOLEAN
```

---

## 현재 데이터베이스 구조

### 데이터베이스 개요

```
데이터베이스 이름: mysupabase
포트: 5432
사용자: postgres
```

### 테이블 다이어그램

```
┌─────────────────┐
│   categories    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ icon_emoji      │
│ description     │
│ post_count      │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ (1:N)
         │
         │
┌────────▼──────────────┐      ┌─────────────────┐
│      posts            │      │    sources      │
├──────────────────────┤      ├─────────────────┤
│ id (PK)              │      │ id (PK)         │
│ title                │      │ name            │
│ url                  │◄─────┤ icon_emoji      │
│ excerpt              │      │ url             │
│ source_id (FK)       │      │ description     │
│ category_id (FK) ───┐│      │ created_at      │
│ likes                ││      │ updated_at      │
│ created_at           ││      │ logo_url        │
│ updated_at           ││      │ favicon_url     │
│ content_html         ││      └─────────────────┘
│ reading_time         ││
│ thumbnail_url        ││
└──────────────────────┘│
                        │
                   ┌────▼─────────┐
                   │  categories  │
                   └──────────────┘
```

---

## 테이블별 상세 설명

### 1️⃣ categories 테이블

**목적**: 게시글의 카테고리 분류

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,                  -- 고유 ID
    name VARCHAR(100) NOT NULL UNIQUE,      -- 카테고리명 (필수, 중복 불가)
    icon_emoji VARCHAR(10),                 -- 이모지 아이콘 (예: 🚀)
    description TEXT,                       -- 상세 설명
    post_count INTEGER DEFAULT 0,           -- 해당 카테고리 게시글 수 (캐시용)
    created_at TIMESTAMP DEFAULT NOW(),     -- 생성 시간
    updated_at TIMESTAMP DEFAULT NOW()      -- 수정 시간
);
```

**특징**:
- 중복 없는 카테고리 이름 보장
- post_count: 조회 성능 최적화를 위한 비정규화 필드
  (매번 posts를 COUNT할 필요 없음)

**예시 데이터**:
```sql
INSERT INTO categories (name, icon_emoji, description)
VALUES
    ('기술', '🚀', 'AI, 클라우드, 프로그래밍'),
    ('디자인', '🎨', 'UI/UX, 그래픽 디자인'),
    ('비즈니스', '💼', '스타트업, 경영, 마케팅');
```

### 2️⃣ sources 테이블

**목적**: 게시글의 출처(뉴스 소스, 블로그) 관리

```sql
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,                  -- 고유 ID
    name VARCHAR(255) NOT NULL UNIQUE,      -- 출처명 (필수, 중복 불가)
    icon_emoji VARCHAR(10),                 -- 이모지 아이콘 (예: 📰)
    url VARCHAR(500) NOT NULL,              -- 출처 웹사이트 URL
    description TEXT,                       -- 출처 설명
    created_at TIMESTAMP DEFAULT NOW(),     -- 생성 시간
    updated_at TIMESTAMP DEFAULT NOW(),     -- 수정 시간
    logo_url VARCHAR(500),                  -- 로고 이미지 URL
    favicon_url VARCHAR(500)                -- 파비콘 URL
);
```

**특징**:
- 각 뉴스 소스를 중앙 관리
- 로고/파비콘을 저장하여 UI에서 직접 표시 가능

**예시 데이터**:
```sql
INSERT INTO sources (name, icon_emoji, url, description)
VALUES
    ('HackerNews', '📰', 'https://news.ycombinator.com', 'IT 뉴스 커뮤니티'),
    ('Product Hunt', '🎯', 'https://www.producthunt.com', '신제품 소개 플랫폼'),
    ('Medium', '✍️', 'https://medium.com', '기술 블로그 플랫폼');
```

### 3️⃣ posts 테이블

**목적**: 게시글의 주요 컨텐츠 저장

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,                           -- 고유 ID
    title VARCHAR(500) NOT NULL,                     -- 제목 (필수)
    url VARCHAR(1000) NOT NULL UNIQUE,               -- 원본 URL (필수, 중복 방지)
    excerpt TEXT,                                    -- 요약 텍스트
    source_id INTEGER NOT NULL REFERENCES sources(id),  -- 출처
    category_id INTEGER REFERENCES categories(id),   -- 카테고리
    likes INTEGER DEFAULT 0,                         -- 추천 수
    created_at TIMESTAMP DEFAULT NOW(),              -- 게시 시간
    updated_at TIMESTAMP DEFAULT NOW(),              -- 수정 시간
    content_html TEXT,                               -- HTML 형식 본문
    reading_time INTEGER,                            -- 읽는데 걸리는 시간 (분)
    thumbnail_url VARCHAR(500)                       -- 썸네일 이미지 URL
);

-- 성능 최적화 인덱스
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_source_id ON posts(source_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes ON posts(likes DESC);
```

**주요 컬럼 설명**:
- `url`: 원본 기사 URL (중복 방지로 같은 기사 중복 저장 방지)
- `reading_time`: 사용자가 예상 소요 시간 알 수 있도록 함
- `content_html`: 마크다운이 아닌 HTML로 저장하여 프론트엔드에서 직접 렌더링
- `likes`: 사용자 투표로 인기도 측정

**예시 데이터**:
```sql
INSERT INTO posts (title, url, excerpt, source_id, category_id, likes, reading_time)
VALUES (
    'AI가 코딩하는 세상이 온다',
    'https://example.com/article/123',
    'ChatGPT와 같은 AI 모델이 프로그래밍을 완전히 바꾸고 있습니다.',
    1,  -- HackerNews (source_id)
    1,  -- 기술 (category_id)
    1245,
    8
);
```

---

## 데이터 타입 선택 가이드

### 텍스트 데이터

```sql
-- CHAR(n): 고정 길이 (보통 사용 안 함)
CHAR(2)              -- 예: 국가 코드 "KR", "US"
                     -- 성능: 빠름, 공간: 낭비

-- VARCHAR(n): 가변 길이 (권장)
VARCHAR(100)         -- 예: 사용자 이름
VARCHAR(255)         -- 예: 이메일 주소
VARCHAR(500)         -- 예: 게시글 제목
VARCHAR(1000)        -- 예: URL

-- TEXT: 길이 제한 없음 (큰 데이터용)
TEXT                 -- 예: 본문 내용, 설명
```

**선택 가이드**:
```
짧은 고정길이 (2~20자)    → CHAR()
짧은 가변길이 (20~255자)  → VARCHAR(n)  ← 대부분의 경우
긴 텍스트                 → TEXT
```

### 숫자 데이터

```sql
-- SMALLINT: 작은 정수 (-32768 ~ 32767)
SMALLINT             -- 예: 나이, 순위

-- INTEGER: 일반 정수 (-2,147,483,648 ~ 2,147,483,647)
INTEGER              -- 예: 사용자 ID, 조회 수
SERIAL               -- 자동 증가 INTEGER

-- BIGINT: 큰 정수 (64비트)
BIGINT               -- 예: 장시간 타이머, 매우 큰 숫자
BIGSERIAL            -- 자동 증가 BIGINT

-- NUMERIC: 정확한 소수점
NUMERIC(10, 2)       -- 예: 가격 (9자리 정수, 2자리 소수)
DECIMAL(10, 2)       -- NUMERIC과 동일

-- FLOAT/DOUBLE: 근사 소수점 (빠르지만 정확도 낮음)
FLOAT                -- 예: 센서 값, 좌표
DOUBLE PRECISION     -- FLOAT의 64비트 버전
```

**선택 가이드**:
```
    예시              데이터 타입
──────────────────────────────────
좋아요 수             INTEGER
나이                  SMALLINT
사용자 ID             SERIAL (INTEGER)
가격                  NUMERIC(10,2)
위도/경도             FLOAT
조회 수               BIGINT (매우 큰 경우)
```

### 날짜/시간 데이터

```sql
-- DATE: 날짜만
DATE                 -- 예: 2026-04-04
                     -- SELECT date_trunc('day', now());

-- TIME: 시간만
TIME                 -- 예: 14:30:45
                     -- SELECT now()::time;

-- TIMESTAMP: 날짜 + 시간 (권장)
TIMESTAMP            -- 예: 2026-04-04 14:30:45
TIMESTAMP WITH TIME ZONE  -- 타임존 포함

-- INTERVAL: 시간 차이
INTERVAL             -- 예: '5 days', '2 hours'
```

**사용 예**:
```sql
-- 게시글 생성 시간 (항상 현재 시간)
created_at TIMESTAMP DEFAULT NOW()

-- 사용자 가입일 (날짜만 필요한 경우)
signup_date DATE DEFAULT CURRENT_DATE

-- 만료 날짜/시간 (타임존 고려)
expires_at TIMESTAMP WITH TIME ZONE

-- 기간 (예: 구독 기간)
subscription_duration INTERVAL

-- 타임존 있는 현재 시간
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
```

### Boolean 데이터

```sql
-- BOOLEAN: true/false
BOOLEAN              -- 예: is_active, is_deleted

-- 기본값 설정
is_active BOOLEAN DEFAULT true
is_verified BOOLEAN DEFAULT false
```

### JSON 데이터

```sql
-- JSON: 텍스트로 저장 (검색 성능 낮음)
JSON                 -- SELECT data FROM ... WHERE data ->> 'key' = 'value'

-- JSONB: 바이너리로 저장 (검색 성능 높음, 권장)
JSONB                -- SELECT data @> '{"key":"value"}'

-- 사용 예
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    settings JSONB DEFAULT '{}'::jsonb
);

-- 삽입
INSERT INTO user_preferences (user_id, settings)
VALUES (1, '{"theme":"dark","notifications":true}');

-- 조회
SELECT settings->'theme' FROM user_preferences WHERE user_id = 1;
-- 결과: "dark"
```

### Array 데이터

```sql
-- ARRAY: 배열 타입
INTEGER[]            -- 정수 배열
TEXT[]               -- 텍스트 배열
VARCHAR[]            -- 가변 문자열 배열

-- 사용 예
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    tags TEXT[],
    author_ids INTEGER[]
);

-- 삽입
INSERT INTO posts (tags, author_ids)
VALUES (ARRAY['python','ai','ml'], ARRAY[1,2,3]);

-- 조회
SELECT tags FROM posts;
-- 결과: {python,ai,ml}

-- 특정 요소 조회
SELECT tags[1] FROM posts;  -- 첫 번째 요소: "python"

-- 배열 포함 여부 확인
SELECT * FROM posts WHERE 'python' = ANY(tags);
```

---

## 관계 설계 (Relations)

### 1️⃣ 일대다 (1:N) 관계

**정의**: 한 카테고리는 많은 게시글을 가짐

```
categories (1)
    │
    │ (1:N)
    │
    └─→ posts (많음)
```

**SQL 구현**:
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    -- category_id: 외부키로 categories 참조
);
```

**DELETE 동작 옵션**:
```sql
-- RESTRICT: 참조된 행이 있으면 삭제 불가 (기본값)
category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT

-- SET NULL: 부모 삭제 시 자식의 외부키를 NULL로 설정
category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL

-- CASCADE: 부모 삭제 시 자식도 자동 삭제 (주의!)
category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE

-- SET DEFAULT: 부모 삭제 시 자식의 외부키를 기본값으로 설정
category_id INTEGER DEFAULT 1 REFERENCES categories(id) ON DELETE SET DEFAULT
```

**조회 쿼리**:
```sql
-- 게시글과 함께 카테고리명 조회
SELECT p.id, p.title, c.name as category_name
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id;

-- PostgREST API로 같은 조회
GET /posts?select=*,categories(name)
```

### 2️⃣ 다대다 (N:N) 관계

**정의**: 많은 게시글이 많은 태그를 가지고, 많은 태그가 많은 게시글에 속함

```
posts (많음)
    │
    ├─→ post_tags (접합 테이블)
    │
tags (많음)
```

**SQL 구현**:
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500)
);

-- 접합 테이블 (중간 테이블)
CREATE TABLE post_tags (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(post_id, tag_id)  -- 같은 게시글에서 중복 태그 방지
);
```

**조회 쿼리**:
```sql
-- 게시글 1의 모든 태그
SELECT t.name
FROM tags t
JOIN post_tags pt ON t.id = pt.tag_id
WHERE pt.post_id = 1;

-- PostgREST API
GET /post_tags?post_id=eq.1&select=tags(name)
```

---

## 인덱스와 성능

### 인덱스란?

데이터베이스에서 **빠른 검색**을 위한 자료구조 (책의 색인처럼)

```
┌─────────────┐
│ B-Tree 구조 │
│             │
│    Root     │
│   /   \     │
│  Mid  Mid    │
│ / \  / \   │
│L L L L L L │ (Leaf nodes: 실제 데이터)
└─────────────┘
```

### 기본 인덱스 생성

```sql
-- 단일 컬럼 인덱스
CREATE INDEX idx_posts_category_id ON posts(category_id);

-- 여러 컬럼 인덱스 (복합 인덱스)
CREATE INDEX idx_posts_created_category ON posts(created_at DESC, category_id);

-- 고유 인덱스 (중복 방지)
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### 인덱스 선택 가이드

```sql
-- ✅ 인덱스가 필요한 경우
- 외부키 (자주 검색)
  CREATE INDEX idx_posts_category_id ON posts(category_id);

- 자주 필터링되는 컬럼 (WHERE 절에 자주 사용)
  CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX idx_users_is_active ON users(is_active);

- 자주 정렬되는 컬럼 (ORDER BY 절에 자주 사용)
  CREATE INDEX idx_posts_likes ON posts(likes DESC);

- 검색하는 컬럼 (LIKE, ILIKE 검색)
  CREATE INDEX idx_posts_title_gin ON posts USING gin(to_tsvector('korean', title));

-- ❌ 인덱스가 불필요한 경우
- 작은 테이블 (<1000행)
- 거의 변경되지 않는 데이터
- 고유성이 낮은 컬럼 (예: is_active, is_deleted)
- 매우 큰 TEXT 필드
```

### 현재 프로젝트의 권장 인덱스

```sql
-- posts 테이블 (가장 자주 조회)
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_source_id ON posts(source_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes ON posts(likes DESC);

-- categories 테이블
CREATE INDEX idx_categories_name ON categories(name);

-- sources 테이블
CREATE INDEX idx_sources_name ON sources(name);

-- 복합 인덱스 (자주 함께 검색)
CREATE INDEX idx_posts_category_date ON posts(category_id, created_at DESC);
```

---

## 설계 패턴과 베스트 프랙티스

### 패턴 1️⃣: Soft Delete (논리적 삭제)

**목적**: 물리적으로 삭제하지 않고 is_deleted 플래그로 표시

```sql
-- 테이블에 deleted_at 컬럼 추가
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    deleted_at TIMESTAMP  -- NULL: 활성, NOT NULL: 삭제됨
);

-- 또는 is_deleted 불린 사용
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    is_deleted BOOLEAN DEFAULT false
);

-- 조회 시 삭제된 항목 제외
SELECT * FROM posts WHERE is_deleted = false;

-- 또는
SELECT * FROM posts WHERE deleted_at IS NULL;
```

**장점**:
- 삭제 이력 추적 가능
- 실수로 삭제한 데이터 복원 가능
- 통계 계산에 전체 데이터 사용 가능

### 패턴 2️⃣: Audit Trail (감사 기록)

**목적**: 데이터 변경 이력을 추적

```sql
CREATE TABLE posts_audit (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by VARCHAR(100),  -- 변경한 사용자
    action VARCHAR(10),        -- INSERT, UPDATE, DELETE
    old_values JSONB,          -- 이전 값
    new_values JSONB           -- 새 값
);

-- 또는 changed_at, updated_at으로 간단하게
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- 마지막 수정 시간으로 변경 감지
);
```

### 패턴 3️⃣: Denormalization (비정규화)

**목적**: 성능 최적화를 위해 일부 정규화 규칙 무시

```sql
-- 정규화된 설계 (느림)
SELECT COUNT(*) FROM posts WHERE category_id = 1;

-- 비정규화된 설계 (빠름)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    post_count INTEGER DEFAULT 0  -- 캐시된 값
);

-- 게시글 추가 시 post_count 업데이트
UPDATE categories SET post_count = post_count + 1 WHERE id = 1;
```

**주의**: 일관성 유지 필수!

### 패턴 4️⃣: Status Enum (상태 관리)

```sql
-- 방법 1: VARCHAR로 제한
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

-- 방법 2: ENUM 타입 (권장)
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    status order_status DEFAULT 'pending'
);
```

### 패턴 5️⃣: Timestamped Records (시간 추적)

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),

    -- 생성 정보
    created_at TIMESTAMP DEFAULT NOW(),

    -- 수정 정보
    updated_at TIMESTAMP DEFAULT NOW(),

    -- 삭제 정보
    deleted_at TIMESTAMP
);

-- created_at은 절대 변경되면 안 됨!
-- updated_at은 매번 업데이트 시 변경됨
```

---

## 성능 최적화 체크리스트

```
┌─────────────────────────────────────────┐
│ 데이터베이스 성능 최적화 체크리스트     │
├─────────────────────────────────────────┤
│ □ PRIMARY KEY 설정
│ □ 외부키에 인덱스 생성
│ □ 자주 검색되는 컬럼에 인덱스
│ □ 자주 정렬되는 컬럼에 인덱스
│ □ 정규화 (적절한 수준)
│ □ 불필요한 NULL 값 제거
│ □ 너무 큰 컬럼은 별도 테이블로 분리
│ □ LIMIT 사용 (페이지네이션)
│ □ 비정규화 필드로 COUNT 최적화
│ □ 느린 쿼리 모니터링
└─────────────────────────────────────────┘
```

---

## PostgREST에서의 특수 고려사항

### 1️⃣ View (뷰) 활용

PostgREST는 테이블뿐 아니라 **뷰**도 API 엔드포인트로 노출할 수 있음

```sql
-- 복잡한 조인을 뷰로 만들기
CREATE VIEW posts_with_details AS
SELECT
    p.id,
    p.title,
    p.excerpt,
    c.name as category_name,
    s.name as source_name,
    p.likes,
    p.created_at
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN sources s ON p.source_id = s.id
WHERE p.is_deleted = false;

-- 이제 /posts_with_details 엔드포인트로 자동 조회 가능!
-- 권한 설정
GRANT SELECT ON posts_with_details TO anon;
```

**장점**:
- 복잡한 쿼리를 단순한 API로 제공
- 성능 최적화
- 보안 (특정 컬럼만 노출)

### 2️⃣ RPC 함수

계산이나 복잡한 로직이 필요한 경우 RPC 함수 사용

```sql
CREATE FUNCTION get_posts_stats()
RETURNS TABLE (total_posts bigint, avg_likes float, max_likes int)
AS $$
    SELECT
        COUNT(*),
        AVG(likes),
        MAX(likes)
    FROM posts
    WHERE is_deleted = false;
$$ LANGUAGE SQL;

GRANT EXECUTE ON FUNCTION get_posts_stats() TO anon;
```

---

## 정리: 스키마 설계 원칙 정리

```
┌──────────────────────────────────────────────┐
│ 좋은 데이터베이스 스키마의 특징              │
├──────────────────────────────────────────────┤
│ 1. 정규화됨 (중복 최소)                      │
│ 2. 제약조건 완벽 (무결성 보장)               │
│ 3. 명확한 명명 (이해하기 쉬움)               │
│ 4. 적절한 인덱스 (검색 빠름)                 │
│ 5. 확장성 있음 (향후 수정 쉬움)              │
│ 6. 문서화됨 (주석으로 설명)                  │
└──────────────────────────────────────────────┘
```

더 자세한 정보는 [새 테이블 추가 가이드](./NEW_TABLE_GUIDE.md)를 참고하세요.
