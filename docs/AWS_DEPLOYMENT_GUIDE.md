# ☁️ AWS EC2 배포 및 문제 해결 가이드

## 목차
1. [개요](#개요)
2. [AWS 환경 준비](#aws-환경-준비)
3. [프로젝트 배포](#프로젝트-배포)
4. [서비스 상태 확인](#서비스-상태-확인)
5. [외부 접근 설정](#외부-접근-설정)
6. [문제 해결](#문제-해결)
7. [모니터링 및 유지보수](#모니터링-및-유지보수)

---

## 개요

이 가이드는 **AWS EC2**에서 mysupabase 프로젝트를 배포하고 운영하는 방법을 설명합니다.

### 배포 환경
```
AWS EC2 Instance
├─ OS: Amazon Linux 2 / Ubuntu 22.04
├─ CPU: t3.small 이상 권장
├─ RAM: 2GB 이상
├─ Storage: 50GB 이상 EBS
└─ Docker: Docker Engine + Docker Compose
```

---

## AWS 환경 준비

### 1️⃣ EC2 인스턴스 생성

**권장 사양**:
```
인스턴스 타입: t3.medium (또는 그 이상)
├─ vCPU: 2개
├─ 메모리: 4GB
├─ 네트워크: 퍼블릭 IP 할당

스토리지: 50GB (gp3 권장)

보안 그룹: 다음 포트 열기
├─ SSH (22): 관리자 IP만
├─ HTTP (80): 0.0.0.0/0
├─ HTTPS (443): 0.0.0.0/0
├─ 3001: 0.0.0.0/0 (PostgREST)
├─ 3002: 0.0.0.0/0 (Legacy API)
├─ 8080: 0.0.0.0/0 (Swagger UI)
├─ 8025: 제한된 IP (MailHog)
└─ 5050: 제한된 IP (pgAdmin)
```

### 2️⃣ Docker 설치

```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install docker -y
sudo usermod -aG docker ec2-user

# Ubuntu 22.04
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker ubuntu

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 설치 확인
docker --version
docker-compose --version
```

### 3️⃣ Git 설치

```bash
# Amazon Linux 2
sudo yum install git -y

# Ubuntu 22.04
sudo apt-get install git -y

# 확인
git --version
```

---

## 프로젝트 배포

### Step 1: 프로젝트 클론

```bash
# 작업 디렉토리 생성
mkdir -p /home/ec2-user/docker
cd /home/ec2-user/docker

# 또는 Ubuntu의 경우
mkdir -p /home/ubuntu/docker
cd /home/ubuntu/docker

# 저장소 클론
git clone https://github.com/iloveaired9/mysupabase.git
cd mysupabase
```

### Step 2: 환경 변수 설정

```bash
# .env 파일 생성/편집
nano .env

# 또는 cat으로 생성
cat > .env << 'EOF'
# PostgreSQL
POSTGRES_DB=supabase
POSTGRES_USER=supabase
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_PORT=5432

# Legacy MySQL (선택사항)
LEGACY_DB_HOST=legacy-mysql
LEGACY_DB_PORT=3306
LEGACY_DB_USER=legacy_user
LEGACY_DB_PASSWORD=legacy_password
LEGACY_DB_NAME=legacy_db

# PostgREST
PGRST_DB_SCHEMA=public
PGRST_DB_ANON_ROLE=anon

# pgAdmin
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin_password

# MailHog (포트)
MAILHOG_SMTP_PORT=1025
MAILHOG_WEB_PORT=8025
EOF
```

### Step 3: Docker Compose 실행

```bash
# 백그라운드에서 모든 서비스 시작
docker-compose up -d

# 또는 로그를 보면서 시작
docker-compose up

# 컨테이너 상태 확인
docker-compose ps

# 예상 출력:
# NAME                   COMMAND                  STATUS
# supabase-postgres      docker-entrypoint.s...   Up 2 minutes
# supabase-postgrest     /bin/sh -c postgrest...  Up 2 minutes
# supabase-swagger-ui    /docker-entrypoint.s...  Up 2 minutes
# supabase-pgadmin       /entrypoint.sh           Up 2 minutes
# supabase-mailhog       MailHog -api-bind-a...   Up 2 minutes
```

---

## 서비스 상태 확인

### 1️⃣ 컨테이너 상태 확인

```bash
# 모든 컨테이너 상태
docker-compose ps

# 개별 컨테이너 로그
docker-compose logs postgres
docker-compose logs postgrest
docker-compose logs swagger-ui

# 실시간 로그
docker-compose logs -f

# 특정 컨테이너 실시간 로그
docker-compose logs -f postgrest
```

### 2️⃣ 서비스별 헬스 체크

```bash
# PostgREST 상태 확인
curl http://localhost:3001

# Swagger UI 확인
curl http://localhost:8080

# PostgreSQL 연결 확인
docker exec supabase-postgres psql -U supabase -d supabase -c "SELECT 1"

# MailHog 확인
curl http://localhost:8025/api/v2/messages

# pgAdmin 확인
curl http://localhost:5050
```

### 3️⃣ EC2에서 AWS 외부로 접근 확인

```bash
# EC2의 공개 IP 확인
curl http://169.254.169.254/latest/meta-data/public-ipv4

# 또는 AWS CLI 사용
aws ec2 describe-instances --instance-ids i-xxxxxxxx --query 'Reservations[0].Instances[0].PublicIpAddress'

# 외부에서 접근 테스트 (로컬 PC에서)
curl http://<EC2_PUBLIC_IP>:3001
curl http://<EC2_PUBLIC_IP>:8080
```

---

## 외부 접근 설정

### AWS 보안 그룹 설정

```
AWS Console 접근:
1. EC2 → Security Groups
2. 인스턴스의 보안 그룹 선택
3. "Inbound rules" 탭에서 "Edit inbound rules"
4. 다음 규칙 추가:

+---------+--------+--------+--------+--------+
| Type    | Proto  | Port   | Source | Desc   |
+---------+--------+--------+--------+--------+
| HTTP    | TCP    | 80     | 0.0/0  | HTTP   |
| HTTPS   | TCP    | 443    | 0.0/0  | HTTPS  |
| Custom  | TCP    | 3001   | 0.0/0  | pgREST |
| Custom  | TCP    | 3002   | 0.0/0  | API    |
| Custom  | TCP    | 8080   | 0.0/0  | Swagger|
| SSH     | TCP    | 22     | MY_IP  | SSH    |
+---------+--------+--------+--------+--------+
```

### Docker 포트 매핑 확인

```bash
# 현재 바인딩된 포트 확인
docker ps --format "table {{.Names}}\t{{.Ports}}"

# 예상 출력:
# NAMES                   PORTS
# supabase-postgres       5432/tcp
# supabase-postgrest      3000/tcp -> 3000
# supabase-swagger-ui     8080/tcp -> 8080
# supabase-pgadmin        5050/tcp -> 80
# supabase-mailhog        1025/tcp -> 1025, 8025/tcp -> 8025
```

---

## 문제 해결

### ❌ "version is obsolete" 경고

```
WARN[0000] version attribute is obsolete, it will be ignored
```

**해결**:
```bash
# docker-compose.yml 맨 위의 version 줄 제거
# 현재: version: '3.8'
# 변경 후: (version 라인 삭제)

# 파일 수정
nano docker-compose.yml

# 첫 번째 줄의 "version: '3.8'" 제거 후 저장
```

### ❌ "컨테이너가 실행되지 않음"

```bash
# 로그 확인
docker-compose logs --tail=50

# 컨테이너 재시작
docker-compose down
docker-compose up -d

# 개별 컨테이너 재시작
docker-compose restart postgrest
docker-compose restart swagger-ui
```

### ❌ "PostgreSQL 연결 실패"

```
Error: could not connect to database
```

**확인 사항**:
```bash
# PostgreSQL 컨테이너 상태
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# 직접 접속 시도
docker exec -it supabase-postgres psql -U supabase -d supabase

# 환경 변수 확인
docker-compose config | grep POSTGRES
```

**해결**:
```bash
# 데이터 초기화 후 재시작
docker-compose down -v
docker-compose up -d

# 또는 컨테이너만 재시작
docker-compose restart postgres
```

### ❌ "Swagger UI에 접근 불가"

```
HTTP 502 Bad Gateway
또는
연결할 수 없음
```

**확인**:
```bash
# 1. 포트 확인
docker-compose logs swagger-ui

# 2. 보안 그룹 확인
# AWS Console에서 포트 8080 허용 여부 확인

# 3. 컨테이너 상태
docker-compose ps swagger-ui

# 4. EC2에서 직접 접근
curl http://localhost:8080
```

**해결**:
```bash
# Swagger 컨테이너 재시작
docker-compose restart swagger-ui

# 또는 전체 재시작
docker-compose down
docker-compose up -d

# 캐시 정리
docker system prune
```

### ❌ "PostgREST API에 접근 불가"

```
Connection refused
```

**확인**:
```bash
# PostgREST 로그
docker-compose logs postgrest

# PostgreSQL 연결 상태
docker-compose logs postgres

# API 포트 확인
docker-compose ps postgrest
```

**해결**:
```bash
# 1. PostgreSQL 먼저 시작 확인
docker-compose logs postgres | grep "ready to accept"

# 2. PostgREST 재시작
docker-compose restart postgrest

# 3. 전체 재시작 (의존성 문제 해결)
docker-compose down
docker-compose up -d
```

### ❌ "디스크 공간 부족"

```
no space left on device
docker: Error response from daemon: write /var/lib/docker/...
```

**해결**:
```bash
# 디스크 사용량 확인
df -h

# Docker 디스크 사용량 확인
docker system df

# 불필요한 것 정리
docker system prune -a

# 로그 정리
docker-compose logs --tail=0

# 오래된 이미지 삭제
docker image prune
```

### ❌ "메모리 부족"

```
OOMKilled
Cannot allocate memory
```

**확인**:
```bash
# 메모리 사용량
free -h

# Docker 메모리 사용량
docker stats --no-stream

# EC2 사양 확인
cat /proc/cpuinfo
```

**해결**:
```bash
# 1. 불필요한 서비스 중지
docker-compose stop pgadmin mailhog

# 2. 인스턴스 크기 확대 (AWS Console)
# t3.small → t3.medium (권장)

# 3. 스왑 공간 설정 (임시 해결)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 모니터링 및 유지보수

### 1️⃣ 자동 재시작 설정

```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/docker-compose@mysupabase.service

# 다음 내용 입력:
[Unit]
Description=Docker Compose Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
User=ec2-user
WorkingDirectory=/home/ec2-user/docker/mysupabase
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target

# 저장 후 실행
sudo systemctl daemon-reload
sudo systemctl enable docker-compose@mysupabase
sudo systemctl start docker-compose@mysupabase
```

### 2️⃣ 로그 모니터링

```bash
# 실시간 로그 모니터링
docker-compose logs -f

# 에러만 필터링
docker-compose logs | grep ERROR

# 특정 시간 로그 조회
docker-compose logs --since 2024-01-01T00:00:00Z

# 로그 저장
docker-compose logs > /tmp/mysupabase_logs.txt
```

### 3️⃣ 정기적 백업

```bash
# PostgreSQL 백업 스크립트
cat > /home/ec2-user/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/home/ec2-user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# PostgreSQL 백업
docker exec supabase-postgres pg_dump -U supabase supabase > $BACKUP_DIR/backup_$DATE.sql

# 30일 이상 오래된 파일 삭제
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql"
EOF

# 실행 권한 부여
chmod +x /home/ec2-user/backup.sh

# 매일 자정에 자동 실행 (crontab)
crontab -e

# 다음 줄 추가:
0 0 * * * /home/ec2-user/backup.sh
```

### 4️⃣ 보안 업데이트

```bash
# 컨테이너 이미지 업데이트
docker-compose pull

# 최신 버전으로 재시작
docker-compose down
docker-compose up -d

# 보안 패치 확인
docker scout cves mysupabase
```

---

## 체크리스트

```
☑ EC2 인스턴스 생성
  ☑ 적절한 사양 선택 (t3.medium 이상)
  ☑ 보안 그룹 설정
  ☑ 탄력적 IP 할당 (선택사항)

☑ 소프트웨어 설치
  ☑ Docker 설치
  ☑ Docker Compose 설치
  ☑ Git 설치

☑ 프로젝트 배포
  ☑ Git clone
  ☑ .env 파일 생성
  ☑ docker-compose up

☑ 서비스 확인
  ☑ 모든 컨테이너 실행 중
  ☑ PostgreSQL 연결 OK
  ☑ PostgREST API 응답 OK
  ☑ Swagger UI 접근 가능
  ☑ 외부에서 접근 가능

☑ 모니터링 설정
  ☑ 자동 재시작 설정
  ☑ 백업 스크립트 설정
  ☑ 로그 모니터링 설정

☑ 보안
  ☑ SSH 키 설정
  ☑ 보안 그룹 최소 권한 설정
  ☑ .env 파일 git ignore 확인
```

---

## 참고 명령어

```bash
# EC2 인스턴스 정보
aws ec2 describe-instances --instance-ids i-xxxxx

# 공개 IP 확인
aws ec2 describe-instances --query 'Reservations[0].Instances[0].PublicIpAddress'

# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids sg-xxxxx

# 스토리지 용량 확인
df -h

# 실행 중인 프로세스
ps aux | grep docker

# 네트워크 포트 확인
netstat -tlnp | grep LISTEN

# 시스템 리소스
top
htop (설치 필요)
```

---

## 추가 자료

- [AWS EC2 공식 문서](https://docs.aws.amazon.com/ec2/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [PostgREST 배포 가이드](https://postgrest.org/en/latest/)

Happy Deploying! 🚀
