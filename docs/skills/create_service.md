---
name: create_service
description: Create a new API Service and corresponding Types for the Dashboard Admin
---

# Create New Service Pattern

This skill guides you through creating a new Service layer integration for the dashboard.

## 1. Define Types
Create or update a type definition in `src/types/`.

**Example**: `src/types/category.ts`
```typescript
export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export type CreateCategoryDTO = Omit<Category, 'id'>;
```

## 2. Create Service
Create a new service file in `src/services/`.
Use the `api` instance from `../api/axios`.

**Example**: `src/services/CategoryService.ts`
```typescript
import { api } from '../api/axios';
import type { Category, CreateCategoryDTO } from '../types/category';

export const CategoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (data: CreateCategoryDTO) => {
    return api.post('/categories', data);
  },

  update: async (id: string, data: Partial<CreateCategoryDTO>) => {
    return api.put(`/categories/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/categories/${id}`);
  }
};
```

## 3. Usage in Component
Import the service and use it inside a `useEffect` or event handler.

```typescript
import { CategoryService } from '../services/CategoryService';

// Inside component
useEffect(() => {
  CategoryService.getAll().then(setCategories).catch(console.error);
}, []);
```
