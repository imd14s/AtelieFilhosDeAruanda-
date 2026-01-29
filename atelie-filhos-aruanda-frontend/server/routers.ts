import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createCategory(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // ============ PRODUCTS ============
  products: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        featured: z.boolean().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return await db.getAllProducts(input);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        
        const [images, variants] = await Promise.all([
          db.getProductImages(input.id),
          db.getProductVariants(input.id),
        ]);
        
        return { ...product, images, variants };
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        
        const [images, variants] = await Promise.all([
          db.getProductImages(product.id),
          db.getProductVariants(product.id),
        ]);
        
        return { ...product, images, variants };
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number().optional(),
        basePrice: z.string(),
        featured: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProduct(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        shortDescription: z.string().optional(),
        categoryId: z.number().optional(),
        basePrice: z.string().optional(),
        featured: z.boolean().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    
    addImage: adminProcedure
      .input(z.object({
        productId: z.number(),
        imageUrl: z.string(),
        altText: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProductImage(input);
        return { id };
      }),
    
    deleteImage: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductImage(input.id);
        return { success: true };
      }),
    
    addVariant: adminProcedure
      .input(z.object({
        productId: z.number(),
        sku: z.string().min(1),
        name: z.string().min(1),
        size: z.string().optional(),
        color: z.string().optional(),
        priceAdjustment: z.string().default("0.00"),
        stockQuantity: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProductVariant(input);
        return { id };
      }),
    
    updateVariant: adminProcedure
      .input(z.object({
        id: z.number(),
        sku: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        priceAdjustment: z.string().optional(),
        stockQuantity: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductVariant(id, data);
        return { success: true };
      }),
    
    deleteVariant: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductVariant(input.id);
        return { success: true };
      }),
  }),

  // ============ CART ============
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      
      // Enrich with product details
      const enriched = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          const variant = item.variantId ? await db.getVariantById(item.variantId) : null;
          const images = await db.getProductImages(item.productId);
          
          return {
            ...item,
            product,
            variant,
            image: images[0]?.imageUrl,
          };
        })
      );
      
      return enriched;
    }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number(),
        variantId: z.number().optional(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify product exists and has stock
        const product = await db.getProductById(input.productId);
        if (!product || !product.active) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
        }
        
        if (input.variantId) {
          const variant = await db.getVariantById(input.variantId);
          if (!variant || !variant.active) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Variant not found' });
          }
          if (variant.stockQuantity < input.quantity) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock' });
          }
        }
        
        const id = await db.addToCart({
          userId: ctx.user.id,
          ...input,
        });
        
        return { id, success: true };
      }),
    
    updateQuantity: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItemQuantity(input.id, input.quantity);
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.id);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ ADDRESSES ============
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAddresses(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        recipientName: z.string().min(1),
        street: z.string().min(1),
        number: z.string().min(1),
        complement: z.string().optional(),
        neighborhood: z.string().min(1),
        city: z.string().min(1),
        state: z.string().length(2),
        zipCode: z.string().min(8).max(10),
        phone: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createAddress({
          userId: ctx.user.id,
          ...input,
        });
        return { id };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        recipientName: z.string().min(1).optional(),
        street: z.string().min(1).optional(),
        number: z.string().min(1).optional(),
        complement: z.string().optional(),
        neighborhood: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        state: z.string().length(2).optional(),
        zipCode: z.string().min(8).max(10).optional(),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAddress(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAddress(input.id);
        return { success: true };
      }),
  }),

  // ============ ORDERS ============
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }
        
        // Verify ownership (unless admin)
        if (order.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const items = await db.getOrderItems(input.id);
        const address = order.shippingAddressId ? await db.getAddressById(order.shippingAddressId) : null;
        
        return { ...order, items, shippingAddress: address };
      }),
    
    create: protectedProcedure
      .input(z.object({
        shippingAddressId: z.number(),
        shippingMethod: z.string(),
        shippingCost: z.string(),
        paymentMethod: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get cart items
        const cartItems = await db.getCartItems(ctx.user.id);
        if (cartItems.length === 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cart is empty' });
        }
        
        // Calculate totals
        let subtotal = 0;
        const orderItemsData = [];
        
        for (const item of cartItems) {
          const product = await db.getProductById(item.productId);
          if (!product) continue;
          
          const variant = item.variantId ? await db.getVariantById(item.variantId) : null;
          
          const basePrice = parseFloat(product.basePrice);
          const priceAdjustment = variant ? parseFloat(variant.priceAdjustment) : 0;
          const unitPrice = basePrice + priceAdjustment;
          const itemSubtotal = unitPrice * item.quantity;
          
          subtotal += itemSubtotal;
          
          orderItemsData.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: product.name,
            variantName: variant?.name,
            quantity: item.quantity,
            unitPrice: unitPrice.toFixed(2),
            subtotal: itemSubtotal.toFixed(2),
          });
        }
        
        const shippingCost = parseFloat(input.shippingCost);
        const total = subtotal + shippingCost;
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Create order
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          status: 'pending',
          subtotal: subtotal.toFixed(2),
          shippingCost: input.shippingCost,
          total: total.toFixed(2),
          shippingMethod: input.shippingMethod,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'pending',
          shippingAddressId: input.shippingAddressId,
          notes: input.notes,
        });
        
        // Create order items
        for (const itemData of orderItemsData) {
          await db.createOrderItem({
            orderId,
            ...itemData,
          });
        }
        
        // Clear cart
        await db.clearCart(ctx.user.id);
        
        return { orderId, orderNumber, success: true };
      }),
  }),

  // ============ ADMIN ============
  admin: router({
    orders: router({
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          paymentStatus: z.string().optional(),
          limit: z.number().default(50),
          offset: z.number().default(0),
        }))
        .query(async ({ input }) => {
          return await db.getAllOrders(input);
        }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        }))
        .mutation(async ({ input }) => {
          await db.updateOrderStatus(input.id, input.status);
          return { success: true };
        }),
      
      updatePaymentStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
        }))
        .mutation(async ({ input }) => {
          await db.updateOrderPaymentStatus(input.id, input.paymentStatus);
          return { success: true };
        }),
    }),
    
    dashboard: router({
      stats: adminProcedure.query(async () => {
        // Get basic stats
        const allOrders = await db.getAllOrders();
        const allProducts = await db.getAllProducts();
        
        const totalOrders = allOrders.length;
        const totalRevenue = allOrders
          .filter(o => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + parseFloat(o.total), 0);
        
        const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
        const totalProducts = allProducts.length;
        
        return {
          totalOrders,
          totalRevenue: totalRevenue.toFixed(2),
          pendingOrders,
          totalProducts,
        };
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
