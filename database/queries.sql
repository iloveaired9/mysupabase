/**
 * Step 3: SQL 쿼리 예제
 *
 * 이 파일은 데이터베이스에서 데이터를 조회하는 다양한 방법을 보여줍니다.
 * 각 쿼리를 실행하여 결과를 확인해보세요.
 *
 * 실행 방법:
 * psql -U supabase -d supabase -f queries.sql
 */

-- ============================================
-- 1. 기본 SELECT 쿼리
-- ============================================

\echo '=== 1. 기본 SELECT: 모든 게시글 조회 (최신순, 상위 5개) ==='
SELECT id, title, likes, comments, created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

\echo ''
\echo '=== 2. 특정 컬럼만 조회 ==='
SELECT id, title, likes
FROM posts
LIMIT 5;

-- ============================================
-- 2. WHERE 조건문
-- ============================================

\echo ''
\echo '=== 3. 카테고리별 조회: 기술(tech) 게시글 ==='
SELECT p.id, p.title, c.name as category, p.likes, p.created_at
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'tech'
ORDER BY p.likes DESC
LIMIT 10;

\echo ''
\echo '=== 4. 조건 필터링: 추천수 1000 이상 ==='
SELECT id, title, likes, comments
FROM posts
WHERE likes > 1000
ORDER BY likes DESC;

\echo ''
\echo '=== 5. 복합 조건: 기술 + 추천수 2000 이상 ==='
SELECT p.id, p.title, c.name, p.likes
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'tech' AND p.likes > 2000
ORDER BY p.likes DESC;

-- ============================================
-- 3. JOIN (테이블 연결)
-- ============================================

\echo ''
\echo '=== 6. JOIN: 게시글 + 카테고리 + 출처 정보 ==='
SELECT
    p.id,
    p.title,
    c.icon || ' ' || c.name as category,
    s.icon_emoji || ' ' || s.name as source,
    p.likes,
    p.comments
FROM posts p
JOIN categories c ON p.category_id = c.id
JOIN sources s ON p.source_id = s.id
LIMIT 10;

\echo ''
\echo '=== 7. LEFT JOIN: 모든 카테고리와 게시글 수 ==='
SELECT
    c.id,
    c.icon || ' ' || c.name as category,
    COUNT(p.id) as post_count
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id, c.name, c.icon
ORDER BY post_count DESC;

-- ============================================
-- 4. ORDER BY (정렬)
-- ============================================

\echo ''
\echo '=== 8. 추천순 정렬: 가장 인기 있는 게시글 ==='
SELECT id, title, likes, comments
FROM posts
ORDER BY likes DESC
LIMIT 10;

\echo ''
\echo '=== 9. 댓글순 정렬: 가장 많은 댓글 ==='
SELECT id, title, comments, likes
FROM posts
ORDER BY comments DESC
LIMIT 10;

\echo ''
\echo '=== 10. 다중 정렬: 추천순 > 댓글순 ==='
SELECT id, title, likes, comments
FROM posts
ORDER BY likes DESC, comments DESC
LIMIT 10;

-- ============================================
-- 5. LIMIT와 OFFSET (페이지네이션)
-- ============================================

\echo ''
\echo '=== 11. 페이지 1 (1-6번) ==='
SELECT id, title, likes
FROM posts
ORDER BY created_at DESC
LIMIT 6
OFFSET 0;

\echo ''
\echo '=== 12. 페이지 2 (7-12번) ==='
SELECT id, title, likes
FROM posts
ORDER BY created_at DESC
LIMIT 6
OFFSET 6;

\echo ''
\echo '=== 13. 페이지 3 (13-18번) ==='
SELECT id, title, likes
FROM posts
ORDER BY created_at DESC
LIMIT 6
OFFSET 12;

-- ============================================
-- 6. DISTINCT (중복 제거)
-- ============================================

\echo ''
\echo '=== 14. 모든 카테고리 이름 (중복 제거) ==='
SELECT DISTINCT c.name
FROM posts p
JOIN categories c ON p.category_id = c.id
ORDER BY c.name;

-- ============================================
-- 7. GROUP BY와 집계 함수
-- ============================================

\echo ''
\echo '=== 15. 카테고리별 통계 ==='
SELECT
    c.name as category,
    COUNT(*) as total_posts,
    AVG(p.likes) as avg_likes,
    MAX(p.likes) as max_likes,
    SUM(p.comments) as total_comments
FROM posts p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY total_posts DESC;

\echo ''
\echo '=== 16. 출처별 평균 추천수 ==='
SELECT
    s.name as source,
    COUNT(*) as post_count,
    ROUND(AVG(p.likes), 2) as avg_likes
FROM posts p
JOIN sources s ON p.source_id = s.id
GROUP BY s.id, s.name
ORDER BY avg_likes DESC;

\echo ''
\echo '=== 17. 시간대별 게시글 수 ==='
SELECT
    DATE(p.created_at) as date,
    COUNT(*) as post_count,
    ROUND(AVG(p.likes), 2) as avg_likes
