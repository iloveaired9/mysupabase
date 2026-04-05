# Step 1: 기본 UI 구축 (HTML/CSS)

## 📌 목표

이 단계에서는 **웹 UI 설계 및 정적 페이지 구현**을 학습합니다.
프레임워크 없이 순수 HTML과 CSS만 사용하여 반응형 웹 페이지를 만듭니다.

---

## 🎨 학습 포인트

### 1. HTML 시멘틱 마크업
- **시멘틱 태그** 사용: `<header>`, `<aside>`, `<main>`, `<article>`, `<footer>`
- 검색 엔진과 스크린 리더 최적화
- 구조가 명확한 코드 작성

### 2. CSS Flexbox & Grid 레이아웃
- **CSS Grid**: 2단 레이아웃 (사이드바 + 메인 콘텐츠)
- **CSS Flexbox**: 게시글 카드 내부 배치
- 반응형 디자인으로 모바일 대응

### 3. CSS 변수 (Custom Properties)
```css
:root {
    --primary-color: #ff6b6b;
    --spacing-md: 1rem;
    /* 등등 */
}
```
- 색상, 크기 등을 중앙에서 관리
- 수정 시 코드 전체에 적용

### 4. 반응형 디자인
- **@media 쿼리** 사용
- 모바일 (480px 이하), 태블릿 (768px 이하), 데스크톱
- 터치 친화적 UI

### 5. 마이크로 인터랙션 (기본)
- **Hover 효과**: 버튼, 카드
- **Transition**: 부드러운 애니메이션
- **Transform**: 카드 호버 시 살짝 떠오르는 효과

---

## 📁 파일 구조

```
step1/
├── index.html       # 메인 HTML 마크업
├── style.css        # 모든 스타일시트
└── README.md        # 이 파일
```

---

## 🏗️ 페이지 구조

```
┌─────────────────────────────────────────┐
│           헤더 (Header)                  │
│      🔥 핫글 모아보기                    │
│    커뮤니티의 인기글을 한 곳에서!       │
├──────────────┬──────────────────────────┤
│              │                          │
│   사이드바   │      메인 콘텐츠        │
│   (Sidebar)  │                          │
│              │   [검색 바]              │
│  - 카테고리  │                          │
│  - 정렬 옵션 │  ┌──────────┬──────────┐ │
│              │  │ 게시글 1 │ 게시글 2 │ │
│              │  ├──────────┼──────────┤ │
│              │  │ 게시글 3 │ 게시글 4 │ │
│              │  └──────────┴──────────┘ │
│              │  [페이지네이션]         │
├──────────────┴──────────────────────────┤
│         푸터 (Footer)                    │
└─────────────────────────────────────────┘
```

---

## 🚀 실행 방법

### 1. 브라우저에서 열기
```bash
# 파일 탐색기에서 index.html 더블클릭
# 또는 브라우저에서 Ctrl+O로 파일 열기
```

### 2. Live Server로 실행 (권장)
VS Code에 Live Server 확장 설치 후:
```bash
# VS Code에서 index.html 우클릭
# "Open with Live Server" 선택
# → http://localhost:5500에서 자동 열림
```

---

## 📚 주요 코드 설명

### HTML 구조
```html
<body>
    <header>...</header>           <!-- 헤더 -->
    <div class="container">        <!-- 메인 컨테이너 (Grid) -->
        <aside class="sidebar">    <!-- 왼쪽 사이드바 -->
            <div class="filter-section">...</div>
        </aside>
        <main class="main-content"> <!-- 오른쪽 메인 콘텐츠 -->
            <div class="search-bar">...</div>
            <div class="posts-grid">...</div>
            <div class="pagination">...</div>
        </main>
    </div>
    <footer>...</footer>           <!-- 푸터 -->
</body>
```

### CSS Grid 레이아웃
```css
.container {
    display: grid;
    grid-template-columns: 200px 1fr;  /* 사이드바 200px, 나머지는 유연 */
    gap: 1.5rem;
}

.posts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    /* 최소 320px, 너비에 따라 자동으로 배치 */
}
```

### 카테고리 배지
```html
<span class="category-badge tech">기술</span>
```

```css
.category-badge.tech {
    background-color: var(--tech-color);  /* CSS 변수 사용 */
}
```

### 호버 효과
```css
.post-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);  /* 2px 위로 */
}
```

