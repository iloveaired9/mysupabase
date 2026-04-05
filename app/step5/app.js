/**
 * Step 5: Frontend & Backend 통합 (PostgREST 버전)
 *
 * 이 파일은 PostgREST API와 통합하여
 * 실시간 데이터베이스에서 가져온 게시글을 표시합니다.
 */

// ============================================
// 1. 상태 관리 (State Management)
// ============================================

const state = {
    currentPage: 1,
    currentCategory: 'all',
    currentSort: 'latest',
    searchQuery: '',
    filteredPosts: [],
    totalPosts: 0,
    totalPages: 1,
    postsPerPage: 6,
    isLoading: false,
    apiBaseUrl: 'http://localhost:3001'
};

// ============================================
// 2. DOM 요소 캐싱
// ============================================

const DOM = {
    postsGrid: document.getElementById('postsGrid'),
    categoryButtons: document.querySelectorAll('.category-btn'),
    sortButtons: document.querySelectorAll('.sort-btn'),
    searchInput: document.querySelector('.search-input'),
    searchButton: document.querySelector('.search-btn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    pageInfo: document.getElementById('pageInfo'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage'),
    statsSection: document.getElementById('statsSection'),
    apiStatus: document.getElementById('apiStatus'),
    totalPostsEl: document.getElementById('totalPosts'),
    avgLikesEl: document.getElementById('avgLikes'),
    maxLikesEl: document.getElementById('maxLikes'),
    avgCommentsEl: document.getElementById('avgComments')
};

// ============================================
// 3. 유틸리티 함수
// ============================================

/**
 * 상대시간 포맷팅 (예: "2시간 전")
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
 * 숫자 포맷팅 (1000 -> 1K)
 */
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * 로딩 스피너 표시/숨김
 */
function setLoading(isLoading) {
    state.isLoading = isLoading;
    if (isLoading) {
        DOM.loadingSpinner.classList.add('active');
        DOM.errorMessage.classList.remove('active');
    } else {
        DOM.loadingSpinner.classList.remove('active');
    }
}

/**
 * 에러 메시지 표시
 */
function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.errorMessage.classList.add('active');
    console.error('❌ 에러:', message);
}

/**
 * 에러 메시지 숨김
 */
function hideError() {
    DOM.errorMessage.classList.remove('active');
}

/**
 * API 상태 표시
 */
function showApiStatus(message, isError = false) {
    DOM.apiStatus.textContent = message;
    DOM.apiStatus.classList.remove('hidden');
    if (isError) {
        DOM.apiStatus.classList.add('error');
    } else {
        DOM.apiStatus.classList.remove('error');
    }

    // 3초 후 자동 숨김
    setTimeout(() => {
        DOM.apiStatus.classList.add('hidden');
    }, 3000);
}

/**
 * HTML 이스케이프 (XSS 방지)
 */
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

// ============================================
// 4. API 호출 함수
// ============================================

/**
 * 게시글 데이터 조회 (PostgREST)
 */
async function fetchPosts() {
    try {
        setLoading(true);
        hideError();

        // PostgREST 쿼리 파라미터 구성
        const offset = (state.currentPage - 1) * state.postsPerPage;

        // 기본 select 쿼리: 관계형 데이터 포함
        let selectQuery = 'id,title,excerpt,likes,comments,views,created_at,url,categories(name,icon),sources(name,icon_emoji)';

        // 필터링 및 정렬 파라미터
        const params = new URLSearchParams({
            select: selectQuery,
            limit: state.postsPerPage,
            offset: offset
        });

        // 카테고리 필터
        if (state.currentCategory !== 'all') {
            params.append('categories.name', `eq.${state.currentCategory}`);
        }

        // 정렬
        switch (state.currentSort) {
            case 'likes':
                params.append('order', 'likes.desc');
                break;
            case 'comments':
                params.append('order', 'comments.desc');
                break;
            case 'latest':
            default:
                params.append('order', 'created_at.desc');
        }

        // 검색 (제목이나 excerpt에서)
        if (state.searchQuery) {
            params.append('or', `(title.ilike.*${state.searchQuery}*,excerpt.ilike.*${state.searchQuery}*)`);
        }

        // 전체 개수 조회를 위해 Prefer 헤더 설정
        const url = `${state.apiBaseUrl}/posts?${params}`;
        console.log(`📡 PostgREST API 호출: ${url}`);

        const response = await fetch(url, {
            headers: {
                'Prefer': 'count=exact'
            }
        });

        if (!response.ok) {
            throw new Error(`API 에러: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Content-Range 헤더에서 전체 개수 추출
        const contentRange = response.headers.get('content-range');
        if (contentRange) {
            const total = parseInt(contentRange.split('/')[1]);
            state.totalPosts = total;
            state.totalPages = Math.ceil(total / state.postsPerPage);
        }

        // 상태 업데이트
        state.filteredPosts = data || [];

        // UI 업데이트
        renderPosts();
        updatePaginationUI();
        showApiStatus('🔗 API 연결됨');

        return data;

    } catch (error) {
        showError(error.message);
        showApiStatus('API 연결 실패', true);
        state.filteredPosts = [];
        DOM.postsGrid.innerHTML = '<p style="padding: 2rem; text-align: center; color: #666;">데이터를 불러올 수 없습니다. API 서버가 실행 중인지 확인하세요.</p>';
    } finally {
        setLoading(false);
    }
}

/**
 * 통계 데이터 조회 (PostgREST RPC)
 */
async function fetchStats() {
    try {
        const response = await fetch(`${state.apiBaseUrl}/rpc/get_posts_stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: '{}'
        });

        if (!response.ok) {
            throw new Error('통계 데이터를 가져올 수 없습니다');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const stats = data[0];

            // 통계 UI 업데이트
            DOM.totalPostsEl.textContent = stats.total_posts || 0;
            DOM.avgLikesEl.textContent = Math.round(stats.avg_likes || 0);
            DOM.maxLikesEl.textContent = stats.max_likes || 0;
            DOM.avgCommentsEl.textContent = Math.round(stats.avg_comments || 0);

            // 통계 섹션 표시
            DOM.statsSection.style.display = 'grid';
        }

    } catch (error) {
        console.warn('⚠️ 통계 조회 실패:', error.message);
        // 통계 실패는 무시하고 계속 진행
    }
}

