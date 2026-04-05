# 🔌 REST API 가이드 (PostgREST + Swagger)

## 📖 개요

이 프로젝트는 **PostgREST** 기반의 자동 생성 REST API와 **Swagger UI**를 통한 인터랙티브 API 문서를 제공합니다.

---

## 🚀 API 접근 방법

### 1️⃣ Swagger UI (권장 - 인터랙티브)

```
http://localhost:8080
```

**특징:**
- ✅ 모든 API 엔드포인트 시각화
- ✅ 브라우저에서 직접 API 테스트 가능
- ✅ 요청/응답 자동 포맷팅
- ✅ 스키마 자동 검증

**사용법:**
1. Swagger UI 열기
2. 원하는 엔드포인트 클릭
3. "Try it out" 버튼 클릭
4. 파라미터 입력
5. "Execute" 클릭

### 2️⃣ PostgREST 자동 생성 OpenAPI (자동)

```
http://localhost:3001/
```

**특징:**
- PostgREST가 자동으로 생성하는 OpenAPI 3.0 스펙
- 스키마 변경 시 자동 업데이트
- 모든 테이블/뷰/RPC 함수 자동 포함

### 3️⃣ 수동 API 호출 (CLI/프로그래밍)

cURL 또는 Postman 등으로 직접 호출:

```bash
# 게시글 조회
curl "http://localhost:3001/posts?limit=6&offset=0&order=created_at.desc"

# 카테고리 필터
curl "http://localhost:3001/posts?categories.name=eq.tech&limit=10"

# 검색
curl "http://localhost:3001/posts?or=(title.ilike.*AI*,excerpt.ilike.*AI*)"

# 통계 조회
curl -X POST http://localhost:3001/rpc/get_posts_stats -H "Content-Type: application/json" -d "{}"
```

---

## 📋 API 엔드포인트 목록

### Posts (게시글)

#### `GET /posts`

게시글 목록을 조회합니다.

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `limit` | integer | 페이지당 개수 (기본: 6) | `?limit=10` |
| `offset` | integer | 건너뛸 개수 (기본: 0) | `?offset=6` |
| `order` | string | 정렬 기준 | `?order=created_at.desc` |
| `categories.name` | string | 카테고리 필터 | `?categories.name=eq.tech` |
| `or` | string | 검색 (OR 조건) | `?or=(title.ilike.*AI*,excerpt.ilike.*AI*)` |
| `select` | string | 반환 컬럼 선택 | `?select=id,title,likes` |
| `Prefer` | header | 응답 옵션 | `Prefer: count=exact` |

**응답 예시:**

```json
[
  {
    "id": 1,
    "title": "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
    "excerpt": "새로운 AI 모델이 출시되면서 기술 산업에 큰 변화가 예상되고 있습니다.",
    "likes": 1245,
    "comments": 342,
    "views": 8932,
    "created_at": "2026-04-04T05:30:12.752165",
    "url": "https://reddit.com/r/technology",
    "categories": {
      "name": "tech",
      "icon": "💻"
    },
    "sources": {
      "name": "Reddit",
      "icon_emoji": "🔴"
    }
  }
]
```

---

#### `GET /posts/{id}`

특정 게시글의 상세 정보를 조회합니다.

**경로 파라미터:**
- `id`: 게시글 ID (정수)

**응답:**
```json
{
  "id": 1,
  "title": "...",
  "excerpt": "...",
  "content": "...",
  "likes": 1245,
  "comments": 342,
  "created_at": "2026-04-04T05:30:12.752165",
  ...
}
```

---

### Categories (카테고리)

#### `GET /categories`

모든 카테고리를 조회합니다.

**응답:**
```json
[
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
```

---

### Sources (출처)

#### `GET /sources`

모든 출처를 조회합니다.

**응답:**
```json
[
  {
    "id": 1,
    "name": "Reddit",
    "icon_emoji": "🔴",
    "url": "https://reddit.com",
    "post_count": 15
  }
]
```

---

### Statistics (통계)

#### `POST /rpc/get_posts_stats`

전체 게시글의 통계를 조회합니다.

**요청:**
```bash
curl -X POST http://localhost:3001/rpc/get_posts_stats \
  -H "Content-Type: application/json" \
  -d "{}"
```

**응답:**
```json
[
  {
    "total_posts": 50,
    "avg_likes": 2237.72,
    "max_likes": 5432,
    "avg_comments": 425.36,
    "max_comments": 1200,
    "total_likes": 111886
  }
]
```

---

#### `POST /rpc/get_categories_with_count`

카테고리별 게시글 수를 조회합니다.

**응답:**
```json
[
  {
    "id": 1,
    "name": "tech",
    "icon": "💻",
    "description": "기술, 프로그래밍, AI, 클라우드 관련",
    "post_count": 12
  }
]
```

---

#### `POST /rpc/get_sources_with_count`

출처별 게시글 수를 조회합니다.

---

## 🔍 고급 쿼리 예제

### 1. 기술 카테고리의 추천순 게시글 조회

```bash
curl "http://localhost:3001/posts?categories.name=eq.tech&order=likes.desc&limit=10"
```

### 2. "AI"를 포함한 게시글 검색

```bash
curl "http://localhost:3001/posts?or=(title.ilike.*AI*,excerpt.ilike.*AI*)"
```

### 3. 특정 컬럼만 선택하여 조회

```bash
curl "http://localhost:3001/posts?select=id,title,likes&limit=5"
```

