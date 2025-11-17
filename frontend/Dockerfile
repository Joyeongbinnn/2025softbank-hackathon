# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 설치
COPY package*.json ./
RUN npm ci

# 소스 복사
COPY . .

# Next 정적 export (out/ 생성)
RUN npm run build


# ----------------------
# 2단계: 정적 파일 서빙
# ----------------------
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

# 정적 export 결과(out)를 컨테이너 내 build 디렉터리로 복사
COPY --from=builder /app/out ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "0.0.0.0:3000"]
