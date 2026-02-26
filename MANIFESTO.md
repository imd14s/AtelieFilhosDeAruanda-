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

Funcionalidade,Rota/Método,Expectativa (Input/Output),Status
Autocomplete NCM,GET /api/v1/ncm,In: Termo de busca. Out: Lista de NCMs (8 dígitos + Descrição).,🟢
Configuração Fiscal,POST /api/v1/config,In: Dados Emitente + Certificado. Out: Status de Conexão SEFAZ.,🟢
Emissão de NF-e,POST /api/v1/nfe,In: ID do Pedido. Out: Protocolo SEFAZ + XML Assinado.,🟢

🔹 Projeto: Storefront (Loja Virtual)

Funcionalidade,Componente,Validação/Regra,Status
Identificação Fiscal,DocumentInput,Valida Dígito Verificador (CPF/CNPJ) via Módulo 11.,🟢
Cálculo de Impostos,CheckoutSummary,Aplica alíquota baseada na Origem da Mercadoria.,🟡
Busca de Endereço,ZipCodeInput,Máscara 00000-000 + Integração correta com API de CEP.,🟢

🔐 3. Guardrails e Segurança (SLA Interno)
Performance: Nenhuma rota de busca deve exceder 200ms.

Privacidade (LGPD): Dados de CPF/CNPJ devem ser criptografados em repouso e mascarados em logs.

Integridade: Bloqueio automático de commits com cobertura de testes inferior a 80%.

Segurança de Certificado: O Certificado A1 nunca deve tocar o disco de forma persistente sem cifragem AES-256.

📖 4. Glossário de Regras de Negócio
Pedido Autorizado: Pedido com pagamento confirmado e XML da NF-e transmitido com sucesso.

Contingência: Estado ativado quando os WebServices da SEFAZ estão offline (Emissão via SCAN/DPEC).

NCM Genérico: Código utilizado para produtos sem classificação específica (A ser evitado).