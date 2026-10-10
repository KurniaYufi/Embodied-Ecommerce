"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/settings";
import Modal from "./Modal";
import TextField from "./TextField";

export default function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setOpen(false);
    setPassword("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      // On success the action signs out and redirects, so this only returns on failure.
      const result = await deleteAccount({ password });
      if (!result.success) setError(result.error);
    } catch (err) {
      // A redirect from the server action surfaces as a thrown navigation signal; let it through.
      if (err && typeof err === "object" && "digest" in err) throw err;
      setError("Couldn't delete your account. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section aria-labelledby="delete-heading" className="mt-14 max-w-md border border-danger/30 p-6">
      <h3 id="delete-heading" className="display text-2xl">
        Delete account
      </h3>
      <p className="mt-1 text-sm text-muted">Permanently delete your account and personal data.</p>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-sm mt-5 border border-danger text-danger hover:bg-danger hover:text-white">
        Delete account
      </button>

      <Modal open={open} onClose={close} title="Delete your account?">
        <p className="text-sm leading-relaxed text-ink-soft">
          Once your account is deleted, your profile and ratings are permanently removed. Existing orders are kept for our records but will no longer
          be linked to you. This cannot be undone.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <TextField
            label="Enter your password to confirm"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            data-autofocus
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="btn btn-quiet btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="btn btn-danger btn-sm">
              {pending ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
