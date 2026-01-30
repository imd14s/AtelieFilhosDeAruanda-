# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Copia código e compila
COPY . .
# Ignora checagem de tipos estrita no build para garantir que suba (Opcional, mas recomendado para MVP)
# Se preferir rigoroso, use apenas "npm run build"
RUN npm run build -- --emptyOutDir

# --- Stage 2: Serve (Nginx) ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove arquivos padrão do Nginx
RUN rm -rf ./*

# Copia os estáticos gerados pelo Vite (pasta dist)
COPY --from=builder /app/dist .

# Configuração necessária para SPA (Redireciona 404 para index.html)
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
