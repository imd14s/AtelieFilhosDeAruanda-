# Relatório de Teste Visual e Funcional

## Objetivo
Verificar visualmente e funcionalmente todas as funcionalidades da aplicação, com foco nas correções recentes de autenticação e formulário de produtos.

## Data e Hora do Teste
2026-02-10 19:15

## Ambiente
- Backend: Local (Porta 8080) - *Nota: Backend não reiniciado automaticamente após alterações de código.*
- Dashboard Admin: Local (Porta 3000)
- Store Frontend: Local (Porta 5173)
- Banco de Dados: Docker (PostgreSQL 16)

## Sumário de Testes Executados

### 1. Correções Críticas (Admin)
- [x] **Input de Categoria (ProductForm)**: **SUCESSO**.
    - O campo não perde mais foco ao digitar.
    - O valor "Roupas" foi mantido corretamente.
- [!] **Criação de Produto**: **FALHA (Erro 500)**.
    - **Sintoma**: Ao salvar, o backend retorna erro 500 (`Internal Server Error`).
    - **Causa Raiz**: *Data Type Mismatch*. O frontend está enviando o **Nome** da categoria (String "Roupas") no payload, mas o endpoint do backend espera o **ID** da categoria (`UUID`).
    - **Ação Necessária**: Refatorar o `ProductForm.tsx` para buscar as categorias do backend e usar um componente `Select` (ou `CreatableSelect`) para enviar o UUID correto.

### 2. Gestão de Equipe (Admin)
- [x] **Interface Modal**: **SUCESSO**.
    - O modal "Convidar Membro" abre corretamente com os campos Nome, Email, Senha e Cargo.
- [!] **Envio de Convite**: **FALHA (Erro 401)**.
    - **Sintoma**: Ao clicar em salvar, o backend retorna erro 401 (`Unauthorized`).
    - **Causa Raiz**: Configuração de segurança (`SecurityConfig.java`) ou mapeamento de roles (`TokenProvider`) impedindo acesso ao endpoint `/api/admin/users`, mesmo com token de Admin.

### 3. Loja Pública (Storefront)
- [x] **Modal de Autenticação**: **SUCESSO**.
    - O modal abre e alterna corretamente entre Login e Cadastro.
- [!] **Cadastro de Usuário**: **FALHA (Erro 401)**.
    - **Sintoma**: Mensagem "Erro ao cadastrar". Console mostra erro 401 no `POST /api/auth/register`.
    - **Causa Raiz**: O endpoint `/api/auth/register` estava bloqueado por padrão no `SecurityConfig.java`.
    - **Status da Correção**: **Corrigido no código** (`SecurityConfig.java` atualizado para permitir acesso público), mas requer reinicialização do backend para surtir efeito.

## Diagnóstico Técnico Detalhado

### Erro 500 - Criação de Produto
O `ProductCreateRequest` no backend espera `@JsonProperty("category") UUID categoryId`.
O frontend envia `{"category": "Roupas"}`.
Jackson falha ao converter "Roupas" para UUID.
**Solução**: Implementar `CategoryService.getAll()` no frontend e usar um dropdown no formulário.

### Erro 401 - Autenticação
O `SecurityConfig` original protegia `/api/auth/**`.
Alteração aplicada (necessita restart):
```java
.requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
.requestMatchers(HttpMethod.POST, "/api/auth/verify").permitAll()
```

## Conclusão Geral
As correções visuais (foco do input, modal UI) foram bem sucedidas. No entanto, os fluxos funcionais (Salvar Produto, Cadastrar Usuário) estão bloqueados por erros de integração (Backend/Frontend mismatch) e configuração de segurança. 
Recomenda-se priorizar a refatoração do seletor de categorias e o restart do backend.
