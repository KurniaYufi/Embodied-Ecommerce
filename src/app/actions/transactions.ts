"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FORBIDDEN, isAdmin } from "@/lib/authz";

export type ActionResult = { success: true } | { success: false; error: string };

const VALID_STATUSES = ["pending_payment", "awaiting_confirmation", "paid", "shipped", "completed", "cancelled"];

export async function updateOrderStatus(orderId: number, status: string): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  if (!VALID_STATUSES.includes(status)) return { success: false, error: "Invalid status." };
  await prisma.order.update({ where: { id: orderId }, data: { status: status as never } });
  revalidatePath("/seller/transactions");
  return { success: true };
}
