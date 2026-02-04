# Style Guide: Ateliê Filhos de Aruanda

> [!IMPORTANT]
> **STRICT ADHERENCE REQUIRED**
> The design system defined in this document must be followed exactly. Modifications to colors, fonts, or core styles are **strictly prohibited** unless explicitly authorized.

## 1. Typography

### Primary Font (Headings & Titles)
*   **Family**: `Playfair Display`
*   **Weight**: Medium
*   **CSS Variable**: `--main-font`
*   **Usage**: Main headings (`h1`, `h2`, `h3`), hero titles, major emphasis.

### Secondary Font (Body & UI)
*   **Family**: `Lato`
*   **Weight**: Regular
*   **CSS Variable**: `--secondary-font`
*   **Usage**: Body text, buttons, navigation, product descriptions.

---

## 2. Color Palette

### Primary Brand Colors

| Color Name | Hex Code | CSS Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Azul Profundo** | `#0f2A44` | `--azul-profundo` | Primary text, Headers, Accents |
| **Branco Off-White**| `#F7F7F4` | `--branco-off-white`| Main Backgrounds, Light Panels |
| **Dourado Suave** | `#C9A24D` | `--dourado-suave` | Call-to-Actions (CTA), Highlights |

### Secondary & Accent Colors

| Color Name | Hex Code | CSS Variable | Usage |
| :--- | :--- | :--- | :--- |
| **Verde Musgo** | `#3EDF4B` | `--verde-musgo` | Success states, Nature motifs |
| **Marrom Terra** | `#5A3E2B` | `--marron-terra` | Earthy accents, secondary text |

---

## 3. UI Components & Patterns

### Buttons
*   **Primary CTA**: Background `Dourado Suave` (`#C9A24D`), Text White/Azul. Hover effects should be subtle (opacity or slight darken).
*   **Secondary**: Border `Azul Profundo` (`#0f2A44`), Transparent Background.

### Cards (Product/Category)
*   **Background**: White or Off-White (`#F7F7F4`).
*   **Border**: Minimal or None.
*   **Shadow**: Soft, diffuse shadows for depth (premium feel).

### Navigation
*   **Header**: Clean, sticky`#F7F7F4` background.
*   **Links**: Uppercase `Lato`, tracked out (`tracking-widest`).

---

## 4. CSS Guidelines
*   **Framework**: Tailwind CSS v4.
*   **Variables**: ALWAYS use the CSS variables defined in `:root` for the brand colors.
*   **Spacing**: Use generous relaxed spacing to convey a "gallery" or "atelier" atmosphere.
