/**
 * Step 2: JavaScript 로직
 *
 * 이 파일은 다음 기능들을 구현합니다:
 * 1. 게시글 동적 렌더링
 * 2. 필터링 (카테고리별)
 * 3. 정렬 (최신순, 추천순, 댓글순)
 * 4. 검색 (제목/내용)
 * 5. 페이지네이션
 *
 * 핵심 개념:
 * - DOM 조작 (document.querySelector, createElement)
 * - 이벤트 처리 (addEventListener)
 * - 배열 메서드 (filter, sort, slice)
 * - 상태 관리 (state 객체)
 */

/**
 * ===== 1. 애플리케이션 상태 (State) =====
 *
 * 상태(State)란 현재 앱의 상황을 저장하는 객체입니다.
 * 필터, 정렬, 현재 페이지 등을 여기에 저장합니다.
 */
const state = {
    currentCategory: "all",        // 현재 선택된 카테고리
    currentSort: "latest",         // 현재 정렬 방식
    currentPage: 1,                // 현재 페이지 번호
    searchQuery: "",               // 검색어
    filteredPosts: [...MOCK_POSTS] // 필터링된 게시글 (초기값: 모든 게시글)
};

/**
 * ===== 2. DOM 요소 캐싱 =====
 *
 * 자주 사용되는 DOM 요소들을 변수에 저장합니다.
 * 이렇게 하면 매번 querySelector를 호출할 필요가 없어 성능이 향상됩니다.
 */
const DOM = {
    categoryButtons: document.querySelectorAll(".category-btn"),
    sortButtons: document.querySelectorAll(".sort-btn"),
    searchInput: document.querySelector(".search-input"),
    searchBtn: document.querySelector(".search-btn"),
    postsGrid: document.querySelector(".posts-grid"),
    pageInfo: document.querySelector(".page-info"),
    paginationBtns: document.querySelectorAll(".pagination-btn"),
    prevBtn: document.querySelector(".pagination-btn:first-child"),
    nextBtn: document.querySelector(".pagination-btn:last-child")
};

/**
 * ===== 3. 유틸리티 함수 =====
 */

/**
 * 날짜를 상대시간으로 변환 (예: "2시간 전")
 */
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "방금 전";
    if (seconds < 3600) return Math.floor(seconds / 60) + "분 전";
    if (seconds < 86400) return Math.floor(seconds / 3600) + "시간 전";
    if (seconds < 604800) return Math.floor(seconds / 86400) + "일 전";

    return date.toLocaleDateString("ko-KR");
}

/**
 * 숫자를 포맷팅 (예: 1000 → "1K", 1200 → "1.2K")
 */
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toString();
}

/**
 * ===== 4. 핵심 기능: 게시글 필터링 및 정렬 =====
 */

/**
 * 현재 상태에 따라 게시글을 필터링하고 정렬합니다.
 *
 * 과정:
 * 1. 모든 게시글로 시작
 * 2. 카테고리 필터링
 * 3. 검색어 필터링
 * 4. 정렬
 * 5. 상태 업데이트
 */
function filterAndSortPosts() {
    let posts = [...MOCK_POSTS];

    // Step 1: 카테고리 필터링
    if (state.currentCategory !== "all") {
        posts = posts.filter(post => post.category === state.currentCategory);
    }

    // Step 2: 검색어 필터링
    if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query)
        );
    }

    // Step 3: 정렬
    switch (state.currentSort) {
        case "latest":
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case "likes":
            posts.sort((a, b) => b.likes - a.likes);
            break;
        case "comments":
            posts.sort((a, b) => b.comments - a.comments);
            break;
    }

    // Step 4: 상태 업데이트
    state.filteredPosts = posts;
    state.currentPage = 1; // 필터/정렬 변경 시 첫 페이지로 리셋
}

/**
 * ===== 5. 페이지네이션 =====
 */

/**
 * 현재 페이지의 게시글을 가져옵니다.
 */
