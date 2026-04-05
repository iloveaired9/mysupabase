# Step 2: JavaScript로 상호작용 추가

## 📌 목표

이 단계에서는 **JavaScript로 동적 기능 구현**을 학습합니다.
Step 1의 정적 페이지에 다음 기능들을 추가합니다:
- ✨ Mock 데이터로 게시글 동적 렌더링
- ✨ 필터링 (카테고리별)
- ✨ 정렬 (최신순, 추천순, 댓글순)
- ✨ 검색 (제목/내용)
- ✨ 페이지네이션

---

## 🎯 학습 포인트

### 1. 상태 관리 (State Management)
```javascript
const state = {
    currentCategory: "all",
    currentSort: "latest",
    currentPage: 1,
    searchQuery: "",
    filteredPosts: [...]
};
```
- 앱의 현재 상황을 객체로 관리
- UI는 이 상태를 반영하여 렌더링됨
- 상태 변경 → 렌더링 → UI 업데이트

### 2. DOM 조작
```javascript
// DOM 요소 선택
const postsGrid = document.querySelector(".posts-grid");

// 내용 변경
postsGrid.innerHTML = "<article>...</article>";

// 이벤트 추가
button.addEventListener("click", () => {});
```

### 3. 배열 메서드 (Array Methods)
```javascript
// filter: 조건에 맞는 요소만 반환
posts.filter(post => post.category === "tech");

// sort: 배열을 정렬
posts.sort((a, b) => b.likes - a.likes);

// slice: 배열의 일부를 추출 (페이지네이션)
posts.slice(0, 6);

// map: 배열의 각 요소를 변환
posts.map(post => `<article>${post.title}</article>`);
```

### 4. 템플릿 리터럴 (Template Literals)
```javascript
// 백틱(`)을 사용하여 멀티라인 문자열 작성
const html = `
    <div class="card">
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
    </div>
`;
```

### 5. 이벤트 처리 (Event Handling)
```javascript
button.addEventListener("click", (event) => {
    // 버튼 클릭 시 실행되는 코드
});

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        // 엔터키 입력 시 실행
    }
});
```

---

## 📁 파일 구조

```
step2/
├── index.html       # HTML 마크업 (Step 1과 유사, 스크립트 로드)
├── style.css        # 스타일 (Step 1의 것을 상속받음)
├── data.js          # Mock 데이터 (15개 게시글)
├── app.js           # 애플리케이션 로직
└── README.md        # 이 파일
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────┐
│         index.html (뷰, View)           │
│  - 카테고리 버튼                        │
│  - 정렬 버튼                            │
│  - 검색 입력                            │
│  - 게시글 컨테이너 (비어있음)           │
└─────────────────────────────────────────┘
            ↑             ↓
            │   렌더링    │
            │    (DOM)    │
            ↓             ↑
┌─────────────────────────────────────────┐
│         app.js (로직, Logic)            │
│  - 필터링                               │
│  - 정렬                                 │
│  - 페이지네이션                         │
│  - 이벤트 핸들링                        │
│  - 상태 관리                            │
└─────────────────────────────────────────┘
            ↑
            │
