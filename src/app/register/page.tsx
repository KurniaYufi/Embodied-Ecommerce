import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";
import { safeRedirectPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  const redirectTo = redirect ? safeRedirectPath(redirect, "") || undefined : undefined;

  return (
    <AuthShell title="Create an account" description="Track your orders and check out faster.">
      <RegisterForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
