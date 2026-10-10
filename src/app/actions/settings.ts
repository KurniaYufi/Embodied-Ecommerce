"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { success: true } | { success: false; error: string; field?: string };

const profileSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
});

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue.message, field: String(issue.path[0]) };
  }

  const { name, email } = parsed.data;
  const userId = Number(session.user.id);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { success: false, error: "This email has already been taken.", field: "email" };
  }

  const current = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      emailVerifiedAt: email !== current.email ? null : undefined,
    },
  });

  revalidatePath("/settings/profile");
  return { success: true };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  password: z.string().min(8),
  passwordConfirmation: z.string(),
});

export async function updatePassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue.message, field: String(issue.path[0]) };
  }

  if (parsed.data.password !== parsed.data.passwordConfirmation) {
    return { success: false, error: "Passwords do not match.", field: "passwordConfirmation" };
  }

  const userId = Number(session.user.id);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) {
    return { success: false, error: "The current password is incorrect.", field: "currentPassword" };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: true };
}

const deleteSchema = z.object({ password: z.string().min(1) });

export async function deleteAccount(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter your password." };
  }

  const userId = Number(session.user.id);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return { success: false, error: "The password is incorrect.", field: "password" };
  }

  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirectTo: "/" });

  return { success: true };
}
