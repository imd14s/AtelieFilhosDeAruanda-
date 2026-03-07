#!/bin/bash

echo "🛡️  [Push Guard] Iniciando validação rigorosa do ecossistema antes do push..."

# 1. Backend Validation
echo "☕ Verificando Backend (Compilação e Testes Arquiteturais)..."
cd backend
# Executa os testes do backend
if ! mvn clean test; then
  echo "❌ Erro no Backend! Testes ou compilação falharam. Push cancelado."
  exit 1
fi
cd ..

# 2. Frontend Validation
echo "⚛️ Verificando Frontend (Typecheck, Linting Estrito e Testes)..."
cd frontend
# Adicionado --max-warnings 0 para espelhar o comando de build e evitar quebra no deploy
# Adicionado npm test para rodar a suíte do Vitest exigida pela CI
if ! (npm run typecheck && npx eslint . --max-warnings 0 && npm run test); then
  echo "❌ Erro no Frontend! Problema de tipagem, warnings no linter ou falha nos testes. Push cancelado."
  exit 1
fi
cd ..

# 3. Dashboard Admin Validation
echo "📊 Verificando Dashboard Admin (Typecheck, Linting Estrito e Testes)..."
cd dashboard-admin
if ! (npm run typecheck && npx eslint . --max-warnings 0 && npm run test); then
  echo "❌ Erro no Dashboard! Problema de tipagem, warnings no linter ou falha nos testes. Push cancelado."
  exit 1
fi
cd ..

echo "✅ Ecossistema íntegro e testado! Push liberado."
exit 0