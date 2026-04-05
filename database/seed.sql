/**
 * Step 3: 샘플 데이터 삽입
 *
 * 이 파일은 다음을 수행합니다:
 * 1. 카테고리 데이터 삽입 (6개)
 * 2. 출처 데이터 삽입 (7개)
 * 3. 게시글 데이터 삽입 (50개)
 *
 * 실행 방법:
 * psql -U supabase -d supabase -f seed.sql
 */

-- ============================================
-- 1. 카테고리 데이터 삽입
-- ============================================

TRUNCATE categories CASCADE;

INSERT INTO categories (name, icon, description) VALUES
('tech', '💻', '기술, 프로그래밍, AI, 클라우드 관련'),
('news', '📰', '뉴스, 정치, 경제 관련'),
('entertainment', '🎬', '영화, 음악, 연예 관련'),
('sports', '⚽', '스포츠, 경기, 선수 관련'),
('life', '🏠', '일상, 생활, 건강 관련');

-- 확인
\echo '✅ 카테고리 삽입 완료'
SELECT COUNT(*) as category_count FROM categories;

-- ============================================
-- 2. 출처 데이터 삽입
-- ============================================

TRUNCATE sources CASCADE;

INSERT INTO sources (name, url, icon_emoji, description) VALUES
('Reddit', 'https://reddit.com', '🔴', '온라인 커뮤니티'),
('Hacker News', 'https://news.ycombinator.com', '⬜', '개발자 커뮤니티'),
('Medium', 'https://medium.com', '📝', '블로그 플랫폼'),
('Twitter', 'https://twitter.com', '🐦', '소셜 미디어'),
('Naver', 'https://naver.com', '🟢', '한국 포털'),
('ESPN', 'https://espn.com', '📺', '스포츠 뉴스'),
('BBC', 'https://bbc.com', '📻', '국제 뉴스');

-- 확인
\echo '✅ 출처 삽입 완료'
SELECT COUNT(*) as source_count FROM sources;

-- ============================================
-- 3. 게시글 데이터 삽입 (50개)
-- ============================================

TRUNCATE posts CASCADE;

INSERT INTO posts (title, excerpt, category_id, source_id, url, author, likes, comments, views, is_trending, created_at) VALUES

-- 기술 관련 (12개)
('혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정', '새로운 AI 모델이 출시되면서 기술 산업에 큰 변화가 예상되고 있습니다.', 1, 1, 'https://reddit.com/r/technology', 'tech_enthusiast', 1245, 342, 8932, true, NOW() - INTERVAL '2 hours'),
('오픈소스 커뮤니티가 선택한 올해의 최고 프로젝트들', '2024년 오픈소스 커뮤니티를 뜨겁게 달군 프로젝트들을 소개합니다.', 1, 2, 'https://news.ycombinator.com', 'dev_guru', 4567, 890, 23451, true, NOW() - INTERVAL '6 hours'),
('클라우드 컴퓨팅의 미래는 어디로 향할까?', '클라우드 기술이 계속 진화하면서 새로운 가능성들이 열리고 있습니다.', 1, 3, 'https://medium.com', 'cloud_architect', 2345, 456, 12345, false, NOW() - INTERVAL '7 hours'),
('차세대 웹 기술 동향 분석', 'Web3, AI, 실시간 통신 등 새로운 웹 기술들이 빠르게 발전하고 있습니다.', 1, 2, 'https://news.ycombinator.com', 'web_dev', 3789, 567, 15678, true, NOW() - INTERVAL '12 hours'),
('Python vs JavaScript: 2024년의 선택', '가장 인기 있는 두 언어의 최신 비교 분석입니다.', 1, 1, 'https://reddit.com/r/programming', 'lang_expert', 2156, 423, 9876, false, NOW() - INTERVAL '18 hours'),
('마이크로서비스 아키텍처 완벽 가이드', '확장 가능한 시스템을 구축하기 위한 실용적인 팁들입니다.', 1, 3, 'https://medium.com', 'systems_arch', 1876, 345, 8765, false, NOW() - INTERVAL '24 hours'),
('DevOps 엔지니어가 반드시 알아야 할 도구들', '2024년에 주목해야 할 DevOps 도구들을 정리했습니다.', 1, 2, 'https://news.ycombinator.com', 'devops_pro', 2341, 478, 11234, true, NOW() - INTERVAL '30 hours'),
('머신러닝 모델 배포의 함정과 해결책', '프로덕션 환경에서의 ML 배포 시 주의사항들입니다.', 1, 3, 'https://medium.com', 'ml_engineer', 1987, 321, 7654, false, NOW() - INTERVAL '36 hours'),
('암호화폐와 블록체인: 기술의 현재와 미래', '새로운 금융 기술의 발전 방향을 분석했습니다.', 1, 1, 'https://reddit.com/r/cryptocurrency', 'blockchain_dev', 3456, 789, 19876, true, NOW() - INTERVAL '42 hours'),
('사이버 보안: 2024년 위협 예측', '올해 주목해야 할 보안 위협들을 정리했습니다.', 1, 4, 'https://twitter.com', 'security_expert', 2876, 512, 13245, true, NOW() - INTERVAL '48 hours'),
('Docker & Kubernetes 실전 가이드', '컨테이너 기술의 완벽한 이해와 활용법입니다.', 1, 2, 'https://news.ycombinator.com', 'container_pro', 2145, 398, 10234, false, NOW() - INTERVAL '54 hours'),
('API 설계의 모범 사례', 'RESTful API를 올바르게 설계하는 방법을 배웁니다.', 1, 3, 'https://medium.com', 'api_designer', 1654, 278, 8123, false, NOW() - INTERVAL '60 hours'),

