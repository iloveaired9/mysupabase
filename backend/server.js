/**
 * Step 4: REST API 서버
 *
 * Node.js + Express + PostgreSQL을 사용한 REST API입니다.
 *
 * 기능:
 * - GET /api/posts - 모든 게시글 조회 (페이지네이션, 필터링, 정렬)
 * - GET /api/posts/:id - 특정 게시글 조회
 * - GET /api/categories - 모든 카테고리 조회
 * - GET /api/sources - 모든 출처 조회
 *
 * 실행 방법:
 * npm install
 * npm start
 * 또는 npm run dev (nodemon)
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// ============================================
// 1. Express 앱 초기화
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 2. 미들웨어 (Middleware)
// ============================================

// CORS 설정 - 클라이언트에서 API 호출 허용
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// JSON 파싱
app.use(express.json());

// 요청 로깅 (개발용)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// 3. PostgreSQL 연결 풀 설정
// ============================================

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 연결 테스트
pool.on('connect', () => {
    console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL 연결 에러:', err);
});

// ============================================
// 4. 유틸리티 함수
// ============================================

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

// ============================================
// 5. API 라우트
// ============================================

/**
 * GET /api/posts
 * 모든 게시글 조회 (페이지네이션, 필터링, 정렬)
 *
 * 쿼리 파라미터:
 * - page (기본값: 1) - 페이지 번호
 * - limit (기본값: 6) - 페이지당 게시글 수
 * - category - 카테고리 필터 (tech, news, etc.)
 * - sort (기본값: latest) - 정렬 (latest, likes, comments)
 * - search - 제목 검색
 *
 * 예: GET /api/posts?page=1&category=tech&sort=likes
 */
app.get('/api/posts', async (req, res) => {
    try {
        const { page = 1, limit = 6, category, sort = 'latest', search } = req.query;

        // 쿼리 빌드
        let query = `
            SELECT
                p.id,
                p.title,
                p.excerpt,
                p.likes,
                p.comments,
                p.views,
                p.created_at,
                p.author,
                c.name as category_name,
                c.icon as category_icon,
                s.name as source_name,
                s.icon_emoji as source_icon,
                p.url
            FROM posts p
            JOIN categories c ON p.category_id = c.id
            JOIN sources s ON p.source_id = s.id
            WHERE 1=1
        `;

        const params = [];

        // 카테고리 필터
        if (category && category !== 'all') {
            query += ` AND c.name = $${params.length + 1}`;
            params.push(category);
        }

        // 검색 필터
        if (search && search.trim()) {
            query += ` AND (p.title ILIKE $${params.length + 1} OR p.excerpt ILIKE $${params.length + 1})`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm);
            params.push(searchTerm);
        }

        // 정렬
        switch (sort) {
            case 'likes':
                query += ` ORDER BY p.likes DESC`;
                break;
            case 'comments':
                query += ` ORDER BY p.comments DESC`;
                break;
            case 'latest':
            default:
                query += ` ORDER BY p.created_at DESC`;
        }

        // 전체 개수 조회 (페이지네이션용)
        // ORDER BY와 LIMIT을 제거하고 SELECT COUNT(*)로 변경
        const baseQuery = query
            .replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as count FROM')
            .replace(/\s+ORDER BY[\s\S]*$/, '');
        const countResult = await pool.query(baseQuery, params);
        const totalPosts = parseInt(countResult.rows[0].count);

        // 페이지네이션
        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit);
        params.push(offset);

        // 데이터 조회
        const result = await pool.query(query, params);

        // 응답
        res.json({
            success: true,
            data: result.rows.map(post => ({
                ...post,
                created_at_relative: formatRelativeTime(post.created_at)
            })),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalPosts,
                pages: Math.ceil(totalPosts / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/posts/:id
 * 특정 게시글 상세 조회
 */
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT
                p.id,
                p.title,
                p.excerpt,
                p.content,
                p.likes,
                p.comments,
                p.views,
                p.created_at,
                p.author,
                c.name as category_name,
                s.name as source_name,
                p.url
            FROM posts p
            JOIN categories c ON p.category_id = c.id
            JOIN sources s ON p.source_id = s.id
            WHERE p.id = $1
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: '게시글을 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/categories
 * 모든 카테고리 조회 (각 카테고리의 게시글 수 포함)
 */
app.get('/api/categories', async (req, res) => {
    try {
        const query = `
            SELECT
                c.id,
                c.name,
                c.icon,
                c.description,
                COUNT(p.id) as post_count
            FROM categories c
            LEFT JOIN posts p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.icon, c.description
            ORDER BY c.name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sources
 * 모든 출처 조회 (각 출처의 게시글 수 포함)
 */
app.get('/api/sources', async (req, res) => {
    try {
        const query = `
            SELECT
                s.id,
                s.name,
                s.icon_emoji,
                s.url,
                COUNT(p.id) as post_count
            FROM sources s
            LEFT JOIN posts p ON s.id = p.source_id
            GROUP BY s.id, s.name, s.icon_emoji, s.url
            ORDER BY post_count DESC
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats
 * 통계 정보 조회
 */
app.get('/api/stats', async (req, res) => {
    try {
        const query = `
            SELECT
                COUNT(*) as total_posts,
                ROUND(AVG(likes), 2) as avg_likes,
                MAX(likes) as max_likes,
                ROUND(AVG(comments), 2) as avg_comments,
                MAX(comments) as max_comments,
                SUM(likes) as total_likes
            FROM posts
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// 6. 헬스체크 라우트
// ============================================

/**
 * GET /
 * API 서버 상태 확인
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🔥 Hot Posts API v1.0 - 정상 작동 중',
        endpoints: {
            posts: 'GET /api/posts?page=1&limit=6&category=tech&sort=likes&search=AI',
            postDetail: 'GET /api/posts/:id',
            categories: 'GET /api/categories',
            sources: 'GET /api/sources',
            stats: 'GET /api/stats'
        }
    });
});

// ============================================
// 7. 에러 핸들링
// ============================================

/**
 * 404 Not Found
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '엔드포인트를 찾을 수 없습니다',
        path: req.path
    });
});

/**
 * 에러 핸들링 미들웨어
 */
app.use((error, req, res, next) => {
    console.error('❌ 예기치 않은 에러:', error);
    res.status(500).json({
        success: false,
        error: '서버 에러가 발생했습니다'
    });
});

// ============================================
// 8. 서버 시작
// ============================================

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 REST API 서버 시작: http://localhost:${PORT}`);
    console.log(`${'='.repeat(50)}`);
    console.log(`\n📌 사용 가능한 엔드포인트:`);
    console.log(`  GET  / - API 정보`);
    console.log(`  GET  /api/posts - 게시글 조회`);
    console.log(`  GET  /api/posts/:id - 게시글 상세`);
    console.log(`  GET  /api/categories - 카테고리 목록`);
    console.log(`  GET  /api/sources - 출처 목록`);
    console.log(`  GET  /api/stats - 통계\n`);
});

// ============================================
// 9. 종료 처리
// ============================================

process.on('SIGINT', async () => {
    console.log('\n\n⛔ 서버 종료 중...');
    await pool.end();
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
});
