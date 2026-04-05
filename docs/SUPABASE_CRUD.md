# Supabase PostgreSQL CRUD 가이드

> **프로젝트**: 커뮤니티 인기글 모아보기
> **데이터베이스**: PostgreSQL (Docker)
> **접근**: pgAdmin, REST API, SQL CLI

---

## 📋 목차

1. [데이터베이스 구조](#-데이터베이스-구조)
2. [CREATE (생성)](#-create-생성)
3. [READ (조회)](#-read-조회)
4. [UPDATE (수정)](#-update-수정)
5. [DELETE (삭제)](#-delete-삭제)
6. [유용한 쿼리](#-유용한-쿼리)

---

## 🏗️ 데이터베이스 구조

### 테이블 관계도

```
┌─────────────────┐
│  categories     │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
│ icon            │
│ description     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│  posts                  │
├─────────────────────────┤
│ id (PK)                 │
│ title                   │
│ excerpt                 │
│ content                 │
│ category_id (FK)        │
│ source_id (FK)          │
│ likes                   │
│ comments                │
│ views                   │
│ created_at              │
│ updated_at              │
└────────┬────────────────┘
         │
         │ N:1
         │
┌────────▼────────┐
│  sources        │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
│ url             │
│ icon_emoji      │
└─────────────────┘
```

### 테이블 상세

#### **categories** (카테고리)
```sql
id: SERIAL PRIMARY KEY
name: VARCHAR(50) UNIQUE NOT NULL
icon: VARCHAR(10)
description: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**예시 데이터:**
```
id | name          | icon | description
---+-----------+------+-----------------------------------
1  | tech      | 💻   | 기술, 프로그래밍, AI, 클라우드
2  | news      | 📰   | 뉴스, 정치, 경제
3  | entertainment | 🎬   | 영화, 음악, 연예
4  | sports    | ⚽   | 스포츠, 경기, 선수
5  | life      | 🏠   | 일상, 생활, 건강
```

---

#### **sources** (출처)
```sql
id: SERIAL PRIMARY KEY
name: VARCHAR(100) UNIQUE NOT NULL
url: VARCHAR(255)
icon_emoji: VARCHAR(10)
description: TEXT
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**예시 데이터:**
```
id | name           | url                        | icon_emoji
---+----------------+----------------------------+----------
1  | Reddit         | https://reddit.com         | 🔴
2  | Hacker News    | https://news.ycombinator  | ⬜
3  | Medium         | https://medium.com         | 📝
4  | Twitter        | https://twitter.com        | 🐦
5  | Naver          | https://naver.com          | 🟢
6  | ESPN           | https://espn.com           | 📺
7  | BBC            | https://bbc.com            | 📻
```

---

#### **posts** (게시글)
```sql
id: SERIAL PRIMARY KEY
title: VARCHAR(500) NOT NULL
excerpt: TEXT
content: TEXT
category_id: INTEGER NOT NULL REFERENCES categories(id)
source_id: INTEGER NOT NULL REFERENCES sources(id)
url: VARCHAR(2048)
author: VARCHAR(255)
tags: VARCHAR(255)[]
likes: INTEGER DEFAULT 0
comments: INTEGER DEFAULT 0
views: INTEGER DEFAULT 0
is_trending: BOOLEAN DEFAULT false
created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**예시 데이터:**
```
id | title                           | category_id | source_id | likes | comments
---+---------------------------------+-------------+-----------+-------+----------
1  | 혁신적인 AI 모델이 2024년...   | 1           | 1         | 1245  | 342
2  | 오픈소스 커뮤니티가 선택한...  | 1           | 2         | 4567  | 890
3  | 클라우드 컴퓨팅의 미래는...    | 1           | 3         | 2345  | 456
...
```

---

## ✅ CREATE (생성)

### 1. 카테고리 추가

**pgAdmin SQL 쿼리:**
```sql
INSERT INTO categories (name, icon, description)
VALUES ('학습', '📚', '프로그래밍 학습 자료 및 튜토리얼');
```

**REST API (POST):**
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "학습",
    "icon": "📚",
    "description": "프로그래밍 학습 자료 및 튜토리얼"
  }'
```

**Node.js (Backend):**
```javascript
const result = await pool.query(
  'INSERT INTO categories (name, icon, description) VALUES ($1, $2, $3) RETURNING *',
  ['학습', '📚', '프로그래밍 학습 자료 및 튜토리얼']
);
console.log('추가된 카테고리:', result.rows[0]);
```

### 2. 출처 추가

```sql
INSERT INTO sources (name, url, icon_emoji, description)
VALUES ('Dev.to', 'https://dev.to', '💼', '개발자 커뮤니티 블로그');
```

### 3. 게시글 추가

```sql
INSERT INTO posts (
  title, excerpt, category_id, source_id, url, author, likes, comments, created_at
) VALUES (
  '새로운 AI 기술 소개',
  'AI 기술의 최신 트렌드를 알아봅시다',
  1,  -- category_id (tech)
  1,  -- source_id (Reddit)
  'https://reddit.com/r/technology',
  'tech_expert',
  0,
  0,
  NOW()
);
```

**반환 ID 받기:**
```sql
INSERT INTO posts (...)
VALUES (...)
RETURNING id, title, created_at;
-- 새로 생성된 게시글의 ID와 타임스탬프 반환
```

---

## 📖 READ (조회)

### 1. 모든 카테고리 조회

```sql
SELECT * FROM categories ORDER BY name;
```

**결과:**
```
 id |     name      | icon |           description
----+---------------+------+----------------------------------
  1 | entertainment | 🎬   | 영화, 음악, 연예 관련
  2 | life          | 🏠   | 일상, 생활, 건강 관련
  3 | news          | 📰   | 뉴스, 정치, 경제 관련
  4 | sports        | ⚽   | 스포츠, 경기, 선수 관련
  5 | tech          | 💻   | 기술, 프로그래밍, AI 관련
```

### 2. 모든 출처 조회

```sql
SELECT * FROM sources ORDER BY name;
```

### 3. 모든 게시글 조회 (기본)

```sql
SELECT * FROM posts LIMIT 10;
```

### 4. 게시글 상세 조회 (JOIN 포함)

```sql
SELECT
  p.id,
  p.title,
  p.excerpt,
  p.likes,
  p.comments,
  p.views,
  p.created_at,
  c.name as category_name,
  c.icon as category_icon,
  s.name as source_name,
  s.icon_emoji as source_icon,
  p.url,
  p.author
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id
ORDER BY p.created_at DESC
LIMIT 6;
```

### 5. 카테고리별 게시글 조회

```sql
-- 기술 카테고리 게시글만
SELECT p.title, p.likes, p.comments
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'tech'
ORDER BY p.created_at DESC;
```

### 6. 추천순 정렬 (인기 게시글)

```sql
SELECT title, likes, comments, author
FROM posts
ORDER BY likes DESC
LIMIT 10;
```

### 7. 댓글순 정렬

```sql
SELECT title, comments, likes, author
FROM posts
ORDER BY comments DESC
LIMIT 10;
```

### 8. 검색 (제목에 'AI' 포함)

```sql
SELECT title, excerpt, likes
FROM posts
WHERE title ILIKE '%AI%'
   OR excerpt ILIKE '%AI%'
ORDER BY likes DESC;
```

### 9. 날짜 범위 조회 (최근 7일)

```sql
SELECT title, created_at, likes
FROM posts
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### 10. 통계 조회

```sql
-- 전체 통계
SELECT
  COUNT(*) as total_posts,
  ROUND(AVG(likes), 2) as avg_likes,
  MAX(likes) as max_likes,
  ROUND(AVG(comments), 2) as avg_comments,
  MAX(comments) as max_comments,
  SUM(likes) as total_likes
FROM posts;
```

**결과:**
```
 total_posts | avg_likes | max_likes | avg_comments | max_comments | total_likes
-------------+-----------+-----------+--------------+--------------+-------------
          50 |   2400.50 |      5432 |       460.25 |         1200 |      120025
```

### 11. 카테고리별 통계

```sql
SELECT
  c.name as category,
  COUNT(p.id) as post_count,
  ROUND(AVG(p.likes), 2) as avg_likes,
  MAX(p.likes) as max_likes
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY post_count DESC;
```

**결과:**
```
 category      | post_count | avg_likes | max_likes
---------------+------------+-----------+-----------
 tech          |         12 |   3200.42 |      5432
 entertainment |         10 |   2345.60 |      4123
 sports        |         10 |   2567.80 |      5432
 news          |         10 |   1876.20 |      2345
 life          |          8 |   2187.50 |      3120
```

### 12. 페이지네이션 (LIMIT & OFFSET)

```sql
-- 페이지 1 (1-6번)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 6 OFFSET 0;

-- 페이지 2 (7-12번)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 6 OFFSET 6;

-- 페이지 3 (13-18번)
SELECT * FROM posts ORDER BY created_at DESC LIMIT 6 OFFSET 12;
```

---

## ✏️ UPDATE (수정)

### 1. 게시글 추천수 증가

```sql
UPDATE posts
SET likes = likes + 1
WHERE id = 1;
```

### 2. 게시글 제목 수정

```sql
UPDATE posts
SET title = '수정된 제목', updated_at = NOW()
WHERE id = 5;
```

### 3. 게시글 상태 변경 (트렌드 마크)

```sql
UPDATE posts
SET is_trending = true
WHERE likes > 5000;
```

### 4. 여러 게시글 일괄 수정

```sql
-- 기술 카테고리의 모든 게시글 조회수 10 증가
UPDATE posts
SET views = views + 10
WHERE category_id = 1;
```

### 5. 카테고리 설명 수정

```sql
UPDATE categories
SET description = '최신 기술, 인공지능, 프로그래밍'
WHERE name = 'tech';
```

### 6. 자동 타임스탬프 업데이트

```sql
-- 자동 updated_at 설정 (트리거로 자동 적용)
UPDATE posts
SET title = '새 제목'
WHERE id = 3;
-- updated_at이 자동으로 현재 시간으로 변경됨
```

---

## 🗑️ DELETE (삭제)

### 1. 특정 게시글 삭제

```sql
DELETE FROM posts
WHERE id = 10;
```

### 2. 특정 카테고리의 게시글 모두 삭제

```sql
-- ⚠️ 주의: 외래키 제약으로 인해 실패할 수 있음
DELETE FROM posts
WHERE category_id = 1;
```

### 3. 오래된 게시글 삭제 (30일 이상)

```sql
DELETE FROM posts
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 4. 낮은 추천수 게시글 삭제

```sql
DELETE FROM posts
WHERE likes < 10 AND created_at < NOW() - INTERVAL '7 days';
```

### 5. 카테고리 삭제 (주의!)

```sql
-- 먼저 관련 게시글 삭제 필요
DELETE FROM posts WHERE category_id = 1;
DELETE FROM categories WHERE id = 1;
```

### 6. 모든 데이터 초기화 (주의!)

```sql
-- 모든 게시글 삭제
TRUNCATE posts CASCADE;

-- 모든 카테고리 삭제
TRUNCATE categories CASCADE;

-- 모든 출처 삭제
TRUNCATE sources CASCADE;
```

---

## 🔧 유용한 쿼리

### 1. 데이터 백업 (CSV 내보내기)

```sql
-- 게시글을 CSV로 내보내기
COPY posts(id, title, likes, comments, created_at)
TO STDOUT WITH CSV HEADER;
```

### 2. 테이블 구조 확인

```sql
-- 테이블의 모든 컬럼 확인
\d posts

-- 또는 SQL로:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts';
```

### 3. 인덱스 확인

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'posts';
```

### 4. 중복 제거

```sql
-- 중복된 게시글 찾기
SELECT title, COUNT(*) as duplicate_count
FROM posts
GROUP BY title
HAVING COUNT(*) > 1;
```

### 5. 데이터 검증

```sql
-- 고아 레코드 찾기 (존재하지 않는 카테고리 참조)
SELECT p.*
FROM posts p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL;
```

### 6. 성능 분석 (EXPLAIN)

```sql
-- 쿼리 성능 분석
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE category_id = 1
ORDER BY likes DESC;
```

---

## 🔌 REST API를 통한 CRUD

### READ (GET)

```bash
# 모든 게시글 조회
curl http://localhost:3000/api/posts

# 카테고리 필터링
curl "http://localhost:3000/api/posts?category=tech"

# 정렬
curl "http://localhost:3000/api/posts?sort=likes"

# 페이지네이션
curl "http://localhost:3000/api/posts?page=2&limit=6"

# 검색
curl "http://localhost:3000/api/posts?search=AI"

# 복합 조건
curl "http://localhost:3000/api/posts?category=tech&sort=likes&search=Python&page=1"

# 통계
curl http://localhost:3000/api/stats

# 카테고리 목록
curl http://localhost:3000/api/categories

# 출처 목록
curl http://localhost:3000/api/sources
```

---

## 📊 JavaScript (Frontend)에서 사용

### Fetch를 통한 데이터 조회

```javascript
// 모든 게시글 조회
async function getPosts() {
  const response = await fetch('http://localhost:3000/api/posts');
  const data = await response.json();
  console.log(data.data); // 게시글 배열
}

// 필터링된 게시글 조회
async function getFilteredPosts(category, sort, search) {
  const params = new URLSearchParams({
    category,
    sort,
    search,
    page: 1,
    limit: 6
  });

  const response = await fetch(`http://localhost:3000/api/posts?${params}`);
  const data = await response.json();

  return {
    posts: data.data,
    pagination: data.pagination
  };
}

// 통계 조회
async function getStats() {
  const response = await fetch('http://localhost:3000/api/stats');
  const data = await response.json();
  console.log(data.data); // 통계 데이터
}
```

---

## 🚀 실행 환경별 접근 방법

### 1. pgAdmin (웹 UI)
```
http://localhost:5050
- 이메일: admin@admin.com
- 비밀번호: admin
```

### 2. 커맨드 라인 (psql)
```bash
# Docker를 통한 접근
docker-compose exec postgres psql -U supabase -d supabase

# 일반 쉘에서
psql -h localhost -p 5432 -U supabase -d supabase
```

### 3. REST API
```
http://localhost:3000/api/posts
```

### 4. JavaScript (Fetch API)
```javascript
fetch('http://localhost:3000/api/posts')
  .then(res => res.json())
  .then(data => console.log(data))
```

---

## 📌 주의사항

### 1. 외래키 제약 (Foreign Key)
- `posts` 테이블의 `category_id`와 `source_id`는 외래키
- 존재하지 않는 카테고리/출처 ID로는 게시글 생성 불가

### 2. 유니크 제약 (UNIQUE)
- `categories.name`과 `sources.name`은 유니크
- 중복된 이름으로는 추가 불가

### 3. 자동 업데이트
- `posts.updated_at`은 UPDATE 시 자동으로 현재 시간 설정
- 트리거로 자동 관리됨

### 4. 인덱스 활용
- `created_at`, `likes`, `comments` 등에 인덱스 설정
- 정렬 및 필터링 시 성능 향상

---

## 📚 참고자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [pgAdmin 튜토리얼](https://www.pgadmin.org/docs/)
- [SQL 완벽 가이드](https://sqlzoo.net/)

---

**작성일**: 2024년 4월 4일
**버전**: 1.0
**상태**: ✅ 완료