-- 뉴스 관련 (10개)
('세계 경제 전문가들 내년 경기 회복 전망 제시', '국제경제기구가 내년 경기 회복을 전망했습니다.', 2, 6, 'https://bbc.com', 'economist', 892, 234, 5432, false, NOW() - INTERVAL '4 hours'),
('환경 보호를 위한 새로운 정책 발표', '정부가 환경 보호를 위한 혁신적인 정책들을 발표했습니다.', 2, 5, 'https://naver.com', 'policy_expert', 1876, 345, 9876, true, NOW() - INTERVAL '8 hours'),
('글로벌 기업들의 한국 진출 전략', '세계 주요 기업들이 한국 시장을 어떻게 공략하고 있는지 분석했습니다.', 2, 5, 'https://naver.com', 'market_analyst', 1567, 289, 7654, false, NOW() - INTERVAL '14 hours'),
('국제 무역 분쟁의 해결책 모색', '글로벌 경제 불균형을 어떻게 해결할 것인가?', 2, 6, 'https://bbc.com', 'trade_expert', 1234, 198, 5432, false, NOW() - INTERVAL '20 hours'),
('에너지 위기 시대의 새로운 해법', '재생 에너지의 확대가 전 세계적으로 가속화되고 있습니다.', 2, 6, 'https://bbc.com', 'energy_analyst', 2345, 423, 10987, true, NOW() - INTERVAL '26 hours'),
('팬데믹 이후 보건 시스템의 변화', '전 세계 보건 시스템이 새로운 방향으로 변모하고 있습니다.', 2, 6, 'https://bbc.com', 'health_expert', 1456, 267, 6543, false, NOW() - INTERVAL '32 hours'),
('교육 현장의 디지털 전환', '온라인 교육의 성장과 미래 교육의 모습입니다.', 2, 5, 'https://naver.com', 'edu_specialist', 1876, 312, 8765, true, NOW() - INTERVAL '38 hours'),
('인구 감소 시대의 사회 정책', '저출산 시대에 필요한 정책들을 모색합니다.', 2, 5, 'https://naver.com', 'sociologist', 987, 156, 4321, false, NOW() - INTERVAL '44 hours'),
('국제 분쟁과 평화 협상', '현안이 되고 있는 국제 분쟁의 해법을 찾습니다.', 2, 6, 'https://bbc.com', 'diplomat', 1654, 298, 7123, true, NOW() - INTERVAL '50 hours'),
('기술이 바꾸는 미디어 산업', '언론과 미디어의 미래를 예측합니다.', 2, 4, 'https://twitter.com', 'media_expert', 1432, 234, 6789, false, NOW() - INTERVAL '56 hours'),

