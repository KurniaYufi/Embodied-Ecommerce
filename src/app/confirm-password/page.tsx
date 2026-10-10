import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import ConfirmPasswordForm from "@/components/ConfirmPasswordForm";

export const metadata: Metadata = { title: "Confirm password" };

export default function ConfirmPasswordPage() {
  return (
    <AuthShell
      title="Confirm password"
      description="This is a secure area of your account. Please confirm your password before continuing."
    >
      <Suspense>
        <ConfirmPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
