import { prisma } from "@/lib/prisma";

export const PAYMENT_TIMEOUT_MINUTES = 10;

export function paymentDeadline(createdAt: Date): Date {
  return new Date(createdAt.getTime() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000);
}

export function isPaymentExpired(status: string, createdAt: Date): boolean {
  if (status !== "pending_payment") return false;
  return new Date() > paymentDeadline(createdAt);
}

/** Mirrors Order::cancelDueToExpiredPayment() — called on every public view of an order. */
export async function cancelDueToExpiredPayment(order: { id: number; status: string; createdAt: Date }) {
  if (isPaymentExpired(order.status, order.createdAt)) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
    return "cancelled" as const;
  }
  return order.status;
}
