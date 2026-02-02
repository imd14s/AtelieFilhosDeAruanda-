#!/bin/bash
# Gerador de Relatório de Auditoria - Contrato de Engenharia
mkdir -p _audit

REPORT="_audit/PROJECT_SCAN_REPORT.txt"
echo "=== PROJECT SCAN REPORT - $(date) ===" > $REPORT

echo -e "\n--- 1. ESTRUTURA DE DIRETÓRIOS (Depth 5) ---" >> $REPORT
tree -L 5 -I "target|node_modules|.git|.idea|.vscode|dist|build" >> $REPORT

echo -e "\n--- 2. DETECÇÃO DE SUBPROJETOS ---" >> $REPORT
[ -d "backend" ] && echo "[OK] Backend (Spring Boot) detectado" >> $REPORT
[ -d "dashboard-admin" ] && echo "[OK] Dashboard Admin detectado" >> $REPORT
[ -d "frontend" ] && echo "[OK] Frontend detectado" >> $REPORT

echo -e "\n--- 3. MAPEAMENTO DE VARIÁVEIS DE AMBIENTE (Detectadas no Código) ---" >> $REPORT
echo "Spring Boot (Backend):" >> $REPORT
grep -r "env.getProperty" backend/src/main | sed 's/.*getProperty(\"\([^\"]*\)\".*/\1/' | sort -u >> $REPORT
grep -r "@Value(\"\${" backend/src/main | sed 's/.*${\([^:}]*\).*/\1/' | sort -u >> $REPORT

echo -e "\n--- 4. RADAR HEURÍSTICO DE HARDCODE ---" >> $REPORT
echo "URLs detectadas no código (Suspeitas de Hardcode):" >> $REPORT
grep -rE "https?://[a-zA-Z0-9./_-]+" backend/src/main --exclude-dir=test | grep -v "springdoc\|schemas\|maven" >> $REPORT

echo "Tokens/Secrets/Senhas suspeitos:" >> $REPORT
grep -rEi "password|secret|token|key|auth" backend/src/main --exclude-dir=test | grep "=" | grep -vE "private|String|final" >> $REPORT

echo -e "\n--- 5. ARQUIVOS CHAVE DE INFRA ---" >> $REPORT
echo "Docker Compose:" >> $REPORT
[ -f "docker-compose.yml" ] && cat docker-compose.yml >> $REPORT || echo "docker-compose.yml não encontrado na raiz" >> $REPORT

echo "Relatório gerado em: $REPORT"
