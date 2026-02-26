# 🗺️ MASTER AI INDEX - Ateliê Filhos de Aruanda

## 🛑 Regras Globais de Engajamento (Leitura Obrigatória)
1. **Zero Suposição:** NUNCA adivinhe a estrutura de diretórios ou padrões arquiteturais. Você DEVE usar este índice para localizar os mapas específicos antes de propor qualquer mudança.
2. **Economia de Tokens:** Não reescreva arquivos inteiros a menos que solicitado. Use substituições parciais sempre que possível.
3. **Proibido Novas Libs:** Não adicione dependências no `pom.xml` ou `package.json` sem aprovação prévia do usuário.
4. **Comandos Estritos:**
   - Se o usuário usar `/plano [feature]`, liste APENAS os arquivos que serão criados/modificados com base na arquitetura. Sem código.
   - Se o usuário usar `/codigo [arquivo]`, gere APENAS o código daquele arquivo.

## 🧭 Roteamento de Módulos (Mapas)
Identifique em qual área o usuário quer trabalhar e leia o respectivo mapa ANTES de agir:

- **Backend (Java, Spring Boot, Clean Architecture):**
  - Diretório raiz: `/backend/`
  - Mapa Arquitetural: Leia `-> /docs-ai/MAP_BACKEND.md`

- **Frontend (E-commerce Cliente - React/Vite):**
  - Diretório raiz: `/frontend/`
  - *Mapa em construção...*

- **Dashboard Admin (Painel de Gestão - React/Vite):**
  - Diretório raiz: `/dashboard-admin/`
  - *Mapa em construção...*

## 🛠️ Regras de Engenharia e Deploy (Antigravity)
# Leis de Engenharia e Prevenção de Quebra de CI (Antigravity)

## 1. Verificação Local OBRIGATÓRIA (Pre-Push Quality Gate)
**PROIBIDO** realizar `git commit` ou `git push` sem antes executar e obter SUCESSO ABSOLUTO (Exit Code 0) nos seguintes comandos no terminal:
- **Backend (Java):** Execute `mvn clean test` (ou `mvn clean verify`). Você DEVE ler o output do terminal. Se houver falha de compilação ou testes quebrando, pare e corrija o código.
- **Frontend (Node/TS):** Execute o linter e o build de produção (ex: `npm run lint && npm run build` ou o comando equivalente do projeto). Você DEVE ler o output. Se o TS reclamar de tipagem (ex: uso de `any`) ou o build falhar, pare e corrija o código.

## 2. Loop de Auto-Correção
- Se qualquer comando acima retornar erro, **NÃO PEÇA PERMISSÃO PARA CORRIGIR**. Analise o log de erro no terminal, aplique a correção e rode a validação novamente. Repita até que todos os comandos passem com sucesso.

## 3. Fluxo de Git & Deploy
- Somente após os builds locais passarem, faça o commit seguindo o padrão Conventional Commits.
- Faça o `push` para a branch `dev`.

## 4. Validação do CI/CD (Post-Push)
- Após o push, você DEVE verificar o status do GitHub Actions.
- Se o GitHub CLI (`gh`) estiver instalado, execute `gh run watch` ou `gh pr checks` para monitorar o pipeline.
- Se o pipeline remoto quebrar, use o GitHub CLI para ler os logs de erro (`gh run view --log`), corrija os problemas localmente, valide a correção (Passo 1) e faça um novo push.