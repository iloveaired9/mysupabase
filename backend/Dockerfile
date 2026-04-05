# Node.js API 서버 Dockerfile

FROM node:20-alpine

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 애플리케이션 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 서버 시작
CMD ["npm", "start"]