function getCurrentPagePosts() {
    const start = (state.currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    return state.filteredPosts.slice(start, end);
}

/**
 * 총 페이지 수를 계산합니다.
 */
function getTotalPages() {
    return Math.ceil(state.filteredPosts.length / POSTS_PER_PAGE);
}

/**
 * ===== 6. DOM 렌더링 =====
 */

/**
 * 단일 게시글 카드를 HTML로 생성합니다.
 *
 * 이 함수는 템플릿 리터럴(template literal)을 사용하여
 * 게시글 데이터를 HTML 문자열로 변환합니다.
 */
function createPostCard(post) {
    const categoryInfo = CATEGORIES[post.category];
    const relativeTime = formatRelativeTime(post.createdAt);

    return `
        <article class="post-card">
            <div class="post-header">
                <span class="category-badge ${post.category}">
                    ${categoryInfo.icon} ${categoryInfo.name}
                </span>
                <span class="source-badge">${SOURCES[post.source] || post.source}</span>
            </div>

            <h2 class="post-title">
                <a href="${post.url}" target="_blank">
                    ${post.title}
                </a>
            </h2>

            <p class="post-excerpt">
                ${post.excerpt}
            </p>

            <div class="post-stats">
                <span class="stat">👍 <strong>${formatNumber(post.likes)}</strong></span>
                <span class="stat">💬 <strong>${formatNumber(post.comments)}</strong></span>
                <span class="post-date">${relativeTime}</span>
            </div>
        </article>
    `;
}

/**
 * 모든 게시글을 렌더링합니다.
 */
function renderPosts() {
    const posts = getCurrentPagePosts();

    // 게시글이 없으면 메시지 표시
    if (posts.length === 0) {
        DOM.postsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p style="color: #999; font-size: 1.1rem;">
                    검색 결과가 없습니다. 다시 시도해보세요.
                </p>
            </div>
        `;
        return;
    }

    // 게시글들을 HTML로 변환하여 렌더링
    DOM.postsGrid.innerHTML = posts.map(post => createPostCard(post)).join("");
}

/**
 * 페이지네이션 UI를 업데이트합니다.
 */
function updatePagination() {
    const totalPages = getTotalPages();
    const currentPage = state.currentPage;

    // 페이지 정보 업데이트
    DOM.pageInfo.textContent = `페이지 ${currentPage} / ${totalPages}`;

    // 이전 버튼 활성화/비활성화
    if (currentPage === 1) {
        DOM.prevBtn.disabled = true;
    } else {
        DOM.prevBtn.disabled = false;
    }

    // 다음 버튼 활성화/비활성화
    if (currentPage === totalPages) {
        DOM.nextBtn.disabled = true;
    } else {
        DOM.nextBtn.disabled = false;
    }
}

/**
 * 카테고리 버튼의 활성 상태를 업데이트합니다.
 */
function updateCategoryButtons() {
    DOM.categoryButtons.forEach(btn => {
        const category = btn.getAttribute("data-category");
        if (category === state.currentCategory) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

/**
 * 정렬 버튼의 활성 상태를 업데이트합니다.
 */
function updateSortButtons() {
    DOM.sortButtons.forEach(btn => {
        const sort = btn.getAttribute("data-sort");
        if (sort === state.currentSort) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

/**
 * 전체 UI를 업데이트합니다.
 */
function render() {
    filterAndSortPosts();
    renderPosts();
    updatePagination();
    updateCategoryButtons();
    updateSortButtons();
}

/**
 * ===== 7. 이벤트 핸들러 =====
 */

/**
 * 카테고리 필터 이벤트
 */
DOM.categoryButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        state.currentCategory = e.target.getAttribute("data-category");
        render();
    });
});

/**
 * 정렬 옵션 이벤트
 */
DOM.sortButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        state.currentSort = e.target.getAttribute("data-sort");
        render();
    });
});

/**
 * 검색 이벤트
 *
 * 검색 버튼 클릭 또는 엔터키 입력 시 동작
 */
function handleSearch() {
    state.searchQuery = DOM.searchInput.value;
    render();
}

DOM.searchBtn.addEventListener("click", handleSearch);

DOM.searchInput.addEventListener("keypress", (e) => {
    // 엔터키(Enter) 입력 시 검색 실행
    if (e.key === "Enter") {
        handleSearch();
    }
});

/**
 * 페이지네이션 이벤트
 */
DOM.prevBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderPosts();
        updatePagination();
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

DOM.nextBtn.addEventListener("click", () => {
    if (state.currentPage < getTotalPages()) {
        state.currentPage++;
        renderPosts();
        updatePagination();
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

/**
 * ===== 8. 초기화 =====
 *
 * 페이지 로드 시 초기 렌더링을 수행합니다.
 */
document.addEventListener("DOMContentLoaded", () => {
    render();
    console.log("✅ Step 2 애플리케이션이 로드되었습니다!");
    console.log("현재 게시글 수:", MOCK_POSTS.length);
    console.log("필터링된 게시글 수:", state.filteredPosts.length);
});

/**
 * ===== 9. 개발자 도구용 (선택사항) =====
 *
 * 브라우저 콘솔에서 앱 상태를 확인할 수 있습니다.
 * 콘솔에서 다음 명령어를 실행해보세요:
 *
 * state               // 현재 상태 확인
 * state.currentPage = 2; render();  // 프로그래밍 방식으로 페이지 변경
 * MOCK_POSTS          // 모든 게시글 보기
 */
window.appState = state;
window.appRender = render;
window.appMocks = MOCK_POSTS;

console.log("%c=== Step 2 개발자 도구 ===", "color: green; font-size: 14px; font-weight: bold;");
console.log("콘솔에서 다음을 사용할 수 있습니다:");
console.log("- appState: 현재 앱 상태");
console.log("- appRender(): 화면 다시 그리기");
console.log("- appMocks: Mock 데이터 전체");
