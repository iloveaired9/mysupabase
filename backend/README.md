# Step 4: REST API 구축

## 📌 목표

이 단계에서는 **Node.js + Express를 사용하여 REST API 서버**를 구축합니다.
Step 3의 PostgreSQL 데이터베이스에 저장된 데이터를 HTTP API로 제공합니다.

---

## 🎯 학습 포인트

### 1. Express.js 기초
```javascript
const express = require('express');
const app = express();

app.get('/api/posts', (req, res) => {
    res.json({ data: [] });
});

app.listen(3000, () => console.log('서버 시작'));
```

### 2. REST API 설계
```
GET    /api/posts              - 모든 게시글 조회
GET    /api/posts/:id          - 특정 게시글 조회
GET    /api/categories         - 카테고리 목록
GET    /api/sources            - 출처 목록
```

### 3. 데이터베이스 연결
```javascript
const { Pool } = require('pg');
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'supabase',
    password: 'postgres',
    database: 'supabase'
});

const result = await pool.query('SELECT * FROM posts');
```

### 4. 쿼리 파라미터 처리
```javascript
// GET /api/posts?page=1&limit=6&category=tech&sort=likes
const { page, limit, category, sort } = req.query;
```

### 5. CORS (Cross-Origin Resource Sharing)
```javascript
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));
```

---

## 📁 파일 구조

```
backend/
├── server.js        # Express 메인 서버
├── package.json     # 의존성
├── .env             # 환경 변수
└── README.md        # 이 파일
```

---

## 🚀 설치 및 실행

### Step 1: 의존성 설치

```bash
cd backend
npm install
```

### Step 2: 서버 시작

```bash
# 일반 실행
npm start

# 또는 개발 모드 (자동 재시작)
npm run dev
```

### Step 3: 서버 확인

```bash
curl http://localhost:3000
```

응답 예시:
```json
{
  "success": true,
  "message": "🔥 Hot Posts API v1.0 - 정상 작동 중",
  "endpoints": { ... }
}
```

---

## 📡 API 엔드포인트

### 1. GET /api/posts
**모든 게시글 조회** (페이지네이션, 필터링, 정렬)

#### 쿼리 파라미터
| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | number | 1 | 페이지 번호 |
| limit | number | 6 | 페이지당 게시글 수 |
| category | string | - | 카테고리 필터 (tech, news, entertainment, sports, life) |
| sort | string | latest | 정렬 (latest, likes, comments) |
| search | string | - | 제목/내용 검색 |

#### 예제

```bash
# 1. 기본 조회
curl http://localhost:3000/api/posts

# 2. 기술 카테고리, 추천순, 페이지 1
curl "http://localhost:3000/api/posts?category=tech&sort=likes&page=1"

# 3. "AI" 검색
curl "http://localhost:3000/api/posts?search=AI"

# 4. 복합 조건
curl "http://localhost:3000/api/posts?category=tech&sort=likes&limit=10&search=Python"
```

#### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
      "excerpt": "새로운 AI 모델이 출시되면서...",
      "category_name": "tech",
      "category_icon": "💻",
      "source_name": "Reddit",
      "source_icon": "🔴",
      "likes": 1245,
      "comments": 342,
      "views": 8932,
      "created_at": "2024-04-04T12:00:00Z",
      "created_at_relative": "2시간 전",
      "url": "https://reddit.com/...",
      "author": "tech_enthusiast"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 50,
    "pages": 9
  }
}
```

---

### 2. GET /api/posts/:id
**특정 게시글 상세 조회**

#### 예제

```bash
curl http://localhost:3000/api/posts/1
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
    "excerpt": "새로운 AI 모델이 출시되면서...",
    "content": "상세한 내용...",
    "category_name": "tech",
    "source_name": "Reddit",
    "likes": 1245,
    "comments": 342,
    "url": "https://reddit.com/..."
  }
}
```

---

### 3. GET /api/categories
**모든 카테고리 조회** (각 카테고리의 게시글 수 포함)

#### 예제

```bash
curl http://localhost:3000/api/categories
```

#### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "tech",
      "icon": "💻",
      "description": "기술, 프로그래밍, AI, 클라우드 관련",
      "post_count": 12
    },
    {
      "id": 2,
      "name": "news",
      "icon": "📰",
      "description": "뉴스, 정치, 경제 관련",
      "post_count": 10
    }
  ]
}
```

---

### 4. GET /api/sources
**모든 출처 조회** (각 출처의 게시글 수 포함)

#### 예제

```bash
curl http://localhost:3000/api/sources
```

