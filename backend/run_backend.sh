#!/bin/bash
cd "$(dirname "$0")"
# Carregar variáveis do arquivo .env (se existir)
if [ -f ../.env ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Valores padrão caso não definidos no .env
export DB_URL=${DB_URL:-jdbc:postgresql://localhost:5432/ecommerce_db}
export DB_USER=${DB_USER:-postgres}
export DB_PASSWORD=${DB_PASSWORD:-local_dev_password}
export DB_NAME=${DB_NAME:-neondb}

export JWT_SECRET=${JWT_SECRET:-TXlTdXBlclNlY3JldEtZX0Zvcl9EZXZFbHZpcm9ubWVudF9NdXN0X0JlX0xvbmdfQU5EX0Jhc2U2NA==}
export JWT_EXPIRATION_MS=${JWT_EXPIRATION_MS:-86400000}
export ADMIN_EMAIL=${ADMIN_EMAIL:-admin@atelie.com}
export ADMIN_PASSWORD=${ADMIN_PASSWORD:-ECautomation@3009}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

# Limpeza de processos na porta 8080
echo "Cleaning up port 8080..."
fuser -k 8080/tcp 2>/dev/null || true

mvn spring-boot:run -Dmaven.test.skip=true > backend_monitor.log 2>&1 &
echo " Backend starting... check backend_monitor.log"
