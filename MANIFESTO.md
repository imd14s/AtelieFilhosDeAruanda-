🛡️ Manifesto de Integridade e Funcionalidade (MIF)
Projeto: Ateliê Filhos de Aruanda

Última Atualização: 26/02/2026

Status Global: 🟢 Operacional | 🟡 Em Manutenção | 🔴 Crítico

📊 1. Painel de Saúde (Métricas de Qualidade)

<!-- START_METRICS_TABLE -->
Métrica,Nível/Valor,Status,Observações
Segurança (AppSec),A,🟢,Baseado em OWASP Top 10 e SAST.
Erros de Lógica Críticos,0,🟢,Nenhuma regressão detectada em E2E.
Vulnerabilidades de Segurança,0,🟢,Dependências atualizadas e sem CVEs.
Cobertura de Testes (Global),0.0%,🟡,Meta: 80% (Threshold de build).
Dívida Técnica,12h,🟢,Sincronizado automaticamente.
<!-- END_METRICS_TABLE -->

🏗️ 2. Catálogo Funcional Detalhado
🔹 Projeto: Backend (API Fiscals & Orders)

<!-- START_CATALOG_BACKEND -->
Funcionalidade,Rota/Método,Expectativa (Input/Output),Status
List All,GET /api/admin/configs,In: @RequestBody / Out: ResponseEntity,🟢
Upsert,POST /api/admin/configs,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/admin/configs/{key},In: @RequestBody / Out: ResponseEntity,🟢
Get Tenants,GET /api/admin/tenants,In: @RequestBody / Out: ResponseEntity,🟢
Get Orders,GET /api/admin/orders,In: @RequestBody / Out: ResponseEntity,🟢
Get Summary,GET /api/admin/summary,In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/admin/features,In: @RequestBody / Out: ResponseEntity,🟢
Create Or Update,POST /api/admin/features,In: @RequestBody / Out: ResponseEntity,🟢
Emit Invoice,POST /api/admin/orders/{id}/invoice,In: @RequestBody / Out: ResponseEntity,🟢
Get Xml,GET /api/admin/orders,In: @RequestBody / Out: ResponseEntity,🟢
Get Danfe,GET /api/admin/orders,In: @RequestBody / Out: ResponseEntity,🟢
Get,GET /api/admin/provider-configs/{providerId}/{env},In: @RequestBody / Out: ResponseEntity,🟢
Upsert,POST /api/admin/provider-configs,In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/admin/providers,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/admin/providers,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/admin/providers/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/admin/providers/{id},In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/admin/rules,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/admin/rules,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/admin/rules/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/admin/rules/{id},In: @RequestBody / Out: ResponseEntity,🟢
Create Employee,POST /api/admin/users,In: @RequestBody / Out: ResponseEntity,🟢
List Employees,GET /api/admin/users,In: @RequestBody / Out: ResponseEntity,🟢
Update Employee,PUT /api/admin/users/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete User,DELETE /api/admin/users/{id},In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/admin/audit-logs,In: @RequestBody / Out: ResponseEntity,🟢
Get Dashboard Metrics,GET /api/analytics/dashboard,In: @RequestBody / Out: ResponseEntity,🟢
Register,POST /api/auth/register,In: @RequestBody / Out: ResponseEntity,🟢
Verify,POST /api/auth/verify,In: @RequestBody / Out: ResponseEntity,🟢
Google,POST /api/auth/google,In: @RequestBody / Out: ResponseEntity,🟢
Login,POST /api/auth/login,In: @RequestBody / Out: ResponseEntity,🟢
Request Reset,POST /api/auth/password-reset/request,In: @RequestBody / Out: ResponseEntity,🟢
Reset Password,POST /api/auth/password-reset/reset,In: @RequestBody / Out: ResponseEntity,🟢
Clear Cart,GET /api/cart/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/categories,In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/categories,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/categories/{id},In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/products,In: @RequestBody / Out: ResponseEntity,🟢
Get By Id,GET /api/products/{id},In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/products,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/products,In: @RequestBody / Out: ResponseEntity,🟢
Upload Image,POST /api/products/upload-image,In: @RequestBody / Out: ResponseEntity,🟢
Toggle Alert,PUT /api/products/{id}/toggle-alert,In: @RequestBody / Out: ResponseEntity,🟢
Generate Description,POST /api/products/generate-description,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/products/{id},In: @RequestBody / Out: ResponseEntity,🟢
Link Product,POST /api/products/{productId}/integrations,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/products/{productId}/variants,In: @RequestBody / Out: ResponseEntity,🟢
List,GET /api/products/{productId}/variants,In: @RequestBody / Out: ResponseEntity,🟢
Upload Image,POST /api/products/{productId}/image,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/reviews,In: @RequestBody / Out: ResponseEntity,🟢
Get By Product,GET /api/reviews/product/{productId},In: @RequestBody / Out: ResponseEntity,🟢
Get By User,GET /api/reviews/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Get Pending,GET /api/reviews/user/{userId}/pending,In: @RequestBody / Out: ResponseEntity,🟢
Process Order,POST /api/checkout/process,In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/configs/ai,In: @RequestBody / Out: ResponseEntity,🟢
Get By Name,GET /api/configs/ai/{nomeIa},In: @RequestBody / Out: ResponseEntity,🟢
Save,POST /api/configs/ai,In: @RequestBody / Out: ResponseEntity,🟢
Send Contact Form,POST /api/contact,In: @RequestBody / Out: ResponseEntity,🟢
Get Addresses,GET /api/addresses/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Create Address,POST /api/addresses/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Update Address,PUT /api/addresses/{addressId}/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Delete Address,DELETE /api/addresses/{addressId}/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
List All,GET /api/dashboard/products,In: @RequestBody / Out: ResponseEntity,🟢
Toggle Alert,PUT /api/dashboard/products/{id}/toggle-alert,In: @RequestBody / Out: ResponseEntity,🟢
Get Info,GET /api/fiscal/certificate/info,In: @RequestBody / Out: ResponseEntity,🟢
Upload,POST /api/fiscal/certificate/upload,In: @RequestBody / Out: ResponseEntity,🟢
Revoke,DELETE /api/fiscal/certificate,In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/fiscal-integrations,In: @RequestBody / Out: ResponseEntity,🟢
Save,POST /api/fiscal-integrations,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/fiscal-integrations/{id},In: @RequestBody / Out: ResponseEntity,🟢
Search,GET /api/fiscal/ncm,In: @RequestBody / Out: ResponseEntity,🟢
Sync Ncms,POST /api/fiscal/ncm/sync,In: @RequestBody / Out: ResponseEntity,🟢
Api Health,GET ,In: @RequestBody / Out: ResponseEntity,🟢
Legacy Health,GET ,In: @RequestBody / Out: ResponseEntity,🟢
Create Account,POST /api/integrations/accounts,In: @RequestBody / Out: ResponseEntity,🟢
Get Accounts,GET /api/integrations/accounts,In: @RequestBody / Out: ResponseEntity,🟢
Save Credentials,POST /api/integrations/{provider}/credentials,In: @RequestBody / Out: ResponseEntity,🟢
Handle Callback,GET /api/integrations/{provider}/auth-url,In: @RequestBody / Out: ResponseEntity,🟢
Get Balance,GET /api/inventory/{variantId},In: @RequestBody / Out: ResponseEntity,🟢
Adjust Stock,POST /api/inventory/{variantId},In: @RequestBody / Out: ResponseEntity,🟢
Get Config,GET /api/marketing/abandoned-carts,In: @RequestBody / Out: ResponseEntity,🟢
Update Config,PUT /api/marketing/abandoned-carts,In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/marketing/coupons,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/marketing/coupons,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/marketing/coupons/{id},In: @RequestBody / Out: ResponseEntity,🟢
Get My Coupons,GET /api/marketing/coupons/my-coupons,In: @RequestBody / Out: ResponseEntity,🟢
Validate,POST /api/marketing/coupons/validate,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/marketing/coupons/{id},In: @RequestBody / Out: ResponseEntity,🟢
Create Campaign,POST /api/marketing/campaigns,In: @RequestBody / Out: ResponseEntity,🟢
List All,GET /api/marketing/campaigns,In: @RequestBody / Out: ResponseEntity,🟢
Get Status,GET /api/marketing/campaigns/{id},In: @RequestBody / Out: ResponseEntity,🟢
Start Campaign,POST /api/marketing/campaigns/{id}/start,In: @RequestBody / Out: ResponseEntity,🟢
Update Campaign,PUT /api/marketing/campaigns/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete Campaign,DELETE /api/marketing/campaigns/{id},In: @RequestBody / Out: ResponseEntity,🟢
Cancel Campaign,POST /api/marketing/campaigns/{id}/cancel,In: @RequestBody / Out: ResponseEntity,🟢
Get Config,GET /api/marketing/email-settings,In: @RequestBody / Out: ResponseEntity,🟢
Save Config,POST /api/marketing/email-settings,In: @RequestBody / Out: ResponseEntity,🟢
List All,GET /api/marketing/email-queue,In: @RequestBody / Out: ResponseEntity,🟢
Retry,POST /api/marketing/email-queue/{id}/retry,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/marketing/email-queue/{id},In: @RequestBody / Out: ResponseEntity,🟢
Retry All Failed,POST /api/marketing/email-queue/retry-failed,In: @RequestBody / Out: ResponseEntity,🟢
Save,POST /api/marketing/signatures,In: @RequestBody / Out: ResponseEntity,🟢
List All,GET /api/marketing/signatures,In: @RequestBody / Out: ResponseEntity,🟢
Find By Id,GET /api/marketing/signatures/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/marketing/signatures/{id},In: @RequestBody / Out: ResponseEntity,🟢
Preview,GET /api/marketing/signatures/{id}/preview,In: @RequestBody / Out: ResponseEntity,🟢
List All,GET /api/marketing/email-templates,In: @RequestBody / Out: ResponseEntity,🟢
Get By Id,GET /api/marketing/email-templates/{id},In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/marketing/email-templates,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/marketing/email-templates/{id},In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/marketing/email-templates/{id},In: @RequestBody / Out: ResponseEntity,🟢
Subscribe,POST /api/newsletter/subscribe,In: @RequestBody / Out: ResponseEntity,🟢
Verify,POST /api/newsletter/verify,In: @RequestBody / Out: ResponseEntity,🟢
Unsubscribe,POST /api/newsletter/unsubscribe,In: @RequestBody / Out: ResponseEntity,🟢
Get All Subscribers,GET /api/newsletter/subscribers,In: @RequestBody / Out: ResponseEntity,🟢
Delete Subscriber,DELETE /api/newsletter/subscribers/{id},In: @RequestBody / Out: ResponseEntity,🟢
Get My Favorites,GET /api/favorites/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Get Ranking,GET /api/favorites/ranking,In: @RequestBody / Out: ResponseEntity,🟢
Add Favorite,POST /api/favorites,In: @RequestBody / Out: ResponseEntity,🟢
Remove Favorite,DELETE /api/favorites,In: @RequestBody / Out: ResponseEntity,🟢
Get My Questions,GET /api/questions,In: @RequestBody / Out: ResponseEntity,🟢
Get Product Questions,GET /api/questions/product/{productId},In: @RequestBody / Out: ResponseEntity,🟢
Ask Question,POST /api/questions,In: @RequestBody / Out: ResponseEntity,🟢
Get My Subscriptions,GET /api/product-subscriptions/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Create Subscription,POST /api/product-subscriptions,In: @RequestBody / Out: ResponseEntity,🟢
Get My History,GET /api/history/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Record View,POST /api/history,In: @RequestBody / Out: ResponseEntity,🟢
Clear History,DELETE /api/history/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Upload,POST /api/media/upload,In: @RequestBody / Out: ResponseEntity,🟢
Download Public,GET /api/media/public/{filename:.+},In: @RequestBody / Out: ResponseEntity,🟢
Create Order,POST /api/orders,In: @RequestBody / Out: ResponseEntity,🟢
Get All Orders,GET /api/orders,In: @RequestBody / Out: ResponseEntity,🟢
Get By User,GET /api/orders/user/{userId},In: @RequestBody / Out: ResponseEntity,🟢
Get By Id,GET /api/orders/{id},In: @RequestBody / Out: ResponseEntity,🟢
Approve Order,PUT /api/orders/{id}/approve,In: @RequestBody / Out: ResponseEntity,🟢
Cancel Order,PUT /api/orders/{id}/cancel,In: @RequestBody / Out: ResponseEntity,🟢
Mark As Shipped,PUT /api/orders/{id}/ship,In: @RequestBody / Out: ResponseEntity,🟢
Mark As Delivered,PUT /api/orders/{id}/delivered,In: @RequestBody / Out: ResponseEntity,🟢
Delete Card,GET /api/customer/cards,In: @RequestBody / Out: ResponseEntity,🟢
Create Pix Payment,POST /api/payments/pix,In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/settings/payment,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/settings/payment/{id},In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/settings/shipping,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/settings/shipping/{id},In: @RequestBody / Out: ResponseEntity,🟢
Quote,POST /api/shipping/quote,In: @RequestBody / Out: ResponseEntity,🟢
Refresh Configs,POST /api/shipping/configs/refresh,In: @RequestBody / Out: ResponseEntity,🟢
Get All,GET /api/subscription-plans,In: @RequestBody / Out: ResponseEntity,🟢
Get Active,GET /api/subscription-plans/active,In: @RequestBody / Out: ResponseEntity,🟢
Get By Id,GET /api/subscription-plans/{id},In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/subscription-plans,In: @RequestBody / Out: ResponseEntity,🟢
Update,PUT /api/subscription-plans,In: @RequestBody / Out: ResponseEntity,🟢
Delete,DELETE /api/subscription-plans/{id},In: @RequestBody / Out: ResponseEntity,🟢
Get My Subscriptions,GET /api/subscriptions/my,In: @RequestBody / Out: ResponseEntity,🟢
Create,POST /api/subscriptions,In: @RequestBody / Out: ResponseEntity,🟢
Get Profile,GET /api/users/profile,In: @RequestBody / Out: ResponseEntity,🟢
Handle Mercado Pago,POST /api/webhooks/mercadopago,In: @RequestBody / Out: ResponseEntity,🟢
Handle Marketplace Webhook,POST /api/webhooks/marketplace/{provider},In: @RequestBody / Out: ResponseEntity,🟢
<!-- END_CATALOG_BACKEND -->

