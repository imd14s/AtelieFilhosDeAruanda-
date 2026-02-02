# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Argumentos de Build
ARG VITE_WIX_CLIENT_ID
ENV VITE_WIX_CLIENT_ID=$VITE_WIX_CLIENT_ID

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build -- --emptyOutDir

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
