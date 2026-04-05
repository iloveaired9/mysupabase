#!/bin/bash

# Supabase API curl 테스트 예제
# 모든 예제는 http://localhost:8000 에 대해 실행됩니다

BASE_URL="http://localhost:8000"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHBsY3VzdGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzA5MzUzMiwiZXhwIjo4MjcwODkzNTMyfQ.f1cEwVhALbKNNEuULqKT7DcRz6YdCfL3VbzCLBVnklI"

echo "=========================================="
echo "🧪 Supabase API 테스트"
echo "=========================================="
echo ""

# 1. 회원가입
echo "1️⃣  회원가입"
echo "=================================================="
echo "curl -X POST $BASE_URL/auth/v1/signup \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"email\": \"test@example.com\","
echo "    \"password\": \"Test123!@#\""
echo "  }'"
echo ""
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/v1/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }')
echo "응답:"
echo $SIGNUP_RESPONSE | python3 -m json.tool 2>/dev/null || echo $SIGNUP_RESPONSE
echo ""

# 2. 로그인
echo "2️⃣  로그인"
echo "=================================================="
echo "curl -X POST '$BASE_URL/auth/v1/token?grant_type=password' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"email\": \"test@example.com\","
echo "    \"password\": \"Test123!@#\""
echo "  }'"
echo ""
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }')
echo "응답:"
echo $LOGIN_RESPONSE | python3 -m json.tool 2>/dev/null || echo $LOGIN_RESPONSE
echo ""

# access_token 추출
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "📝 Access Token: $ACCESS_TOKEN"
echo ""

# 3. 현재 사용자 정보 조회
echo "3️⃣  현재 사용자 정보 조회"
echo "=================================================="
echo "curl -X GET $BASE_URL/auth/v1/user \\"
echo "  -H 'Authorization: Bearer \$ACCESS_TOKEN'"
echo ""
if [ ! -z "$ACCESS_TOKEN" ]; then
  USER_RESPONSE=$(curl -s -X GET $BASE_URL/auth/v1/user \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "응답:"
  echo $USER_RESPONSE | python3 -m json.tool 2>/dev/null || echo $USER_RESPONSE
else
  echo "⚠️  Access Token이 없어서 스킵합니다"
fi
echo ""

# 4. 프로필 목록 조회
echo "4️⃣  프로필 목록 조회"
echo "=================================================="
echo "curl -X GET $BASE_URL/rest/v1/profiles \\"
echo "  -H 'Authorization: Bearer \$ACCESS_TOKEN'"
echo ""
if [ ! -z "$ACCESS_TOKEN" ]; then
  PROFILES_RESPONSE=$(curl -s -X GET $BASE_URL/rest/v1/profiles \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "응답:"
  echo $PROFILES_RESPONSE | python3 -m json.tool 2>/dev/null || echo $PROFILES_RESPONSE
else
  echo "⚠️  Access Token이 없어서 스킵합니다"
fi
echo ""

# 5. 프로필 생성
echo "5️⃣  프로필 생성"
echo "=================================================="
echo "curl -X POST $BASE_URL/rest/v1/profiles \\"
echo "  -H 'Authorization: Bearer \$ACCESS_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"username\": \"test_user\","
echo "    \"full_name\": \"Test User\","
echo "    \"bio\": \"테스트 사용자\""
echo "  }'"
echo ""
if [ ! -z "$ACCESS_TOKEN" ]; then
  CREATE_PROFILE=$(curl -s -X POST $BASE_URL/rest/v1/profiles \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "test_user",
      "full_name": "Test User",
      "bio": "테스트 사용자"
    }')
  echo "응답:"
  echo $CREATE_PROFILE | python3 -m json.tool 2>/dev/null || echo $CREATE_PROFILE
else
  echo "⚠️  Access Token이 없어서 스킵합니다"
fi
echo ""

# 6. 특정 프로필 필터링
echo "6️⃣  특정 사용자명으로 프로필 검색"
echo "=================================================="
echo "curl -X GET '$BASE_URL/rest/v1/profiles?username=eq.test_user' \\"
echo "  -H 'Authorization: Bearer \$ACCESS_TOKEN'"
echo ""
if [ ! -z "$ACCESS_TOKEN" ]; then
  FILTER_RESPONSE=$(curl -s -X GET "$BASE_URL/rest/v1/profiles?username=eq.test_user" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "응답:"
  echo $FILTER_RESPONSE | python3 -m json.tool 2>/dev/null || echo $FILTER_RESPONSE
else
  echo "⚠️  Access Token이 없어서 스킵합니다"
fi
echo ""

echo "=========================================="
echo "✅ 테스트 완료!"
echo "=========================================="
