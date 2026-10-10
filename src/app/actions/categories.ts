"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FORBIDDEN, isAdmin } from "@/lib/authz";

export type ActionResult = { success: true } | { success: false; error: string };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const categorySchema = z.object({
  id: z.number().nullable(),
  name: z.string().min(1).max(255),
});

export async function saveCategory(input: unknown): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Name is required." };

  const { id, name } = parsed.data;
  const slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { success: false, error: "A category with this name already exists." };
  }

  if (id) {
    await prisma.category.update({ where: { id }, data: { name, slug } });
  } else {
    await prisma.category.create({ data: { name, slug } });
  }

  revalidatePath("/seller/categories");
  return { success: true };
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  if (!(await isAdmin())) return FORBIDDEN;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/seller/categories");
  return { success: true };
}
