# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Установим зависимости
COPY package*.json ./
# Используем npm ci для воспроизводимых сборок
RUN npm ci --omit=dev

# Копируем код
COPY . .

# Переменные окружения (можно переопределить через .env)
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "index.js"]