┌─────────────────────────────────────────┐
│         data.js (데이터, Data)          │
│  - Mock 게시글 (15개)                   │
│  - 카테고리 정보                        │
│  - 출처 정보                            │
└─────────────────────────────────────────┘
```

**흐름**:
1. 사용자가 버튼을 클릭
2. 이벤트 핸들러 실행
3. 상태 업데이트
4. 필터링/정렬 실행 (app.js)
5. Mock 데이터 처리 (data.js)
6. HTML 생성
7. DOM 업데이트
8. 화면에 렌더링 (index.html)

---

## 🚀 실행 방법

### 방법 1: 직접 열기
```bash
# 파일 탐색기에서 index.html 더블클릭
# 또는 브라우저에서 Ctrl+O로 열기
```

### 방법 2: Live Server 사용 (권장)
```bash
# VS Code에서 index.html 우클릭
# "Open with Live Server" 선택
```

---

## 📊 기능별 코드 설명

### 1. 필터링 & 정렬
```javascript
function filterAndSortPosts() {
    let posts = [...MOCK_POSTS];  // 원본 보존

    // 카테고리 필터링
    if (state.currentCategory !== "all") {
        posts = posts.filter(post => post.category === state.currentCategory);
    }

    // 검색어 필터링
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query)
        );
    }

    // 정렬
    if (state.currentSort === "likes") {
        posts.sort((a, b) => b.likes - a.likes);
    }

    state.filteredPosts = posts;
}
```

**핵심 포인트**:
- `[...array]` - 스프레드 연산자로 배열 복사 (원본 보존)
- `.filter()` - 조건에 맞는 항목만 선택
- `.sort()` - 정렬 (내림차순: `b - a`, 오름차순: `a - b`)

### 2. 동적 렌더링
```javascript
function createPostCard(post) {
    return `
        <article class="post-card">
            <h2>${post.title}</h2>
            <p>${post.excerpt}</p>
            <span class="stat">👍 ${post.likes}</span>
        </article>
    `;
}

function renderPosts() {
    const posts = getCurrentPagePosts();
    DOM.postsGrid.innerHTML = posts
        .map(post => createPostCard(post))
        .join("");
}
```

**핵심 포인트**:
- 템플릿 리터럴 (`) 사용
- `.map()` - 각 게시글을 HTML로 변환
- `.join("")` - 배열을 문자열로 합치기
- `.innerHTML` - DOM 업데이트

### 3. 페이지네이션
```javascript
const POSTS_PER_PAGE = 6;

function getCurrentPagePosts() {
    const start = (state.currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    return state.filteredPosts.slice(start, end);
}

function getTotalPages() {
    return Math.ceil(state.filteredPosts.length / POSTS_PER_PAGE);
}
```

**핵심 포인트**:
- 페이지 1 = 0~5번, 페이지 2 = 6~11번
- `.slice(start, end)` - 배열의 일부 추출 (end는 미포함)
- `Math.ceil()` - 올림 (1.5 → 2)

### 4. 이벤트 처리
```javascript
DOM.categoryButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        state.currentCategory = e.target.getAttribute("data-category");
        render();  // 화면 다시 그리기
    });
});
```

**핵심 포인트**:
- `.forEach()` - 모든 요소에 이벤트 리스너 추가
- `e.target` - 클릭된 요소
- `.getAttribute()` - HTML 속성 읽기
- `render()` - 상태 변경 후 호출

---

## 🧪 테스트 방법

### 1. 브라우저 콘솔에서 테스트
```javascript
// F12 → Console 탭

// 현재 상태 확인
console.log(appState);

// Mock 데이터 확인
console.log(appMocks);

// 상태 직접 변경해보기
appState.currentCategory = "tech";
appRender();

// 검색 테스트
appState.searchQuery = "AI";
appRender();
```

### 2. UI 테스트
- ✅ 카테고리 버튼 클릭 → 게시글 필터링 확인
- ✅ 정렬 버튼 클릭 → 게시글 순서 변경 확인
- ✅ 검색 입력 → 관련 게시글만 표시 확인
- ✅ 페이지네이션 → 6개씩 나뉨 확인
- ✅ 모바일 반응형 확인 (F12 → 반응형 모드)

---

## 📈 데이터 구조

### Post 객체
```javascript
{
    id: 1,
    title: "제목",
    excerpt: "미리보기 텍스트",
    category: "tech",           // tech, news, entertainment, sports, life
    likes: 1245,
    comments: 342,
    source: "reddit",           // reddit, medium, hacker-news, etc.
    url: "https://...",
    createdAt: "2024-04-04T..."
}
```

### Mock 데이터 특징
- 총 15개의 다양한 게시글
- 각 카테고리별로 분포
- 추천수, 댓글수 다양함
- 시간도 다양함 (상대시간 테스트용)

---

## 💡 팁과 트릭

