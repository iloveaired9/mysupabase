#!/bin/bash

# Supabase Docker Stack 로그 조회 스크립트

if [ -z "$1" ]; then
    echo "=========================================="
    echo "📋 Supabase 서비스 로그"
    echo "=========================================="
    echo ""
    echo "사용법: ./scripts/logs.sh [서비스명] [옵션]"
    echo ""
    echo "서비스명:"
    echo "  all       - 모든 서비스 로그 (기본값)"
    echo "  postgres  - PostgreSQL 로그"
    echo "  auth      - Auth(GoTrue) 로그"
    echo "  kong      - Kong API Gateway 로그"
    echo "  mailhog   - MailHog 메일 서버 로그"
    echo "  pgadmin   - pgAdmin 로그"
    echo ""
    echo "옵션:"
    echo "  -f        - 실시간 로그 (tail -f)"
    echo "  -n NUM    - 최근 NUM개 줄 표시 (기본값: 50)"
    echo ""
    echo "예시:"
    echo "  ./scripts/logs.sh all -f"
    echo "  ./scripts/logs.sh postgres -n 100"
    echo "  ./scripts/logs.sh auth -f"
    echo ""

    # 기본값: 모든 서비스의 최근 로그 표시
    docker-compose logs --tail=50 postgres auth kong mailhog pgadmin
    exit 0
fi

SERVICE=$1
shift
OPTIONS="$@"

case $SERVICE in
    all)
        docker-compose logs $OPTIONS postgres auth kong mailhog pgadmin
        ;;
    postgres)
        docker-compose logs $OPTIONS postgres
        ;;
    auth)
        docker-compose logs $OPTIONS auth
        ;;
    kong)
        docker-compose logs $OPTIONS kong
        ;;
    mailhog)
        docker-compose logs $OPTIONS mailhog
        ;;
    pgadmin)
        docker-compose logs $OPTIONS pgadmin
        ;;
    *)
        echo "❌ 알 수 없는 서비스: $SERVICE"
        echo ""
        echo "사용 가능한 서비스: all, postgres, auth, kong, mailhog, pgadmin"
        exit 1
        ;;
esac