FROM posts p
GROUP BY DATE(p.created_at)
ORDER BY date DESC
LIMIT 10;

-- ============================================
-- 8. HAVING (GROUP BY 조건)
-- ============================================

\echo ''
\echo '=== 18. 추천수 합계 1000 이상인 카테고리 ==='
SELECT
    c.name as category,
    COUNT(*) as post_count,
    SUM(p.likes) as total_likes
FROM posts p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
HAVING SUM(p.likes) > 1000
ORDER BY total_likes DESC;

-- ============================================
-- 9. UNION (합치기)
-- ============================================

\echo ''
\echo '=== 19. 추천수 상위 5 + 댓글수 상위 5 (중복 제거) ==='
SELECT id, title, likes, 'by_likes' as rank_type
FROM posts
ORDER BY likes DESC
LIMIT 5

UNION

SELECT id, title, comments as likes, 'by_comments' as rank_type
FROM posts
ORDER BY comments DESC
LIMIT 5;

-- ============================================
-- 10. 서브쿼리 (Subquery)
-- ============================================

\echo ''
\echo '=== 20. 평균 추천수보다 높은 게시글 ==='
SELECT id, title, likes
FROM posts
WHERE likes > (
    SELECT AVG(likes) FROM posts
)
ORDER BY likes DESC;

\echo ''
\echo '=== 21. 각 카테고리의 최고 추천수 게시글 ==='
SELECT
    p.id,
    p.title,
    c.name as category,
    p.likes
FROM posts p
JOIN categories c ON p.category_id = c.id
WHERE (p.category_id, p.likes) IN (
    SELECT category_id, MAX(likes)
    FROM posts
    GROUP BY category_id
)
ORDER BY p.likes DESC;

-- ============================================
-- 11. CASE (조건문)
-- ============================================

\echo ''
\echo '=== 22. 인기도 등급 (CASE) ==='
SELECT
    id,
    title,
    likes,
    CASE
        WHEN likes > 4000 THEN '🔥 대인기'
        WHEN likes > 2000 THEN '👍 인기'
        WHEN likes > 1000 THEN '⭐ 중간'
        ELSE '📝 일반'
    END as popularity
FROM posts
ORDER BY likes DESC
LIMIT 15;

-- ============================================
-- 12. TEXT 검색
-- ============================================

\echo ''
\echo '=== 23. 제목에 "AI" 포함된 게시글 ==='
SELECT id, title, likes
FROM posts
WHERE title ILIKE '%AI%'
ORDER BY likes DESC;

\echo ''
\echo '=== 24. 제목에 "Python" 또는 "JavaScript" 포함 ==='
SELECT id, title, likes
FROM posts
WHERE title ILIKE '%Python%' OR title ILIKE '%JavaScript%'
ORDER BY likes DESC;

-- ============================================
-- 13. 날짜 함수
-- ============================================

\echo ''
\echo '=== 25. 최근 24시간 게시글 ==='
SELECT id, title, likes,
    NOW() - created_at as time_ago
FROM posts
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

\echo ''
\echo '=== 26. 요일별 게시글 수 ==='
SELECT
    TO_CHAR(created_at, 'Day') as day_of_week,
    COUNT(*) as post_count
FROM posts
GROUP BY TO_CHAR(created_at, 'Day')
ORDER BY COUNT(*) DESC;

-- ============================================
-- 14. 뷰 활용
-- ============================================

\echo ''
\echo '=== 27. 뷰를 사용한 간편한 조회 ==='
SELECT *
FROM posts_with_details
LIMIT 10;

-- ============================================
-- 15. 통계
-- ============================================

\echo ''
\echo '=== 28. 전체 통계 ==='
SELECT
    COUNT(*) as total_posts,
    ROUND(AVG(likes), 2) as avg_likes,
    MAX(likes) as max_likes,
    MIN(likes) as min_likes,
    SUM(likes) as total_likes,
    ROUND(AVG(comments), 2) as avg_comments,
    MAX(comments) as max_comments
FROM posts;

\echo ''
\echo '=== 29. 트렌딩 게시글 (인기 + 최신순) ==='
SELECT
    id,
    title,
    likes,
    comments,
    created_at,
    (likes + comments * 2) as engagement_score
FROM posts
WHERE is_trending = true
ORDER BY engagement_score DESC
LIMIT 10;

\echo ''
\echo '=== 30. 작성자별 게시글 수 ==='
SELECT
    author,
    COUNT(*) as post_count,
    ROUND(AVG(likes), 2) as avg_likes
FROM posts
WHERE author IS NOT NULL
GROUP BY author
HAVING COUNT(*) > 1
ORDER BY post_count DESC;

-- ============================================
-- 완료
-- ============================================

\echo ''
\echo '✅ 쿼리 예제 실행 완료!'
\echo '지금까지 30가지의 다양한 SQL 쿼리를 학습했습니다.'
\echo ''
\echo '다음 단계: PostgreSQL 관리 도구(pgAdmin)에서 이 쿼리들을 직접 실행해보세요!'
