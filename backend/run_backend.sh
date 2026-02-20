#!/bin/bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=ecommerce_db
export DB_USER=postgres
export DB_PASSWORD=local_dev_password
export JWT_SECRET=TXlTdXBlclNlY3JldEtZX0Zvcl9EZXZFbHZpcm9ubWVudF9NdXN0X0JlX0xvbmdfQU5EX0Jhc2U2NA==
export JWT_EXPIRATION_MS=86400000
export WEBHOOK_SECRET=dev_secret_webhook_123
export UPLOAD_DIR=uploads
export MAX_UPLOAD_MB=50
export ALLOWED_IMAGE_MIME=image/png,image/jpeg,video/mp4
export ADMIN_EMAIL=admin@atelie.com
export ADMIN_PASSWORD=ECautomation@3009

mvn spring-boot:run > backend_monitor.log 2>&1 &
echo " Backend starting... check backend_monitor.log"
