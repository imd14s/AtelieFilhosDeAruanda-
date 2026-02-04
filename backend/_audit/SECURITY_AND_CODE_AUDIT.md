# Relatório de Auditoria: Segurança, Código Duplicado e Funções Fake

**Data:** 2026-02-04  
**Escopo:** backend (Java/Spring)

---

## 1. Falhas de Segurança

### 1.1 Path traversal no upload de imagem (CRÍTICO)
- **Arquivo:** `api/catalog/product/ProductController.java` (método `uploadImage`)
- **Problema:** O nome do arquivo vem diretamente de `file.getOriginalFilename()` e é concatenado ao path de upload. Um cliente pode enviar `../../../etc/passwd` ou `..\..\..\windows\system32\config\sam`, fazendo o arquivo ser gravado fora do diretório `uploads`.
- **Recomendação:** Sanitizar o nome (ex.: usar apenas a extensão após o último `.` e UUID, como em `MediaStorageService`) ou delegar o upload ao `MediaStorageService.storeImage()`, que já usa `extractExtension` e não inclui path no nome.

### 1.2 Upload sem validação de tipo/tamanho (ALTO)
- **Arquivo:** `ProductController.uploadImage`
- **Problema:** Não há validação de tipo MIME nem limite de tamanho. Permite upload de qualquer arquivo (scripts, executáveis, etc.) e risco de DoS por arquivos muito grandes.
- **Recomendação:** Reutilizar `MediaStorageService.storeImage()`, que já valida com `validateImage()` (MIME e `MAX_UPLOAD_MB`).

### 1.3 Path de upload hardcoded (MÉDIO)
- **Arquivo:** `ProductController` – `Paths.get("uploads")`
- **Problema:** Diretório fixo; em produção o correto é usar variável de ambiente (ex.: `UPLOAD_DIR`), como em `MediaStorageService`.
- **Recomendação:** Usar o mesmo `MediaStorageService` ou injetar `UPLOAD_DIR` via `Environment`.

### 1.4 JWT_SECRET sem validação de tamanho (BAIXO)
- **Arquivo:** `infrastructure/security/TokenProvider.java`
- **Problema:** O secret é decodificado de BASE64 e usado com HS256. Se o valor em env for curto ou fraco, a chave fica fraca. Não há checagem mínima de tamanho no `@PostConstruct`.
- **Recomendação:** Validar que o array decodificado tenha pelo menos 256 bits (32 bytes) para HS256 e falhar a inicialização se não tiver.

### 1.5 ADMIN_EMAIL com default previsível (BAIXO)
- **Arquivo:** `api/config/AdminBootstrap.java` – `@Value("${ADMIN_EMAIL:admin@atelie.com}")`
- **Problema:** Em produção, se `ADMIN_EMAIL` não for definido, o usuário admin fica previsível.
- **Recomendação:** Em produção, não usar default ou usar default apenas em perfil `dev` (ex.: `@Profile("dev")` ou condicional por `spring.profiles.active`).

### 1.6 Pontos positivos
- Webhook: comparação do token com `MessageDigest.isEqual()` (constante no tempo), sem default para `WEBHOOK_SECRET`.
- JWT: `JWT_SECRET` e `JWT_EXPIRATION_MS` sem valor default (app quebra na subida se faltar).
- Regras de autorização: `/api/admin/**` exige `ROLE_ADMIN`; demais rotas exigem autenticação.
- SpEL em regras: uso de `SimpleEvaluationContext.forReadOnlyDataBinding()` reduz risco de RCE.

---

## 2. Código Duplicado

### 2.1 Lógica de reflexão (findSetter / findMethod + trySet / tryGet)
- **Arquivos:**  
  - `infrastructure/service/media/MediaStorageService.java` (findSetter, trySet, tryGetBoolean, tryGetString)  
  - `application/service/payment/PaymentService.java` (findMethod, trySet, readAny, tryGetByGetter, tryGetByField)
- **Problema:** Ambos implementam busca de método por nome e tipo, setter por reflexão e leitura de propriedades. Código muito parecido, difícil de manter.
- **Recomendação:** Extrair para uma classe utilitária compartilhada (ex.: `ReflectionPropertyUtils` ou `BeanReflectionHelper`) em um pacote comum (ex.: `api.serviceengine.util` ou `infrastructure.util`) e usar em ambos os serviços.

### 2.2 Duas implementações de upload de arquivo
- **Arquivos:**  
  - `ProductController.uploadImage()` – path hardcoded, sem validação, nome não sanitizado.  
  - `MediaStorageService.storeImage()` – usa `UPLOAD_DIR`, valida MIME/tamanho, nome seguro (UUID + extensão).
