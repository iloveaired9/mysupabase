# RDBMS ↔ CRUD ↔ API 서버 데이터 변환 가이드

> **목표**: PostgreSQL 데이터 ↔ REST API ↔ Frontend JavaScript 간의 데이터 변환 이해
> **프로젝트**: 커뮤니티 인기글 모아보기 (Step 3-5)

---

## 📋 목차

1. [데이터 변환 흐름](#-데이터-변환-흐름)
2. [RDBMS 데이터 타입](#-rdbms-데이터-타입)
3. [REST API 변환](#-rest-api-변환)
4. [Frontend 변환](#-frontend-변환)
5. [실제 예제](#-실제-예제)
6. [타입 매핑](#-타입-매핑)

---

## 🔄 데이터 변환 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│                  (PostgreSQL / RDBMS)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ CREATE posts (                                      │   │
│  │   id SERIAL,                                        │   │
│  │   title VARCHAR(500),                               │   │
│  │   likes INTEGER,                                    │   │
│  │   created_at TIMESTAMP,                             │   │
│  │   ...                                               │   │
│  │ )                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ (SQL Query Result)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API LAYER                          │
│                 (Node.js / Express)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ const result = await pool.query(                   │   │
│  │   'SELECT * FROM posts WHERE id = $1',             │   │
│  │   [1]                                               │   │
│  │ );                                                  │   │
│  │                                                     │   │
│  │ res.json({                                          │   │
│  │   success: true,                                    │   │
│  │   data: result.rows                                │   │
│  │ });                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│       (JSON Serialization)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ (HTTP Response / JSON)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                            │
│                (HTML/CSS/JavaScript)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ const response = await fetch(                       │   │
│  │   'http://localhost:3000/api/posts'                │   │
│  │ );                                                  │   │
│  │ const data = await response.json();                │   │
│  │                                                     │   │
│  │ data.data.forEach(post => {                        │   │
│  │   console.log(post.title);                         │   │
│  │   renderPostCard(post);                            │   │
│  │ });                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│       (JavaScript Object)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ RDBMS 데이터 타입

### PostgreSQL 데이터 타입 정의

```sql
CREATE TABLE posts (
  -- 정수 타입
  id SERIAL PRIMARY KEY,              -- 1, 2, 3, ...

  -- 문자열 타입
  title VARCHAR(500),                 -- '혁신적인 AI 모델...'
  excerpt TEXT,                       -- '새로운 AI 모델이...'
  content TEXT,                       -- '상세한 내용...'
  author VARCHAR(255),                -- 'tech_expert'
  url VARCHAR(2048),                  -- 'https://reddit.com/r/...'

  -- 숫자 타입
  likes INTEGER DEFAULT 0,            -- 1245
  comments INTEGER DEFAULT 0,         -- 342
  views INTEGER DEFAULT 0,            -- 8932

  -- 불린 타입
  is_trending BOOLEAN DEFAULT false,  -- true/false

  -- 배열 타입
  tags VARCHAR(255)[],                -- '{"AI", "기술", "2024"}'

  -- 외래키 (INTEGER)
  category_id INTEGER NOT NULL,       -- 1
  source_id INTEGER NOT NULL,         -- 2

  -- 날짜/시간 타입
  created_at TIMESTAMP,               -- 2026-04-04 12:00:00
  updated_at TIMESTAMP                -- 2026-04-04 12:30:00
);
```

### PostgreSQL 타입 → JSON 변환

| RDBMS 타입 | 예시 값 | JSON 타입 | JSON 값 |
|-----------|--------|----------|---------|
| SERIAL | 1 | number | `1` |
| INTEGER | 1245 | number | `1245` |
| FLOAT | 3.14 | number | `3.14` |
| VARCHAR | "hello" | string | `"hello"` |
| TEXT | "long text" | string | `"long text"` |
| BOOLEAN | true | boolean | `true` |
| TIMESTAMP | 2026-04-04 12:00 | string (ISO8601) | `"2026-04-04T12:00:00.000Z"` |
| ARRAY | {1,2,3} | array | `[1, 2, 3]` |
| NULL | - | null | `null` |

---

## 🔌 REST API 변환

### 1단계: PostgreSQL 쿼리 실행 (Backend)

**backend/server.js:**
```javascript
app.get('/api/posts/:id', async (req, res) => {
  try {
    // Step 1: SQL 쿼리 실행
    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );

    // Step 2: 결과 추출
    const post = result.rows[0];

    // Step 3: 필요한 데이터만 선택 (선택사항)
    const responseData = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      likes: post.likes,
      comments: post.comments,
      created_at: post.created_at,
      category_id: post.category_id,
      source_id: post.source_id
    };

    // Step 4: JSON 응답
    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**PostgreSQL의 결과:**
```
{
  id: 1,
  title: '혁신적인 AI 모델...',
  excerpt: '새로운 AI 모델...',
  likes: 1245,
  comments: 342,
  views: 8932,
  created_at: 2026-04-04T12:00:00.000Z,
  updated_at: 2026-04-04T12:30:00.000Z,
  category_id: 1,
  source_id: 1,
  ...
}
```

### 2단계: JSON 응답 전송

**HTTP Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
    "excerpt": "새로운 AI 모델이 출시되면서...",
    "likes": 1245,
    "comments": 342,
    "created_at": "2026-04-04T12:00:00.000Z",
    "category_id": 1,
    "source_id": 1
  }
}
```

### 3단계: 데이터 타입 변환 규칙

**Date 변환:**
```javascript
// PostgreSQL: TIMESTAMP (문자열)
const created_at = "2026-04-04T12:00:00.000Z";

// JavaScript Date 객체로 변환
const dateObj = new Date(created_at);
console.log(dateObj); // Date object

// 날짜 포맷팅
const formatted = dateObj.toLocaleDateString('ko-KR');
console.log(formatted); // "2026. 4. 4."
```

**NULL 처리:**
```javascript
// PostgreSQL NULL → JavaScript null
{
  title: "게시글 제목",
  description: null  // DB에서 NULL 값
}

// Frontend에서 처리
if (data.description === null) {
  console.log("설명 없음");
}

// 기본값 설정
const description = data.description || "기본 설명";
```

**배열 처리:**
```javascript
// PostgreSQL: ARRAY 타입
const tags = '{"AI", "기술", "2024"}';

// JSON으로 변환되는 순간
const tagsArray = ["AI", "기술", "2024"];

// Frontend에서 사용
tags.forEach(tag => {
  console.log(tag);
});
```

---

## 🎨 Frontend 변환

### 1단계: API 데이터 수신

**app/step5/app.js:**
```javascript
async function fetchPosts() {
  try {
    // Step 1: API 호출
    const response = await fetch('http://localhost:3000/api/posts');

    // Step 2: JSON 파싱
    const data = await response.json();

    // Step 3: 데이터 추출
    const posts = data.data; // 배열

    // Step 4: 상태 저장
    state.filteredPosts = posts;

    // Step 5: UI 업데이트
    renderPosts();

  } catch (error) {
    console.error('API 에러:', error);
  }
}
```

**수신되는 JSON:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "혁신적인 AI 모델...",
      "excerpt": "새로운 AI 모델...",
      "likes": 1245,
      "comments": 342,
      "views": 8932,
      "created_at": "2026-04-04T12:00:00.000Z",
      "category_name": "tech",
      "category_icon": "💻",
      "source_name": "Reddit",
      "source_icon": "🔴",
      "url": "https://reddit.com/...",
      "created_at_relative": "2시간 전"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 50,
    "pages": 9
  }
}
```

### 2단계: 데이터 변환 및 처리

```javascript
// 수신한 데이터
const post = {
  id: 1,
  title: "혁신적인 AI 모델...",
  likes: 1245,
  created_at: "2026-04-04T12:00:00.000Z"
};

// 변환 1: 날짜 포맷팅
const createdDate = new Date(post.created_at);
const formattedDate = createdDate.toLocaleDateString('ko-KR');

// 변환 2: 숫자 포맷팅
const formattedLikes = post.likes > 1000
  ? (post.likes / 1000).toFixed(1) + 'K'
  : post.likes;

// 변환 3: 텍스트 길이 제한
const truncatedTitle = post.title.length > 50
  ? post.title.substring(0, 50) + '...'
  : post.title;

// 변환된 객체
const displayPost = {
  id: post.id,
  title: truncatedTitle,
  likes: formattedLikes,
  createdDate: formattedDate
};
```

### 3단계: HTML 렌더링

```javascript
function renderPostCard(post) {
  const html = `
    <div class="post-card">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <div class="meta">
        <span>👍 ${formatNumber(post.likes)}</span>
        <span>💬 ${formatNumber(post.comments)}</span>
        <span>🕐 ${post.created_at_relative}</span>
      </div>
      <a href="${post.url}" target="_blank">자세히 보기</a>
    </div>
  `;
  return html;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };
  return text.replace(/[&<>"]/g, m => map[m]);
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
```

---

## 💾 실제 예제

### 전체 데이터 흐름

#### 1. PostgreSQL 데이터

```sql
SELECT
  p.id,
  p.title,
  p.excerpt,
  p.likes,
  p.comments,
  p.created_at,
  c.name as category_name,
  c.icon as category_icon,
  s.name as source_name,
  s.icon_emoji as source_icon
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id
WHERE p.id = 1;
```

**결과:**
```
 id |        title        | excerpt | likes | comments |       created_at        | category_name | category_icon | source_name | source_icon
----+---------------------+---------+-------+----------+-------------------------+---------------+---------------+-------------+-------------
  1 | 혁신적인 AI 모델... | 새로운  | 1245  |      342 | 2026-04-04 12:00:00+00 | tech          | 💻            | Reddit      | 🔴
```

#### 2. Backend 처리

**server.js:**
```javascript
app.get('/api/posts/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT
      p.id, p.title, p.excerpt, p.likes, p.comments, p.created_at,
      c.name as category_name, c.icon as category_icon,
      s.name as source_name, s.icon_emoji as source_icon,
      p.url, p.author
    FROM posts p
    JOIN categories c ON p.category_id = c.id
    JOIN sources s ON p.source_id = s.id
    WHERE p.id = $1`,
    [req.params.id]
  );

  const post = result.rows[0];

  res.json({
    success: true,
    data: {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      likes: post.likes,
      comments: post.comments,
      created_at: post.created_at,
      created_at_relative: formatRelativeTime(post.created_at),
      category_icon: post.category_icon,
      category_name: post.category_name,
      source_icon: post.source_icon,
      source_name: post.source_name,
      url: post.url,
      author: post.author
    }
  });
});
```

#### 3. API 응답 (JSON)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
    "excerpt": "새로운 AI 모델이 출시되면서...",
    "likes": 1245,
    "comments": 342,
    "created_at": "2026-04-04T12:00:00.000Z",
    "created_at_relative": "2시간 전",
    "category_icon": "💻",
    "category_name": "tech",
    "source_icon": "🔴",
    "source_name": "Reddit",
    "url": "https://reddit.com/r/technology",
    "author": "tech_enthusiast"
  }
}
```

#### 4. Frontend JavaScript

```javascript
async function loadPost() {
  // API 호출
  const response = await fetch('http://localhost:3000/api/posts/1');
  const data = await response.json();

  const post = data.data;

  // 데이터 사용
  document.querySelector('.post-title').textContent = post.title;
  document.querySelector('.post-excerpt').textContent = post.excerpt;
  document.querySelector('.post-likes').textContent =
    post.likes > 1000 ? (post.likes / 1000).toFixed(1) + 'K' : post.likes;
  document.querySelector('.post-time').textContent = post.created_at_relative;
  document.querySelector('.category-badge').innerHTML =
    `${post.category_icon} ${post.category_name}`;
  document.querySelector('.source-badge').innerHTML =
    `${post.source_icon} ${post.source_name}`;
  document.querySelector('.post-link').href = post.url;
}

loadPost();
```

#### 5. 렌더링 결과 (HTML)

```html
<div class="post-card">
  <h3 class="post-title">
    혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정
  </h3>
  <p class="post-excerpt">새로운 AI 모델이 출시되면서...</p>
  <div class="post-header">
    <span class="category-badge">💻 tech</span>
    <span class="source-badge">🔴 Reddit</span>
  </div>
  <div class="post-meta">
    <span class="post-likes">👍 1.2K</span>
    <span class="post-comments">💬 342</span>
    <span class="post-time">🕐 2시간 전</span>
  </div>
  <a class="post-link" href="https://reddit.com/r/technology" target="_blank">
    자세히 보기 →
  </a>
</div>
```

---

## 🔄 타입 매핑

### 데이터 타입 변환 매트릭스

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ PostgreSQL   │ pg 라이브러리 │ JSON (HTTP)  │ JavaScript   │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ BIGSERIAL    │ number       │ number       │ number       │
│ INTEGER      │ number       │ number       │ number       │
│ DECIMAL      │ string/number│ number       │ number       │
│ VARCHAR      │ string       │ string       │ string       │
│ TEXT         │ string       │ string       │ string       │
│ BOOLEAN      │ boolean      │ boolean      │ boolean      │
│ DATE         │ Date         │ string (ISO) │ Date object  │
│ TIMESTAMP    │ Date         │ string (ISO) │ Date object  │
│ ARRAY        │ array        │ array        │ array        │
│ JSON         │ object       │ object       │ object       │
│ NULL         │ null         │ null         │ null         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### 변환 코드 예제

#### INTEGER → number → number ✅

```javascript
// PostgreSQL: likes INTEGER = 1245
// JSON: "likes": 1245
// JavaScript: post.likes = 1245

const post = {
  likes: 1245  // 이미 number
};

console.log(typeof post.likes); // "number"
post.likes + 1; // 1246
```

#### TIMESTAMP → ISO8601 string → Date ✅

```javascript
// PostgreSQL: created_at TIMESTAMP = 2026-04-04 12:00:00+00
// JSON: "created_at": "2026-04-04T12:00:00.000Z" (ISO 8601)
// JavaScript: Date 객체로 변환

const isoString = "2026-04-04T12:00:00.000Z";

// 변환
const dateObj = new Date(isoString);

// 사용
console.log(dateObj.getFullYear()); // 2026
console.log(dateObj.getMonth());    // 3 (0-indexed, April)
console.log(dateObj.getDate());     // 4
```

#### VARCHAR[] → JSON array → JavaScript array ✅

```javascript
// PostgreSQL: tags VARCHAR[] = '{"AI", "기술", "2024"}'
// JSON: "tags": ["AI", "기술", "2024"]
// JavaScript: 배열로 사용

const post = {
  tags: ["AI", "기술", "2024"]
};

// 사용
post.tags.forEach(tag => console.log(tag));
post.tags.map(tag => `<span>${tag}</span>`).join('');
```

#### NULL 값 처리 ✅

```javascript
// PostgreSQL: description NULL
// JSON: "description": null
// JavaScript: null 값

const post = {
  description: null,
  title: "제목"
};

// 확인
if (post.description === null) {
  console.log("설명 없음");
}

// 기본값 설정
const description = post.description || "기본 설명";

// 또는 옵셔널 체이닝
const text = post.description?.trim() ?? "기본 설명";
```

---

## 🔐 데이터 보안

### SQL Injection 방지

**❌ 위험한 코드:**
```javascript
const query = `SELECT * FROM posts WHERE id = ${req.params.id}`;
// 해킹: ?id=1 OR 1=1 → SELECT * FROM posts WHERE id = 1 OR 1=1
```

**✅ 안전한 코드:**
```javascript
const query = 'SELECT * FROM posts WHERE id = $1';
const result = await pool.query(query, [req.params.id]);
// 파라미터화된 쿼리 사용 (자동 이스케이프)
```

### XSS 방지

**❌ 위험한 코드:**
```javascript
// 사용자 입력이 HTML로 렌더링됨
document.querySelector('.title').innerHTML = post.title;
```

**✅ 안전한 코드:**
```javascript
// 텍스트로 렌더링 (HTML 태그 이스케이프)
document.querySelector('.title').textContent = post.title;

// 또는 수동 이스케이프
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

const safeHTML = `<h3>${escapeHtml(post.title)}</h3>`;
```

---

## 📊 성능 최적화

### 1. 필요한 컬럼만 선택

**❌ 비효율:**
```javascript
const result = await pool.query('SELECT * FROM posts');
// 모든 컬럼 + 네트워크 전송
```

**✅ 효율적:**
```javascript
const result = await pool.query(
  'SELECT id, title, likes, created_at FROM posts'
);
// 필요한 컬럼만
```

### 2. 캐싱

```javascript
// 메모리 캐시
const cache = new Map();

async function getCachedPosts(page) {
  const key = `posts_page_${page}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await fetchPosts(page);
  cache.set(key, data);

  return data;
}
```

### 3. 페이지네이션

```javascript
// 한 번에 모든 데이터: ❌
SELECT * FROM posts;

// 페이지 단위로: ✅
SELECT * FROM posts
LIMIT 6 OFFSET 0;  -- 페이지 1
```

---

## 📚 체크리스트

### Backend (Node.js/Express)

- [ ] PostgreSQL 쿼리 작성
- [ ] 결과 데이터 추출
- [ ] 필요한 필드만 선택
- [ ] 날짜 포맷팅
- [ ] NULL 값 처리
- [ ] JSON 응답 형식 정의
- [ ] 에러 처리

### Frontend (JavaScript)

- [ ] Fetch API 호출
- [ ] JSON 파싱
- [ ] 데이터 변환 (숫자, 날짜 포맷)
- [ ] XSS 방지 (escapeHtml 또는 textContent)
- [ ] NULL 값 처리
- [ ] UI 렌더링
- [ ] 에러 처리

### Database (PostgreSQL)

- [ ] 테이블 설계
- [ ] 데이터 타입 선택
- [ ] 인덱스 설정
- [ ] 외래키 제약
- [ ] NOT NULL 제약

---

## 🚀 실행 환경별 데이터 흐름

### 개발 환경

```
PostgreSQL (Docker 5432)
    ↓
Express.js (localhost:3000)
    ↓
Browser (localhost:5500)
    ↓
Frontend Rendering
```

### 명령어

```bash
# 1. Docker 시작
docker-compose up -d

# 2. API 테스트
curl http://localhost:3000/api/posts

# 3. 브라우저
http://localhost:5500/step5/

# 4. pgAdmin
http://localhost:5050
```

---

## 📖 참고 자료

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Express.js 공식 문서](https://expressjs.com/)
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN - JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

---

**작성일**: 2024년 4월 4일
**버전**: 1.0
**상태**: ✅ 완료

**핵심 개념**:
```
RDBMS Data → SQL Query → JSON → JavaScript Object → DOM
```
