# Project Skills & Technical Guidelines

## 1. Tech Stack
*   **Frontend**: React (v19) + Vite
*   **Styling**: Tailwind CSS (v4) + CSS Variables
*   **Routing**: React Router DOM (v7)
*   **Icons**: Lucide React
*   **HTTP**: Axios
*   **Build Tool**: Vite

## 2. Directory Structure
```
src/
├── assets/      # Fonts, Images, Static assets
├── components/  # Reusable UI components (Header, Footer, ProductCard)
├── pages/       # Route components (Home, ShopPage, ProductPage)
├── services/    # API interaction layer (storeService.js, api.js)
├── utils/       # Helper functions
└── index.css    # Global styles & Theme definition (Source of Truth)
```

## 3. Component Guidelines
*   **Functional Components**: Use React Functional Components with Hooks.
*   **Props**: Define clear props. Avoid Prop Drilling where possible (use Context if needed, though simple state is preferred for now).
*   **Images**: Ensure all images have `alt` tags for accessibility.
*   **Responsive**: Mobile-first design is critical. Always test on mobile breakpoints.

## 4. API Integration Strategy
*   **Service Layer**: All API calls must go through `src/services/`.
*   **No Fake Data**: Do not create fake generator functions. If the API doesn't support a feature, fail gracefully or hide the feature, and update `backend/frontend_integration_specs.md`.
*   **Error Handling**: Services should catch errors and return consistent structures (e.g., empty arrays or null) to prevent UI crashes, while logging errors to console.

## 5. State Management
*   **Local State**: `useState` for component-level logic.
*   **Global/Shared State**: Currently using `localStorage` + Custom Events (`window.dispatchEvent`) for Cart and Auth.
    *   *Note: This is a simple implementation. Future refactors might introduce Context API or Redux if complexity grows.*

## 6. Coding Standards
*   **Linter**: ESLint is configured. Run `npm run lint` before committing.
*   **Formatting**: Keep code clean and indented.
*   **Comments**: Comment complex logic, especially tailored business rules (e.g., shipping calculations).
