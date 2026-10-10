"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cancelDueToExpiredPayment } from "@/lib/orders";
import { deleteUpload, saveUpload } from "@/lib/uploads";

export type ActionResult = { success: true } | { success: false; error: string };

const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function uploadPaymentProof(token: string, formData: FormData): Promise<ActionResult> {
  const order = await prisma.order.findUnique({ where: { accessToken: token } });
  if (!order) return { success: false, error: "Order not found." };

  await cancelDueToExpiredPayment(order);
  const fresh = await prisma.order.findUniqueOrThrow({ where: { accessToken: token } });

  if (!["pending_payment", "awaiting_confirmation"].includes(fresh.status)) {
    return { success: false, error: "This order can no longer accept a new payment proof." };
  }

  const paymentMethodId = Number(formData.get("payment_method_id"));
  const file = formData.get("proof") as File | null;

  if (!paymentMethodId || !file || typeof file === "string" || file.size === 0) {
    return { success: false, error: "Please choose a payment method and upload a proof image." };
  }
  if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
    return { success: false, error: "The proof must be a JPG, PNG, WEBP or HEIC image." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "The proof image must not be larger than 5MB." };
  }

  const method = await prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, isActive: true } });
  if (!method) {
    return { success: false, error: "That payment method is no longer available. Please choose another." };
  }

  if (fresh.paymentProofPath) {
    await deleteUpload(fresh.paymentProofPath);
  }

  const path = await saveUpload(file, "payment-proofs");

  await prisma.order.update({
    where: { id: fresh.id },
    data: {
      paymentMethodId,
      paymentProofPath: path,
      paymentProofUploadedAt: new Date(),
      status: "awaiting_confirmation",
    },
  });

  revalidatePath(`/orders/${token}`);
  revalidatePath("/seller/transactions");
  return { success: true };
}

export async function submitReview(
  token: string,
  productId: number,
  rating: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const order = await prisma.order.findUnique({
    where: { accessToken: token },
    include: { items: true },
  });
  if (!order) return { success: false, error: "Order not found." };
  if (order.userId !== Number(session.user.id)) return { success: false, error: "Forbidden." };
  if (order.status !== "completed") return { success: false, error: "This order is not completed yet." };

  const purchasedProductIds = order.items.map((i) => i.productId).filter((id): id is number => id !== null);
  if (!purchasedProductIds.includes(productId)) {
    return { success: false, error: "You can only review products you purchased." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5." };
  }

  await prisma.review.upsert({
    where: { userId_productId: { userId: Number(session.user.id), productId } },
    update: { rating, orderId: order.id },
    create: { userId: Number(session.user.id), productId, orderId: order.id, rating },
  });

  revalidatePath(`/orders/${token}`);
  return { success: true };
}
