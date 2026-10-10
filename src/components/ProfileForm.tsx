"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/settings";
import TextField from "./TextField";

export default function ProfileForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const unchanged = name.trim() === initialName && email.trim() === initialEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setField(null);
    setSaved(false);
    setPending(true);
    try {
      const result = await updateProfile({ name: name.trim(), email: email.trim() });
      if (!result.success) {
        setError(result.error);
        setField(result.field ?? null);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-5" noValidate>
      <TextField
        label="Name"
        required
        autoComplete="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSaved(false);
        }}
        error={field === "name" ? error : null}
      />
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setSaved(false);
        }}
        error={field === "email" ? error : null}
      />
      {error && !field && (
        <p role="alert" className="alert alert-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending || unchanged} className="btn btn-primary btn-sm">
          {pending ? "Saving…" : "Save changes"}
        </button>
        {saved && (
          <span role="status" className="text-[13px] text-success">
            Profile updated.
          </span>
        )}
      </div>
    </form>
  );
}
