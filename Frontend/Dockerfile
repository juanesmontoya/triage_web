FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm cache clean --force
RUN npm install
EXPOSE 3001
ENV HOST 0.0.0.0
ENV PORT 3001
CMD ["npm", "run", "dev"]