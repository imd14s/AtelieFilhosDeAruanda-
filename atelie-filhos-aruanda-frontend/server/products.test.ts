import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(isAdmin = false): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: isAdmin ? "admin" : "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  describe("list", () => {
    it("should allow public access to product list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.list({
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter products by search query", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.products.list({
        search: "test",
        limit: 10,
        offset: 0,
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("admin operations", () => {
    it("should allow admin to create product", async () => {
      const ctx = createContext(true);
      const caller = appRouter.createCaller(ctx);

      try {
        const result = await caller.products.create({
          name: "Test Product",
          slug: `test-product-${Date.now()}`,
          description: "Test description",
          basePrice: "99.99",
          featured: false,
        });

        expect(result).toHaveProperty("id");
        expect(typeof result.id).toBe("number");
      } catch (error: any) {
        // Database might not be available in test environment
        if (!error.message?.includes("Database not available")) {
          throw error;
        }
      }
    });

    it("should deny non-admin from creating product", async () => {
      const ctx = createContext(false);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.products.create({
          name: "Test Product",
          slug: "test-product",
          description: "Test description",
          basePrice: "99.99",
          featured: false,
        })
      ).rejects.toThrow("Admin access required");
    });
  });
});

describe("categories router", () => {
  it("should allow public access to categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny non-admin from creating category", async () => {
    const ctx = createContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.categories.create({
        name: "Test Category",
        slug: "test-category",
      })
    ).rejects.toThrow("Admin access required");
  });
});

describe("cart router", () => {
  it("should require authentication for cart access", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cart.get()).rejects.toThrow("Please login");
  });

  it("should allow authenticated user to access cart", async () => {
    const ctx = createContext(false);
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.cart.get();
      expect(Array.isArray(result)).toBe(true);
    } catch (error: any) {
      // Database might not be available in test environment
      if (!error.message?.includes("Database not available")) {
        throw error;
      }
    }
  });
});
