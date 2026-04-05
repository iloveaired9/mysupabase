# Step 5: Frontend & Backend 통합 (PostgREST 최종 완성)

## 📌 목표

이 단계에서는 **Step 2의 JavaScript 앱을 PostgREST API와 연동하여** 실제 데이터베이스 데이터를 표시합니다.

---

## 🎯 학습 포인트

### 1. Fetch API를 사용한 비동기 데이터 조회
```javascript
const response = await fetch('http://localhost:3001/posts?limit=6&offset=0');
const data = await response.json();
```

### 2. PostgREST 쿼리 형식 이해
```javascript
// 필터링
?categories.name=eq.tech

// 정렬
?order=created_at.desc

// 검색
?or=(title.ilike.*AI*,excerpt.ilike.*AI*)

// 관계형 데이터 로딩
?select=id,title,categories(name),sources(name)

// 페이지네이션
?limit=6&offset=0
```

### 3. 로딩 상태 관리
```javascript
function setLoading(isLoading) {
    if (isLoading) {
        DOM.loadingSpinner.classList.add('active');
    } else {
        DOM.loadingSpinner.classList.remove('active');
    }
}
```

### 4. 에러 처리
```javascript
async function fetchPosts() {
    try {
        // API 호출
    } catch (error) {
        showError(error.message);
    }
}
```

### 5. 상태 관리 패턴
```javascript
const state = {
    currentPage: 1,
    currentCategory: 'all',
    currentSort: 'latest',
    searchQuery: '',
    apiBaseUrl: 'http://localhost:3001'
};
```

---

## 📁 파일 구조

```
step5/
├── index.html    # HTML (로딩, 에러, 통계 UI 포함)
├── app.js        # JavaScript (PostgREST API 통합 로직)
└── README.md     # 이 파일
```

> **참고**: `style.css`는 Step 1의 스타일을 재사용합니다 (`../step1/style.css`)

---

## 🚀 실행 방법

### 1단계: Docker Compose로 모든 서비스 시작

```bash
cd mysupabase
docker-compose up -d
```

확인:
```bash
docker-compose ps
```

모든 서비스가 "Up" 상태인지 확인:
- ✅ supabase-postgrest (PostgREST API) - 포트 3001
- ✅ supabase-postgres (PostgreSQL) - 포트 5432
- ✅ supabase-pgadmin (DB 관리) - 포트 5050
- ✅ supabase-mailhog (이메일 테스트) - 포트 8025

### 2단계: 로컬 웹 서버 시작

```bash
cd app
python3 -m http.server 5500
```

또는 VS Code Live Server:
- `app/step5/index.html` 우클릭
- "Open with Live Server" 선택

### 3단계: 브라우저에서 Step 5 열기 ⭐

```
http://localhost:5500/step5/index.html
```

더 간단하게:
```
http://localhost:5500/step5/
```

---

## 📊 주요 기능

### 1. 실시간 데이터 로드
- 페이지 로드 시 PostgREST API에서 게시글 자동 조회
- 로딩 스피너 표시

### 2. 카테고리 필터링
```
📌 전체 / 💻 기술 / 📰 뉴스 / 🎬 연예 / ⚽ 스포츠 / 🏠 일상
```
PostgREST 쿼리: `?categories.name=eq.tech`

### 3. 정렬 기능
```
🕐 최신순 / 👍 추천순 / 💬 댓글순
```
PostgREST 쿼리: `?order=likes.desc`

### 4. 검색 기능
```
게시글 검색... (제목, 내용)
```
PostgREST 쿼리: `?or=(title.ilike.*검색어*,excerpt.ilike.*검색어*)`

### 5. 페이지네이션
```
← 이전  |  페이지 1 / 5  |  다음 →
```
PostgREST 쿼리: `?limit=6&offset=0`

### 6. 통계 섹션
```
전체 게시글 | 평균 추천수 | 최고 추천수 | 평균 댓글수
```
PostgREST RPC: `/rpc/get_posts_stats`

### 7. API 상태 표시
- 우측 하단에 연결 상태 표시
- 3초 후 자동 숨김

---

## 🔄 API 통합 흐름

### Step 1: 사용자가 버튼 클릭
```javascript
DOM.categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        state.currentCategory = btn.dataset.category;
        fetchPosts();  // ← API 호출 트리거
    });
});
```

### Step 2: PostgREST 쿼리 파라미터 구성
```javascript
const params = new URLSearchParams({
    select: 'id,title,excerpt,likes,comments,created_at,categories(name),sources(name)',
    limit: 6,
    offset: (state.currentPage - 1) * 6,
    order: 'created_at.desc'
});

// 카테고리 필터
if (state.currentCategory !== 'all') {
    params.append('categories.name', `eq.${state.currentCategory}`);
}
```