- **Problema:** Dois fluxos diferentes para a mesma necessidade (upload de imagem de produto), com níveis de segurança diferentes.
- **Recomendação:** Fazer `ProductController` (e qualquer outro ponto que precise de upload de imagem) usar `MediaStorageService.storeImage()` ou um `FileStorageService` que delega a ele, eliminando a lógica duplicada e o path traversal.

### 2.3 Duas interfaces OrderRepository
- **Arquivos:**  
  - `domain/order/OrderRepository.java` (só estende JpaRepository)  
  - `infrastructure/persistence/order/OrderRepository.java` (com `sumTotalSales()`, `countPendingOrders()`)
- **Problema:** Dois contratos com o mesmo nome em camadas diferentes; a camada de aplicação usa a implementação de infra. Pode gerar confusão e acoplamento incorreto.
- **Recomendação:** Unificar em uma única interface (idealmente no domain, com adaptador em infra se necessário) ou renomear uma delas (ex.: `OrderJpaRepository`) e deixar claro qual é a porta de domínio.

---

## 3. Funções / Dados Fake

### 3.1 Dashboard – dados fixos de vendas e pedidos (CRÍTICO)
- **Arquivo:** `api/dashboard/DashboardController.java` – `getSummary()`
- **Problema:** `totalSales`, `pendingOrders` e `lowStockAlerts` estão hardcoded (`1500.00`, `3`, `0`). O comentário diz “Mock para Vendas (pois a estrutura de Order é complexa)”, mas o projeto já tem:
  - `OrderRepository.sumTotalSales()` e `OrderRepository.countPendingOrders()`
  - `ProductRepository.findCriticalStock()` (ou equivalente para alertas de estoque)
- **Impacto:** API de dashboard retorna dados falsos em produção.
- **Recomendação:** Injetar `OrderRepository` (infra) e `ProductRepository` no `DashboardController` e usar esses métodos para preencher `totalSales`, `pendingOrders` e `lowStockAlerts` com dados reais.

### 3.2 Status de automação sempre true (ALTO)
- **Arquivo:** `api/dashboard/DashboardController.java` – `getAutomationStatus()`
- **Problema:** Retorna sempre `Map.of("enabled", true)` sem consultar configuração.
- **Impacto:** Frontend/dashboard mostra “automação ativa” mesmo quando não está.
- **Recomendação:** Injetar `N8nService` e retornar `Map.of("enabled", n8nService.isAutomationEnabled())`.

### 3.3 Outros pontos
- **InventoryService.trySet:** Não é “fake”; é um helper defensivo para campos opcionais na entity. Comportamento esperado.
- **ProductController – TODO “Mover lógica de update para o Service”:** Débito técnico, não função fake.
- **MercadoLivreService:** `return null` quando `ML_SYNC_ENABLED` é false é decisão de negócio (desabilitar integração), não dado fake.

---

## 4. Resumo de Ações Prioritárias

| Prioridade | Item | Ação |
|------------|------|------|
| P0 | Path traversal no upload | Sanitizar nome ou usar `MediaStorageService.storeImage()` no ProductController |
| P0 | Dashboard com dados fake | Usar OrderRepository e ProductRepository para totalSales, pendingOrders, lowStockAlerts |
| P1 | Automation status fake | Usar N8nService.isAutomationEnabled() em getAutomationStatus() |
| P1 | Upload sem validação | Centralizar upload em MediaStorageService (validação + path seguro) |
| P2 | Reflexão duplicada | Extrair BeanReflectionHelper / ReflectionPropertyUtils |
| P2 | Duas interfaces OrderRepository | Unificar ou renomear para evitar confusão de camadas |

---

---

## 5. Correções já aplicadas (2026-02-04)

- **DashboardController:** Passa a usar dados reais: `OrderRepository.sumTotalSales()`, `OrderRepository.countPendingOrders()`, `ProductRepository.findCriticalStock()` para o summary; `N8nService.isAutomationEnabled()` para o status de automação.
- **ProductController.uploadImage:** Passa a delegar para `MediaStorageService.storeImage()`, eliminando path traversal e garantindo validação de tipo/tamanho (MIME e `MAX_UPLOAD_MB`). Removidos path hardcoded e lógica duplicada de upload.

**Nota:** Garantir que em produção a variável `UPLOAD_DIR` e o mapeamento de recursos estáticos (ex.: `/uploads`) apontem para o mesmo diretório, para que as URLs retornadas (`/uploads/{filename}`) continuem válidas.

---

*Relatório gerado por varredura automatizada no backend. Revisar e ajustar conforme ambiente (dev/test/prod).*
