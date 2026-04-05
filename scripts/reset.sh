#!/bin/bash

# Supabase Docker Stack 데이터 리셋 스크립트

set -e

echo "=========================================="
echo "🗑️  데이터베이스 및 볼륨 초기화 중..."
echo "=========================================="
echo ""
echo "⚠️  경고: 모든 데이터가 삭제됩니다!"
read -p "정말로 계속하시겠습니까? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "취소됨"
    exit 0
fi

echo ""
echo "중지 중..."
docker-compose down

echo "🗑️  볼륨 삭제 중..."
docker volume rm supabase_postgres-data 2>/dev/null || echo "   postgres-data 볼륨을 찾을 수 없습니다"
docker volume rm supabase_pgadmin-data 2>/dev/null || echo "   pgadmin-data 볼륨을 찾을 수 없습니다"

echo ""
echo "🚀 새로운 데이터베이스로 시작 중..."
docker-compose up -d

echo ""
echo "⏳ 서비스 시작 대기 중... (약 10초)"
sleep 10

echo ""
echo "✅ 데이터베이스가 초기화되었습니다!"
echo ""
echo "🌐 접속 정보:"
echo "   - API Gateway:     http://localhost:8000"
echo "   - Auth Service:    http://localhost:9999"
echo "   - PostgreSQL:      localhost:5432"
echo "   - pgAdmin:         http://localhost:5050"
echo ""
