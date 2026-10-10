"use client";

import { useState } from "react";
import { updatePassword } from "@/app/actions/settings";
import TextField from "./TextField";

export default function SecurityForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setField(null);
    setSaved(false);

    if (password.length < 8) {
      setError("The new password must be at least 8 characters.");
      setField("password");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      setField("passwordConfirmation");
      return;
    }

    setPending(true);
    try {
      const result = await updatePassword({ currentPassword, password, passwordConfirmation });
      if (!result.success) {
        setError(result.error);
        setField(result.field ?? null);
        // Keep the new password fields when only the current password was wrong.
        if (result.field === "currentPassword") setCurrentPassword("");
        return;
      }
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setSaved(true);
    } catch {
      setError("Couldn't update your password. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5" noValidate>
      <TextField
        label="Current password"
        type="password"
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={field === "currentPassword" ? error : null}
      />
      <TextField
        label="New password"
        type="password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={field === "password" ? error : null}
        hint="At least 8 characters."
      />
      <TextField
        label="Confirm new password"
        type="password"
        required
        autoComplete="new-password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        error={field === "passwordConfirmation" ? error : null}
      />
      {error && !field && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? "Saving…" : "Update password"}
        </button>
        {saved && (
          <span role="status" className="text-[13px] text-success">
            Password updated.
          </span>
        )}
      </div>
    </form>
  );
}