// ============================================
// 5. UI 렌더링 함수
// ============================================

/**
 * 게시글 렌더링 (PostgREST 데이터 형식)
 */
function renderPosts() {
    const postsHTML = state.filteredPosts.map(post => {
        // PostgREST에서 반환된 중첩 객체 처리
        const categoryIcon = post.categories?.icon || '📌';
        const categoryName = post.categories?.name || 'Unknown';
        const sourceIcon = post.sources?.icon_emoji || '🔗';
        const sourceName = post.sources?.name || 'Unknown';

        return `
        <div class="post-card">
            <div class="post-header">
                <span class="category-badge">${categoryIcon} ${categoryName}</span>
                <span class="source-badge">${sourceIcon} ${sourceName}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
            <div class="post-meta">
                <span class="meta-item">👍 ${formatNumber(post.likes)}</span>
                <span class="meta-item">💬 ${formatNumber(post.comments)}</span>
                <span class="meta-item">👁️ ${formatNumber(post.views || 0)}</span>
                <span class="meta-item">🕐 ${formatRelativeTime(post.created_at)}</span>
            </div>
            <a href="${escapeHtml(post.url)}" target="_blank" class="post-link">
                자세히 보기 →
            </a>
        </div>
    `;
    }).join('');

    DOM.postsGrid.innerHTML = postsHTML || '<p style="padding: 2rem; text-align: center; color: #666;">게시글이 없습니다.</p>';
}

/**
 * 페이지네이션 UI 업데이트
 */
function updatePaginationUI() {
    DOM.pageInfo.textContent = `페이지 ${state.currentPage} / ${state.totalPages}`;
    DOM.prevBtn.disabled = state.currentPage <= 1;
    DOM.nextBtn.disabled = state.currentPage >= state.totalPages;
}

// ============================================
// 6. 이벤트 리스너 설정
// ============================================

/**
 * 카테고리 필터 버튼
 */
DOM.categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 활성 버튼 업데이트
        DOM.categoryButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 상태 업데이트
        state.currentCategory = btn.dataset.category;
        state.currentPage = 1; // 카테고리 변경 시 첫 페이지로

        // 데이터 다시 로드
        fetchPosts();
    });
});

/**
 * 정렬 버튼
 */
DOM.sortButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 활성 버튼 업데이트
        DOM.sortButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 상태 업데이트
        state.currentSort = btn.dataset.sort;
        state.currentPage = 1; // 정렬 변경 시 첫 페이지로

        // 데이터 다시 로드
        fetchPosts();
    });
});

/**
 * 검색 기능
 */
DOM.searchButton.addEventListener('click', () => {
    state.searchQuery = DOM.searchInput.value.trim();
    state.currentPage = 1; // 검색 시 첫 페이지로
    fetchPosts();
});

DOM.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        DOM.searchButton.click();
    }
});

/**
 * 페이지네이션 버튼
 */
DOM.prevBtn.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        fetchPosts();
        window.scrollTo(0, 0);
    }
});

DOM.nextBtn.addEventListener('click', () => {
    if (state.currentPage < state.totalPages) {
        state.currentPage++;
        fetchPosts();
        window.scrollTo(0, 0);
    }
});

// ============================================
// 7. 초기화
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Step 5 앱 초기화 시작 (PostgREST 버전)');
    console.log(`📍 API Base URL: ${state.apiBaseUrl}`);

    // 초기 데이터 로드
    fetchPosts();
    fetchStats();

    // 5초마다 통계 갱신
    setInterval(fetchStats, 5000);
});