-- 연예 관련 (10개)
('유명 배우의 깜짝 영화 출연 발표로 팬들 열광', '전 국민의 사랑을 받은 배우가 새로운 영화 출연을 발표했습니다.', 3, 5, 'https://naver.com', 'entertainment_news', 2891, 758, 14321, true, NOW() - INTERVAL '3 hours'),
('올림픽 신기록이 속속 깨지는 이유', '과학과 기술의 발전으로 신기록이 계속 나오고 있습니다.', 3, 6, 'https://espn.com', 'sports_analyst', 2234, 398, 9876, true, NOW() - INTERVAL '9 hours'),
('음악 스트리밍 서비스의 새로운 변화', '음악 업계를 장악한 스트리밍 서비스가 새 기능을 추가합니다.', 3, 4, 'https://twitter.com', 'music_critic', 1998, 401, 8765, false, NOW() - INTERVAL '15 hours'),
('유명 셀럽들의 의외의 취미생활 공개', '평소에 알려지지 않았던 셀럽들의 숨은 취미들입니다.', 3, 4, 'https://twitter.com', 'celebrity_news', 4123, 892, 19876, true, NOW() - INTERVAL '21 hours'),
('영화제에서 본 올해의 최고 영화들', '국제 영화제에서 선보인 최고의 작품들을 소개합니다.', 3, 3, 'https://medium.com', 'film_critic', 1876, 345, 9123, true, NOW() - INTERVAL '27 hours'),
('드라마 시청률 급상승의 비결', '올해 인기 드라마들의 성공 요소를 분석했습니다.', 3, 5, 'https://naver.com', 'drama_expert', 2145, 456, 10987, false, NOW() - INTERVAL '33 hours'),
('K-POP 아이돌의 글로벌 진출 현황', 'K-POP이 전 세계적으로 인기를 얻고 있습니다.', 3, 4, 'https://twitter.com', 'kpop_fan', 3456, 678, 16543, true, NOW() - INTERVAL '39 hours'),
('영화 산업의 AI 활용 사례들', '인공지능이 영화 제작에 어떻게 사용되고 있나요?', 3, 1, 'https://reddit.com', 'film_tech', 1567, 289, 7654, false, NOW() - INTERVAL '45 hours'),
('연기파 배우들의 역할 분석', '명배우들의 연기 변화와 성장을 살펴봅니다.', 3, 3, 'https://medium.com', 'acting_coach', 987, 178, 5432, false, NOW() - INTERVAL '51 hours'),
('연예계의 SNS 트렌드', '셀럽들이 주도하는 소셜 미디어 트렌드를 분석합니다.', 3, 4, 'https://twitter.com', 'social_expert', 2341, 512, 11234, true, NOW() - INTERVAL '57 hours'),

-- 스포츠 관련 (10개)
('국가대표팀 예상 밖의 역대급 승리로 국민 들썩', '국가대표팀이 세계 강호를 상대로 역대급 승리를 거뒀습니다.', 4, 6, 'https://espn.com', 'sports_reporter', 5432, 1200, 32145, true, NOW() - INTERVAL '1 hour'),
('스포츠 역사상 가장 감동적인 경기 순간들', '세계 스포츠 역사에 기록된 감동적인 순간들을 모아봤습니다.', 4, 6, 'https://espn.com', 'sports_historian', 3456, 678, 17654, true, NOW() - INTERVAL '10 hours'),
('축구 선수의 연봉 논쟁', '프로 운동선수의 급여 체계에 대한 논쟁입니다.', 4, 6, 'https://espn.com', 'sports_analyst', 1876, 398, 9123, false, NOW() - INTERVAL '16 hours'),
('올림픽 선수들의 훈련 비결', '금메달리스트들의 성공 전략을 공개합니다.', 4, 6, 'https://espn.com', 'coach_expert', 2345, 456, 11234, true, NOW() - INTERVAL '22 hours'),
('여성 스포츠의 성장과 미래', '여성 스포츠 산업이 급속도로 성장하고 있습니다.', 4, 4, 'https://twitter.com', 'gender_equality', 2987, 512, 13456, true, NOW() - INTERVAL '28 hours'),
('스포츠 과학의 최신 발전', '과학이 스포츠 성능을 어떻게 향상시키나요?', 4, 2, 'https://news.ycombinator.com', 'sports_scientist', 1654, 278, 7543, false, NOW() - INTERVAL '34 hours'),
('마라톤 선수들의 영양 관리', '최고의 성능을 위한 영양 전략입니다.', 4, 3, 'https://medium.com', 'nutrition_expert', 1432, 234, 6789, false, NOW() - INTERVAL '40 hours'),
('프로 선수의 부상 예방과 관리', '선수들이 어떻게 부상을 관리하나요?', 4, 3, 'https://medium.com', 'sports_doctor', 1876, 312, 8765, true, NOW() - INTERVAL '46 hours'),
('경기력을 높이는 정신력 훈련', '심리학이 스포츠에 미치는 영향입니다.', 4, 3, 'https://medium.com', 'sports_psychologist', 1234, 198, 5432, false, NOW() - INTERVAL '52 hours'),
('국제 스포츠 정치의 현황', '스포츠와 정치의 얽힌 관계를 분석합니다.', 4, 6, 'https://bbc.com', 'political_analyst', 1565, 287, 7123, false, NOW() - INTERVAL '58 hours'),