### Step 3: API 호출
```javascript
const response = await fetch(`${state.apiBaseUrl}/posts?${params}`, {
    headers: { 'Prefer': 'count=exact' }
});
const data = await response.json();
state.filteredPosts = data;
```

### Step 4: UI 업데이트
```javascript
renderPosts();
updatePaginationUI();
```

---

## 🧪 테스트 시나리오

### 테스트 1: API 연결 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭 클릭
3. 예상 출력:
```
✅ Step 5 앱 초기화 시작 (PostgREST 버전)
📍 API Base URL: http://localhost:3001
📡 PostgREST API 호출: http://localhost:3001/posts?...
🔗 API 연결됨
```

### 테스트 2: 데이터 로드 확인
1. 게시글이 정상적으로 표시되는지 확인
2. 각 카드에 다음 정보가 표시되는지 확인:
   - 제목
   - 요약 (excerpt)
   - 카테고리 배지
   - 출처 정보
   - 추천수, 댓글수, 조회수
   - 상대시간 (예: "2시간 전")

### 테스트 3: 필터링 동작
1. "기술" 카테고리 클릭
2. 콘솔에서 확인: `?categories.name=eq.tech`
3. 기술 카테고리의 게시글만 표시되는지 확인

### 테스트 4: 정렬 동작
1. "추천순" 클릭
2. 콘솔에서 확인: `?order=likes.desc`
3. 게시글이 추천순으로 정렬되는지 확인

### 테스트 5: 검색 동작
1. 검색창에 "AI" 입력
2. 검색 버튼 클릭 또는 Enter 키
3. 콘솔에서 확인: `?or=(title.ilike.*AI*,excerpt.ilike.*AI*)`
4. "AI"를 포함한 게시글만 표시되는지 확인

### 테스트 6: 페이지네이션
1. 게시글 목록 하단의 "다음" 버튼 클릭
2. 콘솔에서 확인: `?limit=6&offset=6`
3. 다음 페이지의 게시글 표시
4. "이전" 버튼이 활성화되는지 확인

### 테스트 7: 에러 처리
1. PostgREST 서버 중지
   ```bash
   docker-compose down
   ```
2. 브라우저 새로고침
3. 에러 메시지 표시 확인: "API 연결 실패"
4. 로딩 스피너가 사라지는지 확인

### 테스트 8: 통계 조회
1. 페이지 로드 후 통계 섹션 표시 확인
2. 표시되는 통계 정보:
   - 전체 게시글 수: 50
   - 평균 추천수
   - 최고 추천수: 5432
   - 평균 댓글수

---

## ⚙️ 환경 설정

### API Base URL 변경

`app.js` 파일에서 API URL을 수정할 수 있습니다:

```javascript
const state = {
    // ...
    apiBaseUrl: 'http://localhost:3001'  // ← 여기서 변경
};
```

### 개발 환경과 프로덕션 환경 분리

```javascript
const isDevelopment = true;  // 개발 환경

const state = {
    apiBaseUrl: isDevelopment
        ? 'http://localhost:3001'           // 개발 환경
        : 'https://api.example.com'         // 프로덕션 환경
};
```

---

## 🐛 문제 해결

### 문제 1: "API 연결 실패" 메시지
**원인**: PostgREST 서버가 실행 중이 아님

**해결 방법**:
```bash
docker-compose up -d
# 3-5초 기다린 후 확인
docker-compose ps
```

### 문제 2: "CORS 에러" (콘솔에서 확인)
**원인**: PostgREST의 CORS 설정 미맞춤

**확인**:
1. PostgREST 컨테이너의 CORS 헤더 확인:
   ```bash
   curl -H "Origin: http://localhost:5500" http://localhost:3001/posts?limit=1 -v
   ```
2. 필요시 docker-compose.yml의 PostgREST 환경 변수 추가

### 문제 3: 게시글이 표시되지 않음
**확인 항목**:
1. API가 정상 작동하는지 확인:
   ```bash
   curl http://localhost:3001/posts?limit=1
   ```
2. pgAdmin에서 데이터베이스에 게시글이 있는지 확인
   ```
   http://localhost:5050 (admin@admin.com / admin)
   ```
3. 브라우저 개발자 도구 → Network 탭에서 API 응답 확인
4. 데이터베이스에 권한이 설정되어 있는지 확인

### 문제 4: 검색이 동작하지 않음
**확인**:
1. 검색 입력창에 텍스트 입력 확인
2. 검색 버튼 클릭 또는 Enter 키 확인
3. 콘솔 로그에서 API 호출 URL 확인
4. PostgREST의 OR 필터 문법 확인:
   ```bash
   curl 'http://localhost:3001/posts?or=(title.ilike.*AI*,excerpt.ilike.*AI*)'
   ```

### 문제 5: HTTP 서버가 실행되지 않음
**해결 방법**:
```bash
cd /c/rnd/claude/mysupabase/app
python3 -m http.server 5500
```

