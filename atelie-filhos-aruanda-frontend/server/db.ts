import { eq, and, desc, asc, like, or, sql, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  products, 
  productImages, 
  productVariants, 
  categories,
  orders,
  orderItems,
  cartItems,
  addresses,
  systemConfig,
  type Product,
  type ProductImage,
  type ProductVariant,
  type Category,
  type Order,
  type OrderItem,
  type CartItem,
  type Address,
  type InsertProduct,
  type InsertProductImage,
  type InsertProductVariant,
  type InsertCategory,
  type InsertOrder,
  type InsertOrderItem,
  type InsertCartItem,
  type InsertAddress,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ CATEGORY OPERATIONS ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(data);
  return Number((result as any)[0].insertId);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set({ active: false }).where(eq(categories.id, id));
}

// ============ PRODUCT OPERATIONS ============

export async function getAllProducts(filters?: {
  categoryId?: number;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(products).where(eq(products.active, true)).$dynamic();
  
  if (filters?.categoryId) {
    query = query.where(eq(products.categoryId, filters.categoryId));
  }
  
  if (filters?.featured !== undefined) {
    query = query.where(eq(products.featured, filters.featured));
  }
  
  if (filters?.minPrice !== undefined) {
    query = query.where(gte(products.basePrice, filters.minPrice.toString()));
  }
  
  if (filters?.maxPrice !== undefined) {
    query = query.where(lte(products.basePrice, filters.maxPrice.toString()));
  }
  
  if (filters?.search) {
    query = query.where(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.description, `%${filters.search}%`)
      )
    );
  }
  
  query = query.orderBy(desc(products.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  return await query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.displayOrder));
}

export async function getProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(productVariants)
    .where(and(
      eq(productVariants.productId, productId),
      eq(productVariants.active, true)
    ))
    .orderBy(asc(productVariants.name));
}

export async function getVariantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(products).values(data);
  return Number((result as any)[0].insertId);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(products).set({ active: false }).where(eq(products.id, id));
}

export async function createProductImage(data: InsertProductImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(productImages).values(data);
  return Number((result as any)[0].insertId);
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(productImages).where(eq(productImages.id, id));
}

export async function createProductVariant(data: InsertProductVariant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(productVariants).values(data);
  return Number((result as any)[0].insertId);
}

export async function updateProductVariant(id: number, data: Partial<InsertProductVariant>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(productVariants).set(data).where(eq(productVariants.id, id));
}

export async function deleteProductVariant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(productVariants).set({ active: false }).where(eq(productVariants.id, id));
}

// ============ CART OPERATIONS ============

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(data: InsertCartItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists
  const existing = await db.select().from(cartItems)
    .where(and(
      eq(cartItems.userId, data.userId),
      eq(cartItems.productId, data.productId),
      data.variantId ? eq(cartItems.variantId, data.variantId) : sql`${cartItems.variantId} IS NULL`
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    await db.update(cartItems)
      .set({ quantity: existing[0].quantity + data.quantity })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0].id;
  } else {
    // Insert new item
    const result = await db.insert(cartItems).values(data);
    return Number((result as any)[0].insertId);
  }
}

export async function updateCartItemQuantity(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============ ADDRESS OPERATIONS ============

export async function getUserAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));
}

export async function getAddressById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(addresses).where(eq(addresses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAddress(data: InsertAddress) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If this is set as default, unset other defaults
  if (data.isDefault) {
    await db.update(addresses)
      .set({ isDefault: false })
      .where(eq(addresses.userId, data.userId));
  }
  
  const result = await db.insert(addresses).values(data);
  return Number((result as any)[0].insertId);
}

export async function updateAddress(id: number, data: Partial<InsertAddress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // If setting as default, unset other defaults
  if (data.isDefault) {
    const address = await getAddressById(id);
    if (address) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }
  }
  
  await db.update(addresses).set(data).where(eq(addresses.id, id));
}

export async function deleteAddress(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(addresses).where(eq(addresses.id, id));
}

// ============ ORDER OPERATIONS ============

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(data);
  return Number((result as any)[0].insertId);
}

export async function createOrderItem(data: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orderItems).values(data);
  return Number((result as any)[0].insertId);
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: "pending" | "paid" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, id));
}

export async function getAllOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(orders).$dynamic();
  
  if (filters?.status) {
    query = query.where(eq(orders.status, filters.status as any));
  }
  
  if (filters?.paymentStatus) {
    query = query.where(eq(orders.paymentStatus, filters.paymentStatus as any));
  }
  
  query = query.orderBy(desc(orders.createdAt));
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }
  
  return await query;
}

// ============ SYSTEM CONFIG ============

export async function getSystemConfig(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(systemConfig).where(eq(systemConfig.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSystemConfig(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSystemConfig(key);
  
  if (existing) {
    await db.update(systemConfig)
      .set({ value, description: description || existing.description })
      .where(eq(systemConfig.key, key));
  } else {
    await db.insert(systemConfig).values({ key, value, description });
  }
}
