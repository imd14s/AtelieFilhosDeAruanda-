#!/bin/bash
export DB_HOST=localhost
export DB_PORT=$(docker compose -f ../docker-compose.yml port db 5432 | cut -d: -f2)
export DB_NAME=ecommerce_db
export DB_USER=postgres
export DB_PASSWORD=local_dev_password
export JWT_SECRET=TXlTdXBlclNlY3JldEtZX0Zvcl9EZXZFbHZpcm9ubWVudF9NdXN0X0JlX0xvbmdfQU5EX0Jhc2U2NA==
export JWT_EXPIRATION_MS=86400000
export WEBHOOK_SECRET=dev_secret_webhook_123
export UPLOAD_DIR=uploads
export MAX_UPLOAD_MB=50
export ALLOWED_IMAGE_MIME=image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime
export ADMIN_EMAIL=admin@atelie.com
export ADMIN_PASSWORD=ECautomation@3009
export MAIL_HOST=localhost
export MAIL_PORT=1025
export MAIL_USERNAME=dev
export MAIL_PASSWORD=dev
export FRONTEND_URL=http://localhost:5173

# Limpeza de processos na porta 8080
echo "Cleaning up port 8080..."
fuser -k 8080/tcp 2>/dev/null || true

mvn spring-boot:run -Dmaven.test.skip=true > backend_monitor.log 2>&1 &
echo " Backend starting... check backend_monitor.log"