### 1. 배열 메서드 체이닝
```javascript
// 한 줄로 여러 작업 수행
const result = posts
    .filter(p => p.likes > 100)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 10);
```

### 2. 구조 분해 (Destructuring)
```javascript
// 객체 속성 편하게 접근
const { currentCategory, currentSort } = state;

// 배열 원소 편하게 접근
const [first, second, ...rest] = posts;
```

### 3. 삼항 연산자 (Ternary Operator)
```javascript
// if-else를 짧게 표현
const className = active ? "active" : "";
```

### 4. 옵셔널 체이닝 (?.)
```javascript
// null/undefined 체크 불필요
const name = user?.name ?? "Anonymous";
```

---

## 🎯 실습 과제

### 초급
1. ✅ 페이지 열어보기
2. ✅ 각 필터 버튼 클릭해보기
3. ✅ 검색 기능 사용해보기
4. ✅ 브라우저 콘솔에서 `appState` 출력해보기

### 중급
5. Mock 데이터에 새로운 게시글 추가하기
   - `data.js`에서 `MOCK_POSTS` 배열에 객체 추가
   - 페이지를 새로고침하여 확인
6. 새로운 카테고리 추가하기
   - `data.js`에서 `CATEGORIES` 수정
   - `index.html`에서 버튼 추가
7. 정렬 방식 추가하기 (예: "오래된순")
   - `app.js`의 `filterAndSortPosts()` 함수 수정

### 고급
8. 페이지당 게시글 수 변경
   - `app.js`의 `POSTS_PER_PAGE` 변경
   - UI가 자동으로 조정되는지 확인
9. 추천 게시글 (인기도순) 섹션 추가
   - 상위 3개 게시글을 별도 섹션에 표시
10. 최근 검색어 저장 기능
    - `localStorage` 활용
    - 검색어를 저장하고 다음 방문 시 표시

---

## 🔗 JavaScript 핵심 개념

| 개념 | 설명 | 예제 |
|------|------|------|
| **State** | 앱의 상태 저장 | `const state = { ... }` |
| **DOM** | HTML 요소 조작 | `document.querySelector()` |
| **Event** | 사용자 상호작용 | `addEventListener()` |
| **Filter** | 조건 필터링 | `.filter(x => x > 10)` |
| **Sort** | 배열 정렬 | `.sort((a, b) => ...)` |
| **Map** | 배열 변환 | `.map(x => x * 2)` |
| **Slice** | 배열 일부 추출 | `.slice(0, 5)` |
| **Template Literal** | 문자열 템플릿 | `` `Hello ${name}` `` |

---

## ❓ 자주 묻는 질문

**Q: 왜 `render()` 함수를 따로 만드나?**
A: 상태 변경 후 항상 화면을 다시 그려야 하므로, 이 과정을 함수로 만들어 반복 호출합니다.

**Q: `.innerHTML` vs `.textContent`의 차이?**
A:
- `.innerHTML` - HTML을 포함한 내용 변경 (보안 주의)
- `.textContent` - 순수 텍스트만 변경 (안전)

**Q: 왜 배열을 복사할 필요가 있나?**
A: 원본 데이터를 보존하기 위해. `[...array]`로 복사하면 필터링/정렬 후에도 원본은 변경 안 됨.

**Q: `forEach` vs `map` 차이?**
A:
- `forEach` - 각 요소에 작업 수행 (반환값 없음)
- `map` - 각 요소를 변환하여 새 배열 반환

---

## 🔗 다음 단계

✅ **Step 2 완료!**
→ **[Step 3: PostgreSQL 데이터베이스 구축](../../database/README.md)**

Step 3에서는:
- PostgreSQL 테이블 설계
- 샘플 데이터 15개 이상 삽입
- SQL 쿼리 작성 (SELECT, WHERE, ORDER BY, JOIN)

---

## 📖 참고 자료

- [MDN - JavaScript Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics)
- [Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [DOM Manipulation](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [Event Handling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)

---

**작성일**: 2024년 4월 4일
**난이도**: ⭐⭐⭐ (초급-중급)
**예상 소요 시간**: 2-3시간
