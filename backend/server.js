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

// ============================================
// 6. Database 관리 API (콘솔용)
// ============================================

/**
 * GET /api/db/tables
 * 모든 테이블 목록 조회 (메타데이터 포함)
 */
app.get('/api/db/tables', async (req, res) => {
    try {
        const query = `
            SELECT
                t.table_name,
                n_live_tup as row_count,
                (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
            FROM pg_stat_user_tables st
            FULL OUTER JOIN information_schema.tables t ON st.relname = t.table_name
            WHERE t.table_schema = 'public'
            ORDER BY t.table_name
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows.map(table => ({
                name: table.table_name,
                rowCount: parseInt(table.row_count) || 0,
                columnCount: parseInt(table.column_count) || 0,
                lastModified: new Date().toISOString()
            }))
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tables'
        });
    }
});

/**
 * GET /api/db/tables/:tableName/schema
 * 특정 테이블의 스키마 조회 (컬럼, 타입, 제약조건)
 */
app.get('/api/db/tables/:tableName/schema', async (req, res) => {
    try {
        const { tableName } = req.params;

        // 테이블명 검증 (SQL injection 방지)
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid table name'
            });
        }

        // 테이블 존재 확인
        const tableCheck = await pool.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
            [tableName]
        );

        if (tableCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: `Table '${tableName}' not found`
            });
        }

        const query = `
            SELECT
                c.column_name,
                c.data_type,
                c.is_nullable,
                c.column_default,
                tc.constraint_type
            FROM information_schema.columns c
            LEFT JOIN information_schema.constraint_column_usage ccu
                ON c.table_name = ccu.table_name AND c.column_name = ccu.column_name
            LEFT JOIN information_schema.table_constraints tc
                ON ccu.constraint_name = tc.constraint_name
            WHERE c.table_schema = 'public' AND c.table_name = $1
            ORDER BY c.ordinal_position
        `;

        const result = await pool.query(query, [tableName]);

        res.json({
            success: true,
            data: {
                tableName,
                columns: result.rows.map(col => ({
                    name: col.column_name,
                    type: col.data_type,
                    nullable: col.is_nullable === 'YES',
                    default: col.column_default,
                    isPrimaryKey: col.constraint_type === 'PRIMARY KEY'
                }))
            }
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch table schema'
        });
    }
});

/**
 * GET /api/db/tables/:tableName/records
 * 테이블 레코드 조회 (페이지네이션)
 */
app.get('/api/db/tables/:tableName/records', async (req, res) => {
    try {
        const { tableName } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // 테이블명 검증
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid table name'
            });
        }

        // 전체 개수
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        const total = parseInt(countResult.rows[0].count);

        // 페이지네이션
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const query = `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`;
        const result = await pool.query(query, [parseInt(limit), offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch records'
        });
    }
});

/**
 * POST /api/db/tables/:tableName/records
 * 테이블에 새 레코드 추가
 */
app.post('/api/db/tables/:tableName/records', async (req, res) => {
    try {
        const { tableName } = req.params;
        const data = req.body;

        // 테이블명 검증
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid table name'
            });
        }

        // 빈 데이터 확인
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No data provided'
            });
        }

        // 컬럼명과 값 준비
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');

        const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) RETURNING *`;
        const result = await pool.query(query, values);

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to insert record'
        });
    }
});

/**
 * POST /api/db/query
 * SELECT 쿼리 실행 (읽기 전용)
 */
app.post('/api/db/query', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                error: 'No query provided'
            });
        }

        // SELECT 쿼리만 허용 (안전성)
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            return res.status(400).json({
                success: false,
                error: 'Only SELECT queries are allowed'
            });
        }

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows,
            rowCount: result.rowCount
        });

    } catch (error) {
        console.error('❌ 에러:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Query execution failed'
        });
    }
});

/**
 * POST /api/db/tables - 새로운 테이블 생성
 */