또는 포트가 사용 중인 경우:
```bash
python3 -m http.server 5501  # 다른 포트 사용
```

---

## 📈 성능 최적화

### 1. 페이지당 게시글 수 변경
```javascript
const state = {
    postsPerPage: 6,  // ← 여기서 변경 (기본: 6)
};
```

### 2. 통계 갱신 간격 변경
```javascript
// 5초마다 통계 갱신
setInterval(fetchStats, 5000);  // ← 간격 변경 (밀리초)
```

### 3. 캐싱 구현
```javascript
const cache = new Map();

async function fetchPosts() {
    const key = `${state.currentCategory}-${state.currentSort}-${state.currentPage}`;

    if (cache.has(key)) {
        state.filteredPosts = cache.get(key);
        renderPosts();
        return;
    }

    // API 호출...
    cache.set(key, data);
}
```

---

## 📡 PostgREST API 엔드포인트 참조

### GET 엔드포인트

| 엔드포인트 | 설명 | 예시 |
|-----------|------|------|
| `/posts` | 게시글 조회 | `?limit=6&offset=0&order=created_at.desc` |
| `/posts?categories.name=eq.tech` | 카테고리 필터 | |
| `/posts?title=ilike.*AI*` | 제목 검색 | |
| `/posts?order=likes.desc` | 정렬 | |
| `/posts?select=id,title,likes,categories(name)` | 선택적 컬럼 + 관계 | |
| `/categories` | 카테고리 목록 | `?select=*,(posts(id))` |
| `/sources` | 출처 목록 | |

### RPC 엔드포인트 (POST)

| 엔드포인트 | 설명 |
|-----------|------|
| `/rpc/get_posts_stats` | 게시글 통계 |
| `/rpc/get_categories_with_count` | 카테고리별 게시글 수 |
| `/rpc/get_sources_with_count` | 출처별 게시글 수 |

**PostgREST 공식 문서**: https://postgrest.org

---

## 🎓 핵심 학습 내용

### 1. PostgREST 활용
- 스키마 기반 자동 API 생성
- 쿼리 파라미터로 필터링/정렬/페이지네이션
- RPC 함수 호출
- 관계형 데이터 로딩

### 2. Fetch API 활용
- GET 요청으로 데이터 조회
- JSON 응답 파싱
- 비동기 처리 (async/await)
- 헤더 설정 (Prefer, Content-Type)

### 3. 에러 처리
- try-catch 블록
- 사용자 친화적 에러 메시지
- 네트워크 에러 처리

### 4. 사용자 경험 (UX)
- 로딩 상태 표시
- 진행 상황 피드백
- 에러 알림

### 5. 상태 관리
- 애플리케이션 상태 추적
- 상태 변경에 따른 UI 업데이트
- 데이터 일관성 유지

---

## 🔗 다음 단계 (선택사항)

### 1. 배포 (Deployment)
- Frontend: GitHub Pages, Netlify, Vercel
- Backend: Supabase, Railway, DigitalOcean
- 환경 변수 설정

### 2. 기능 확장
- 게시글 상세 보기 페이지
- 즐겨찾기 (로컬 스토리지)
- 다크 모드
- 댓글 기능
- CRUD 작업 (INSERT, UPDATE, DELETE)

### 3. 성능 개선
- 가상 스크롤 (Virtual Scrolling)
- 이미지 최적화
- 캐싱 전략
- 번들 최적화

### 4. 테스트
- 유닛 테스트 (Jest)
- E2E 테스트 (Playwright, Cypress)
- API 테스트 (Postman, REST Client)

---

## 📚 참고 자료

### PostgREST
- [PostgREST 공식 문서](https://postgrest.org)
- [PostgREST API 참조](https://postgrest.org/en/v14/references/api.html)
- [PostgREST Querying Guide](https://postgrest.org/en/v14/api/reading.html)

### JavaScript / Fetch API
- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Async/Await - MDN](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)
- [URLSearchParams - MDN](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

### Docker
- [Docker 공식 문서](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose)

---

## 🏆 프로젝트 완성

이 단계에서 전체 풀스택 웹 애플리케이션이 완성됩니다:

- ✅ **Frontend**: HTML/CSS/JavaScript (Step 1-2, Step 5)
- ✅ **Database**: PostgreSQL (Step 3)
- ✅ **API**: PostgREST (Schema-based Auto-generated)
- ✅ **Containerization**: Docker & Docker Compose

**축하합니다!** 🎉 이제 실제 웹 서비스 개발의 모든 단계를 경험했습니다.

---

**작성일**: 2026년 4월 4일
**버전**: 2.0 (PostgREST 마이그레이션)
**난이도**: ⭐⭐⭐⭐⭐ (고급)
**예상 소요 시간**: 1-2시간
**상태**: ✅ 완료
