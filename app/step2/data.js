/**
 * Mock 데이터셋 - Step 2
 *
 * 이 파일은 가짜 데이터(Mock Data)를 제공합니다.
 * Step 3에서는 실제 데이터베이스에서 가져올 것입니다.
 *
 * 데이터 구조:
 * {
 *   id: 게시글 고유 ID,
 *   title: 제목,
 *   excerpt: 미리보기 텍스트,
 *   category: 카테고리 (tech, news, entertainment, sports, life),
 *   likes: 추천수,
 *   comments: 댓글수,
 *   source: 출처 (reddit, hacker-news, medium, twitter, naver),
 *   url: 외부 링크,
 *   createdAt: 생성 시간 (ISO 8601 형식)
 * }
 */

const MOCK_POSTS = [
    {
        id: 1,
        title: "혁신적인 AI 모델이 2024년 기술 판도를 바꿀 예정",
        excerpt: "새로운 AI 모델이 출시되면서 기술 산업에 큰 변화가 예상되고 있습니다. 전문가들은 이것이 게임체인저가 될 것이라고 평가하고 있습니다.",
        category: "tech",
        likes: 1245,
        comments: 342,
        source: "reddit",
        url: "#",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 2,
        title: "유명 배우의 깜짝 영화 출연 발표로 팬들 열광",
        excerpt: "전 국민의 사랑을 받은 배우가 예상치 못한 영화 출연을 발표해 팬들이 환호하고 있습니다. 영화 개봉은 내년 상반기 예정입니다.",
        category: "entertainment",
        likes: 2891,
        comments: 758,
        source: "naver",
        url: "#",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 3,
        title: "국가대표팀 예상 밖의 역대급 승리로 국민 들썩",
        excerpt: "국가대표팀이 세계 강호를 상대로 역대급 승리를 거두었습니다. 경기 후 선수들의 모습과 팬들의 반응이 화제입니다.",
        category: "sports",
        likes: 5432,
        comments: 1200,
        source: "espn",
        url: "#",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 4,
        title: "세계 경제 전문가들 내년 경기 회복 전망 제시",
        excerpt: "국제경제기구가 내년 경기 회복을 전망했습니다. 전문가들은 긍정적인 신호들이 나타나고 있다고 분석합니다.",
        category: "news",
        likes: 892,
        comments: 234,
        source: "bbc",
        url: "#",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 5,
        title: "생산성을 높이는 5가지 간단한 습관",
        excerpt: "성공한 사람들의 공통점은 무엇일까요? 오늘은 일상 생산성을 높이는 실용적인 팁들을 소개합니다.",
        category: "life",
        likes: 3120,
        comments: 567,
        source: "medium",
        url: "#",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 6,
        title: "오픈소스 커뮤니티가 선택한 올해의 최고 프로젝트들",
        excerpt: "2024년 오픈소스 커뮤니티를 뜨겁게 달군 프로젝트들을 소개합니다. 개발자들에게 큰 도움이 될 것들입니다.",
        category: "tech",
        likes: 4567,
        comments: 890,
        source: "hacker-news",
        url: "#",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 7,
        title: "클라우드 컴퓨팅의 미래는 어디로 향할까?",
        excerpt: "클라우드 기술이 계속 진화하면서 새로운 가능성들이 열리고 있습니다. 업계 리더들의 견해를 정리했습니다.",
        category: "tech",
        likes: 2345,
        comments: 456,
        source: "medium",
        url: "#",
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 8,
        title: "스포츠 역사상 가장 감동적인 경기 순간들",
        excerpt: "세계 스포츠 역사에 기록된 감동적인 순간들을 모아봤습니다. 이들은 영원히 우리 마음에 남을 것입니다.",
        category: "sports",
        likes: 3456,
        comments: 678,
        source: "espn",
        url: "#",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 9,
        title: "유명 셀럽들의 의외의 취미생활 공개",
        excerpt: "평소에 알려지지 않았던 셀럽들의 숨은 취미들이 공개되면서 팬들의 반응이 뜨겁습니다.",
        category: "entertainment",
        likes: 4123,
        comments: 892,
        source: "twitter",
        url: "#",
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 10,
        title: "환경 보호를 위한 새로운 정책 발표",
        excerpt: "정부가 환경 보호를 위한 혁신적인 정책들을 발표했습니다. 전문가들의 평가를 들어봤습니다.",
        category: "news",
        likes: 1876,
        comments: 345,
        source: "bbc",
        url: "#",
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 11,
        title: "홈 오피스 최적화 가이드",
        excerpt: "재택근무의 생산성을 높이기 위한 환경 구성 방법을 소개합니다. 간단한 변화로 큰 효과를 볼 수 있습니다.",
        category: "life",
        likes: 2567,
        comments: 432,
        source: "medium",
        url: "#",
        createdAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 12,
        title: "차세대 웹 기술 동향 분석",
        excerpt: "Web3, AI, 실시간 통신 등 새로운 웹 기술들이 빠르게 발전하고 있습니다. 앞으로의 동향을 예측해봅시다.",
        category: "tech",
        likes: 3789,
        comments: 567,
        source: "hacker-news",
        url: "#",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 13,
        title: "올림픽 신기록이 속속 깨지는 이유",
        excerpt: "과학과 기술의 발전으로 올림픽에서 신기록이 계속 나오고 있습니다. 그 배경을 알아봅시다.",
        category: "sports",
        likes: 2234,
        comments: 398,
        source: "espn",
        url: "#",
        createdAt: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 14,
        title: "음악 스트리밍 서비스의 새로운 변화",
        excerpt: "음악 업계를 장악한 스트리밍 서비스가 새로운 기능들을 추가하고 있습니다. 사용자 경험이 어떻게 달라질까요?",
        category: "entertainment",
        likes: 1998,
        comments: 401,
        source: "reddit",
        url: "#",
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 15,
        title: "글로벌 기업들의 한국 진출 전략",
        excerpt: "세계 주요 기업들이 한국 시장을 어떻게 공략하고 있는지 분석해봅시다. 한국만의 경쟁력은 무엇일까요?",
        category: "news",
        likes: 1567,
        comments: 289,
        source: "naver",
        url: "#",
        createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
    }
];

/**
 * 카테고리 정보
 * 각 카테고리의 이름과 한국어 표시를 정의합니다.
 */
const CATEGORIES = {
    all: { name: "전체", icon: "📌" },
    tech: { name: "기술", icon: "💻" },
    news: { name: "뉴스", icon: "📰" },
    entertainment: { name: "연예", icon: "🎬" },
    sports: { name: "스포츠", icon: "⚽" },
    life: { name: "일상", icon: "🏠" }
};

/**
 * 출처 정보
 * 각 출처의 이름과 표시 방식을 정의합니다.
 */
const SOURCES = {
    "reddit": "Reddit",
    "hacker-news": "Hacker News",
    "medium": "Medium",
    "twitter": "Twitter",
    "naver": "Naver",
    "espn": "ESPN",
    "bbc": "BBC"
};

/**
 * 상수: 페이지당 게시글 수
 */
const POSTS_PER_PAGE = 6;

/**
 * 상수: 정렬 옵션
 */
const SORT_OPTIONS = {
    latest: "최신순",
    likes: "추천순",
    comments: "댓글순"
};
