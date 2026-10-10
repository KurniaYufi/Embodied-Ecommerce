"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";
import TextField from "./TextField";

export default function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFormError(null);
    const next: Record<string, string> = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) next.passwordConfirmation = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const result = await resetPassword({ token, email, password, passwordConfirmation });
      if (!result.success) {
        if (result.field === "password" || result.field === "passwordConfirmation") setErrors({ [result.field]: result.error });
        else setFormError(result.error);
        return;
      }
      setDone(true);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (!email) {
    return (
      <div className="space-y-5">
        <p role="alert" className="alert alert-danger">
          This reset link is incomplete. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5">
        <p role="status" className="alert alert-success">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && (
        <div role="alert" className="alert alert-danger">
          {formError}{" "}
          <Link href="/forgot-password" className="underline underline-offset-2">
            Request a new link
          </Link>
        </div>
      )}
      <TextField label="Email" type="email" value={email} readOnly disabled />
      <TextField
        label="New password"
        type="password"
        required
        autoFocus
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        hint="At least 8 characters."
      />
      <TextField
        label="Confirm new password"
        type="password"
        required
        autoComplete="new-password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        error={errors.passwordConfirmation}
      />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
