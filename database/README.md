# Step 3: PostgreSQL 데이터베이스 구축

## 📌 목표

이 단계에서는 **데이터베이스 설계 및 SQL 학습**을 합니다.
Step 2의 Mock 데이터를 PostgreSQL 데이터베이스에 저장하고, SQL 쿼리를 통해 데이터를 조회합니다.

---

## 🎯 학습 포인트

### 1. 관계형 데이터베이스 설계
```
categories (카테고리)
    ↓
    posts (게시글)
    ↑
sources (출처)
```
- **1:N 관계** - 하나의 카테고리에 여러 게시글
- **정규화** - 데이터 중복 최소화
- **외래키** - 테이블 간 관계 유지

### 2. SQL 기초
```sql
SELECT title FROM posts;              -- 조회
WHERE likes > 1000;                   -- 필터링
ORDER BY likes DESC;                  -- 정렬
GROUP BY category;                    -- 그룹화
JOIN categories ON ...;               -- 테이블 연결
```

### 3. 인덱스 (Index)
```sql
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```
- 데이터 조회 속도 향상
- 검색, 정렬, 조인 성능 개선

### 4. 트리거 (Trigger)
```sql
CREATE TRIGGER trigger_update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_updated_at();
```
- `updated_at`을 자동으로 현재 시간으로 변경
- 데이터 일관성 유지

---

## 📁 파일 구조

```
database/
├── schema.sql       # 테이블 생성 (CREATE TABLE)
├── seed.sql         # 샘플 데이터 (INSERT)
├── queries.sql      # SQL 쿼리 예제 (SELECT, JOIN, etc.)
└── README.md        # 이 파일
```

---

## 🏗️ 데이터베이스 스키마

### categories 테이블
```
id      (INT, PK)
name    (VARCHAR, UNIQUE)  → tech, news, entertainment, sports, life
icon    (VARCHAR)          → 💻, 📰, 🎬, ⚽, 🏠
```

### sources 테이블
```
id      (INT, PK)
name    (VARCHAR, UNIQUE)  → Reddit, Medium, Twitter, Naver, etc.
url     (VARCHAR)
icon    (VARCHAR)
```

### posts 테이블
```
id          (INT, PK)
title       (VARCHAR)
excerpt     (TEXT)
category_id (INT, FK → categories.id)
source_id   (INT, FK → sources.id)
likes       (INT, >= 0)
comments    (INT, >= 0)
views       (INT)
url         (VARCHAR)
created_at  (TIMESTAMP)
updated_at  (TIMESTAMP)  ← 자동 업데이트 (트리거)
```

---

## 🚀 실행 방법

### Step 1: 테이블 생성

```bash
# PostgreSQL에 접속
psql -U supabase -d supabase

# 또는 pgAdmin에서 Query Tool 사용
```

```sql
-- schema.sql의 내용을 복사하여 실행
-- psql 명령줄에서
\i database/schema.sql

-- 또는 한 번에
psql -U supabase -d supabase -f database/schema.sql
```

### Step 2: 샘플 데이터 삽입

```bash
# seed.sql 실행
psql -U supabase -d supabase -f database/seed.sql
```

### Step 3: 쿼리 학습

```bash
# queries.sql 실행
psql -U supabase -d supabase -f database/queries.sql
```

---

## 🎓 SQL 핵심 문법

### 기본 SELECT

```sql
-- 모든 게시글 조회
SELECT * FROM posts;

-- 특정 컬럼만 조회
SELECT id, title, likes FROM posts;

-- 정렬
SELECT * FROM posts ORDER BY likes DESC;

-- 제한
SELECT * FROM posts LIMIT 10;
```

### WHERE (필터링)

```sql
-- 조건 하나
SELECT * FROM posts WHERE likes > 1000;

-- 복합 조건
SELECT * FROM posts WHERE likes > 1000 AND comments > 200;

-- OR 조건
SELECT * FROM posts WHERE category_id = 1 OR category_id = 2;

-- IN
SELECT * FROM posts WHERE category_id IN (1, 2, 3);

-- LIKE (문자열 검색)
SELECT * FROM posts WHERE title LIKE '%AI%';
SELECT * FROM posts WHERE title ILIKE '%ai%';  -- 대소문자 무시
```

### JOIN (테이블 연결)

```sql
-- INNER JOIN (교집합)
SELECT p.title, c.name
FROM posts p
INNER JOIN categories c ON p.category_id = c.id;

-- LEFT JOIN (왼쪽 테이블 전체 포함)
SELECT c.name, COUNT(p.id)
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id;

-- 여러 테이블 JOIN
SELECT p.title, c.name, s.name
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id;
```

### GROUP BY와 집계

```sql
-- 카테고리별 게시글 수
SELECT category_id, COUNT(*) FROM posts GROUP BY category_id;

-- 카테고리별 평균 추천수
SELECT c.name, AVG(p.likes)
FROM posts p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name;

-- HAVING (GROUP BY 이후 필터링)
SELECT category_id, COUNT(*) as count
FROM posts
GROUP BY category_id
HAVING COUNT(*) > 5;
```

### ORDER BY와 LIMIT (페이지네이션)

