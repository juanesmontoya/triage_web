FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Servir con Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /app/nginx.config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
