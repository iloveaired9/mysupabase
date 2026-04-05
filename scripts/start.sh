#!/bin/bash

# Supabase Docker Stack 시작 스크립트

set -e

echo "=========================================="
echo "🚀 Supabase Docker Stack 시작 중..."
echo "=========================================="

# .env 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일을 찾을 수 없습니다."
    echo "📋 .env.example을 .env로 복사하세요:"
    echo "   cp .env.example .env"
    exit 1
fi

# Docker Compose 시작
echo "📦 Docker 이미지 빌드 및 서비스 시작..."
docker-compose up -d

# 서비스 상태 확인
echo ""
echo "⏳ 서비스 시작 대기 중... (약 10초)"
sleep 10

echo ""
echo "✅ Supabase Stack이 시작되었습니다!"
echo ""
echo "🌐 접속 정보:"
echo "   - API Gateway:     http://localhost:8000"
echo "   - Auth Service:    http://localhost:9999"
echo "   - PostgreSQL:      localhost:5432"
echo "   - pgAdmin:         http://localhost:5050"
echo "   - MailHog:         http://localhost:8025"
echo ""
echo "📝 로그 확인: ./scripts/logs.sh"
echo "⛔ 중지: ./scripts/stop.sh"
echo ""