---

## 🎯 실습 과제

### 초급
1. ✅ HTML 파일 열어보기
2. ✅ 브라우저의 개발자 도구(F12)에서 HTML 구조 확인
3. ✅ 각 카테고리 배지의 색상 변경해보기 (CSS 변수 수정)

### 중급
4. 새로운 게시글 카드 추가하기
   - HTML에 `<article class="post-card">` 복사 후 추가
   - 내용 수정
5. 새로운 카테고리 만들기
   - `category-badge` 클래스 확장 (CSS에 새 클래스 추가)
   - HTML에서 사용
6. 헤더 색상 그라디언트 변경해보기

### 고급
7. 모바일 반응형 테스트
   - F12 → 반응형 디자인 모드 (Ctrl+Shift+M)
   - 768px, 480px 구간에서 레이아웃 변화 확인
8. 다크 모드 CSS 작성
   - `@media (prefers-color-scheme: dark)` 활용
9. 새로운 섹션 추가
   - "인기 검색어" 섹션
   - "추천 채널" 섹션

---

## 🔍 핵심 개념 학습

### CSS 변수 (Custom Properties)
**왜 사용?**
- 반복되는 값을 한 곳에서 관리
- 테마 변경 시 쉬움
- 유지보수 편함

```css
/* 정의 */
:root {
    --primary-color: #ff6b6b;
}

/* 사용 */
.logo {
    color: var(--primary-color);
}
```

### Flexbox vs Grid
| 항목 | Flexbox | Grid |
|------|---------|------|
| 차원 | 1차원 (행 또는 열) | 2차원 (행과 열) |
| 사용처 | 네비게이션, 배치 | 레이아웃 구조 |
| 예시 | `.post-stats` | `.container`, `.posts-grid` |

### 반응형 브레이크포인트
```css
/* 모바일 우선 접근 */
.posts-grid {
    grid-template-columns: 1fr;  /* 모바일: 1열 */
}

@media (min-width: 768px) {
    .posts-grid {
        grid-template-columns: repeat(2, 1fr);  /* 태블릿: 2열 */
    }
}

@media (min-width: 1024px) {
    .posts-grid {
        grid-template-columns: repeat(3, 1fr);  /* 데스크톱: 3열 */
    }
}
```

---

## 💡 팁과 트릭

1. **개발자 도구 활용**
   - F12로 개발자 도구 열기
   - Elements 탭에서 HTML 구조 확인
   - Styles 탭에서 CSS 실시간 수정 가능

2. **색상 팔레트**
   - 현재: 빨강(primary), 청록(secondary)
   - 추천 도구: colorhexa.com, coolors.co

3. **폰트 개선**
   - Google Fonts 추가: `<link rel="stylesheet" href="https://fonts.googleapis.com/...">`
   - 더 예쁜 폰트 적용 가능

4. **이미지 추가**
   ```html
   <img src="image.jpg" alt="이미지 설명" class="post-image">
   ```

---

## ❓ 자주 묻는 질문

**Q: 왜 정적 페이지를 먼저 만드나?**
A: HTML/CSS의 기초를 탄탄히 하기 위해. JavaScript는 동작을 추가하는 것이므로, 기초 구조가 중요합니다.

**Q: CSS를 어떻게 배워야 하나?**
A: 다음 단계:
1. 기본 선택자 (태그, 클래스, ID)
2. 박스 모델 (margin, padding, border)
3. Display (block, inline, flex, grid)
4. 색상과 배경
5. 애니메이션

**Q: 반응형 디자인이 정말 필요한가?**
A: 네! 현재 모바일 사용자가 60% 이상입니다. 필수입니다.

---

## 🔗 다음 단계

✅ **Step 1 완료!**
→ **[Step 2: JavaScript로 상호작용 추가](../step2/README.md)**

Step 2에서는 이 정적 페이지에 JavaScript로 동작을 추가합니다:
- Mock 데이터로 게시글 동적 생성
- 필터링, 정렬, 검색 기능
- 페이지네이션 동작

---

## 📖 참고 자료

- [MDN Web Docs - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [CSS Grid 완벽 가이드](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox 완벽 가이드](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**작성일**: 2024년 4월 4일
**난이도**: ⭐⭐ (초급-중급)
**예상 소요 시간**: 1-2시간
