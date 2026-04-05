/**
 * React + Supabase 클라이언트 예제
 *
 * 설치:
 * npm install @supabase/supabase-js
 */

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 초기화
const SUPABASE_URL = 'http://localhost:8000'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHBsY3VzdGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzA5MzUzMiwiZXhwIjo4MjcwODkzNTMyfQ.f1cEwVhALbKNNEuULqKT7DcRz6YdCfL3VbzCLBVnklI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 인증 컴포넌트
export function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      alert('회원가입 성공! 이메일을 확인하세요.')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Supabase 인증</h2>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      <form>
        <div style={{ marginBottom: '15px' }}>
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password123!"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '48%',
            padding: '10px',
            marginRight: '4%',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '처리 중...' : '회원가입'}
        </button>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '48%',
            padding: '10px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '처리 중...' : '로그인'}
        </button>
      </form>
    </div>
  )
}

// 프로필 관리 컴포넌트
export function ProfileManager() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [newProfile, setNewProfile] = useState({
    username: '',
    full_name: '',
    bio: ''
  })

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        fetchProfiles()
      }
    })

    // 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        if (session) {
          fetchProfiles()
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      if (error) throw error
      setProfiles(data)
    } catch (error) {
      console.error('프로필 조회 실패:', error.message)
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    if (!session) return

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([newProfile])
      if (error) throw error
      setNewProfile({ username: '', full_name: '', bio: '' })
      fetchProfiles()
    } catch (error) {
      alert(`프로필 생성 실패: ${error.message}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>프로필 관리</h2>
        <div>
          <p>👤 {session.user.email}</p>
          <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            로그아웃
          </button>
        </div>
      </div>

      <form onSubmit={handleCreateProfile} style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
        <h3>새 프로필 생성</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>사용자명:</label>
          <input
            type="text"
            value={newProfile.username}
            onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
            placeholder="john_doe"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>이름:</label>
          <input
            type="text"
            value={newProfile.full_name}
            onChange={(e) => setNewProfile({ ...newProfile, full_name: e.target.value })}
            placeholder="John Doe"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>자기소개:</label>
          <textarea
            value={newProfile.bio}
            onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
            placeholder="내 소개를 입력하세요"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
          생성
        </button>
      </form>

      <div>
        <h3>프로필 목록 ({profiles.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {profiles.map((profile) => (
            <div key={profile.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h4>{profile.full_name || profile.username}</h4>
              <p><strong>사용자명:</strong> {profile.username}</p>
              <p><strong>자기소개:</strong> {profile.bio || 'N/A'}</p>
              <p style={{ fontSize: '12px', color: '#999' }}>생성일: {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 메인 앱
export default function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>🚀 Supabase React 예제</h1>
      <ProfileManager />
    </div>
  )
}
