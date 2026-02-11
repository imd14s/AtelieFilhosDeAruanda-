# Relatório de Testes API (Execução Automática)
Data: qua 11 fev 2026 00:42:10 -03

Este relatório documenta a interação com a API, incluindo requisições e retornos.

## 1. Login (Admin)
**Rota**: `/api/auth/login` (POST)

**Requisição**:
```json
{"email":"admin@atelie.com", "password":"ECautomation@3009"}
```

**Retorno**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBhdGVsaWUuY29tIiwiaWF0IjoxNzcwNzgxMzMxLCJleHAiOjE3NzA4Njc3MzEsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0.WBA1eULy8epqFV9H0VwtHInlpafjHnXowwlVGv5NJZY",
    "name": null,
    "email": null,
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBhdGVsaWUuY29tIiwiaWF0IjoxNzcwNzgxMzMxLCJleHAiOjE3NzA4Njc3MzEsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0.WBA1eULy8epqFV9H0VwtHInlpafjHnXowwlVGv5NJZY"
}
```

---
## 2. Upload de Mídia (chapeu.png)
**Rota**: `/api/media/upload` (POST)

**Requisição**:
```json
(multipart/form-data: chapeu.png)
```

**Retorno**:
```json
{
    "id": 1,
    "type": "IMAGE",
    "storageKey": "8556aa77-2af1-4bfb-af68-7fd9b3237cf6.png",
    "originalFilename": "chapeu.png",
    "mimeType": "image/png",
    "sizeBytes": 245122,
    "checksumSha256": null,
    "createdAt": "2026-02-11T03:42:11.601005412Z",
    "public": true
}
```

---
## 2. Upload de Mídia (saia.png)
**Rota**: `/api/media/upload` (POST)

**Requisição**:
```json
(multipart/form-data: saia.png)
```

**Retorno**:
```json
{
    "id": 2,
    "type": "IMAGE",
    "storageKey": "0f0caab4-a672-49c1-a27c-35bd4e3eb79a.png",
    "originalFilename": "saia.png",
    "mimeType": "image/png",
    "sizeBytes": 121476,
    "checksumSha256": null,
    "createdAt": "2026-02-11T03:42:11.770992688Z",
    "public": true
}
```

---
## 2. Upload de Mídia (Chapéu de Couro Boiadeiro.mp4)
**Rota**: `/api/media/upload` (POST)

**Requisição**:
```json
(multipart/form-data: Chapéu de Couro Boiadeiro.mp4)
```

**Retorno**:
```json
{
    "type": "about:blank",
    "title": "Erro Interno do Servidor",
    "status": 500,
    "detail": "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    "instance": "/api/media/upload",
    "timestamp": "2026-02-11T03:42:12.134370011",
    "errors": null
}
```

---
## 3.1 Criar Categoria (Roupas)
**Rota**: `/api/categories` (POST)

**Requisição**:
```json
{"name": "Roupas", "active": true}
```

**Retorno**:
```json
{
    "id": "33724d73-1b6e-449f-bdd7-4b0d6a35b668",
    "name": "Roupas",
    "active": true
}
```

---
## 3.2 Criar Categoria (Acessórios)
**Rota**: `/api/categories` (POST)

**Requisição**:
```json
{"name": "Acessórios", "active": true}
```

**Retorno**:
```json
{
    "id": "3e94625b-5fa3-4ba3-89fc-1a59bdb709e5",
    "name": "Acess\u00f3rios",
    "active": true
}
```

---
## 4.1 Criar Produto (Chapéu)
**Rota**: `/api/products` (POST)

**Requisição**:
```json
{
  "title": "Chapéu de Couro Legítimo",
  "description": "Chapéu tradicional de alta qualidade.",
  "price": 250.00,
  "stock": 50,
  "category": "3e94625b-5fa3-4ba3-89fc-1a59bdb709e5",
  "media": [
    { "url": "http://localhost:8080/api/media/public/1", "type": "IMAGE", "isMain": true }
  ],
  "active": true
}
```

**Retorno**:
```json
{
    "id": "b775eb67-6429-41be-8d27-83a27a74680a",
    "name": "Chap\u00e9u de Couro Leg\u00edtimo",
    "description": "Chap\u00e9u tradicional de alta qualidade.",
    "price": 250.0,
    "stockQuantity": 50,
    "images": [
        "http://localhost:8080/api/media/public/1"
    ],
    "active": true,
    "alertEnabled": false,
    "createdAt": "2026-02-11T03:42:12.594646859",
    "updatedAt": "2026-02-11T03:42:12.594669758",
    "slug": "chap-u-de-couro-leg-timo-b775",
    "imageUrl": "http://localhost:8080/api/media/public/1",
    "category": "3e94625b-5fa3-4ba3-89fc-1a59bdb709e5"
}
```

---
## 5. Listar Produtos (Público)
**Rota**: `/api/products` (GET)

**Retorno**:
```json
{
    "content": [
        {
            "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "name": "Vela de 7 Dias Branca",
            "description": "Vela votiva de parafina pura, dura\u00e7\u00e3o estimada de 7 dias. Ideal para rituais de paz e firmeza de anjo da guarda.",
            "price": 12.9,
            "stockQuantity": 100,
            "images": [
                "https://placehold.co/600x400/EEE/31343C?text=Vela+7+Dias"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "vela-de-7-dias-branca-a0ee",
            "imageUrl": "https://placehold.co/600x400/EEE/31343C?text=Vela+7+Dias",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "name": "Incenso Artesanal de Arruda",
            "description": "Incenso natural de arruda para limpeza energ\u00e9tica e prote\u00e7\u00e3o do ambiente. Caixa com 10 varetas.",
            "price": 8.5,
            "stockQuantity": 200,
            "images": [
                "https://placehold.co/600x400/2E7D32/FFFFFF?text=Incenso+Arruda"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "incenso-artesanal-de-arruda-b0ee",
            "imageUrl": "https://placehold.co/600x400/2E7D32/FFFFFF?text=Incenso+Arruda",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
            "name": "Imagem de Oxal\u00e1 (20cm)",
            "description": "Estatueta de gesso resinado de Oxal\u00e1, acabamento fino e pintura manual. Altura 20cm.",
            "price": 89.9,
            "stockQuantity": 15,
            "images": [
                "https://placehold.co/600x400/FFFFFF/000000?text=Imagem+Oxala"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "imagem-de-oxal---20cm--c0ee",
            "imageUrl": "https://placehold.co/600x400/FFFFFF/000000?text=Imagem+Oxala",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
            "name": "Banho de Ervas - Abre Caminho",
            "description": "Mix de ervas secas selecionadas para banho de descarrego e abertura de caminhos. Cont\u00e9m levante, guin\u00e9 e alecrim.",
            "price": 25.0,
            "stockQuantity": 50,
            "images": [
                "https://placehold.co/600x400/81C784/000000?text=Banho+Ervas"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "banho-de-ervas---abre-caminho-d0ee",
            "imageUrl": "https://placehold.co/600x400/81C784/000000?text=Banho+Ervas",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
            "name": "Guia de Prote\u00e7\u00e3o Vermelha e Preta",
            "description": "Guia de prote\u00e7\u00e3o confeccionada com mi\u00e7angas de vidro e firma. Cores vibrantes.",
            "price": 45.0,
            "stockQuantity": 30,
            "images": [
                "https://placehold.co/600x400/B71C1C/FFFFFF?text=Guia+Protecao"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "guia-de-prote--o-vermelha-e-preta-e0ee",
            "imageUrl": "https://placehold.co/600x400/B71C1C/FFFFFF?text=Guia+Protecao",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
            "name": "Defumador Completo com Carv\u00e3o",
            "description": "Kit contendo turibulo pequeno, carv\u00e3o vegetal e mix de resinas sagradas para defuma\u00e7\u00e3o.",
            "price": 110.0,
            "stockQuantity": 10,
            "images": [
                "https://placehold.co/600x400/5D4037/FFFFFF?text=Defumador"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:41:56.939698",
            "updatedAt": "2026-02-11T03:41:56.939698",
            "slug": "defumador-completo-com-carv-o-f0ee",
            "imageUrl": "https://placehold.co/600x400/5D4037/FFFFFF?text=Defumador",
            "category": "a2b7f478-1152-4e15-be75-5433a2a4c505"
        },
        {
            "id": "b775eb67-6429-41be-8d27-83a27a74680a",
            "name": "Chap\u00e9u de Couro Leg\u00edtimo",
            "description": "Chap\u00e9u tradicional de alta qualidade.",
            "price": 250.0,
            "stockQuantity": 50,
            "images": [
                "http://localhost:8080/api/media/public/1"
            ],
            "active": true,
            "alertEnabled": false,
            "createdAt": "2026-02-11T03:42:12.594647",
            "updatedAt": "2026-02-11T03:42:12.59467",
            "slug": "chap-u-de-couro-leg-timo-b775",
            "imageUrl": "http://localhost:8080/api/media/public/1",
            "category": "3e94625b-5fa3-4ba3-89fc-1a59bdb709e5"
        }
    ],
    "pageable": {
        "pageNumber": 0,
        "pageSize": 20,
        "sort": {
            "unsorted": true,
            "sorted": false,
            "empty": true
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
    },
    "totalPages": 1,
    "totalElements": 7,
    "last": true,
    "first": true,
    "numberOfElements": 7,
    "size": 20,
    "number": 0,
    "sort": {
        "unsorted": true,
        "sorted": false,
        "empty": true
    },
    "empty": false
}
```

---
