"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateOrderNumber } from "@/lib/orderCode";
import { MAX_QTY_PER_LINE, cartLineKey } from "@/lib/cart";

// Only the product id, size and quantity are trusted from the browser. Name, price and imagery
// are always re-read from the database so a tampered cart cannot change what is charged.
const cartItemSchema = z.object({
  id: z.number().int().positive().nullable(),
  size: z.string().nullable(),
  qty: z.number().int(),
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(1, "Full name is required.").max(255),
  customerPhone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(30)
    .regex(/^\+?[0-9\s-]{8,20}$/, "Enter a valid phone number (8–20 digits)."),
  shippingAddress: z.string().trim().min(10, "Please enter your full shipping address.").max(1000),
  notes: z.string().trim().max(500).optional().nullable(),
  items: z.array(cartItemSchema),
});

export type CheckoutResult =
  | { success: true; accessToken: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
      /** Cart lines that could not be ordered, keyed by `${id}:${size}`. */
      itemErrors?: Record<string, string>;
      needsLogin?: boolean;
    };

export async function submitCheckout(input: unknown): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Please log in to complete your order.", needsLogin: true };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  const { customerName, customerPhone, shippingAddress, notes, items } = parsed.data;
  if (items.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  const ids = [...new Set(items.map((i) => i.id).filter((id): id is number => id !== null))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { sizes: { include: { size: true } } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Total quantity requested per product across sizes, for the stock check.
  const requestedPerProduct = new Map<number, number>();
  for (const item of items) {
    if (item.id !== null) requestedPerProduct.set(item.id, (requestedPerProduct.get(item.id) ?? 0) + item.qty);
  }

  const itemErrors: Record<string, string> = {};
  const lineItems: {
    productId: number;
    productName: string;
    size: string | null;
    price: number;
    quantity: number;
    gradient: string;
    image: string | null;
  }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const key = cartLineKey(item.id, item.size);
    const product = item.id !== null ? byId.get(item.id) : undefined;

    if (!product) {
      itemErrors[key] = "This item is no longer available.";
      continue;
    }
    if (item.qty < 1 || item.qty > MAX_QTY_PER_LINE) {
      itemErrors[key] = `Quantity must be between 1 and ${MAX_QTY_PER_LINE}.`;
      continue;
    }

    const sizeLabels = product.sizes.map((ps) => ps.size.label);
    if (sizeLabels.length > 0 && (!item.size || !sizeLabels.includes(item.size))) {
      itemErrors[key] = "Please choose an available size.";
      continue;
    }
    if (sizeLabels.length === 0 && item.size) {
      itemErrors[key] = "This item does not come in sizes.";
      continue;
    }

    const requested = requestedPerProduct.get(product.id) ?? item.qty;
    if (product.stock <= 0) {
      itemErrors[key] = "Sold out.";
      continue;
    }
    if (requested > product.stock) {
      itemErrors[key] = `Only ${product.stock} left in stock.`;
      continue;
    }

    subtotal += product.price * item.qty;
    lineItems.push({
      productId: product.id,
      productName: product.name,
      size: sizeLabels.length > 0 ? item.size : null,
      price: product.price,
      quantity: item.qty,
      gradient: product.gradient,
      image: product.image,
    });
  }

  if (Object.keys(itemErrors).length > 0) {
    return {
      success: false,
      error: "Some items in your bag need attention before you can continue.",
      itemErrors,
    };
  }

  const order = await prisma.order.create({
    data: {
      userId: Number(session.user.id),
      number: generateOrderNumber(),
      accessToken: generateAccessToken(),
      customerName,
      customerPhone,
      shippingAddress,
      notes: notes || null,
      subtotal,
      items: { create: lineItems },
    },
  });

  return { success: true, accessToken: order.accessToken };
}

/** Fresh price/stock data for the items in a browser cart, used to reconcile stale carts. */
export async function getCartProducts(ids: number[]) {
  const clean = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))].slice(0, 100);
  if (clean.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: clean } },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      stock: true,
      image: true,
      gradient: true,
      sizes: { select: { size: { select: { label: true } } } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image: p.image,
    gradient: p.gradient,
    sizes: p.sizes.map((s) => s.size.label),
  }));
}