#### 응답 예시

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Reddit",
      "icon_emoji": "🔴",
      "url": "https://reddit.com",
      "post_count": 12
    },
    {
      "id": 3,
      "name": "Medium",
      "icon_emoji": "📝",
      "url": "https://medium.com",
      "post_count": 8
    }
  ]
}
```

---

### 5. GET /api/stats
**통계 정보 조회**

#### 예제

```bash
curl http://localhost:3000/api/stats
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "total_posts": 50,
    "avg_likes": 2400.5,
    "max_likes": 5432,
    "avg_comments": 460.25,
    "max_comments": 1200,
    "total_likes": 120025
  }
}
```

---

## 🧪 API 테스트

### Postman 또는 Insomnia 사용

1. **Postman 설치**: https://www.postman.com/downloads/
2. **New Request 클릭**
3. **Method**: GET
4. **URL**: http://localhost:3000/api/posts
5. **Send**

### VS Code REST Client 사용

```
# .http 파일 생성

### 1. 게시글 목록
GET http://localhost:3000/api/posts

### 2. 기술 카테고리만
GET http://localhost:3000/api/posts?category=tech

### 3. 추천순 정렬
GET http://localhost:3000/api/posts?sort=likes

### 4. 페이지 2
GET http://localhost:3000/api/posts?page=2&limit=6

### 5. AI 검색
GET http://localhost:3000/api/posts?search=AI

### 6. 복합 조건
GET http://localhost:3000/api/posts?category=tech&sort=likes&search=Python&page=1

### 7. 특정 게시글
GET http://localhost:3000/api/posts/1

### 8. 카테고리 목록
GET http://localhost:3000/api/categories

### 9. 출처 목록
GET http://localhost:3000/api/sources

### 10. 통계
GET http://localhost:3000/api/stats
```

---

## 🔧 환경 설정

### .env 파일

```bash
# PostgreSQL
DB_HOST=postgres         # Docker 컨테이너 이름
DB_PORT=5432
DB_USER=supabase
DB_PASSWORD=postgres
DB_NAME=supabase

# Express
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5500
```

---

## 📊 에러 처리

### 404 Not Found

```json
{
  "success": false,
  "error": "엔드포인트를 찾을 수 없습니다",
  "path": "/api/invalid"
}
```

### 게시글 미발견

```json
{
  "success": false,
  "error": "게시글을 찾을 수 없습니다"
}
```

### 서버 에러

```json
{
  "success": false,
  "error": "서버 에러가 발생했습니다"
}
```

---

## 💡 JavaScript (Fetch API)로 호출

### 기본 예제

```javascript
// 게시글 목록 조회
fetch('http://localhost:3000/api/posts')
    .then(res => res.json())
    .then(data => console.log(data));

// 쿼리 파라미터 포함
fetch('http://localhost:3000/api/posts?category=tech&sort=likes')
    .then(res => res.json())
    .then(data => console.log(data));

// 에러 처리
fetch('http://localhost:3000/api/posts')
    .then(res => {
        if (!res.ok) throw new Error('API 에러');
        return res.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('에러:', error));
```

### Async/Await 사용

```javascript
async function getPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/posts?category=tech');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('에러:', error);
    }
}

getPosts();
```

---

## 🎯 실전 예제: Step 2 연동

Step 2의 JavaScript 앱을 이 API로 변경하기:

```javascript
// 기존 (Mock 데이터)
const posts = MOCK_POSTS;

// 변경 (API에서 조회)
async function loadPosts() {
    const category = state.currentCategory === 'all' ? '' : state.currentCategory;
    const sort = state.currentSort;
    const search = state.searchQuery;

    const params = new URLSearchParams({
        page: state.currentPage,
        limit: 6,
        ...(category && { category }),
        ...(sort !== 'latest' && { sort }),
        ...(search && { search })
    });

    const response = await fetch(`http://localhost:3000/api/posts?${params}`);
    const data = await response.json();

    state.filteredPosts = data.data;
    renderPosts();
}
```

---

## 📈 성능 최적화

### 1. 쿼리 최적화
- 불필요한 컬럼 제외
- 인덱스 활용
- LIMIT으로 데이터 수 제한

### 2. 캐싱
```javascript
// 캐시 구현 예시
const cache = new Map();

app.get('/api/categories', (req, res) => {
    if (cache.has('categories')) {
        return res.json(cache.get('categories'));
    }
    // 데이터베이스 조회
    // cache.set('categories', result);
});
```

### 3. 응답 압축
```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🔗 다음 단계

✅ **Step 4 완료!**
→ **Step 5: Frontend & Backend 통합**

Step 5에서는:
- Step 2의 JavaScript 앱을 이 API와 연동
- 실제 데이터베이스 데이터 표시
- 오류 처리 및 로딩 상태

---

## 📖 참고 자료

- [Express.js 공식 문서](https://expressjs.com/)
- [Node.js PostgreSQL](https://node-postgres.com/)
- [REST API 설계 가이드](https://restfulapi.net/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---

**작성일**: 2024년 4월 4일
**난이도**: ⭐⭐⭐⭐ (중급-고급)
**예상 소요 시간**: 1-2시간