app.post('/api/db/tables', async (req, res) => {
    try {
        const { tableName, columns } = req.body;

        // 테이블명 검증
        if (!tableName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid table name. Must start with letter or underscore, contain only alphanumeric and underscores'
            });
        }

        // 시스템 테이블 확인
        if (tableName.startsWith('pg_') || tableName === 'information_schema') {
            return res.status(403).json({
                success: false,
                error: 'Cannot create system tables'
            });
        }

        // 컬럼 검증
        if (!Array.isArray(columns) || columns.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one column is required'
            });
        }

        // 컬럼 정의 생성
        const columnDefs = [];
        let hasPrimaryKey = false;

        for (const col of columns) {
            if (!col.name || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col.name)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid column name: ${col.name}`
                });
            }

            const type = col.type || 'TEXT';
            const nullable = col.nullable !== false ? '' : ' NOT NULL';
            const primaryKey = col.isPrimaryKey ? ' PRIMARY KEY' : '';
            const defaultVal = col.default ? ` DEFAULT ${col.default}` : '';

            if (col.isPrimaryKey) {
                hasPrimaryKey = true;
            }

            columnDefs.push(`"${col.name}" ${type}${primaryKey}${nullable}${defaultVal}`);
        }

        // 자동 id 컬럼 추가 (primary key가 없으면)
        let createTableSQL;
        if (!hasPrimaryKey) {
            createTableSQL = `CREATE TABLE "${tableName}" (
                id SERIAL PRIMARY KEY,
                ${columnDefs.join(',\n                ')},
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;
        } else {
            createTableSQL = `CREATE TABLE "${tableName}" (
                ${columnDefs.join(',\n                ')},
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;
        }

        // 테이블 생성
        await pool.query(createTableSQL);

        res.json({
            success: true,
            message: `Table '${tableName}' created successfully`,
            tableName: tableName
        });

    } catch (error) {
        console.error('❌ 테이블 생성 오류:', error);

        // PostgreSQL 중복 테이블 오류
        if (error.code === '42P07') {
            return res.status(400).json({
                success: false,
                error: 'Table already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create table'
        });
    }
});

/**
 * POST /api/db/ddl - DDL 쿼리 실행 (CREATE, ALTER, DROP)
 * 여러 개의 쿼리를 세미콜론으로 구분하여 실행 가능
 */
app.post('/api/db/ddl', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || !query.trim()) {
            return res.status(400).json({
                success: false,
                error: 'No query provided'
            });
        }

        // SQL 주석 제거 (-- 와 /* */)
        let cleanedQuery = query
            // 한 줄 주석 제거 (-- 부터 줄 끝까지)
            .replace(/--[^\n]*\n/g, '\n')
            .replace(/--[^\n]*$/gm, '')
            // 블록 주석 제거 (/* ... */)
            .replace(/\/\*[\s\S]*?\*\//g, ' ');

        // 여러 쿼리를 세미콜론으로 분리
        const queries = cleanedQuery
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0); // 빈 쿼리 제거

        if (queries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid queries provided'
            });
        }

        // 각 쿼리 검증
        for (const singleQuery of queries) {
            const trimmedQuery = singleQuery.toUpperCase();

            // DDL 쿼리만 허용 (CREATE, ALTER, DROP)
            const allowedDDLs = ['CREATE', 'ALTER', 'DROP'];
            const isAllowedDDL = allowedDDLs.some(ddl => trimmedQuery.startsWith(ddl));

            if (!isAllowedDDL) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid query: Only CREATE, ALTER, and DROP statements are allowed. Got: ${trimmedQuery.substring(0, 30)}...`
                });
            }

            // 시스템 테이블 보호
            if (trimmedQuery.includes('PG_') || trimmedQuery.includes('INFORMATION_SCHEMA')) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot modify system tables'
                });
            }
        }

        // 모든 쿼리 실행
        const executedQueries = [];
        for (const singleQuery of queries) {
            try {
                await pool.query(singleQuery);
                executedQueries.push(singleQuery.substring(0, 50).toUpperCase() + '...');
            } catch (error) {
                console.error('❌ 쿼리 실행 오류:', singleQuery, error);
                throw error;
            }
        }

        res.json({
            success: true,
            message: `${executedQueries.length} DDL statement(s) executed successfully`,
            queriesExecuted: executedQueries.length,
            queries: executedQueries
        });

    } catch (error) {
        console.error('❌ DDL 에러:', error);

        // PostgreSQL 에러 코드 해석
        let errorMessage = error.message;
        if (error.code === '42P07') {
            errorMessage = 'Table or object already exists';
        } else if (error.code === '42704') {
            errorMessage = 'Table or object does not exist';
        } else if (error.code === '42601') {
            errorMessage = 'Syntax error in DDL statement';
        } else if (error.code === '42809') {
            errorMessage = 'Wrong object type (e.g., creating index on non-existent table)';
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

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
