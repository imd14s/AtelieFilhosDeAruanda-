#!/bin/bash
set -euo pipefail

# ========================================
# Ateliê Filhos de Aruanda — Dev Startup
# ========================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT_DIR/.dev-logs"
REPORT="$ROOT_DIR/terminal_erro.md"

BACKEND_LOG="$LOG_DIR/backend.log"
DASHBOARD_LOG="$LOG_DIR/dashboard.log"
STORE_LOG="$LOG_DIR/store.log"

BACKEND_WAIT=30   # segundos de espera para o backend iniciar
DB_WAIT=8         # segundos de espera para o DB ficar healthy

# ── Cores ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[$1]${NC} $2"; }
ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
fail() { echo -e "${RED}  ❌ $1${NC}"; }

# ── 0. Preparar diretório de logs ──
mkdir -p "$LOG_DIR"
: > "$BACKEND_LOG"
: > "$DASHBOARD_LOG"
: > "$STORE_LOG"

# ── 1. Limpeza de portas ──
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
    warn "Porta $port liberada (PID: $pids)"
  fi
}

log "LIMPEZA" "Liberando portas..."
kill_port 8080
kill_port 3000
kill_port 5173

# ── 2. Carregar .env ──
log "ENV" "Carregando variáveis de ambiente..."
set -a
source "$ROOT_DIR/.env"
set +a
ok "Variáveis carregadas"

# ── 3. Docker DB ──
log "DOCKER" "Subindo PostgreSQL..."
docker compose -f "$ROOT_DIR/docker-compose.yml" down --remove-orphans 2>/dev/null || true
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d

log "DOCKER" "Aguardando DB ficar healthy (${DB_WAIT}s)..."
sleep "$DB_WAIT"

if docker compose -f "$ROOT_DIR/docker-compose.yml" ps | grep -q "healthy"; then
  ok "PostgreSQL healthy"
else
  warn "PostgreSQL pode não estar pronto ainda"
fi

# ── 4. Dashboard Admin ──
log "DASHBOARD" "Iniciando na porta 3000..."
(cd "$ROOT_DIR/dashboard-admin" && npm run dev -- --port 3000) > "$DASHBOARD_LOG" 2>&1 &
DASHBOARD_PID=$!

# ── 5. Store (Loja) ──
log "STORE" "Iniciando na porta 5173..."
(cd "$ROOT_DIR/frontend" && npm run dev -- --port 5173) > "$STORE_LOG" 2>&1 &
STORE_PID=$!

# ── 6. Backend ──
log "BACKEND" "Compilando e iniciando (porta 8080)..."
(cd "$ROOT_DIR/backend" && mvn spring-boot:run -DskipTests) > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

# ── 7. Aguardar e validar ──
log "VALIDAÇÃO" "Aguardando backend iniciar (${BACKEND_WAIT}s)..."

STARTED=false
for i in $(seq 1 "$BACKEND_WAIT"); do
  if grep -q "Started EcommerceApplication" "$BACKEND_LOG" 2>/dev/null; then
    STARTED=true
    break
  fi
  sleep 1
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "          STATUS DOS SERVIÇOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Validar Backend
if $STARTED; then
  BOOT_TIME=$(grep "Started EcommerceApplication" "$BACKEND_LOG" | grep -oP '\d+\.\d+ seconds' || echo "?")
  ok "Backend  → http://localhost:8080  ($BOOT_TIME)"
else
  fail "Backend  → FALHA ao iniciar (ver $BACKEND_LOG)"
fi

# Validar Dashboard
sleep 2
if grep -q "ready in" "$DASHBOARD_LOG" 2>/dev/null; then
  ok "Dashboard → http://localhost:3000"
else
  fail "Dashboard → FALHA (ver $DASHBOARD_LOG)"
fi

# Validar Store
if grep -q "ready in" "$STORE_LOG" 2>/dev/null; then
  ok "Store     → http://localhost:5173"
else
  fail "Store     → FALHA (ver $STORE_LOG)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 8. Gerar relatório de erros ──
