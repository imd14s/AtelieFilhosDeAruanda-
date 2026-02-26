---
name: seo-optimization
description: Use esta skill sempre que o usuário solicitar otimização para motores de busca (SEO), melhoria de indexação, adição de meta tags, estruturação de dados (JSON-LD), semântica HTML ou auditoria de performance web para Core Web Vitals no frontend.
---

# Objetivo
Garantir que a aplicação frontend seja perfeitamente rastreável, indexável e compreensível por motores de busca (Googlebot, Bingbot) e redes sociais (Open Graph/Twitter Cards), focando em semântica estrita, performance e metadados.

# Instruções de Execução (Siga em ordem)

1. **Reaproveitamento de Componentes Base:** Utilize ou expanda o componente `src/components/SEO.jsx` (ou `.tsx` se já migrado) para gerenciar o `<head>` do documento. Não injete meta tags diretamente em páginas aleatórias sem centralizar a lógica.
2. **Semântica HTML Implacável:**
   - É terminantemente proibido usar `<div>` ou `<span>` quando uma tag semântica for aplicável (`<main>`, `<article>`, `<section>`, `<nav>`, `<aside>`, `<time>`).
   - Hierarquia de Cabeçalhos: Garanta que exista **apenas um** `<h1>` por página. Os `<h2>` a `<h6>` devem seguir uma ordem lógica e não pular níveis apenas por razões de tamanho de fonte.
3. **Mídia e Performance (Core Web Vitals):**
   - Imagens devem OBRIGATORIAMENTE possuir o atributo `alt` descritivo (não use "imagem de produto", descreva o produto).
   - Adicione `loading="lazy"` a imagens que não estão visíveis no carregamento inicial (below the fold).
   - Defina explicitamente `width` e `height` (ou use proporções CSS em Aspect Ratio) nas imagens para evitar Cumulative Layout Shift (CLS).
4. **Dados Estruturados (JSON-LD):** - Ao construir ou editar páginas de Produto, Categorias ou Avaliações, você DEVE gerar scripts de dados estruturados (Schema.org) no formato JSON-LD.
   - Exemplo: Para a página de produto, injete o schema `Product` detalhando preço, disponibilidade (estoque) e avaliações agregadas (AggregateRating).
5. **Prevenção de Conteúdo Duplicado:**
   - Certifique-se de que URLs possuam tags canônicas (`<link rel="canonical" href="..." />`) dinâmicas apontando para a versão principal da página.