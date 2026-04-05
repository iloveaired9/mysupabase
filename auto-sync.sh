#!/bin/bash

###############################################################################
# Auto Sync Script for mysupabase
# GitHub에서 최신 코드를 받고 Docker 컨테이너를 동기화
# 실행 주기: 매 1분 (cron)
###############################################################################

# 설정
PROJECT_DIR="/home/ec2-user/docker/mysupabase"
LOG_DIR="/home/ec2-user/logs"
LOG_FILE="$LOG_DIR/auto-sync.log"
ERROR_LOG="$LOG_DIR/auto-sync-error.log"

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 현재 시간
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 프로젝트 디렉토리 확인
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[$TIMESTAMP] ERROR: Project directory not found: $PROJECT_DIR" >> "$ERROR_LOG"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

###############################################################################
# 1. Git Pull (최신 코드 받기)
###############################################################################

echo "[$TIMESTAMP] Starting auto-sync..." >> "$LOG_FILE"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 로컬 변경사항 확인
if [ "$(git status --porcelain)" ]; then
    echo "[$TIMESTAMP] WARNING: Local changes detected. Stashing..." >> "$LOG_FILE"
    git stash >> "$LOG_FILE" 2>&1
fi

# Git pull 실행
if git pull origin "$CURRENT_BRANCH" >> "$LOG_FILE" 2>&1; then
    PULL_STATUS="SUCCESS"
    echo "[$TIMESTAMP] Git pull SUCCESS" >> "$LOG_FILE"
else
    PULL_STATUS="FAILED"
    echo "[$TIMESTAMP] ERROR: Git pull failed" >> "$ERROR_LOG"
fi

###############################################################################
# 2. Docker 동기화
###############################################################################

# 변경사항이 있으면 Docker 재빌드
if [ "$PULL_STATUS" = "SUCCESS" ]; then
    # Dockerfile이 변경되었는지 확인
    if git diff HEAD~1 HEAD --name-only | grep -q "Dockerfile\|docker-compose.yml"; then
        echo "[$TIMESTAMP] Dockerfile or docker-compose.yml changed. Rebuilding..." >> "$LOG_FILE"

        # 이미지 재빌드
        if docker-compose build --no-cache 2>&1 | tee -a "$LOG_FILE" | grep -q "error"; then
            echo "[$TIMESTAMP] ERROR: Docker build failed" >> "$ERROR_LOG"
        else
            echo "[$TIMESTAMP] Docker build SUCCESS" >> "$LOG_FILE"
        fi
    fi

    # 컨테이너 상태 확인 및 재시작
    if docker-compose ps | grep -q "Down\|Exit"; then
        echo "[$TIMESTAMP] Some containers are down. Restarting..." >> "$LOG_FILE"
        docker-compose down >> "$LOG_FILE" 2>&1
        docker-compose up -d >> "$LOG_FILE" 2>&1
        echo "[$TIMESTAMP] Docker restart SUCCESS" >> "$LOG_FILE"
    fi
fi

###############################################################################
# 3. 서비스 헬스 체크
###############################################################################

# Backend 상태 확인
if curl -s http://localhost:3000/api/posts > /dev/null 2>&1; then
    echo "[$TIMESTAMP] Backend API: OK" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] WARNING: Backend API not responding" >> "$ERROR_LOG"
    docker-compose logs backend | tail -5 >> "$ERROR_LOG"
fi

# PostgREST 상태 확인
if curl -s http://localhost:3001/posts > /dev/null 2>&1; then
    echo "[$TIMESTAMP] PostgREST API: OK" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] WARNING: PostgREST API not responding" >> "$ERROR_LOG"
fi

# PostgreSQL 상태 확인
if docker exec supabase-postgres pg_isready -U supabase > /dev/null 2>&1; then
    echo "[$TIMESTAMP] PostgreSQL: OK" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] WARNING: PostgreSQL not ready" >> "$ERROR_LOG"
fi

###############################################################################
# 4. 정리 (로그 로테이션)
###############################################################################

# 로그 파일 크기 확인 (100MB 이상이면 압축)
if [ -f "$LOG_FILE" ]; then
    SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
    if [ "$SIZE" -gt 104857600 ]; then
        gzip -f "$LOG_FILE"
        echo "[$TIMESTAMP] Log file compressed" >> "$ERROR_LOG"
    fi
fi

echo "[$TIMESTAMP] Auto-sync completed" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
