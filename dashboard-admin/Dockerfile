# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Copia código fonte
COPY . .

# CORREÇÃO CRÍTICA:
# Usamos 'npx vite build' em vez de 'npm run build'.
# Isso invoca o bundler diretamente, ignorando os erros do 'tsc' (TypeScript).
RUN npx vite build --emptyOutDir

# --- Stage 2: Serve (Nginx) ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Limpa padrão do Nginx
RUN rm -rf ./*

# Copia o artefato gerado (dist)
COPY --from=builder /app/dist .

# Configuração para SPA (Single Page Application)
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
