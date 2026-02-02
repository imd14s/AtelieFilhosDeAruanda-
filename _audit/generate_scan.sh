#!/bin/bash

REPORT="_audit/PROJECT_SCAN_REPORT.txt"
echo "=== PROJECT SCAN REPORT (v1.0) ===" > "$REPORT"
echo "Date: $(date)" >> "$REPORT"
echo "Root: $(pwd)" >> "$REPORT"

# 1. Mapeamento de Estrutura (Ignorando lixo de compilação)
echo -e "\n\n1. ESTRUTURA DE DIRETÓRIOS (Depth 4)" >> "$REPORT"
find . -maxdepth 5 \
  -not -path '*/.*' \
  -not -path '*/node_modules*' \
  -not -path '*/target*' \
  -not -path '*/dist*' \
  -not -path '*/build*' \
  -not -path '*/.next*' \
  -not -path '*/_audit*' \
  -not -path '*/coverage*' \
  | sort >> "$REPORT"

# 2. Arquivos Chave de Configuração
echo -e "\n\n2. ARQUIVOS DE CONFIGURAÇÃO CRÍTICOS" >> "$REPORT"
find . -type f \( \
  -name "Dockerfile*" -o \
  -name "docker-compose*.yml" -o \
  -name "*.env*" -o \
  -name "pom.xml" -o \
  -name "build.gradle" -o \
  -name "package.json" -o \
  -name "application.yml" -o \
  -name "application.properties" -o \
  -name "next.config.*" -o \
  -name "vite.config.*" \
\) -not -path '*/node_modules*' -not -path '*/target*' >> "$REPORT"

# 3. Detecção de Variáveis de Ambiente
echo -e "\n\n3. MAPA DE USO DE ENV VARS" >> "$REPORT"
echo "--- Java (Spring \${VAR}) ---" >> "$REPORT"
grep -r "\${[A-Z0-9_]\+}" . \
  --include="*.java" --include="*.xml" --include="*.yml" --include="*.properties" \
  --exclude-dir="target" --exclude-dir="node_modules" --exclude-dir=".git" \
  | cut -c 1-120 >> "$REPORT"

echo -e "\n--- Node/Frontend (process.env / import.meta.env) ---" >> "$REPORT"
grep -rE "process\.env\.[A-Z0-9_]+|import\.meta\.env\.[A-Z0-9_]+" . \
  --include="*.js" --include="*.ts" --include="*.tsx" --include="*.jsx" \
  --exclude-dir="node_modules" --exclude-dir=".next" --exclude-dir="dist" --exclude-dir="target" \
  | cut -c 1-120 >> "$REPORT"

# 4. Radar de Hardcode (URLs e Credenciais expostas)
echo -e "\n\n4. RADAR HEURÍSTICO DE HARDCODE (Amostra)" >> "$REPORT"
grep -rE "http://|https://|Bearer |api_key|password.*=.*[\"']" . \
  --include="*.java" --include="*.js" --include="*.ts" --include="*.tsx" \
  --exclude-dir="node_modules" --exclude-dir="target" --exclude-dir="dist" --exclude-dir=".git" \
  --exclude-dir="_audit" \
  | grep -vE "import|package|//|/\*|console.log" \
  | cut -c 1-120 >> "$REPORT"

echo "Scan completo. Relatório gerado em: $REPORT"