### 4. 관계형 데이터 포함하여 조회

```bash
curl "http://localhost:3001/posts?select=id,title,categories(name,icon),sources(name)&limit=3"
```

### 5. 페이지네이션 (2페이지, 6개씩)

```bash
curl "http://localhost:3001/posts?limit=6&offset=6"
```

### 6. 전체 개수 포함하여 조회

```bash
curl -H "Prefer: count=exact" "http://localhost:3001/posts?limit=6"
```

응답 헤더에 포함되는 `Content-Range: 0-5/50` (0-5번째, 전체 50개)

### 7. 최신순 + 카테고리 필터 + 페이지네이션

```bash
curl "http://localhost:3001/posts?categories.name=eq.news&order=created_at.desc&limit=6&offset=0"
```

---

## 📊 PostgREST 필터링 연산자

PostgREST는 다양한 필터 연산자를 지원합니다:

| 연산자 | 설명 | 예시 |
|--------|------|------|
| `eq` | 같음 | `?name=eq.tech` |
| `neq` | 다름 | `?likes=neq.0` |
| `gt` | 보다 큼 | `?likes=gt.100` |
| `gte` | 크거나 같음 | `?likes=gte.100` |
| `lt` | 보다 작음 | `?likes=lt.100` |
| `lte` | 작거나 같음 | `?likes=lte.100` |
| `like` | 패턴 매칭 | `?title=like.%AI%` |
| `ilike` | 대소문자 무시 | `?title=ilike.*AI*` |
| `in` | 목록 포함 | `?id=in.(1,2,3)` |
| `is` | NULL 검사 | `?content=is.null` |

---

## 🔗 JavaScript Fetch 예제

### React/Vue/Node.js에서 사용

```javascript
// 게시글 조회
async function fetchPosts(category = 'all', sort = 'latest', page = 1) {
  const limit = 6;
  const offset = (page - 1) * limit;

  let url = `http://localhost:3001/posts?limit=${limit}&offset=${offset}&order=`;

  // 정렬
  switch(sort) {
    case 'likes':
      url += 'likes.desc';
      break;
    case 'comments':
      url += 'comments.desc';
      break;
    default:
      url += 'created_at.desc';
  }

  // 카테고리 필터
  if (category !== 'all') {
    url += `&categories.name=eq.${category}`;
  }

  // 관계 데이터 포함
  url += '&select=id,title,excerpt,likes,comments,created_at,url,categories(name,icon),sources(name,icon_emoji)';

  const response = await fetch(url, {
    headers: { 'Prefer': 'count=exact' }
  });

  const data = await response.json();
  const total = response.headers.get('content-range')?.split('/')[1] || 0;

  return { data, total };
}

// 검색
async function searchPosts(searchQuery) {
  const query = encodeURIComponent(searchQuery);
  const url = `http://localhost:3001/posts?or=(title.ilike.*${query}*,excerpt.ilike.*${query}*)`;

  const response = await fetch(url);
  return response.json();
}

// 통계
async function getStats() {
  const response = await fetch('http://localhost:3001/rpc/get_posts_stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });

  const data = await response.json();
  return data[0];
}
```

---

## 🐛 일반적인 오류

### 1. CORS 에러

```
Access to XMLHttpRequest at 'http://localhost:3001/posts' has been blocked
```

**해결:**
- PostgREST는 기본적으로 CORS를 지원합니다
- docker-compose.yml에서 PostgREST 설정 확인

### 2. 401 Unauthorized

```json
{"message":"JWT invalid"}
```

**해결:**
- 현재 프로젝트는 JWT 인증을 사용하지 않습니다
- PGRST_JWT_SECRET이 설정되지 않았으므로 문제 없음

### 3. 404 Not Found

```json
{"message":"The request body is empty"}
```

**해결:**
- RPC 호출 시 반드시 POST 메서드 사용
- Content-Type: application/json 헤더 필수
- 빈 객체 `{}` 또는 파라미터 전달

---

## 📚 참고 자료

### PostgREST 공식 문서
- [PostgREST API Reference](https://postgrest.org/en/v14/references/api.html)
- [Querying Guide](https://postgrest.org/en/v14/api/reading.html)
- [Filtering Guide](https://postgrest.org/en/v14/api/reading.html#operators)

### Swagger UI
- [Swagger UI 공식 문서](https://swagger.io/tools/swagger-ui/)
- [OpenAPI 3.0 명세](https://spec.openapis.org/oas/v3.0.3)

### API 클라이언트
- [Postman](https://www.postman.com/) - API 테스트 및 개발
- [REST Client (VS Code 확장)](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Thunder Client](https://www.thunderclient.com/) - 경량 API 테스트

---

## 🚀 배포 환경에서의 API

프로덕션 환경에서는 다음을 고려하세요:

1. **API 기본 URL 변경**
   ```javascript
   const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
   ```

2. **인증 추가 (선택사항)**
   - JWT 토큰 설정
   - API 키 인증
   - OAuth 통합

3. **CORS 설정**
   - 허용된 오리진 명시
   - 크리덴셜 전달 설정

4. **속도 제한 (Rate Limiting)**
   - 초당 요청 수 제한
   - 사용자당 쿼터 설정

5. **모니터링**
   - API 사용량 추적
   - 에러 로깅
   - 성능 모니터링

---

**Last Updated**: 2026-04-04
**API Version**: 2.0 (PostgREST)
**Status**: ✅ Active
