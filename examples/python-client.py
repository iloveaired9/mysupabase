"""
Python 클라이언트 예제
Supabase API를 requests 라이브러리로 사용하는 예제
"""

import requests
import json
from typing import Dict, Any, Optional

SUPABASE_URL = 'http://localhost:8000'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dHBsY3VzdGEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyNzA5MzUzMiwiZXhwIjo4MjcwODkzNTMyfQ.f1cEwVhALbKNNEuULqKT7DcRz6YdCfL3VbzCLBVnklI'


class SupabaseClient:
    def __init__(self, url: str, anon_key: str):
        self.url = url
        self.anon_key = anon_key
        self.access_token: Optional[str] = None

    def _auth_headers(self, include_token: bool = True) -> Dict[str, str]:
        """인증 헤더 생성"""
        headers = {
            'Content-Type': 'application/json',
            'apikey': self.anon_key
        }
        if include_token and self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'
        return headers

    def signup(self, email: str, password: str) -> Dict[str, Any]:
        """사용자 회원가입"""
        response = requests.post(
            f'{self.url}/auth/v1/signup',
            json={'email': email, 'password': password},
            headers=self._auth_headers(include_token=False)
        )
        response.raise_for_status()
        return response.json()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """사용자 로그인"""
        response = requests.post(
            f'{self.url}/auth/v1/token?grant_type=password',
            json={'email': email, 'password': password},
            headers=self._auth_headers(include_token=False)
        )
        response.raise_for_status()
        data = response.json()
        self.access_token = data.get('access_token')
        return data

    def get_user(self) -> Dict[str, Any]:
        """현재 사용자 정보 조회"""
        response = requests.get(
            f'{self.url}/auth/v1/user',
            headers=self._auth_headers()
        )
        response.raise_for_status()
        return response.json()

    def logout(self) -> Dict[str, Any]:
        """로그아웃"""
        response = requests.post(
            f'{self.url}/auth/v1/logout',
            headers=self._auth_headers()
        )
        response.raise_for_status()
        self.access_token = None
        return {'success': True}

    def get_profiles(self) -> list:
        """모든 프로필 조회"""
        response = requests.get(
            f'{self.url}/rest/v1/profiles',
            headers=self._auth_headers()
        )
        response.raise_for_status()
        return response.json()

    def get_profile(self, profile_id: str) -> Dict[str, Any]:
        """특정 프로필 조회"""
        response = requests.get(
            f'{self.url}/rest/v1/profiles?id=eq.{profile_id}',
            headers=self._auth_headers()
        )
        response.raise_for_status()
        data = response.json()
        return data[0] if data else {}

    def create_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """새 프로필 생성"""
        response = requests.post(
            f'{self.url}/rest/v1/profiles',
            json=profile_data,
            headers=self._auth_headers()
        )
        response.raise_for_status()
        data = response.json()
        return data[0] if isinstance(data, list) else data

    def update_profile(self, profile_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """프로필 업데이트"""
        response = requests.patch(
            f'{self.url}/rest/v1/profiles?id=eq.{profile_id}',
            json=profile_data,
            headers=self._auth_headers()
        )
        response.raise_for_status()
        return response.json()

    def delete_profile(self, profile_id: str) -> bool:
        """프로필 삭제"""
        response = requests.delete(
            f'{self.url}/rest/v1/profiles?id=eq.{profile_id}',
            headers=self._auth_headers()
        )
        response.raise_for_status()
        return True


def main():
    """사용 예제"""
    client = SupabaseClient(SUPABASE_URL, ANON_KEY)

    try:
        # 1. 회원가입
        print('1️⃣  회원가입 중...')
        signup_result = client.signup('test@example.com', 'Test123!@#')
        print(f'✅ 회원가입 성공: {signup_result["user"]["email"]}')

        # 2. 로그인
        print('\n2️⃣  로그인 중...')
        login_result = client.login('test@example.com', 'Test123!@#')
        print(f'✅ 로그인 성공: Access Token 받음')

        # 3. 현재 사용자 정보 조회
        print('\n3️⃣  사용자 정보 조회 중...')
        user = client.get_user()
        user_id = user['id']
        print(f'✅ 사용자 ID: {user_id}')
        print(f'✅ 사용자 이메일: {user["email"]}')

        # 4. 프로필 생성
        print('\n4️⃣  프로필 생성 중...')
        new_profile = client.create_profile({
            'username': 'test_user',
            'full_name': 'Test User',
            'bio': 'Python 예제 사용자'
        })
        print(f'✅ 프로필 생성: {new_profile}')

        # 5. 모든 프로필 조회
        print('\n5️⃣  모든 프로필 조회 중...')
        profiles = client.get_profiles()
        print(f'✅ 프로필 개수: {len(profiles)}')
        for profile in profiles:
            print(f'   - {profile.get("username", "N/A")}: {profile.get("full_name", "N/A")}')

        # 6. 프로필 업데이트
        print('\n6️⃣  프로필 업데이트 중...')
        updated = client.update_profile(user_id, {
            'full_name': 'Test User Updated',
            'bio': '업데이트된 바이오'
        })
        print(f'✅ 프로필 업데이트 완료')

        # 7. 로그아웃
        print('\n7️⃣  로그아웃 중...')
        client.logout()
        print('✅ 로그아웃 성공')

    except requests.exceptions.RequestException as e:
        print(f'❌ API 에러: {e.response.text if hasattr(e, "response") else str(e)}')
    except Exception as e:
        print(f'❌ 에러: {str(e)}')


if __name__ == '__main__':
    main()
