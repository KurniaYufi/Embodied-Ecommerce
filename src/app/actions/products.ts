"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { GRADIENTS } from "@/lib/gradients";
import { FORBIDDEN, isAdmin } from "@/lib/authz";

export type ActionResult = { success: true } | { success: false; error: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveProduct(formData: FormData): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const idRaw = formData.get("id");
  const id = idRaw ? Number(idRaw) : null;
  const name = String(formData.get("name") ?? "").trim();
  const categoryIdRaw = formData.get("categoryId");
  const categoryId = categoryIdRaw && categoryIdRaw !== "" ? Number(categoryIdRaw) : null;
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const gradient = String(formData.get("gradient") ?? "");
  const isBestseller = formData.get("isBestseller") === "1";
  const isNew = formData.get("isNew") === "1";
  const removePhoto = formData.get("removePhoto") === "1";
  const photo = formData.get("photo") as File | null;
  const sizeIds = formData.getAll("sizeIds").map((v) => Number(v));

  if (!name) return { success: false, error: "Name is required." };
  if (!description) return { success: false, error: "Description is required." };
  if (!Number.isFinite(price) || price < 0) return { success: false, error: "Price must be a positive number." };
  if (!Number.isFinite(stock) || stock < 0) return { success: false, error: "Stock must be a positive number." };
  if (!GRADIENTS[gradient]) return { success: false, error: "Please choose a valid backdrop tone." };

  const slug = slugify(name);
  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug && existingSlug.id !== id) {
    return { success: false, error: "A product with this name already exists." };
  }

  const existing = id ? await prisma.product.findUnique({ where: { id } }) : null;

  let image = existing?.image ?? null;
  if (photo && photo.size > 0) {
    if (existing?.image) await deleteUpload(existing.image);
    image = await saveUpload(photo, "products");
  } else if (removePhoto) {
    if (existing?.image) await deleteUpload(existing.image);
    image = null;
  }

  const data = {
    name,
    slug,
    categoryId,
    description,
    price: Math.trunc(price),
    stock: Math.trunc(stock),
    gradient,
    image,
    isBestseller,
    isNew,
  };

  const product = id
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });

  await prisma.productSize.deleteMany({ where: { productId: product.id } });
  if (sizeIds.length > 0) {
    await prisma.productSize.createMany({
      data: sizeIds.map((sizeId) => ({ productId: product.id, sizeId })),
    });
  }

  revalidatePath("/seller/products");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  if (product.image) await deleteUpload(product.image);
  await prisma.product.delete({ where: { id } });
  revalidatePath("/seller/products");
  return { success: true };
}
