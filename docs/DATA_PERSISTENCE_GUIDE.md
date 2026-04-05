# 💾 데이터 유지 및 백업 완벽 가이드

## 목차
1. [개요](#개요)
2. [현재 설정 이해](#현재-설정-이해)
3. [데이터 유지 방식](#데이터-유지-방식)
4. [백업 방법](#백업-방법)
5. [복구 방법](#복구-방법)
6. [정기적 백업 자동화](#정기적-백업-자동화)
7. [문제 해결](#문제-해결)

---

## 개요

Docker 컨테이너는 상태를 유지하지 않는 특성(stateless)이 있지만, **볼륨(Volumes)**을 사용하면 데이터를 영구적으로 보존할 수 있습니다.

### 중요한 개념

```
┌──────────────────────────────────────────────────────┐
│ Docker 데이터 저장 방식 비교                          │
├──────────────────────────────────────────────────────┤
│                                                       │
│ 1️⃣ 컨테이너 내부 저장 (권장 ❌)                     │
│    → 컨테이너 삭제 = 데이터 삭제                      │
│                                                       │
│ 2️⃣ Named Volumes (권장 ✅)                          │
│    → Docker 관리 영역에 저장                          │
│    → 컨테이너 삭제해도 데이터 유지                    │
│    → docker-compose down -v 로만 삭제 가능           │
│                                                       │
│ 3️⃣ Bind Mount (권장 ✅)                            │
│    → 호스트 컴퓨터의 특정 디렉토리에 저장             │
│    → 가장 명확하고 백업 용이                         │
│    → 개발자가 직접 파일 관리 가능                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 현재 설정 이해

### 현재 docker-compose.yml 분석

```yaml
services:
  postgres:
    container_name: supabase-postgres
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: supabase
      POSTGRES_USER: supabase
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data  ← Named Volume

volumes:
  postgres-data:  ← 하단에 정의되어야 함
```

### ✅ 현재 설정의 장점

```
✅ Named Volume 사용 (postgres-data)
   → 컨테이너 삭제해도 데이터 유지

✅ 자동 생성
   → 처음 실행 시 자동으로 생성됨

✅ 멀티 컨테이너 공유 가능
   → 다른 컨테이너에서도 접근 가능
```

### ⚠️ 주의: 데이터가 정말 안전한가?

```
❌ 다음 명령어로는 데이터가 삭제됩니다!
docker-compose down -v          ← -v 플래그가 위험!
docker volume rm postgres-data  ← 명시적 삭제

✅ 다음 명령어로는 데이터가 유지됩니다
docker-compose down             ← 데이터 유지
docker stop <컨테이너>          ← 데이터 유지
docker-compose stop             ← 데이터 유지
```

---

## 데이터 유지 방식

### 방식 1️⃣: Named Volume (현재 설정) - 권장 ⭐

**원리**: Docker가 데이터를 자동으로 관리

```yaml
services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:  # ← 명시적으로 정의
```

**데이터 위치** (Windows):
```
C:\ProgramData\Docker\volumes\postgres-data\_data\
```

**장점**:
- ✅ 가장 간단함
- ✅ 자동으로 관리됨
- ✅ 성능 최적화됨

**단점**:
- ⚠️ Docker이 숨긴 위치에 저장
- ⚠️ 백업이 조금 더 복잡함

**데이터 확인**:
```powershell
# 전체 볼륨 목록
docker volume ls

# 특정 볼륨 상세 정보
docker volume inspect postgres-data

# 예상 출력:
# [
#   {
#     "Name": "postgres-data",
#     "Driver": "local",
#     "Mountpoint": "C:\\ProgramData\\Docker\\volumes\\postgres-data\\_data",
#     "Labels": {},
#     "Scope": "local"
#   }
# ]
```

---

### 방식 2️⃣: Bind Mount (권장) ⭐⭐

**원리**: 호스트 컴퓨터의 특정 폴더에 직접 저장

**docker-compose.yml 수정**:

```yaml
services:
  postgres:
    container_name: supabase-postgres
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: supabase
      POSTGRES_USER: supabase
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      # Named Volume 대신 Bind Mount 사용
      - ./postgres-data:/var/lib/postgresql/data

# volumes 섹션 제거 또는 주석처리
# volumes:
#   postgres-data:
```

**폴더 구조**:
```
mysupabase/
├── docker-compose.yml
├── postgres-data/          ← 🆕 호스트 컴퓨터의 실제 폴더
│   ├── base/
│   ├── global/
│   └── pg_version
└── docs/
```

**초기 설정 (Bind Mount로 변경)**:

```powershell
# 1. 기존 데이터 백업 (선택사항)
docker exec supabase-postgres pg_dump -U supabase supabase > backup.sql

# 2. 컨테이너 중지
docker-compose down

# 3. docker-compose.yml 수정 (위의 코드 참고)

# 4. 호스트 폴더 생성
mkdir postgres-data

# 5. 컨테이너 재시작
docker-compose up -d
```

**장점**:
- ✅ 호스트 컴퓨터에서 직접 파일 보이기
- ✅ 백업이 매우 간단함
- ✅ 버전 관리(Git) 제외 설정 명확
- ✅ 개발자가 완벽히 제어 가능

**단점**:
- ⚠️ 권한 설정이 필요할 수 있음
- ⚠️ Windows와 Linux 경로 호환성 주의

**권장 사항**:
```
✅ 개발 환경: Bind Mount 사용
   → 로컬 파일 시스템에서 직접 관리

✅ 프로덕션: Named Volume 사용
   → Docker가 자동으로 관리
```

---

## 백업 방법

### 방법 1️⃣: SQL 덤프 (권장) ⭐⭐

**원리**: 데이터베이스 전체를 SQL 파일로 내보내기

#### Step 1: 데이터 덤프

```powershell
# 간단한 백업 (기본 포맷)
docker exec supabase-postgres pg_dump -U supabase supabase > backup.sql

# 더 자세한 정보 포함
docker exec supabase-postgres pg_dump -U supabase supabase \
  --verbose \
  --format=plain \
  > backup_detailed.sql

# 압축 형식 (파일 크기 줄임)
docker exec supabase-postgres pg_dump -U supabase supabase \
  --format=custom \
  > backup.dump
```

**파일 설명**:
```
backup.sql (텍스트 형식)
├─ 크기: 큼 (수십 MB 가능)
├─ 장점: 읽기 쉬움, 수정 가능
└─ 용도: 개발, 교육

backup.dump (바이너리 형식)
├─ 크기: 작음 (압축됨)
├─ 장점: 빠른 복구
└─ 용도: 프로덕션 백업
```

#### Step 2: 백업 검증

```powershell
# SQL 파일 크기 확인
ls -lh backup.sql

# 파일 내용 미리보기 (첫 50줄)
Get-Content backup.sql -Head 50

# 예상 출력:
# --
# -- PostgreSQL database dump
# --
# -- Dumped from database version 15.1
# -- Dumped by pg_dump version 15.1
```

#### Step 3: 정기적 백업 스크립트

**백업 스크립트 생성** (`backup.ps1` - PowerShell):

```powershell
# C:\dev\mysuperbase\backup.ps1

# 설정
$BACKUP_DIR = ".\backups"
$DB_NAME = "supabase"
$DB_USER = "supabase"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup_$TIMESTAMP.sql"

# 백업 디렉토리 생성
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

# 데이터 덤프
Write-Host "백업 시작: $BACKUP_FILE"
docker exec supabase-postgres pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# 성공 확인
if ($LASTEXITCODE -eq 0) {
    $SIZE = (Get-Item $BACKUP_FILE).Length / 1MB
    Write-Host "✅ 백업 완료! (크기: $([Math]::Round($SIZE, 2)) MB)"
} else {
    Write-Host "❌ 백업 실패!"
    exit 1
}

# 오래된 백업 자동 삭제 (30일 이상)
Get-ChildItem $BACKUP_DIR -Filter "backup_*.sql" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
    Remove-Item -Force

Write-Host "오래된 백업 정리 완료"
```

**스크립트 실행**:

```powershell
# PowerShell 실행 정책 변경 (필요시)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 스크립트 실행
.\backup.ps1

# 백업 목록 확인
ls .\backups\
```

---

### 방법 2️⃣: 볼륨 복사

**원리**: 전체 postgres-data 폴더를 복사

```powershell
# Named Volume의 경우
docker run --rm -v postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data

# Bind Mount의 경우 (더 간단함)
Copy-Item -Path .\postgres-data -Destination .\postgres-data-backup -Recurse
```

**장점**:
- ✅ 완벽한 복사 (모든 데이터 포함)
- ✅ 빠른 복구

**단점**:
- ⚠️ 파일 크기가 큼
- ⚠️ 실행 중 백업 시 불완전할 수 있음

---

### 방법 3️⃣: 클라우드 백업 (선택사항)

**AWS S3에 자동 백업**:

```powershell
# AWS CLI 설치 필요
# https://aws.amazon.com/cli/

# 자동 백업 스크립트 (backup-to-s3.ps1)
$BUCKET = "my-backup-bucket"
$DB_NAME = "supabase"
$DB_USER = "supabase"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "backup_$TIMESTAMP.sql"

# 로컬 백업
docker exec supabase-postgres pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# S3 업로드
aws s3 cp $BACKUP_FILE s3://$BUCKET/backups/

# 로컬 파일 삭제
Remove-Item $BACKUP_FILE

Write-Host "✅ S3 백업 완료!"
```

---

## 복구 방법

### 기본 복구 (SQL 파일)

#### Step 1: 데이터 복구

```powershell
# 방법 1: 파일 직접 읽기
docker exec -i supabase-postgres psql -U supabase supabase < backup.sql

# 방법 2: stdin 통한 복구 (더 명확)
cat backup.sql | docker exec -i supabase-postgres psql -U supabase supabase

# 방법 3: 압축 파일 복구
docker exec -i supabase-postgres pg_restore -U supabase -d supabase < backup.dump
```

#### Step 2: 복구 확인

```powershell
# 복구된 데이터 확인
docker exec -it supabase-postgres psql -U supabase supabase -c "SELECT COUNT(*) FROM posts;"

# 또는 API로 확인
curl http://localhost:3001/posts
```

#### Step 3: 특정 테이블만 복구

```powershell
# posts 테이블만 복구
docker exec -i supabase-postgres psql -U supabase supabase \
  -c "DROP TABLE IF EXISTS posts;"

# 백업 파일에서 posts 테이블만 복구
docker exec -i supabase-postgres pg_restore -U supabase -d supabase \
  --table=posts < backup.dump
```

---

### 재해 복구 (전체 데이터 손실)

**시나리오**: docker-compose down -v 로 모든 데이터가 삭제됨

```powershell
# Step 1: 컨테이너 중지
docker-compose down

# Step 2: 새로운 데이터베이스로 시작
docker-compose up -d

# Step 3: 대기 (PostgreSQL 초기화 완료 대기)
Start-Sleep -Seconds 10

# Step 4: 백업 복구
cat backup.sql | docker exec -i supabase-postgres psql -U supabase supabase

# Step 5: 확인
docker exec -it supabase-postgres psql -U supabase supabase \
  -c "SELECT COUNT(*) FROM posts;"
```

---

## 정기적 백업 자동화

### Windows 작업 스케줄러를 통한 자동 백업

#### Step 1: 백업 스크립트 생성

`backup-auto.ps1` 파일 생성:

```powershell
# C:\dev\mysuperbase\scripts\backup-auto.ps1

param(
    [string]$BackupDir = ".\backups",
    [int]$RetentionDays = 30,
    [string]$S3Bucket = ""  # 선택사항
)

# 설정
$DB_NAME = "supabase"
$DB_USER = "supabase"
$CONTAINER = "supabase-postgres"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# 백업 디렉토리 생성
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# 로그 파일
$LogFile = "$BackupDir\backup_$TIMESTAMP.log"

# 로깅 함수
function Log {
    param([string]$Message)
    Add-Content -Path $LogFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - $Message"
    Write-Host $Message
}

Log "========== 백업 시작 =========="

try {
    # 컨테이너 상태 확인
    $Container = docker ps -q --filter "name=$CONTAINER"
    if (!$Container) {
        throw "PostgreSQL 컨테이너가 실행 중이 아닙니다!"
    }

    # 데이터 덤프
    $BackupFile = "$BackupDir\backup_$TIMESTAMP.sql"
    Log "백업 시작: $BackupFile"

    docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME > $BackupFile

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump 실패!"
    }

    $Size = (Get-Item $BackupFile).Length / 1MB
    Log "✅ 백업 완료! (크기: $([Math]::Round($Size, 2)) MB)"

    # 오래된 백업 삭제
    Log "오래된 백업 정리 중..."
    Get-ChildItem $BackupDir -Filter "backup_*.sql" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
        ForEach-Object {
            Log "삭제: $($_.Name)"
            Remove-Item $_.FullName -Force
        }

    # S3 업로드 (선택사항)
    if ($S3Bucket) {
        Log "S3 업로드 중..."
        aws s3 cp $BackupFile "s3://$S3Bucket/backups/"
        Log "✅ S3 업로드 완료"
    }

} catch {
    Log "❌ 오류: $_"
    exit 1
}

Log "========== 백업 완료 =========="
```

#### Step 2: 작업 스케줄러 등록

```powershell
# PowerShell (관리자 권한)에서 실행

# 스크립트 경로
$ScriptPath = "C:\dev\mysuperbase\scripts\backup-auto.ps1"

# 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 작업 생성 (매일 자정)
$trigger = New-JobTrigger -Daily -At 12:00am
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File $ScriptPath"
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName "PostgreSQL-AutoBackup" `
    -Trigger $trigger `
    -Action $action `
    -Settings $settings `
    -Description "매일 자정에 PostgreSQL 자동 백업" `
    -RunLevel Highest

# 작업 확인
Get-ScheduledTask -TaskName "PostgreSQL-AutoBackup"
```

#### Step 3: 백업 검증

```powershell
# 작업 목록 확인
Get-ScheduledTask | Where-Object { $_.TaskName -like "*Backup*" }

# 작업 실행 이력 확인
Get-ScheduledTaskInfo -TaskName "PostgreSQL-AutoBackup"

# 수동 테스트
Start-ScheduledTask -TaskName "PostgreSQL-AutoBackup"
Start-Sleep -Seconds 5
Get-ScheduledTaskInfo -TaskName "PostgreSQL-AutoBackup"

# 백업 파일 확인
ls .\backups\ | sort LastWriteTime -Descending | head 10
```

---

## 권장 백업 전략

### 개발 환경

```
┌─────────────────────────────────────────┐
│ 개발 환경 백업 전략                     │
├─────────────────────────────────────────┤
│                                         │
│ 💾 데이터 유지 방식: Bind Mount        │
│    → ./postgres-data/ 폴더에 저장       │
│                                         │
│ 🔄 백업 빈도: 주 1회                   │
│    → 매주 일요일 자정                   │
│                                         │
│ 💼 저장 위치: 로컬 폴더                │
│    → ./backups/ 폴더                    │
│                                         │
│ 🗑️ 보관 기간: 3개월                    │
│    → 자동으로 오래된 파일 삭제          │
│                                         │
│ 📊 백업 방식: SQL 덤프                 │
│    → backup_YYYYMMDD.sql                │
│                                         │
└─────────────────────────────────────────┘
```

### 프로덕션 환경

```
┌──────────────────────────────────────────┐
│ 프로덕션 백업 전략                      │
├──────────────────────────────────────────┤
│                                          │
│ 💾 데이터 유지 방식: Named Volume      │
│    → Docker가 자동 관리                  │
│                                          │
│ 🔄 백업 빈도: 매일 3회                 │
│    → 06:00, 12:00, 18:00                 │
│                                          │
│ 💼 저장 위치: 클라우드 + 로컬           │
│    → AWS S3 (주)                        │
│    → 로컬 백업 (부)                     │
│                                          │
│ 🗑️ 보관 기간: 1년                      │
│    → 월별 백업 보관                     │
│                                          │
│ 📊 백업 방식: 압축 포맷                │
│    → backup.dump (빠른 복구)             │
│                                          │
│ ✅ 정기 복구 테스트                    │
│    → 월 1회 복구 테스트                 │
│                                          │
└──────────────────────────────────────────┘
```

---

## 문제 해결

### ❌ "컨테이너가 데이터를 찾을 수 없음"

```
Error: mkdir failed: permission denied
```

**해결**:

```powershell
# Bind Mount 사용 시 권한 문제
# Windows에서는 보통 필요 없지만, WSL 2 사용 시:

# WSL 폴더 권한 확인
wsl chmod -R 755 /mnt/c/dev/mysuperbase/postgres-data

# 또는 docker-compose.yml에 환경 변수 추가
services:
  postgres:
    environment:
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
```

### ❌ "복구 중 오류: relation "posts" already exists"

```
ERROR: relation "posts" already exists
```

**해결**:

```powershell
# 기존 테이블 삭제 후 복구
docker exec -i supabase-postgres psql -U supabase supabase \
  -c "DROP TABLE IF EXISTS posts CASCADE;"

# 이제 백업 복구
cat backup.sql | docker exec -i supabase-postgres psql -U supabase supabase
```

### ❌ "백업 파일이 너무 크다"

```
100+ MB 파일 크기
```

**해결**:

```powershell
# 압축 형식으로 백업
docker exec supabase-postgres pg_dump -U supabase supabase \
  --format=custom | gzip > backup.dump.gz

# 복구
gunzip < backup.dump.gz | docker exec -i supabase-postgres pg_restore -U supabase -d supabase -F c

# 또는 개별 테이블만 백업
docker exec supabase-postgres pg_dump -U supabase supabase \
  --table=posts \
  --table=categories \
  > backup_important.sql
```

### ❌ "데이터 베이스 마이그레이션 필요"

```
PostgreSQL 버전 업그레이드 후 호환성 문제
```

**해결**:

```powershell
# pg_upgrade 사용
docker run --rm \
  -v postgres-data:/var/lib/postgresql/old \
  -v postgres-data-new:/var/lib/postgresql/new \
  postgres:16-alpine \
  pg_upgrade -b /usr/lib/postgresql/15/bin -B /usr/lib/postgresql/16/bin \
  -d /var/lib/postgresql/old -D /var/lib/postgresql/new

# 또는 단순히 덤프/복구
docker exec supabase-postgres pg_dump -U supabase supabase > backup.sql
# PostgreSQL 버전 업그레이드
# 복구
cat backup.sql | docker exec -i supabase-postgres psql -U supabase supabase
```

---

## 체크리스트

```
☑ 데이터 유지 방식 선택
  ☑ Named Volume (현재)
  ☑ Bind Mount (권장)

☑ 백업 방법 구현
  ☑ SQL 덤프 스크립트 생성
  ☑ 자동 백업 스케줄 설정
  ☑ 백업 검증

☑ 복구 절차 테스트
  ☑ SQL 파일 복구
  ☑ 전체 데이터 손실 시나리오
  ☑ 부분 복구 테스트

☑ 정기적 검토
  ☑ 월 1회 백업 파일 확인
  ☑ 분기별 복구 테스트
  ☑ 백업 스토리지 용량 모니터링
```

---

## 다음 단계

1. **즉시 실행**:
   - Bind Mount로 변경 (선택사항)
   - 초기 백업 수행

2. **자동화 설정**:
   - 백업 스크립트 생성
   - 작업 스케줄러 등록
   - 정기 모니터링

3. **정기 점검**:
   - 월 1회 백업 파일 크기 확인
   - 분기별 복구 테스트
   - 구급함 문서 작성

더 자세한 정보는 공식 문서를 참고하세요:
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [Docker Bind Mounts](https://docs.docker.com/storage/bind-mounts/)

Happy Backing Up! 💾
