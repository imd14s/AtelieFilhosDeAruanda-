#!/bin/bash
# Carrega variáveis do .env ignorando comentários e linhas vazias
# Usa export para garantir que o Maven enxergue as variáveis
while IFS='=' read -r key value; do
    if [[ ! $key =~ ^# && -n $key ]]; then
        # Remove eventuais aspas do valor
        eval export "$key='$value'"
    fi
done < ../.env

mvn spring-boot:run -Dmaven.test.skip=true
