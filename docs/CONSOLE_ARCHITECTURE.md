# 💾 mysupabase Console - 아키텍처 가이드

mysupabase Console의 내부 구조, 모듈 설계, 그리고 확장 방법을 설명하는 개발자 가이드입니다.

## 📋 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [디렉토리 구조](#디렉토리-구조)
3. [모듈 상세 설명](#모듈-상세-설명)
4. [CSS 구조](#css-구조)
5. [데이터 흐름](#데이터-흐름)
6. [확장 가이드](#확장-가이드)
7. [성능 고려사항](#성능-고려사항)

---

## 아키텍처 개요

### 설계 원칙

```
┌─────────────────────────────────────────────────────────┐
│                   mysupabase Console                    │
│                   (Vanilla JavaScript)                   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │   Browser (Client)   │
                    ├──────────────────────┤
                    │ 1. index.html (UI)   │
                    │ 2. CSS Modules       │
                    │ 3. JS Modules        │
                    │ 4. localStorage      │
                    └──────────────────────┘
                              │
                              ▼ (HTTP/JSON)
                    ┌──────────────────────┐
                    │  Backend API Server  │
                    │  (Node.js Express)   │
                    ├──────────────────────┤
                    │ Port 3000            │
                    │ /api/db/* endpoints  │
                    └──────────────────────┘
                              │
                              ▼ (SQL Queries)
                    ┌──────────────────────┐
                    │  PostgreSQL Database │
                    │                      │
                    ├──────────────────────┤
                    │ tables, views, RPC   │
                    │ information_schema   │
                    └──────────────────────┘
```

### 핵심 특징

**1. No Framework Approach**
- React, Vue, Angular 등 프레임워크 없음
- 순수 Vanilla JavaScript만 사용
- 작은 번들 크기, 빠른 로딩

**2. 모듈식 설계**
- 각 JavaScript 파일이 독립적인 책임
- 전역 변수 최소화
- 모듈 간 의존성 명확화

**3. CSS Custom Properties**
- 색상, 폰트, 간격을 변수로 관리
- Light/Dark 테마 전환 용이
- 유지보수성 향상

**4. Responsive Design**
- 모바일 우선 접근
- Flexbox/Grid 활용
- 미디어 쿼리로 반응형 처리

---

## 디렉토리 구조

```
app/console/
├── index.html                 # 진입점 (HTML 구조)
├── scripts/
│   ├── api-client.js          # API 통신 모듈
│   ├── theme-manager.js       # 테마 관리 모듈
│   ├── ui-components.js       # UI 유틸리티 모듈
│   ├── table-manager.js       # 테이블 관리 로직
│   ├── query-builder.js       # 쿼리 실행 로직
│   └── app.js                 # 애플리케이션 초기화
└── styles/
    ├── variables.css          # CSS 변수 (색상, 폰트, 간격)
    ├── theme.css              # 글로벌 스타일
    ├── layout.css             # 레이아웃 구조
    └── components.css         # 컴포넌트 스타일
```

### 로딩 순서

**HTML에서의 로딩 순서는 매우 중요합니다:**

```html
<!-- 1단계: CSS 로드 (순서대로) -->
<link rel="stylesheet" href="styles/variables.css">
<link rel="stylesheet" href="styles/theme.css">
<link rel="stylesheet" href="styles/layout.css">
<link rel="stylesheet" href="styles/components.css">

<!-- 2단계: JavaScript 로드 (의존성 순서) -->
<script src="scripts/api-client.js"></script>          <!-- 기본 API 통신 -->
<script src="scripts/theme-manager.js"></script>      <!-- 테마 (독립적) -->
<script src="scripts/ui-components.js"></script>      <!-- UI 유틸 (독립적) -->
<script src="scripts/table-manager.js"></script>      <!-- API + UI 사용 -->
<script src="scripts/query-builder.js"></script>      <!-- API + UI 사용 -->
<script src="scripts/app.js"></script>                <!-- 전체 조율 (마지막) -->
```

---

## 모듈 상세 설명

### 1. api-client.js - API 통신 모듈

**책임:**
- Backend API와의 모든 통신 담당
- HTTP 요청/응답 처리
- 자동 호스트 감지 (localhost, IP, 도메인)
- 에러 처리 및 로깅

**주요 메서드:**

```javascript
class APIClient {
  // 기본 요청 (모든 HTTP 메서드 지원)
  request(method, endpoint, data)

  // 데이터베이스 조회
  getTables()                                    // GET /api/db/tables
  getTableSchema(tableName)                      // GET /api/db/tables/:name/schema
  getTableRecords(tableName, page, limit)        // GET /api/db/tables/:name/records?page=x&limit=y

  // 데이터 변경
  insertRecord(tableName, data)                  // POST /api/db/tables/:name/records
  updateRecord(tableName, id, data)              // PUT /api/db/tables/:name/records/:id
  deleteRecord(tableName, id)                    // DELETE /api/db/tables/:name/records/:id

  // 쿼리 실행
  executeQuery(sqlQuery)                         // POST /api/db/query
}
```

**자동 호스트 감지:**

```javascript
// window.location.hostname이 자동으로 감지됨
// localhost → http://localhost:3000
// 54.180.52.120 → http://54.180.52.120:3000
// example.com → https://example.com:3000 (HTTPS 자동 감지)
```

**에러 처리:**

```javascript
try {
  const response = await apiClient.getTables();
} catch (error) {
  // {message: "...", status: 500, data: {...}}
  console.error(error.message);
}
```

### 2. theme-manager.js - 테마 관리 모듈

**책임:**
- Light/Dark 테마 전환
- localStorage에 설정 저장
- 시스템 테마 감지 (prefers-color-scheme)

**주요 메서드:**

```javascript
class ThemeManager {
  // 초기화 및 이벤트 설정
  init()

  // 테마 제어
  toggle()                    // Light ↔ Dark 전환
  applyTheme(theme)           // 테마 적용
  setTheme(theme)             // 명시적 테마 설정
  getCurrentTheme()           // 현재 테마 반환
}
```

**작동 방식:**

```javascript
// 1. localStorage에서 저장된 테마 확인
const stored = localStorage.getItem('console-theme');

// 2. 없으면 시스템 설정 확인
if (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  theme = 'dark';
}

// 3. 없으면 기본값 (light)
theme = 'light';

// 4. data-theme 속성으로 적용
document.documentElement.setAttribute('data-theme', theme);
```

**CSS에서의 활용:**

```css
/* variables.css */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

/* 실제 사용 */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

### 3. ui-components.js - UI 유틸리티 모듈

**책임:**
- DOM 요소 생성 및 조작
- 테이블 렌더링
- 폼 생성 및 관리
- 토스트 알림
- 복사 기능

**주요 메서드:**

```javascript
class UIComponents {
  // 알림
  static showToast(message, type, duration)

  // 테이블 생성
  static createTable(columns, rows)
  static createTableHeader(columns)
  static createTableRow(columns, data)

  // 폼 생성
  static createFormFromSchema(columns, data)

  // 모달
  static showModal(title)
  static hideModal()

  // 기타 컴포넌트
  static createSpinner()
  static createPaginationControls(current, total, callback)
  static createSchemaItem(column)
  static createInfoBox(message, type)

  // 유틸리티
  static formatValue(value)
  static copyToClipboard(text)
}
```

**동적 폼 생성 (PostgreSQL 타입 맵핑):**

```javascript
// 컬럼 타입에 따른 입력 요소 자동 생성
{
  "boolean": <input type="checkbox">,
  "integer": <input type="number">,
  "numeric": <input type="number" step="0.01">,
  "text": <textarea>,
  "timestamp": <input type="datetime-local">,
  "date": <input type="date">,
  "varchar": <input type="text" maxlength="n">
}
```

**토스트 알림 타입:**

```javascript
showToast('저장되었습니다', 'success', 3000)  // 초록색
showToast('오류 발생', 'error', 3000)        // 빨강색
showToast('경고', 'warning', 3000)           // 주황색
showToast('정보', 'info', 3000)              // 파란색
```

### 4. table-manager.js - 테이블 관리 로직

**책임:**
- 테이블 선택 및 데이터 로드
- 테이블 목록 렌더링
- 데이터 페이지네이션
- 레코드 추가 폼 관리

**주요 메서드:**

```javascript
class TableManager {
  // 테이블 탐색
  loadTableList()                          // 모든 테이블 목록 로드
  selectTable(tableName)                   // 특정 테이블 선택 (데이터 로드)

  // 렌더링
  renderTableData(rows, pagination)        // Data 탭 렌더링
  renderSchemaView(columns)                // Schema 탭 렌더링
  renderPagination(pagination)             // 페이지네이션 컨트롤
  updateSettingsView(...)                  // Settings 탭 업데이트

  // 페이지네이션
  goToPage(page)                           // 특정 페이지로 이동

  // 레코드 관리
  addRecord()                              // 레코드 추가 모달 표시 및 처리

  // 상태 관리
  getCurrentTable()                        // 현재 선택된 테이블 반환
  hasTableSelected()                       // 테이블 선택 여부 확인
}
```

**전역 인스턴스:**

```javascript
const tableManager = new TableManager();

// 사용 예시
tableManager.loadTableList();
tableManager.selectTable('posts');
tableManager.goToPage(2);
```

### 5. query-builder.js - 쿼리 실행 로직

**책임:**
- SQL SELECT 쿼리 실행
- 결과 렌더링
- 결과 내보내기 (JSON, CSV)
- 쿼리 포매팅

**주요 메서드:**

```javascript
class QueryBuilder {
  // 쿼리 실행
  static executeQuery()                    // 쿼리 입력창에서 읽어 실행

  // 결과 처리
  static renderResults(data)               // 결과를 테이블로 표시

  // 결과 내보내기
  static exportAsJSON(data)                // JSON 파일 다운로드
  static exportAsCSV(data)                 // CSV 파일 다운로드
  static copyResults(data)                 // 클립보드에 복사

  // 쿼리 관리
  static loadSampleQueries()               // 샘플 쿼리 사전 반환
  static clearAll()                        // 쿼리 입력 및 결과 초기화
  static formatQuery()                     // SQL 키워드 포매팅
}
```

**지원하는 쿼리:**

```sql
-- ✅ 허용됨
SELECT * FROM posts;
SELECT id, title FROM posts WHERE likes > 100;
SELECT p.*, c.name FROM posts p JOIN categories c ON p.category_id = c.id;

-- ❌ 차단됨
INSERT INTO posts (...);
UPDATE posts SET title = ...;
DELETE FROM posts;
DROP TABLE posts;
```

**샘플 쿼리:**

```javascript
const samples = {
  'All Posts': 'SELECT * FROM posts LIMIT 10;',
  'Posts with Count': 'SELECT p.id, p.title, c.name FROM posts p JOIN categories c ON p.category_id = c.id LIMIT 5;',
  'Category Stats': 'SELECT c.name, COUNT(p.id) FROM categories c LEFT JOIN posts p ON c.id = p.category_id GROUP BY c.id, c.name;',
  'Top Posts by Likes': 'SELECT id, title, likes FROM posts ORDER BY likes DESC LIMIT 10;'
};
```

### 6. app.js - 애플리케이션 초기화

**책임:**
- 전체 애플리케이션 초기화
- 이벤트 리스너 설정
- 탭 전환 관리
- 데이터베이스 연결 확인

**주요 메서드:**

```javascript
class ConsoleApp {
  // 초기화
  constructor()                            // 생성자 (init 호출)
  async init()                             // 초기화 대기 (DOM ready 확인)
  setup()                                  // 실제 초기화 작업

  // 이벤트 설정
  setupTabEvents()                         // 탭 클릭 이벤트
  setupDataEvents()                        // Data 탭 이벤트 (add record, search)
  setupQueryEvents()                       // Query 탭 이벤트 (execute, Ctrl+Enter)
  setupModalEvents()                       // 모달 이벤트 (close, ESC 등)
  setupToolbarEvents()                     // 도구 모음 이벤트 (refresh, new table)

  // UI 상태 관리
  updateUIState()                          // Empty state vs Content 표시
  async checkDatabaseConnection()          // DB 연결 상태 확인
}
```

**초기화 흐름:**

```javascript
// 1. DOM 로드 대기
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => this.setup());
}

// 2. 모든 준비 완료
setup() {
  themeManager.init();           // 테마 초기화
  tableManager.loadTableList();  // 테이블 목록 로드
  this.setupTabEvents();         // 이벤트 리스너 설정
  // ... 기타 초기화
}

// 3. DB 연결 확인
checkDatabaseConnection();
```

**전역 인스턴스:**

```javascript
// DOMContentLoaded 이벤트에서 생성
const app = new ConsoleApp();
app.checkDatabaseConnection();
```

---

## CSS 구조

### 변수 정의 (variables.css)

```css
:root {
  /* 색상 */
  --primary-color: #667eea;
  --secondary-color: #4ecdc4;

  /* 상태 색상 */
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;

  /* 중성색 (Light/Dark 모드에 따라 변함) */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #ddd;

  /* 폰트 */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-mono: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;

  /* 간격 (8px 배수) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 그림자 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.2);

  /* 레이아웃 */
  --navbar-height: 60px;
  --sidebar-width: 250px;

  /* 반응형 breakpoints */
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

### 계층적 구조

```
1. variables.css
   └─ CSS 변수 정의 (색상, 폰트, 간격 등)

2. theme.css
   └─ 글로벌 스타일 (body, h1-h6, input, table 등)
   └─ 변수를 사용하여 색상 적용

3. layout.css
   └─ 레이아웃 구조 (navbar, sidebar, main-content 등)
   └─ Grid/Flexbox 사용
   └─ 반응형 미디어 쿼리

4. components.css
   └─ 재사용 컴포넌트 (버튼, 모달, 토스트 등)
   └─ 상태별 스타일 (:hover, :active, .active 등)
   └─ 애니메이션 및 트랜지션
```

### Light/Dark 테마 전환

```css
/* Light 모드 (기본) */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
}

/* Dark 모드 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
}

/* 모든 요소에서 변수 사용 */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

---

## 데이터 흐름

### 1. 애플리케이션 시작

```
1. index.html 로드
   ├─ CSS 파일 로드 (variables → theme → layout → components)
   ├─ JavaScript 모듈 로드 (api-client → ui-components → app)

2. DOMContentLoaded 이벤트
   └─ new ConsoleApp() 생성

3. ConsoleApp.init()
   └─ DOM 준비 확인

4. ConsoleApp.setup()
   ├─ themeManager.init() (테마 복원)
   ├─ tableManager.loadTableList() (테이블 목록 로드)
   └─ 이벤트 리스너 설정

5. checkDatabaseConnection()
   └─ 상태 표시 업데이트
```

### 2. 테이블 선택 흐름

```
User clicks 'posts' in sidebar
        │
        ▼
tableManager.selectTable('posts')
        │
        ├─ apiClient.getTableSchema('posts')
        │  └─ Backend: GET /api/db/tables/posts/schema
        │     └─ PostgreSQL: information_schema 쿼리
        │        └─ 컬럼 정보 반환 (name, type, nullable, default, isPrimaryKey)
        │
        ├─ apiClient.getTableRecords('posts', 1, 10)
        │  └─ Backend: GET /api/db/tables/posts/records?page=1&limit=10
        │     └─ PostgreSQL: SELECT * FROM posts LIMIT 10 OFFSET 0
        │        └─ 데이터 + pagination 정보 반환
        │
        ├─ tableManager.renderTableData(rows, pagination)
        │  └─ UIComponents.createTable(columns, rows)
        │     └─ HTML <table> 생성 및 DOM에 추가
        │
        ├─ tableManager.renderSchemaView(columns)
        │  └─ UIComponents.createSchemaItem(column) × N
        │     └─ 각 컬럼 정보 표시
        │
        └─ tableManager.updateSettingsView(...)
           └─ 테이블 메타정보 업데이트
```

### 3. 레코드 추가 흐름

```
User clicks '+ Add Record' button
        │
        ▼
tableManager.addRecord()
        │
        ├─ UIComponents.showModal('Add Record to posts')
        │  └─ 모달 표시
        │
        ├─ UIComponents.createFormFromSchema(columns)
        │  └─ PostgreSQL 타입별 입력 요소 생성
        │     ├─ title (text) → <input type="text">
        │     ├─ category_id (integer) → <input type="number">
        │     └─ content (text) → <textarea>
        │
        └─ Save 버튼 클릭
           │
           ├─ FormData 수집
           │  └─ 각 입력 요소에서 값 추출
           │
           ├─ 타입 변환
           │  ├─ null/empty → null
           │  ├─ boolean → true/false
           │  ├─ numeric → Number()
           │  └─ string → 그대로
           │
           ├─ apiClient.insertRecord('posts', data)
           │  └─ Backend: POST /api/db/tables/posts/records
           │     └─ PostgreSQL: INSERT INTO posts (...) VALUES (...)
           │
           ├─ UIComponents.showToast('Record added', 'success')
           │  └─ 성공 토스트 표시 (자동 소멸)
           │
           ├─ UIComponents.hideModal()
           │  └─ 모달 닫기
           │
           └─ tableManager.selectTable('posts')
              └─ 테이블 데이터 새로고침
```

### 4. 쿼리 실행 흐름

```
User enters SQL in Query tab
'SELECT * FROM posts WHERE likes > 100;'
        │
        ▼
User clicks [Execute] or presses Ctrl+Enter
        │
        ▼
QueryBuilder.executeQuery()
        │
        ├─ 쿼리 입력 확인
        │  └─ 빈 쿼리면 경고 토스트
        │
        ├─ SELECT 검증
        │  └─ SELECT로 시작하지 않으면 오류 토스트
        │
        ├─ 로딩 스피너 표시
        │  └─ UIComponents.createSpinner()
        │
        ├─ apiClient.executeQuery(query)
        │  └─ Backend: POST /api/db/query
        │     └─ {query: "SELECT ..."}
        │        └─ PostgreSQL: 쿼리 실행
        │           └─ 결과 반환
        │
        ├─ QueryBuilder.renderResults(data)
        │  └─ UIComponents.createTable(columns, rows)
        │     └─ 결과 테이블 표시
        │
        └─ UIComponents.showToast('Query executed', 'success')
           └─ 성공 메시지 (행 수 포함)
```

---

## 확장 가이드

### 1. 새로운 UI 컴포넌트 추가

**예: 검색 필터 컴포넌트**

```javascript
// ui-components.js에 추가
static createFilterForm(columns) {
  const form = document.createElement('form');
  form.className = 'filter-form';

  columns.forEach(col => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Filter by ${col.name}...`;
    input.className = 'filter-input';
    form.appendChild(input);
  });

  return form;
}
```

**사용:**

```javascript
// table-manager.js에서
const filterForm = UIComponents.createFilterForm(columns);
document.getElementById('filterContainer').appendChild(filterForm);
```

### 2. 새로운 API 엔드포인트 추가

**Backend (backend/server.js)에 먼저 추가:**

```javascript
// 예: 테이블 통계 조회
app.get('/api/db/tables/:tableName/stats', async (req, res) => {
  const { tableName } = req.params;

  // 테이블명 검증
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return res.status(400).json({ success: false, error: 'Invalid table name' });
  }

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total_rows FROM "${tableName}"`
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

**Frontend (api-client.js)에 메서드 추가:**

```javascript
// APIClient 클래스에 추가
getTableStats(tableName) {
  return this.request('GET', `/db/tables/${tableName}/stats`);
}
```

**Console에서 사용:**

```javascript
// table-manager.js 또는 다른 곳에서
const stats = await apiClient.getTableStats('posts');
console.log(stats.data.total_rows);
```

### 3. 새로운 탭 추가

**HTML (index.html) 수정:**

```html
<!-- 탭 버튼 추가 -->
<button class="tab-btn" data-tab="export">💾 Export</button>

<!-- 탭 콘텐츠 추가 -->
<div id="tab-export" class="tab-pane">
  <div class="export-options">
    <button id="exportJsonBtn">JSON</button>
    <button id="exportCsvBtn">CSV</button>
  </div>
</div>
```

**JavaScript (app.js) 수정:**

```javascript
// setupTabEvents에서 이미 처리됨 (data-tab 속성 기반)
setupTabEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      // "export" 탭도 자동으로 처리됨
    });
  });
}

// 새로운 모듈 생성: export-manager.js
class ExportManager {
  static exportTable(tableName, format) {
    // 내용
  }
}
```

### 4. 새로운 테마 추가

**variables.css 수정:**

```css
/* 기존 Light/Dark 외 새로운 테마 */
[data-theme="ocean"] {
  --primary-color: #0066cc;
  --bg-color: #e6f2ff;
  --text-color: #003366;
}

[data-theme="forest"] {
  --primary-color: #228B22;
  --bg-color: #f0f5e8;
  --text-color: #1a3a1a;
}
```

**theme-manager.js 수정:**

```javascript
setTheme(theme) {
  if (['light', 'dark', 'ocean', 'forest'].includes(theme)) {
    this.theme = theme;
    this.applyTheme(theme);
    localStorage.setItem('console-theme', theme);
  }
}
```

### 5. 국제화 (i18n) 추가

**새 파일: i18n.js**

```javascript
class i18n {
  constructor() {
    this.language = localStorage.getItem('console-lang') || 'ko';
    this.messages = {
      ko: {
        'title': '💾 Database Console',
        'add_record': '+ Add Record',
        'save': 'Save'
      },
      en: {
        'title': '💾 Database Console',
        'add_record': '+ Add Record',
        'save': 'Save'
      }
    };
  }

  t(key) {
    return this.messages[this.language][key] || key;
  }

  setLanguage(lang) {
    this.language = lang;
    localStorage.setItem('console-lang', lang);
    // UI 업데이트 (선택사항)
  }
}

const i18nManager = new i18n();
```

**HTML에서 사용:**

```html
<h1 id="consoleTitle"></h1>

<script>
  document.getElementById('consoleTitle').textContent = i18nManager.t('title');
</script>
```

---

## 성능 고려사항

### 1. 대용량 테이블 처리

**문제:** 수백만 개의 레코드를 가진 테이블은 느림

**해결책:**

```javascript
// backend/server.js에서 기본 limit 설정
const DEFAULT_LIMIT = 10;  // 페이지당 10개만
const MAX_LIMIT = 100;     // 최대 100개

app.get('/api/db/tables/:tableName/records', async (req, res) => {
  let { page = 1, limit = DEFAULT_LIMIT } = req.query;
  limit = Math.min(limit, MAX_LIMIT);
  // ...
});
```

### 2. 중복 API 호출 방지

**문제:** 사용자가 빠르게 버튼을 클릭하면 여러 API 호출 발생

**해결책:**

```javascript
class TableManager {
  constructor() {
    this.isLoading = false;  // 플래그 추가
  }

  async selectTable(tableName) {
    if (this.isLoading) return;  // 로딩 중이면 무시

    this.isLoading = true;
    try {
      // API 호출
    } finally {
      this.isLoading = false;
    }
  }
}
```

### 3. 메모리 누수 방지

**문제:** 이벤트 리스너가 제거되지 않으면 메모리 누수

**해결책:**

```javascript
// 모달 닫을 때 정리
static hideModal() {
  const modal = document.getElementById('recordModal');
  if (modal) {
    modal.classList.remove('active');
    const form = document.getElementById('recordForm');
    if (form) {
      form.innerHTML = '';  // DOM 정리
      // 이벤트 리스너 제거 (필요시)
    }
  }
}
```

### 4. DOM 업데이트 최적화

**문제:** 대량의 행을 렌더링할 때 느림

**해결책:**

```javascript
// 1. 한 번에 여러 요소 생성 후 추가
const fragment = document.createDocumentFragment();
rows.forEach(row => {
  const tr = this.createTableRow(columns, row);
  fragment.appendChild(tr);
});
tbody.appendChild(fragment);

// 2. Virtual scrolling 고려 (고급)
// 화면에 보이는 부분만 렌더링
```

### 5. CSS 최적화

**피해야 할 것:**
```css
/* ❌ 비효율적: 모든 요소 스타일링 */
* {
  color: var(--text-color);
}

/* ❌ 복잡한 선택자 */
.sidebar .table-list .table-item:nth-child(odd) .table-name span:first-child {
  color: red;
}
```

**권장사항:**
```css
/* ✅ 효율적: 특정 클래스 사용 */
.table-item {
  color: var(--text-color);
}

/* ✅ 단순한 선택자 */
.table-item.active {
  background-color: var(--primary-color);
}
```

---

## 디버깅 팁

### 1. 브라우저 Console에서 전역 객체 접근

```javascript
// 콘솔에서 직접 실행
console.log(apiClient);
console.log(tableManager);
console.log(themeManager);

// API 수동 호출
apiClient.getTables().then(r => console.log(r));

// 테마 변경
themeManager.setTheme('dark');
```

### 2. Network 탭에서 API 호출 확인

**F12 → Network 탭**

```
GET /api/db/tables              200  1.2 KB
GET /api/db/tables/posts/schema 200  2.5 KB
GET /api/db/tables/posts/records?page=1&limit=10  200  3.8 KB
POST /api/db/tables/posts/records 201  0.1 KB
```

### 3. localStorage 확인

```javascript
// 콘솔에서
localStorage.getItem('console-theme')  // "dark"
localStorage.getItem('console-lang')   // "ko" (추가했다면)

// 모두 삭제
localStorage.clear();
```

### 4. Element Inspector로 DOM 구조 확인

**F12 → Elements/Inspector 탭**

```html
<body>
  <nav class="navbar">...</nav>
  <div class="main-container">
    <aside class="sidebar">...</aside>
    <main class="main-content">...</main>
  </div>
</body>
```

---

## 기여 가이드

### 코드 스타일

```javascript
// ✅ 권장사항
class MyModule {
  constructor() {
    this.value = 0;  // 프로퍼티
  }

  // 메서드는 camelCase
  myMethod() {
    // 주석은 명확하게
  }

  // 정적 메서드
  static staticMethod() {
    return 'result';
  }
}

// ❌ 피해야 할 것
function myFunction() {  // 클래스는 대문자로 시작
  var x = 1;             // var 사용 (const/let 권장)
}
```

### 커밋 메시지 포맷

```
feat: Add export to CSV functionality
fix: Fix pagination offset calculation
docs: Update Console architecture guide
style: Improve button styling
refactor: Extract form validation logic
```

---

**마지막 업데이트:** 2026년 4월 5일
**버전:** 1.0.0
