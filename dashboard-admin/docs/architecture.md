# Architecture Reference: Dashboard Admin

## High-Level Architecture
The application follows a standard Client-Side Rendering (CSR) architecture.

```mermaid
graph TD
    User[Admin User] -->|HTTPS| CDN[Vite/Static Host]
    CDN -->|Load Bundle| Browser
    Browser -->|API Calls (JSON)| API[Backend API :8080]
```

## Layered Architecture (Frontend)

The frontend codebase is organized into layers to separate concerns:

1.  **Presentation Layer (Components & Pages)**
    - Responsible for UI rendering and user interaction.
    - Located in `src/pages` and `src/components`.
    - **Rule**: Should not contain direct API calls. Use Hooks or Services.

2.  **State Management Layer (Context & Hooks)**
    - Responsible for global state (Auth) and local data fetching logic.
    - Located in `src/context` and `src/hooks`.

3.  **Service Layer**
    - Responsible for communicating with the backend.
    - Located in `src/services`.
    - **Rule**: Returns Promises resolving to typed data.

4.  **Network Layer**
    - Configured Axios instance.
    - Located in `src/api`.
    - Handles Interceptors and base configuration.

## Data Flow
1.  **Component** initiates action (e.g., `useEffect`).
2.  **Service** is called (e.g., `ProductService.getAll()`).
3.  **Axios** intercepts request, adds Token.
4.  **API** returns JSON.
5.  **Service** returns typed Object.
6.  **Component** updates state.

## Security
- **JWT Storage**: `localStorage` (Key: `auth_token`).
- **Route Protection**: Private routes check `useAuth().isAuthenticated`.
- **CORS**: Backend must allow origin of dashboard.
