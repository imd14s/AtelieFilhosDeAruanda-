# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Argumentos de Build (Vite precisa disso aqui)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx vite build --emptyOutDir

# --- Stage 2: Serve ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
# Configuração SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
