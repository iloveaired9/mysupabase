# 🪟 Windows 11 Pro 설치 가이드

## 목차
1. [개요](#개요)
2. [시스템 요구사항](#시스템-요구사항)
3. [Step 1: 필수 소프트웨어 설치](#step-1-필수-소프트웨어-설치)
4. [Step 2: Docker Desktop 설치](#step-2-docker-desktop-설치)
5. [Step 3: Git 설정](#step-3-git-설정)
6. [Step 4: 프로젝트 클론 및 실행](#step-4-프로젝트-클론-및-실행)
7. [Step 5: 개발 환경 확인](#step-5-개발-환경-확인)
8. [문제 해결 (Troubleshooting)](#문제-해결-troubleshooting)

---

## 개요

이 가이드는 **Windows 11 Pro**에서 mysupabase 프로젝트를 처음부터 설정하는 방법을 설명합니다.

### 최종 결과
```
✅ Docker 기반 다중 서비스 실행
✅ PostgreSQL 데이터베이스 활성
✅ PostgREST REST API 생성
✅ Swagger UI로 API 문서 조회
✅ 개발 환경 완벽 구성
```

---

## 시스템 요구사항

### 필수 사항

```
Windows 11 Pro (홈 에디션 불가)
├─ 프로세서: Intel/AMD x64 듀얼 코어 이상
├─ RAM: 8GB 이상 (권장: 16GB)
├─ SSD: 50GB 이상 여유 공간
├─ BIOS: 가상화(Hyper-V) 지원 활성화
└─ 인터넷: 설치 파일 다운로드 필요
```

### 설치할 소프트웨어

| 소프트웨어 | 버전 | 용도 |
|-----------|------|------|
| Docker Desktop | 최신 | 컨테이너 실행 |
| Git for Windows | 최신 | 버전 관리 |
| VS Code | 최신 (선택) | 코드 편집기 |
| Node.js | v18+ (선택) | JavaScript 런타임 |

---

## Step 1: 필수 소프트웨어 설치

### 1️⃣ Hyper-V 활성화 (필수!)

Docker Desktop은 **Hyper-V**를 필요로 합니다.

**방법 A: 설정 앱 통해 활성화**

```
1. Windows + S 키 → "제어판" 검색
2. "프로그램" → "프로그램 및 기능"
3. 좌측 "Windows 기능 켜기/끄기" 클릭
4. "Hyper-V" 체크박스 활성화
5. "확인" 클릭 → 컴퓨터 재부팅
```

**방법 B: PowerShell로 활성화 (빠름)**

```powershell
# PowerShell을 관리자 권한으로 실행
# (Windows + X → Windows PowerShell(관리자) 선택)

Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# 재부팅 메시지 나타나면 Y 입력
```

**확인 방법**:
```powershell
# 다음 명령어 실행
wmic os get virtualization capabilities

# 출력 예시:
# VirtualizationCapabilities
# 8
# (8 = Hyper-V 지원됨)
```

### 2️⃣ Git for Windows 설치

**공식 웹사이트에서 다운로드:**
https://git-scm.com/download/win

**설치 단계:**
```
1. 다운로드한 .exe 파일 실행
2. "Install" 클릭
3. 설치 경로: 기본값 유지
   C:\Program Files\Git
4. 설치 완료 → "Finish" 클릭
```

**설치 확인:**
```powershell
# PowerShell 또는 명령 프롬프트 열기
git --version

# 예상 출력:
# git version 2.45.0.windows.1
```

**Git 사용자 설정:**
```powershell
# 처음 사용하면 설정 필요
git config --global user.name "홍길동"
git config --global user.email "hong@example.com"

# 확인
git config --global user.name
git config --global user.email
```

### 3️⃣ VS Code 설치 (선택사항)

**공식 웹사이트에서 다운로드:**
https://code.visualstudio.com/Download

**추천 확장 프로그램:**
- Docker
- PostgreSQL
- REST Client
- Markdown Preview Enhanced

---

## Step 2: Docker Desktop 설치

### Docker Desktop 다운로드

**공식 웹사이트:**
https://www.docker.com/products/docker-desktop

**버전 선택:**
```
Windows 11 Pro → Docker Desktop for Windows (최신 버전)
```

### 설치 과정

```
1. Docker Desktop Installer.exe 실행
2. "Install" 클릭
3. 다음 화면에서 다음 옵션 선택:
   ☑ Use WSL 2 instead of Hyper-V
   (또는 기본값 Hyper-V 유지)
4. 설치 완료 → "Close" 클릭
5. 컴퓨터 재부팅 (필요시)
```

### Docker 설치 확인

```powershell
# 새 PowerShell/명령 프롬프트 열기
docker --version

# 예상 출력:
# Docker version 26.0.0, build ...

docker run hello-world

# 예상 출력:
# Hello from Docker!
# This message shows that your installation appears to be working correctly.
```

### Docker Desktop 설정 최적화

```
1. Docker Desktop 트레이 아이콘 우클릭
2. "Settings" 선택
3. "Resources" 탭에서:
   - CPU: 4개 이상 할당
   - Memory: 8GB 이상 할당
   - Swap: 2GB 이상
4. "Apply & Restart" 클릭
```

**리소스 권장값:**
```
기본 스펙         Docker 권장값
─────────────────────────────
CPU: 8코어   →   4개 할당
RAM: 16GB    →   8GB 할당
HDD: 256GB   →   Swap 2GB, 50GB 여유
```

---

## Step 3: Git 설정

### GitHub 계정 설정

```powershell
# 사용자 정보 설정
git config --global user.name "당신의이름"
git config --global user.email "your.email@example.com"

# GitHub 토큰 설정 (선택사항, SSH 사용 시)
# https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
```

### SSH 키 설정 (GitHub HTTPS 사용 시 생략 가능)

```powershell
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# 또는 기존 공개키 시스템의 경우
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 프롬프트에서 엔터 입력 (기본값 사용)
# Enter file in which to save the key: [엔터]
# Enter passphrase: [비밀번호 입력 또는 엔터로 건너뛰기]

# SSH 키 확인
cat ~/.ssh/id_ed25519.pub
```

---

## Step 4: 프로젝트 클론 및 실행

### 1️⃣ 프로젝트 디렉토리 준비

```powershell
# 작업 디렉토리 생성
mkdir C:\dev
cd C:\dev
```

### 2️⃣ GitHub에서 클론

```powershell
# HTTPS 방식 (권장, 비밀번호 필요 없음)
git clone https://github.com/iloveaired9/mysupabase.git
cd mysupabase

# 또는 SSH 방식 (SSH 키 설정 후 사용)
git clone git@github.com:iloveaired9/mysupabase.git
cd mysupabase
```

### 3️⃣ Docker Compose로 프로젝트 실행

```powershell
# 프로젝트 디렉토리 확인
# C:\dev\mysupabase 위치에 있어야 함

# 모든 컨테이너 시작
docker-compose up

# 백그라운드에서 실행 (터미널 해제)
docker-compose up -d
```

### 4️⃣ 실행 상태 확인

```powershell
# 실행 중인 컨테이너 확인
docker-compose ps

# 예상 출력:
# NAME              COMMAND                  SERVICE     STATUS
# supabase-db       docker-entrypoint.s...   db          Up 2 minutes
# postgrest         /bin/sh -c postgrest...  api         Up 2 minutes
# swagger-ui        /docker-entrypoint.s...  swagger-ui  Up 2 minutes
# pgadmin           /entrypoint.sh           pgadmin     Up 2 minutes
# mailhog           MailHog -api-bind-a...   mailhog     Up 2 minutes
```

---

## Step 5: 개발 환경 확인

### 서비스 접근 확인

브라우저에서 다음 주소들에 접속하여 확인:

#### 1. Swagger UI (API 문서)
```
URL: http://localhost:8080
예상: 🎨 Swagger UI 페이지 표시
```

#### 2. PostgREST API
```
URL: http://localhost:3001
예상: JSON 응답
```

#### 3. Admin Dashboard
```
URL: http://localhost:5500/admin
예상: 관리자 대시보드 표시
```

#### 4. pgAdmin (데이터베이스 관리)
```
URL: http://localhost:5050
로그인: admin@admin.com / admin
```

#### 5. MailHog (이메일 테스트)
```
URL: http://localhost:1025 (SMTP 서버)
URL: http://localhost:8025 (웹 UI)
```

### API 테스트

```powershell
# PowerShell에서 API 테스트
Invoke-WebRequest -Uri "http://localhost:3001/posts" | Select-Object Content

# 또는 curl 사용
curl http://localhost:3001/posts

# 또는 VS Code의 REST Client 확장 사용
# 프로젝트에 test.http 파일 생성:
GET http://localhost:3001/posts
Content-Type: application/json
```

---

## 문제 해결 (Troubleshooting)

### ❌ "Docker daemon이 실행 중이 아닙니다"

```powershell
# 해결 방법 1: Docker Desktop 재시작
# 트레이 아이콘 우클릭 → Restart

# 해결 방법 2: WSL 2 초기화
wsl --shutdown
docker-compose up

# 해결 방법 3: Hyper-V 확인
# Windows 기능 → Hyper-V 체크박스 확인
```

### ❌ "포트 이미 사용 중" 오류

```
error: bind: address already in use
```

**해결 방법:**

```powershell
# 포트 사용 프로세스 확인 (포트 3001 예시)
netstat -ano | findstr :3001

# 프로세스 종료
taskkill /PID <PID번호> /F

# 또는 docker-compose.yml에서 포트 변경
# ports:
#   - "3002:3000"  (3001 → 3002로 변경)
```

### ❌ "디스크 공간 부족" 오류

```
Disk space insufficient
```

**해결 방법:**

```powershell
# Docker 디스크 사용량 확인
docker system df

# 불필요한 이미지/컨테이너 정리
docker system prune

# 볼륨 정리
docker volume prune

# 완전 정리 (모든 Docker 데이터 삭제, 주의!)
docker system prune -a
```

### ❌ PostgreSQL 연결 오류

```
connection refused
```

**해결 방법:**

```powershell
# 데이터베이스 컨테이너 재시작
docker-compose restart supabase-db

# 또는 전체 재시작
docker-compose down
docker-compose up

# 컨테이너 로그 확인
docker-compose logs supabase-db
```

### ❌ "permission denied" 오류

```
permission denied while trying to connect to Docker daemon
```

**해결 방법:**

```powershell
# Windows 11에서는 보통 필요 없지만, 필요시:
# 1. PowerShell을 관리자 권한으로 실행
# Windows + X → Windows PowerShell(관리자)

# 2. Docker Desktop 설정에서 "Use WSL 2" 확인
# Docker Desktop → Settings → General
```

### ❌ Git 인증 오류

```
fatal: could not read Username for 'https://github.com': No such file or directory
```

**해결 방법:**

```powershell
# Windows Credential Manager를 통해 저장된 자격증명 확인
# 제어판 → 사용자 계정 → 자격 증명 관리자
# → Windows 자격 증명에서 github.com 항목 확인/수정

# 또는 git config에서 HTTPS 자격 증명 저장
git config --global credential.helper wincred

# HTTPS 대신 SSH 사용 (권장)
git remote set-url origin git@github.com:iloveaired9/mysupabase.git
```

### ❌ "WSL 2 설치 필요" 오류

```
WSL 2 installation is incomplete
```

**해결 방법:**

```powershell
# WSL 2 자동 설치
# PowerShell (관리자 권한)에서:
wsl --install

# 재부팅 후 다시 시도
docker-compose up
```

---

## 개발 워크플로우

### 일일 작업 시작

```powershell
# 프로젝트 디렉토리 이동
cd C:\dev\mysupabase

# 컨테이너 시작 (또는 Docker Desktop 실행)
docker-compose up -d

# 상태 확인
docker-compose ps
```

### 데이터베이스 접근

```powershell
# psql로 데이터베이스 접근
docker exec -it supabase-db psql -U postgres -d mysupabase

# 또는 pgAdmin 웹 UI 사용
# http://localhost:5050
```

### 로그 확인

```powershell
# 모든 컨테이너 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs postgrest
docker-compose logs supabase-db

# 실시간 로그 모니터링
docker-compose logs -f
```

### 컨테이너 중지

```powershell
# 컨테이너 중지
docker-compose stop

# 컨테이너 중지 + 제거
docker-compose down

# 데이터 유지하며 중지
# (docker-compose down 사용 시 데이터 손실 가능)
```

---

## 추가 팁과 최적화

### 1️⃣ WSL 2 성능 최적화

```powershell
# .wslconfig 파일 생성 (메모장에서)
notepad $env:USERPROFILE\.wslconfig

# 다음 내용 추가:
[interop]
enabled=true
appendWindowsPath=true

[wsl2]
memory=8GB
processors=4
swap=2GB
```

### 2️⃣ Docker 이미지 정리

```powershell
# 사용하지 않는 이미지 제거
docker image prune

# 완전 정리 (주의!)
docker system prune -a --volumes
```

### 3️⃣ 터미널 단축키 설정

```powershell
# PowerShell 프로필 편집 (선택사항)
# 자주 사용하는 명령어를 별칭으로 설정
```

### 4️⃣ 자동 시작 설정 (선택사항)

```powershell
# Docker Desktop 자동 시작 설정:
# Docker Desktop → Settings → General
# ☑ Start Docker Desktop when you log in
```

---

## 체크리스트: 설치 완료 확인

```
☑ Windows 11 Pro 확인
  wmic os get caption

☑ Hyper-V 활성화
  wmic os get virtualization capabilities

☑ Git 설치
  git --version

☑ Docker Desktop 설치
  docker --version
  docker run hello-world

☑ 프로젝트 클론
  git clone https://github.com/iloveaired9/mysupabase.git

☑ Docker Compose 실행
  docker-compose up -d

☑ 컨테이너 상태 확인
  docker-compose ps

☑ 서비스 접근 확인
  http://localhost:8080  (Swagger UI)
  http://localhost:3001  (PostgREST API)
  http://localhost:5500/admin  (Admin Dashboard)

☑ API 테스트
  curl http://localhost:3001/posts

모두 완료! 🎉
```

---

## 다음 단계

개발 환경 설정이 완료되었습니다. 다음 문서들을 참고하세요:

- 📚 [PostgREST 완벽 가이드](./POSTGREST_GUIDE.md) - PostgREST 개념 학습
- 🚀 [새 테이블 추가 가이드](./NEW_TABLE_GUIDE.md) - 테이블 생성 및 API 생성
- 📊 [데이터베이스 스키마 설계](./DATABASE_SCHEMA.md) - 데이터베이스 설계 원칙
- 📖 [API 사용 가이드](./API_GUIDE.md) - REST API 상세 사용법

문제가 있으면 [Troubleshooting](#문제-해결-troubleshooting) 섹션을 참고하세요.

Happy Coding! 🚀
