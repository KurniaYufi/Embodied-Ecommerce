"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { loginAction } from "@/app/actions/login";
import TextField from "./TextField";

export default function RegisterForm({ redirectTo }: { redirectTo?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const clear = (key: string) => errors[key] && setErrors((e) => ({ ...e, [key]: "" }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setFormError(null);

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== passwordConfirmation) next.passwordConfirmation = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const result = await registerUser({ name: name.trim(), email: email.trim(), password, passwordConfirmation });
      if (!result.success) {
        if (result.field && ["name", "email", "password", "passwordConfirmation"].includes(result.field)) {
          setErrors({ [result.field]: result.error });
        } else {
          setFormError(result.error);
        }
        setPending(false);
        return;
      }

      // Sign straight in; the login action redirects on success.
      const formData = new FormData();
      formData.set("email", email.trim());
      formData.set("password", password);
      if (redirectTo) formData.set("redirect", redirectTo);
      const loginResult = await loginAction(null, formData);
      if (loginResult?.error) {
        setFormError("Your account was created, but we couldn't sign you in automatically. Please log in.");
        setPending(false);
      }
    } catch (err) {
      if (err && typeof err === "object" && "digest" in err) throw err;
      setFormError("Something went wrong. Please try again.");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError && (
        <p role="alert" className="alert alert-danger">
          {formError}
        </p>
      )}
      <TextField
        label="Full name"
        required
        autoFocus
        autoComplete="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          clear("name");
        }}
        error={errors.name}
      />
      <TextField
        label="Email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clear("email");
        }}
        error={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          clear("password");
        }}
        error={errors.password}
        hint="At least 8 characters."
      />
      <TextField
        label="Confirm password"
        type="password"
        required
        autoComplete="new-password"
        value={passwordConfirmation}
        onChange={(e) => {
          setPasswordConfirmation(e.target.value);
          clear("passwordConfirmation");
        }}
        error={errors.passwordConfirmation}
      />

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"} className="link text-ink">
          Log in
        </Link>
      </p>
    </form>
  );
}
