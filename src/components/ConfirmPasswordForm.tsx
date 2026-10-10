"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmCurrentPassword } from "@/app/actions/auth";
import { safeRedirectPath } from "@/lib/redirect";
import TextField from "./TextField";

export default function ConfirmPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const result = await confirmCurrentPassword({ password });
      if (!result.success) {
        setError(result.error);
        setPending(false);
        return;
      }
      router.push(safeRedirectPath(searchParams.get("redirect"), "/settings/security"));
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <button type="submit" disabled={pending || !password} className="btn btn-primary w-full">
        {pending ? "Confirming…" : "Confirm"}
      </button>
    </form>
  );
}
