/**
 * JavaScript 클라이언트 예제
 * Supabase API를 직접 사용한 기본 예제
 */

const SUPABASE_URL = 'http://localhost:8000'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHBsY3VzdGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzA5MzUzMiwiZXhwIjo4MjcwODkzNTMyfQ.f1cEwVhALbKNNEuULqKT7DcRz6YdCfL3VbzCLBVnklI'

// 인증 API 호출 함수
async function signup(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    throw new Error(`Signup failed: ${response.statusText}`)
  }

  return response.json()
}

async function login(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`)
  }

  return response.json()
}

async function getCurrentUser(accessToken) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Get user failed: ${response.statusText}`)
  }

  return response.json()
}

async function logout(accessToken) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Logout failed: ${response.statusText}`)
  }

  return { success: true }
}

// 데이터베이스 API 호출 함수
async function fetchProfiles(accessToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Fetch profiles failed: ${response.statusText}`)
  }

  return response.json()
}

async function createProfile(accessToken, profileData) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  })

  if (!response.ok) {
    throw new Error(`Create profile failed: ${response.statusText}`)
  }

  return response.json()
}

async function updateProfile(accessToken, userId, profileData) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  })

  if (!response.ok) {
    throw new Error(`Update profile failed: ${response.statusText}`)
  }

  return response.json()
}

async function deleteProfile(accessToken, userId) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Delete profile failed: ${response.statusText}`)
  }

  return { success: true }
}

// 사용 예제
async function main() {
  try {
    // 1. 회원가입
    console.log('1️⃣  회원가입 중...')
    const signupResult = await signup('test@example.com', 'Test123!@#')
    console.log('✅ 회원가입 성공:', signupResult)

    // 2. 로그인
    console.log('\n2️⃣  로그인 중...')
    const loginResult = await login('test@example.com', 'Test123!@#')
    console.log('✅ 로그인 성공')
    const accessToken = loginResult.access_token

    // 3. 현재 사용자 정보 조회
    console.log('\n3️⃣  사용자 정보 조회 중...')
    const user = await getCurrentUser(accessToken)
    console.log('✅ 사용자 정보:', user)

    // 4. 프로필 생성
    console.log('\n4️⃣  프로필 생성 중...')
    const newProfile = await createProfile(accessToken, {
      username: 'test_user',
      full_name: 'Test User',
      bio: 'JavaScript 예제 사용자'
    })
    console.log('✅ 프로필 생성:', newProfile)

    // 5. 모든 프로필 조회
    console.log('\n5️⃣  모든 프로필 조회 중...')
    const profiles = await fetchProfiles(accessToken)
    console.log('✅ 프로필 목록:', profiles)

    // 6. 프로필 업데이트
    console.log('\n6️⃣  프로필 업데이트 중...')
    const updatedProfile = await updateProfile(accessToken, user.id, {
      full_name: 'Test User Updated',
      bio: '업데이트된 바이오'
    })
    console.log('✅ 프로필 업데이트:', updatedProfile)

    // 7. 로그아웃
    console.log('\n7️⃣  로그아웃 중...')
    await logout(accessToken)
    console.log('✅ 로그아웃 성공')

  } catch (error) {
    console.error('❌ 에러:', error.message)
  }
}

// Node.js 환경에서 실행 시
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    signup,
    login,
    getCurrentUser,
    logout,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile
  }

  // main()
}
