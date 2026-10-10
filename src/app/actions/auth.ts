"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const registerSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type ActionResult = { success: true } | { success: false; error: string; field?: string };

export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue.message, field: String(issue.path[0]) };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "This email has already been taken.", field: "email" };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed, role: "customer" },
  });

  return { success: true };
}

const forgotPasswordSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(
  input: unknown
): Promise<{ success: true; resetUrl?: string } | { success: false; error: string }> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter a valid email address." };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always behave the same whether the user exists or not (avoid email enumeration).
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.upsert({
    where: { email },
    update: { token, createdAt: new Date() },
    create: { email, token },
  });

  const resetUrl = `/reset-password/${token}?email=${encodeURIComponent(email)}`;
  return { success: true, resetUrl };
}

// Matches Laravel's default `auth.passwords.users.expire`.
const RESET_TOKEN_TTL_MINUTES = 60;

const resetPasswordSchema = z
  .object({
    token: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue.message, field: String(issue.path[0]) };
  }

  const { token, email, password } = parsed.data;
  const record = await prisma.passwordResetToken.findUnique({ where: { email } });
  const expired = record ? Date.now() - record.createdAt.getTime() > RESET_TOKEN_TTL_MINUTES * 60 * 1000 : true;
  if (!record || record.token !== token || expired) {
    return { success: false, error: "This password reset link is invalid or has expired." };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { email }, data: { password: hashed } });
  await prisma.passwordResetToken.delete({ where: { email } });

  return { success: true };
}

const confirmPasswordSchema = z.object({ password: z.string().min(1) });

export async function confirmCurrentPassword(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not authenticated." };
  }

  const parsed = confirmPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please enter your password." };
  }

  const user = await prisma.user.findUnique({ where: { id: Number(session.user.id) } });
  if (!user) {
    return { success: false, error: "User not found." };
  }

  const valid = await bcrypt.compare(parsed.data.password, user.password);
  if (!valid) {
    return { success: false, error: "The password is incorrect.", field: "password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("pwd_confirmed", "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 3,
    path: "/",
    sameSite: "lax",
  });

  return { success: true };
}
