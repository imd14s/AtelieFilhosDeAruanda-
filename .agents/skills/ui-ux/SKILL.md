---
name: ui-ux-engineering
description: Use esta skill sempre que o utilizador solicitar a criação, alteração, estilização ou auditoria de componentes visuais, layouts, ecrãs ou fluxos de interacção no frontend ou dashboard-admin.
---

# Objectivo
Assegurar o desenvolvimento de interfaces de utilizador (UI) e experiências (UX) altamente consistentes, escaláveis e acessíveis. Evitar a criação de dívida técnica visual, como estilos inline e componentes duplicados.

# Instruções de Execução (Siga em ordem estrita)

1. **Contexto Arquitectural:** Verifique sempre o mapa do módulo em que está a operar (`/docs-ai/MAP_FRONTEND.md` ou `/docs-ai/MAP_DASHBOARD.md`). Mantenha a separação rígida entre a lógica de negócio (Pages/Hooks) e a apresentação (Components).
2. **Auditoria de Reutilização (Evitar Duplicação):** Antes de desenhar um novo botão, input, modal ou card, inspeccione o directório `src/components/ui/`. Reutilize os componentes base sempre que possível. Se o componente base precisar de ajustes, extenda as suas propriedades (Props) sem quebrar o uso existente.
3. **Abordagem Mobile-First:** O desenvolvimento visual deve começar sempre pelos ecrãs móveis. Utilize utilitários CSS ou Tailwind (consoante o módulo) para garantir que a interface cresce harmoniosamente para tablets (`md:`) e desktops (`lg:`, `xl:`). A quebra de layout em dispositivos móveis é inaceitável.
4. **Gestão de Feedback de Estado (UX):** Nenhuma acção assíncrona deve ocorrer sem feedback visual ao utilizador. Preveja e estilize obrigatoriamente os estados de:
   - `Loading` (Spinners, Skeletons ou disabled states).
   - `Success` (Toasts ou mensagens visuais).
   - `Error` (Mensagens claras e estados de validação vermelhos/alerta).
   - `Empty States` (O que aparece quando uma lista ou carrinho está vazio).
5. **Acessibilidade Base (a11y):** Garanta que botões e links possuem nomes descritivos, atributos `aria-label` quando apropriado, suporte para navegação por teclado (focus visible) e contraste de cores legível.
6. **REGRA DE CONTENÇÃO (Estilos Inline):** É expressamente proibido o uso de estilos inline (ex: `style={{ margin: '10px' }}`) no React. Utilize as folhas de estilo globais/módulos CSS no Frontend e as classes do Tailwind CSS no Dashboard-Admin. Excepções apenas para cálculos matemáticos dinâmicos que o CSS nativo não consiga resolver.