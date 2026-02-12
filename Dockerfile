# Build React App
FROM node:alpine3.18 as build
WORKDIR /app

# //* [Added Code] 빌드 타임 환경 변수 수신 설정
ARG VITE_AUTH_CLIENT_ID
ENV VITE_AUTH_CLIENT_ID=$VITE_AUTH_CLIENT_ID

COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


# Server Setting nginx
FROM nginx:1.23-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *
COPY --from=build /app/dist .
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
