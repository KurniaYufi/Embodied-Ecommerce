import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";
import { safeRedirectPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const { redirect } = await searchParams;
  const redirectTo = redirect ? safeRedirectPath(redirect, "") || undefined : undefined;
  const fromCheckout = redirectTo?.startsWith("/checkout");

  return (
    <AuthShell
      title="Welcome back"
      description={fromCheckout ? "Log in to complete your order — your bag is saved." : "Log in to your account to see your orders."}
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthShell>
  );
}
