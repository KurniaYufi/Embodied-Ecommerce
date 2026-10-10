"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { FORBIDDEN, isAdmin } from "@/lib/authz";

export type ActionResult = { success: true } | { success: false; error: string };

export async function savePaymentMethod(formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;
  const type = String(formData.get("type") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const isActive = formData.get("isActive") === "1";
  const removePhoto = formData.get("removePhoto") === "1";
  const photo = formData.get("photo") as File | null;

  if (!type || !["bank", "qris"].includes(type)) return { success: false, error: "Invalid type." };
  if (!name) return { success: false, error: "Name is required." };
  if (type === "bank" && (!accountName || !accountNumber)) {
    return { success: false, error: "Account name and number are required for bank transfer." };
  }

  const existing = id ? await prisma.paymentMethod.findUnique({ where: { id } }) : null;

  let imagePath = existing?.imagePath ?? null;
  if (type === "qris") {
    if (photo && photo.size > 0) {
      if (existing?.imagePath) await deleteUpload(existing.imagePath);
      imagePath = await saveUpload(photo, "payment-methods");
    } else if (removePhoto) {
      if (existing?.imagePath) await deleteUpload(existing.imagePath);
      imagePath = null;
    } else if (!existing?.imagePath) {
      return { success: false, error: "Please upload a QRIS image." };
    }
  } else {
    if (existing?.imagePath) await deleteUpload(existing.imagePath);
    imagePath = null;
  }

  const data = {
    type: type as "bank" | "qris",
    name,
    accountName: type === "bank" ? accountName : null,
    accountNumber: type === "bank" ? accountNumber : null,
    imagePath: type === "qris" ? imagePath : null,
    isActive,
  };

  if (id) {
    await prisma.paymentMethod.update({ where: { id }, data });
  } else {
    await prisma.paymentMethod.create({ data: { ...data, sortOrder: 0 } });
  }

  revalidatePath("/seller/payment-methods");
  return { success: true };
}

export async function togglePaymentMethodActive(id: number): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const pm = await prisma.paymentMethod.findUniqueOrThrow({ where: { id } });
  await prisma.paymentMethod.update({ where: { id }, data: { isActive: !pm.isActive } });
  revalidatePath("/seller/payment-methods");
  return { success: true };
}

export async function deletePaymentMethod(id: number): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const pm = await prisma.paymentMethod.findUniqueOrThrow({ where: { id } });
  if (pm.imagePath) await deleteUpload(pm.imagePath);
  await prisma.paymentMethod.delete({ where: { id } });
  revalidatePath("/seller/payment-methods");
  return { success: true };
}
