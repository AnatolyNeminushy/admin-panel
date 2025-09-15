# frontend/Dockerfile

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Протаскиваем адрес API в билд (из args compose)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine
# наш конфиг проксирует /api → http://backend:5000
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
