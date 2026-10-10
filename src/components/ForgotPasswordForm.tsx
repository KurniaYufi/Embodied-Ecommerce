"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import TextField from "./TextField";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setPending(true);
    try {
      const result = await requestPasswordReset({ email: email.trim() });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSent(true);
      setResetUrl(result.resetUrl ?? null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-5">
        <p role="status" className="alert alert-success">
          If an account exists for <strong>{email.trim()}</strong>, a password reset link has been generated.
        </p>
        {/* This project has no email service configured, so the link is shown here instead of being emailed. */}
        {resetUrl && (
          <Link href={resetUrl} className="btn btn-primary w-full">
            Open reset link
          </Link>
        )}
        <p className="text-center text-sm text-muted">
          <Link href="/login" className="link text-ink">
            Return to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Email"
        type="email"
        required
        autoFocus
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
      />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Sending…" : "Get reset link"}
      </button>
      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="link text-ink">
          Return to log in
        </Link>
      </p>
    </form>
  );
}
