/**
 * Step 3: PostgreSQL 테이블 설계
 *
 * 이 파일은 다음을 정의합니다:
 * 1. categories 테이블 - 카테고리 정보
 * 2. sources 테이블 - 게시글 출처 정보
 * 3. posts 테이블 - 게시글 데이터 (categories, sources와 연결)
 *
 * 실행 방법:
 * psql -U supabase -d supabase -f schema.sql
 */

-- ============================================
-- 1. 기본 설정 (초기화)
-- ============================================

-- 기존 테이블 삭제 (주의: 데이터 손실)
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS sources CASCADE;

-- ============================================
-- 2. CATEGORIES 테이블
-- ============================================
/**
 * 게시글의 카테고리를 저장합니다.
 *
 * 구조:
 * - id: 카테고리 고유 ID (자동 증가)
 * - name: 카테고리 이름 (유니크)
 * - icon: 이모지 아이콘
 * - description: 설명
 * - created_at: 생성 시간
 */
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스: 카테고리 이름으로 빠르게 검색
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- 3. SOURCES 테이블
-- ============================================
/**
 * 게시글의 출처(플랫폼)를 저장합니다.
 * 예: Reddit, Hacker News, Medium, Twitter, Naver 등
 *
 * 구조:
 * - id: 출처 고유 ID
 * - name: 출처 이름 (유니크)
 * - url: 출처 웹사이트 URL
 * - icon_emoji: 이모지 아이콘
 * - created_at: 생성 시간
 */
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    url VARCHAR(255),
    icon_emoji VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스: 출처 이름으로 빠르게 검색
CREATE INDEX idx_sources_name ON sources(name);

-- ============================================
-- 4. POSTS 테이블 (핵심)
-- ============================================
/**
 * 게시글의 모든 정보를 저장합니다.
 *
 * 구조:
 * - id: 게시글 고유 ID
 * - title: 제목
 * - excerpt: 미리보기 텍스트
 * - content: 전체 내용 (선택사항)
 * - category_id: 카테고리 (외래키)
 * - source_id: 출처 (외래키)
 * - url: 원본 게시글 링크
 * - likes: 추천수
 * - comments: 댓글수
 * - views: 조회수 (선택사항)
 * - is_trending: 트렌드 여부
 * - tags: 해시태그 (배열)
 * - author: 작성자
 * - created_at: 생성 시간
 * - updated_at: 수정 시간
 */
CREATE TABLE posts (
    -- 기본 정보
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT,
    content TEXT,

    -- 외래키 (다른 테이블과의 연결)
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,

    -- 링크 및 메타데이터
    url VARCHAR(2048),
    author VARCHAR(255),
    tags VARCHAR(255)[],  -- PostgreSQL 배열 타입

    -- 통계
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    comments INTEGER DEFAULT 0 CHECK (comments >= 0),
    views INTEGER DEFAULT 0 CHECK (views >= 0),

    -- 상태
    is_trending BOOLEAN DEFAULT false,

    -- 시간 정보
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 인덱스 생성 (성능 최적화)
-- ============================================

-- posts 테이블 인덱스
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_source_id ON posts(source_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);  -- 최신순 조회에 최적
CREATE INDEX idx_posts_likes ON posts(likes DESC);             -- 추천순 조회에 최적
CREATE INDEX idx_posts_comments ON posts(comments DESC);       -- 댓글순 조회에 최적
CREATE INDEX idx_posts_title ON posts USING GIN (to_tsvector('korean', title));  -- 전문 검색 인덱스

-- ============================================
-- 6. 트리거 (자동 업데이트)
-- ============================================

/**
 * updated_at을 자동으로 업데이트하는 함수
 * 게시글이 수정될 때마다 updated_at이 현재 시간으로 변경됩니다.
 */
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 연결
CREATE TRIGGER trigger_update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_updated_at();

-- ============================================
-- 7. 뷰 (복잡한 쿼리를 단순화)
-- ============================================

/**
 * posts_with_details 뷰
 * 게시글을 카테고리와 출처 정보와 함께 조회합니다.
 *
 * 사용 예:
 * SELECT * FROM posts_with_details WHERE category_name = '기술';
 */
CREATE OR REPLACE VIEW posts_with_details AS
SELECT
    p.id,
    p.title,
    p.excerpt,
    p.likes,
    p.comments,
    p.views,
    p.created_at,
    p.author,
    c.name AS category_name,
    c.icon AS category_icon,
    s.name AS source_name,
    s.icon_emoji AS source_icon,
    p.url
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id
ORDER BY p.created_at DESC;

-- ============================================
-- 8. 권한 설정 (선택사항)
-- ============================================

-- supabase 사용자에게 모든 권한 부여
GRANT ALL PRIVILEGES ON categories TO supabase;
GRANT ALL PRIVILEGES ON sources TO supabase;
GRANT ALL PRIVILEGES ON posts TO supabase;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase;

-- ============================================
-- 9. 주석 (문서화)
-- ============================================

COMMENT ON TABLE categories IS '게시글 카테고리 정보';
COMMENT ON COLUMN categories.id IS '카테고리 고유 ID';
COMMENT ON COLUMN categories.name IS '카테고리 이름 (기술, 뉴스, 연예, 스포츠, 일상)';
COMMENT ON COLUMN categories.icon IS '이모지 아이콘 (💻, 📰, 🎬 등)';

COMMENT ON TABLE sources IS '게시글 출처 정보';
COMMENT ON COLUMN sources.id IS '출처 고유 ID';
COMMENT ON COLUMN sources.name IS '출처 이름 (Reddit, Medium, Twitter 등)';

COMMENT ON TABLE posts IS '게시글 메인 테이블';
COMMENT ON COLUMN posts.id IS '게시글 고유 ID';
COMMENT ON COLUMN posts.title IS '게시글 제목';
COMMENT ON COLUMN posts.category_id IS '카테고리 외래키';
COMMENT ON COLUMN posts.source_id IS '출처 외래키';
COMMENT ON COLUMN posts.likes IS '추천 수 (0 이상)';
COMMENT ON COLUMN posts.comments IS '댓글 수 (0 이상)';
COMMENT ON COLUMN posts.created_at IS '생성 시간';
COMMENT ON COLUMN posts.updated_at IS '마지막 수정 시간 (자동 업데이트)';

-- ============================================
-- 완료 메시지
-- ============================================

\echo '✅ 테이블 생성 완료!'
\echo '다음 단계: seed.sql을 실행하여 샘플 데이터를 삽입하세요.'