```sql
-- 추천순 정렬, 상위 10개
SELECT * FROM posts ORDER BY likes DESC LIMIT 10;

-- 페이지 1 (1-6번)
SELECT * FROM posts LIMIT 6 OFFSET 0;

-- 페이지 2 (7-12번)
SELECT * FROM posts LIMIT 6 OFFSET 6;

-- 페이지 3 (13-18번)
SELECT * FROM posts LIMIT 6 OFFSET 12;
```

---

## 📊 실전 예제

### 예제 1: 기술 카테고리의 인기 게시글 Top 5

```sql
SELECT
    p.id,
    p.title,
    p.likes,
    p.comments,
    s.name as source
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id
WHERE c.name = 'tech'
ORDER BY p.likes DESC
LIMIT 5;
```

**결과**: 기술 분야에서 추천이 가장 많은 게시글 5개

### 예제 2: 각 카테고리별 통계

```sql
SELECT
    c.name as category,
    COUNT(*) as post_count,
    ROUND(AVG(p.likes), 2) as avg_likes,
    MAX(p.likes) as max_likes
FROM posts p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY post_count DESC;
```

**결과**: 각 카테고리의 게시글 수, 평균 추천수, 최고 추천수

### 예제 3: 페이지네이션

```sql
-- 페이지당 6개, 페이지 2 조회
SELECT id, title, likes, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 6
OFFSET 6;
```

**결과**: 7번째부터 12번째 게시글

---

## 🧪 pgAdmin에서 테스트

### 1. 테이블 확인

```
좌측 메뉴
→ Servers → Supabase Local → Database → Schemas → public → Tables
→ categories, sources, posts 테이블 확인
```

### 2. 데이터 조회

```
Tools → Query Tool
→ 다음 쿼리 실행:

SELECT * FROM categories;
SELECT * FROM sources;
SELECT COUNT(*) FROM posts;
```

### 3. 쿼리 실행 및 분석

```sql
-- categories별 게시글 수 확인
SELECT c.name, COUNT(p.id) as count
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id, c.name;
```

---

## 💡 팁과 트릭

### 1. 날짜 함수
```sql
NOW()                          -- 현재 시간
NOW() - INTERVAL '24 hours'    -- 24시간 전
DATE(created_at)               -- 날짜만 추출
```

### 2. 문자열 함수
```sql
UPPER(title)                   -- 대문자
LOWER(title)                   -- 소문자
LENGTH(title)                  -- 문자 길이
SUBSTR(title, 1, 10)           -- 부분 추출
CONCAT(icon, ' ', name)        -- 문자 연결
```

### 3. 수치 함수
```sql
ROUND(avg_likes, 2)            -- 소수점 2자리로 반올림
CEIL(value)                    -- 올림
FLOOR(value)                   -- 내림
ABS(value)                     -- 절댓값
```

### 4. 조건문
```sql
CASE
    WHEN likes > 4000 THEN '🔥 대인기'
    WHEN likes > 2000 THEN '👍 인기'
    ELSE '📝 일반'
END as popularity
```

---

## ❓ 자주 묻는 질문

**Q: 왜 category_id와 source_id가 필요한가?**
A: 데이터 중복을 피하고 관계를 관리하기 위해. "기술"을 매번 저장하는 대신 ID 참조.

**Q: 왜 updated_at이 자동 업데이트되나?**
A: 트리거(Trigger)를 사용하여 데이터 수정 시 언제 변경되었는지 자동 추적.

**Q: INNER JOIN vs LEFT JOIN?**
A:
- **INNER JOIN**: 양쪽 테이블에 모두 존재하는 데이터만
- **LEFT JOIN**: 왼쪽 테이블의 모든 데이터 (오른쪽은 없으면 NULL)

**Q: 왜 인덱스가 필요한가?**
A: 테이블이 커질수록 검색 속도 향상. `ORDER BY`, `WHERE`, `JOIN`이 빨라짐.

**Q: 트렌딩 게시글을 어떻게 확인하나?**
A: `is_trending = true` 또는 `(likes + comments * 2)` 같은 engagement score 계산.

---

## 🔗 다음 단계

✅ **Step 3 완료!**
→ **[Step 4: REST API 구축](../../backend/README.md)**

Step 4에서는:
- Node.js + Express로 API 서버 구축
- PostgreSQL 데이터 조회 API 구현
- HTTP 요청/응답 처리

---

## 📖 학습 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [PostgreSQL 한글 문서](https://postgresql.kr/)
- [pgAdmin 4 Documentation](https://www.pgadmin.org/docs/)

---

## 🧠 데이터베이스 개념 정리

| 개념 | 설명 |
|------|------|
| **Primary Key** | 각 행을 고유하게 식별 (id) |
| **Foreign Key** | 다른 테이블과의 관계 (category_id → categories.id) |
| **Index** | 빠른 검색을 위한 색인 |
| **JOIN** | 여러 테이블 데이터 연결 |
| **GROUP BY** | 데이터 그룹화 및 집계 |
| **Subquery** | 쿼리 내 쿼리 사용 |
| **Trigger** | 특정 이벤트 시 자동 실행 |
| **View** | 저장된 SELECT 쿼리 |

---

**작성일**: 2024년 4월 4일
**난이도**: ⭐⭐⭐⭐ (중급-고급)
**예상 소요 시간**: 2-3시간
