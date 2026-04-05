# 🔄 GitHub 자동 동기화 설정 가이드

## 목차
1. [개요](#개요)
2. [설정 방법](#설정-방법)
3. [스크립트 설명](#스크립트-설명)
4. [모니터링](#모니터링)
5. [문제 해결](#문제-해결)

---

## 개요

**매 1분마다 GitHub에서 최신 코드를 자동으로 받아서 Docker를 동기화합니다.**

### 기능
```
✅ 1분마다 git pull 실행
✅ 변경사항 자동 감지
✅ Dockerfile 변경시 자동 재빌드
✅ 컨테이너 상태 모니터링
✅ 헬스 체크 (API 응답 확인)
✅ 로그 자동 저장
```

---

## 설정 방법

### Step 1️⃣: 스크립트를 AWS에 복사

**로컬에서 GitHub에 올리기:**

이미 `auto-sync.sh`가 저장되었으니, AWS에서 git pull하면 받아집니다.

```bash
cd /home/ec2-user/docker/mysupabase
git pull origin main
```

### Step 2️⃣: 스크립트 실행 권한 부여

```bash
# AWS EC2에서
chmod +x /home/ec2-user/docker/mysupabase/auto-sync.sh

# 확인
ls -l /home/ec2-user/docker/mysupabase/auto-sync.sh
# -rwxr-xr-x (실행 권한 있음)
```

### Step 3️⃣: 스크립트 테스트 실행

```bash
# 직접 실행해보기
/home/ec2-user/docker/mysupabase/auto-sync.sh

# 로그 확인
cat /home/ec2-user/logs/auto-sync.log

# 에러 확인
cat /home/ec2-user/logs/auto-sync-error.log
```

### Step 4️⃣: Cron 작업 등록

```bash
# crontab 편집
crontab -e

# 다음 줄을 추가 (1분마다 실행)
* * * * * /home/ec2-user/docker/mysupabase/auto-sync.sh

# 저장 (Ctrl+X, Y, Enter)
```

### Step 5️⃣: Cron 작업 확인

```bash
# 등록된 cron 작업 확인
crontab -l

# 예상 출력:
# * * * * * /home/ec2-user/docker/mysupabase/auto-sync.sh
```

### Step 6️⃣: Cron 데몬 시작

```bash
# Amazon Linux 2
sudo systemctl start crond
sudo systemctl enable crond

# 또는 Ubuntu
sudo systemctl start cron
sudo systemctl enable cron

# 상태 확인
sudo systemctl status crond
```

---

## 스크립트 설명

### 구조

```bash
#!/bin/bash

# 1. 설정 및 초기화
PROJECT_DIR="/home/ec2-user/docker/mysupabase"
LOG_DIR="/home/ec2-user/logs"

# 2. Git Pull (최신 코드 받기)
git pull origin main

# 3. Docker 동기화
- Dockerfile 변경 감지 → 재빌드
- 컨테이너 상태 확인 → 필요시 재시작

# 4. 헬스 체크
- Backend API 확인
- PostgREST 확인
- PostgreSQL 확인

# 5. 로그 정리
- 로그 파일 크기 확인
- 100MB 이상이면 압축
```

### 로그 파일

```
/home/ec2-user/logs/auto-sync.log
├─ 성공 로그
├─ 실행 시간
├─ Git pull 결과
├─ Docker 재빌드 여부
└─ 헬스 체크 결과

/home/ec2-user/logs/auto-sync-error.log
├─ 에러 메시지
├─ 경고 사항
└─ 서비스 불안정 알림
```

---

## 모니터링

### 실시간 로그 확인

```bash
# 성공 로그 실시간 확인
tail -f /home/ec2-user/logs/auto-sync.log

# 에러 로그 확인
tail -f /home/ec2-user/logs/auto-sync-error.log

# 모든 로그 한번에 보기
tail -50 /home/ec2-user/logs/auto-sync.log
```

### 최근 실행 확인

```bash
# 마지막 10줄 보기
tail -10 /home/ec2-user/logs/auto-sync.log

# 마지막 동기화 시간
tail -1 /home/ec2-user/logs/auto-sync.log

# 에러 발생 여부
[ -s /home/ec2-user/logs/auto-sync-error.log ] && echo "Errors found" || echo "No errors"
```

### Cron 실행 로그

```bash
# Amazon Linux 2
sudo tail -f /var/log/cron

# Ubuntu
sudo tail -f /var/log/syslog | grep CRON
```

---

## 사용 시나리오

### 시나리오 1️⃣: GitHub에서 코드 푸시

```
1. 로컬에서 코드 변경
   git add .
   git commit -m "feature: add new feature"
   git push origin main

2. 1분 이내에 자동 동기화
   ✅ AWS에서 git pull 실행
   ✅ 변경사항 감지
   ✅ Docker 필요시 재빌드
   ✅ 새 코드로 자동 배포

3. AWS에서 바로 실행됨
```

### 시나리오 2️⃣: Dockerfile 변경

```
1. Dockerfile 수정
   git push origin main

2. 1분 이내에 감지
   ✅ auto-sync.sh 실행
   ✅ git pull 성공
   ✅ Dockerfile 변경 감지
   ✅ docker-compose build 실행
   ✅ 컨테이너 재시작

3. 새 이미지로 실행됨
```

### 시나리오 3️⃣: 컨테이너 다운

```
1. 어떤 이유로 컨테이너 중단됨
   → Backend API 응답 없음

2. 1분 이내에 감지
   ✅ 헬스 체크 실패
   ✅ 에러 로그 기록
   ✅ 다음 실행시 자동 재시작

3. 서비스 자동 복구
```

---

## 문제 해결

### ❌ "Permission denied"

```bash
# 권한 문제
chmod +x /home/ec2-user/docker/mysupabase/auto-sync.sh

# 전체 권한 부여
chmod 755 /home/ec2-user/docker/mysupabase/auto-sync.sh
```

### ❌ "Cron job not running"

```bash
# Cron 데몬 상태 확인
sudo systemctl status crond

# 데몬 시작
sudo systemctl start crond
sudo systemctl enable crond

# 크론 로그 확인
sudo tail -20 /var/log/cron
```

### ❌ "Permission denied" (Cron에서)

```bash
# Cron은 특정 권한으로 실행되므로, 경로 확인
crontab -l

# 절대 경로 확인
which auto-sync.sh

# 또는 전체 경로로 실행
* * * * * /home/ec2-user/docker/mysupabase/auto-sync.sh >> /home/ec2-user/logs/cron.log 2>&1
```

### ❌ "Git pull fails"

```bash
# Git 설정 확인
git config --global user.name
git config --global user.email

# SSH 키 확인 (SSH 방식 사용 시)
ls -la ~/.ssh/id_rsa

# 또는 HTTPS 사용
git remote set-url origin https://github.com/iloveaired9/mysupabase.git
```

### ❌ "Docker commands fail in cron"

```bash
# Cron은 제한된 환경에서 실행되므로
# docker를 sudoers에 추가

sudo visudo

# 다음 줄 추가:
ec2-user ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/local/bin/docker-compose

# 또는 docker 그룹에 사용자 추가
sudo usermod -aG docker ec2-user
```

---

## 수동 명령어

언제든 수동으로 동기화할 수 있습니다:

```bash
# 수동 동기화 실행
/home/ec2-user/docker/mysupabase/auto-sync.sh

# 또는 로컬에서 직접 실행
cd /home/ec2-user/docker/mysupabase
git pull origin main
docker-compose up -d
```

---

## 정기 점검 사항

### 주간 점검 (매주 월요일)

```bash
# 로그 파일 크기 확인
ls -lh /home/ec2-user/logs/

# 에러 로그 확인
cat /home/ec2-user/logs/auto-sync-error.log

# Cron 작업 확인
crontab -l

# Docker 이미지 정리
docker system prune
```

### 월간 점검 (매달 1일)

```bash
# 오래된 로그 압축
gzip /home/ec2-user/logs/auto-sync.log.*

# Docker 볼륨 확인
docker volume ls

# 저장소 상태 확인
cd /home/ec2-user/docker/mysupabase
git status
```

---

## 체크리스트

```
☑ 스크립트 다운로드
  git pull origin main

☑ 실행 권한 부여
  chmod +x auto-sync.sh

☑ 스크립트 테스트
  ./auto-sync.sh

☑ Cron 등록
  crontab -e
  * * * * * /home/ec2-user/docker/mysupabase/auto-sync.sh

☑ Cron 데몬 시작
  sudo systemctl start crond
  sudo systemctl enable crond

☑ 로그 확인
  tail /home/ec2-user/logs/auto-sync.log

☑ 모니터링 설정
  tail -f /home/ec2-user/logs/auto-sync.log
```

---

## 빠른 시작 (한 줄)

```bash
chmod +x /home/ec2-user/docker/mysupabase/auto-sync.sh && \
(crontab -l 2>/dev/null; echo "* * * * * /home/ec2-user/docker/mysupabase/auto-sync.sh") | crontab - && \
sudo systemctl start crond && \
echo "✅ Auto-sync setup complete!"
```

---

이제 GitHub 변경사항이 **자동으로 AWS에 배포됩니다!** 🚀

Happy Auto-Syncing! 🔄
