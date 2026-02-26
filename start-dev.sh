#!/bin/bash

echo "🛑 Iniciando limpeza de ambiente..."

# Função para identificar e matar processos travados nas portas
kill_port() {
  PORT=$1
  # lsof lista processos; -t retorna só o PID; -i filtra pela porta
  PID=$(lsof -ti:$PORT)
  
  if [ ! -z "$PID" ]; then
    echo "💥 Matando processo preso na porta $PORT (PID: $PID)..."
    kill -9 $PID
  else
    echo "✅ Porta $PORT já está livre."
  fi
}

# 1. Liberar todas as portas antes de começar
echo "🧹 Limpando conexões antigas..."
kill_port 8080 # API
kill_port 3000 # Dashboard
kill_port 5173 # Loja

# 2. Reiniciar o Banco de Dados (Docker)
echo "🐳 Derrubando e recriando os containers do Docker..."
docker-compose down
docker-compose up -d
echo "⏳ Aguardando 5 segundos para o banco de dados inicializar completamente..."
sleep 5 

# 3. Iniciar o Dashboard Admin em background (&)
echo "🖥️ Subindo Dashboard Admin (Porta 3000)..."
cd dashboard-admin
# Descomente a linha abaixo se quiser que o script instale pacotes novos sempre
# npm install 
npm run dev -- --port 3000 &
cd ..

# 4. Iniciar a Loja Frontend em background (&)
echo "🛒 Subindo Loja (Porta 5173)..."
cd frontend
# Descomente a linha abaixo se quiser que o script instale pacotes novos sempre
# npm install 
npm run dev -- --port 5173 &
cd ..

# 5. Iniciar a API em foreground
echo "🚀 Iniciando API Backend (Porta 8080)..."
echo "👀 O log da API ficará preso neste terminal para você analisar em tempo real. Para parar tudo, pressione Ctrl+C."
cd backend
mvn clean package spring-boot:run -DskipTests