🔹 Projeto: Storefront (Loja Virtual)

<!-- START_CATALOG_STOREFRONT -->
Funcionalidade,Componente,Validação/Regra,Status
Identificação Fiscal,DocumentInput,Valida CPF/CNPJ via Módulo 11,🟢
Cálculo de Impostos,CheckoutSummary,Alíquota por Origem,🟡
Busca de Endereço,ZipCodeInput,Integração API CEP,🟢
<!-- END_CATALOG_STOREFRONT -->

🔐 3. Guardrails e Segurança (SLA Interno)
Performance: Nenhuma rota de busca deve exceder 200ms. <!-- sla: response_time=200 -->

Privacidade (LGPD): Dados de CPF/CNPJ devem ser criptografados em repouso e mascarados em logs.

Integridade: Bloqueio automático de commits com cobertura de testes inferior a 80%. <!-- sla: coverage=80 -->

Segurança de Certificado: O Certificado A1 nunca deve tocar o disco de forma persistente sem cifragem AES-256. <!-- sla: cert_security=aes-256 -->

📖 4. Glossário de Regras de Negócio
Pedido Autorizado: Pedido com pagamento confirmado e XML da NF-e transmitido com sucesso.

Contingência: Estado ativado quando os WebServices da SEFAZ estão offline (Emissão via SCAN/DPEC).

NCM Genérico: Código utilizado para produtos sem classificação específica (A ser evitado).