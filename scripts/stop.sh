#!/bin/bash

# Supabase Docker Stack 중지 스크립트

echo "=========================================="
echo "⛔ Supabase Docker Stack 중지 중..."
echo "=========================================="

docker-compose down

echo "✅ 모든 서비스가 중지되었습니다."
echo ""
echo "💾 데이터는 유지됩니다 (볼륨에 저장됨)"
echo "🗑️  데이터 삭제: ./scripts/reset.sh"
echo ""