-- 일상 관련 (8개)
('생산성을 높이는 5가지 간단한 습관', '성공한 사람들의 공통점은 무엇일까요?', 5, 3, 'https://medium.com', 'productivity_coach', 3120, 567, 15432, true, NOW() - INTERVAL '5 hours'),
('홈 오피스 최적화 가이드', '재택근무의 생산성을 높이기 위한 환경 구성 방법입니다.', 5, 3, 'https://medium.com', 'home_office_expert', 2567, 432, 12345, true, NOW() - INTERVAL '11 hours'),
('명상과 마음챙김의 과학', '과학이 증명한 명상의 효과입니다.', 5, 3, 'https://medium.com', 'mindfulness_teacher', 1876, 321, 8765, false, NOW() - INTERVAL '17 hours'),
('건강한 식습관 형성하기', '올바른 식습관의 중요성과 실행 방법입니다.', 5, 3, 'https://medium.com', 'nutritionist', 2234, 398, 9876, true, NOW() - INTERVAL '23 hours'),
('운동과 웰빙의 관계', '규칙적인 운동이 삶의 질을 어떻게 개선하나요?', 5, 3, 'https://medium.com', 'fitness_trainer', 1987, 356, 7654, false, NOW() - INTERVAL '29 hours'),
('일과 삶의 균형 찾기', '워라밸(Work-Life Balance)의 중요성을 살펴봅니다.', 5, 3, 'https://medium.com', 'life_coach', 2341, 412, 10234, true, NOW() - INTERVAL '35 hours'),
('스트레스 관리의 실전 기법', '일상의 스트레스에 대처하는 방법들입니다.', 5, 3, 'https://medium.com', 'therapist', 1654, 278, 7123, false, NOW() - INTERVAL '41 hours'),
('행복의 심리학', '행복하게 살기 위한 과학적 근거들입니다.', 5, 3, 'https://medium.com', 'happiness_expert', 2876, 489, 12456, true, NOW() - INTERVAL '47 hours');

-- 확인
\echo '✅ 게시글 삽입 완료'
SELECT COUNT(*) as post_count FROM posts;
SELECT
    (SELECT COUNT(*) FROM categories) as categories,
    (SELECT COUNT(*) FROM sources) as sources,
    (SELECT COUNT(*) FROM posts) as posts;

-- ============================================
-- 4. 통계 조회
-- ============================================

\echo ''
\echo '=== 카테고리별 게시글 수 ==='
SELECT c.name, c.icon, COUNT(p.id) as post_count
FROM categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id, c.name, c.icon
ORDER BY post_count DESC;

\echo ''
\echo '=== 출처별 게시글 수 ==='
SELECT s.name, COUNT(p.id) as post_count
FROM sources s
LEFT JOIN posts p ON s.id = p.source_id
GROUP BY s.id, s.name
ORDER BY post_count DESC;

\echo ''
\echo '=== 추천수 상위 10개 게시글 ==='
SELECT id, title, likes, comments FROM posts
ORDER BY likes DESC
LIMIT 10;

\echo '✅ 샘플 데이터 삽입 완료!'
\echo '다음 단계: queries.sql을 실행하여 유용한 쿼리들을 학습하세요.'
