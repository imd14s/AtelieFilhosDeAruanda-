#!/bin/bash

# Configurações
BASE_URL="http://localhost:8080/api"
REPORT="_audit/ROTAS_AND_REQUEST.md"
IMAGES_DIR="/home/imdias/workspace/AtelieFilhosDeAruanda-/images"
mkdir -p _audit

# Helper para extrair JSON usando Python
get_json_value() {
  echo "$1" | python3 -c "import sys, json; print(json.load(sys.stdin).get('$2', ''))" 2>/dev/null
}

# Início do Relatório
echo "# Relatório de Testes API (Execução Automática)" > $REPORT
echo "Data: $(date)" >> $REPORT
echo "" >> $REPORT
echo "Este relatório documenta a interação com a API, incluindo requisições e retornos." >> $REPORT
echo "" >> $REPORT

log_transaction() {
  TITLE="$1"
  ROUTE="$2"
  METHOD="$3"
  PAYLOAD="$4"
  RESPONSE="$5"

  echo "## $TITLE" >> $REPORT
  echo "**Rota**: \`$ROUTE\` ($METHOD)" >> $REPORT
  echo "" >> $REPORT
  
  if [ ! -z "$PAYLOAD" ]; then
    echo "**Requisição**:" >> $REPORT
    echo "\`\`\`json" >> $REPORT
    echo "$PAYLOAD" >> $REPORT
    echo "\`\`\`" >> $REPORT
    echo "" >> $REPORT
  fi

  echo "**Retorno**:" >> $REPORT
  echo "\`\`\`json" >> $REPORT
  # Formata o JSON se possível
  echo "$RESPONSE" | python3 -m json.tool >> $REPORT 2>>$REPORT || echo "$RESPONSE" >> $REPORT
  echo "\`\`\`" >> $REPORT
  echo "" >> $REPORT
  echo "---" >> $REPORT
}

# 1. Autenticação
echo "Autenticando..."
LOGIN_PAYLOAD='{"email":"admin@atelie.com", "password":"ECautomation@3009"}'
LOGIN_RES=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "$LOGIN_PAYLOAD")
TOKEN=$(get_json_value "$LOGIN_RES" "accessToken")

log_transaction "1. Login (Admin)" "/api/auth/login" "POST" "$LOGIN_PAYLOAD" "$LOGIN_RES"

if [ -z "$TOKEN" ]; then
  echo "ERRO: Falha no login. Abortando testes."
  exit 1
fi
echo "Login OK."

# 2. Upload de Mídia
MEDIA_IDS=()
MEDIA_URLS=()

for FILE_NAME in "chapeu.png" "saia.png" "Chapéu de Couro Boiadeiro.mp4"; do
  FILE_PATH="$IMAGES_DIR/$FILE_NAME"
  if [ -f "$FILE_PATH" ]; then
    echo "Enviando $FILE_NAME..."
    # Configura category baseado no nome (simplificado)
    CATEGORY="products"
    
    RES=$(curl -s -X POST "$BASE_URL/media/upload" \
      -H "Authorization: Bearer $TOKEN" \
      -F "file=@$FILE_PATH" \
      -F "category=$CATEGORY" \
      -F "public=true")
    
    log_transaction "2. Upload de Mídia ($FILE_NAME)" "/api/media/upload" "POST" "(multipart/form-data: $FILE_NAME)" "$RES"
    
    ID=$(get_json_value "$RES" "id")
    if [ ! -z "$ID" ]; then
        MEDIA_IDS+=("$ID")
        # Constrói URL Pública
        MEDIA_URLS+=("$BASE_URL/media/public/$ID")
    fi
  else
    echo "AVISO: Arquivo $FILE_NAME não encontrado em $IMAGES_DIR"
  fi
done

# 3. Criar Categorias
echo "Criando categorias..."
CAT_ROUPAS=""
CAT_ACESSORIOS=""

PAYLOAD_ROUPAS='{"name": "Roupas", "active": true}'
RES_ROUPAS=$(curl -s -X POST "$BASE_URL/categories" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PAYLOAD_ROUPAS")
log_transaction "3.1 Criar Categoria (Roupas)" "/api/categories" "POST" "$PAYLOAD_ROUPAS" "$RES_ROUPAS"
CAT_ROUPAS=$(get_json_value "$RES_ROUPAS" "id")

PAYLOAD_ACESSORIOS='{"name": "Acessórios", "active": true}'
RES_ACESSORIOS=$(curl -s -X POST "$BASE_URL/categories" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PAYLOAD_ACESSORIOS")
log_transaction "3.2 Criar Categoria (Acessórios)" "/api/categories" "POST" "$PAYLOAD_ACESSORIOS" "$RES_ACESSORIOS"
CAT_ACESSORIOS=$(get_json_value "$RES_ACESSORIOS" "id")

# 4. Criar Produtos (com Mídia)
if [ ! -z "$CAT_ACESSORIOS" ] && [ ${#MEDIA_URLS[@]} -gt 0 ]; then
  echo "Criando produto Chapéu..."
  # Pega a primeira URL (chapeu.png)
  IMG_URL="${MEDIA_URLS[0]}"
  
  PRODUCT_PAYLOAD=$(cat <<EOF
{
  "title": "Chapéu de Couro Legítimo",
  "description": "Chapéu tradicional de alta qualidade.",
  "price": 250.00,
  "stock": 50,
  "category": "$CAT_ACESSORIOS",
  "media": [
    { "url": "$IMG_URL", "type": "IMAGE", "isMain": true }
  ],
  "active": true
}
EOF
)
  RES_PROD=$(curl -s -X POST "$BASE_URL/products" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PRODUCT_PAYLOAD")
  log_transaction "4.1 Criar Produto (Chapéu)" "/api/products" "POST" "$PRODUCT_PAYLOAD" "$RES_PROD"
fi

# Se houver vídeo (índice 2)
if [ ! -z "$CAT_ROUPAS" ] && [ ${#MEDIA_URLS[@]} -gt 2 ]; then
  echo "Criando produto com Vídeo..."
  VIDEO_URL="${MEDIA_URLS[2]}" # O mp4
  
  PRODUCT_PAYLOAD_VIDEO=$(cat <<EOF
{
  "title": "Coleção Boiadeiro (Vídeo)",
  "description": "Vídeo demonstrativo da coleção.",
  "price": 0.00,
  "stock": 1,
  "category": "$CAT_ROUPAS",
  "media": [
    { "url": "$VIDEO_URL", "type": "VIDEO", "isMain": true }
  ],
  "active": true
}
EOF
)
  RES_PROD_VIDEO=$(curl -s -X POST "$BASE_URL/products" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$PRODUCT_PAYLOAD_VIDEO")
  log_transaction "4.2 Criar Produto com Vídeo" "/api/products" "POST" "$PRODUCT_PAYLOAD_VIDEO" "$RES_PROD_VIDEO"
fi

# 5. Listar Produtos (Público)
echo "Listando produtos..."
RES_LIST=$(curl -s -X GET "$BASE_URL/products")
log_transaction "5. Listar Produtos (Público)" "/api/products" "GET" "" "$RES_LIST"

echo "Testes concluídos. Relatório gerado em $REPORT"
