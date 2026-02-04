---
name: security-guardian
description: Valida segurança, OWASP Top 10, sanitização e segredos.
---

# Regras de Segurança Obrigatórias

1. **Input Validation (Zod/Joi):** - Nunca confie em dados vindos da API, Loja ou Admin.
   - Valide tipos, tamanhos e formatos antes de processar.

2. **Proteção de Segredos:**
   - Jamais hardcode API Keys, senhas ou tokens.
   - Use `process.env` e garanta que existe um arquivo `.env.example`.

3. **Autenticação e Autorização:**
   - Verifique sempre o escopo do usuário (Admin vs Cliente da Loja).
   - Use bcrypt ou argon2 para hash de senhas.

4. **Sanitização:**
   - Previna XSS no Dashboard e SQL Injection no banco.