generate_report() {
  local has_errors=false

  cat > "$REPORT" << 'HEADER'
# 🔴 Relatório de Erros — Dev Startup

> Gerado automaticamente pelo `start-dev.sh`.
> Verifique os logs completos em `.dev-logs/`.

HEADER

  echo "**Gerado em:** $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT"
  echo "" >> "$REPORT"

  # Backend — filtra apenas linhas de log reais com nível ERROR/Exception, ignorando SQL do Hibernate
  local backend_errors
  backend_errors=$(grep -E "(\] ERROR |\] FATAL |FAILED TO START|APPLICATION FAILED|Could not resolve placeholder|Caused by: [a-z])" "$BACKEND_LOG" 2>/dev/null | grep -v "common frames omitted" | head -30 || true)

  if [ -n "$backend_errors" ]; then
    has_errors=true
    cat >> "$REPORT" << EOF
## ❌ Backend (API)

\`\`\`
$backend_errors
\`\`\`

**Possíveis causas:**
EOF

    # Análise inteligente
    if echo "$backend_errors" | grep -q "Could not resolve placeholder"; then
      echo "- 🔑 **Variável de ambiente ausente.** Verifique o \`.env\`." >> "$REPORT"
      local missing_var
      missing_var=$(echo "$backend_errors" | grep -oP "'\K[^']+(?=')" | head -1)
      [ -n "$missing_var" ] && echo "  - Variável: \`$missing_var\`" >> "$REPORT"
    fi

    if echo "$backend_errors" | grep -q "circular"; then
      echo "- 🔄 **Dependência circular.** Use \`@Lazy\` no bean problemático." >> "$REPORT"
    fi

    if echo "$backend_errors" | grep -q "Connection.*refused\|UnknownHostException"; then
      echo "- 🗄️ **Banco de dados inacessível.** Verifique se o Docker está rodando: \`docker compose ps\`" >> "$REPORT"
    fi

    if echo "$backend_errors" | grep -q "column.*does not exist\|relation.*does not exist"; then
      echo "- 📋 **Schema desatualizado.** Execute \`mvn flyway:repair\` ou verifique as migrations." >> "$REPORT"
    fi

    if echo "$backend_errors" | grep -q "Flyway\|checksum"; then
      echo "- 🛩️ **Flyway checksum mismatch.** Execute: \`mvn flyway:repair -f backend/pom.xml\`" >> "$REPORT"
    fi

    if echo "$backend_errors" | grep -q "COMPILATION ERROR\|cannot be applied"; then
      echo "- 🔨 **Erro de compilação.** Verifique assinaturas de métodos e imports." >> "$REPORT"
    fi

    echo "" >> "$REPORT"
  fi

  # Dashboard
  local dashboard_errors
  dashboard_errors=$(grep -iE "ERROR|error|failed|ENOENT|EACCES" "$DASHBOARD_LOG" 2>/dev/null | head -10 || true)

  if [ -n "$dashboard_errors" ]; then
    has_errors=true
    cat >> "$REPORT" << EOF
## ❌ Dashboard Admin

\`\`\`
$dashboard_errors
\`\`\`

**Possíveis causas:**
- 📦 Rode \`npm install\` em \`dashboard-admin/\`
- 🔌 Porta 3000 pode estar ocupada

EOF
  fi

  # Store
  local store_errors
  store_errors=$(grep -iE "ERROR|error|failed|ENOENT|EACCES" "$STORE_LOG" 2>/dev/null | head -10 || true)

  if [ -n "$store_errors" ]; then
    has_errors=true
    cat >> "$REPORT" << EOF
## ❌ Store (Loja)

\`\`\`
$store_errors
\`\`\`

**Possíveis causas:**
- 📦 Rode \`npm install\` em \`frontend/\`
- 🔌 Porta 5173 pode estar ocupada

EOF
  fi

  if ! $has_errors; then
    echo "## ✅ Nenhum erro detectado" >> "$REPORT"
    echo "" >> "$REPORT"
    echo "Todos os serviços iniciaram sem erros nos logs." >> "$REPORT"
  fi
}

generate_report

if grep -q "❌" "$REPORT"; then
  warn "Erros detectados! Veja: terminal_erro.md"
else
  ok "Nenhum erro detectado."
fi

# ── 9. Finalização ──
echo ""
log "PRONTO" "Todos os serviços estão rodando em background."
echo ""
echo "  📄 Relatório de erros: terminal_erro.md"
echo "  📁 Logs completos:    .dev-logs/"
echo ""
echo "  Para parar tudo:"
echo "    kill $BACKEND_PID $DASHBOARD_PID $STORE_PID"
echo "    docker compose down"
echo ""