FROM node:18 AS builder

WORKDIR /app
COPY . .
COPY package*.json ./
RUN npm install
COPY .env.production .env
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]