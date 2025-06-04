FROM node:18-alpine as builder

WORKDIR /app
COPY . .
COPY .env.production .env

RUN npm install
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
