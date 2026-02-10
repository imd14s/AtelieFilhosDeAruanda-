# Project Analysis: Dashboard Admin

## Overview
The `dashboard-admin` is a modern Single Page Application (SPA) built with React 19, TypeScript, and Vite 7. It serves as the administrative interface for the `Atelie Filhos de Aruanda` e-commerce platform.

## Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript (~5.9)
- **Styling**: Tailwind CSS 3.4
- **State/Context**: React Context API (`AuthContext`)
- **Routing**: React Router DOM 7.1
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure
- `src/api`: Axios instance configuration with interceptors for JWT authentication.
- `src/services`: Service layer decoupling API calls from components (e.g., `ProductService`, `DashboardService`).
- `src/context`: Global state management, primarily `AuthContext` for authentication and session persistence.
- `src/pages`: Feature-based routing components (`/auth`, `/dashboard`, `/products`).
- `src/types`: TypeScript definitions mirroring the backend DTOs.

## Key Patterns Identified
1.  **Service Layer Pattern**: Components do not call `api.get` directly. They use `Service.method()`.
2.  **DTO/Type Sharing**: TypeScript interfaces in `src/types` align with backend responses.
3.  **Auth Interceptor**: `src/api/axios.ts` automatically attaches `Authorization: Bearer <token>` if a token exists in `localStorage`.
4.  **Feature Folders**: Pages are organized by feature (dashboard, products), not just a flat list.

## Integration Points
- **Backend URL**: Configured via `VITE_API_URL` or defaults to `http://localhost:8080/api`.
- **Authentication**: JWT-based. Token stored in `localStorage` key `auth_token`.
- **Health Check**: Validates session on load by calling `/health`.

## Recommendations (Future)
- **Query Management**: Consider `React Query` (TanStack Query) for better caching/loading states, as `useEffect` data fetching is currently manual.
- **Environment Variables**: Ensure `VITE_API_URL` is properly set in production.
