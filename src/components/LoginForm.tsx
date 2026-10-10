"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/login";
import TextField from "./TextField";

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const registerHref = redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register";

  return (
    <form action={formAction} className="space-y-5">
      {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

      {state?.error && (
        <p role="alert" className="alert alert-danger">
          {state.error}
        </p>
      )}

      <TextField
        label="Email"
        type="email"
        name="email"
        required
        autoFocus
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        defaultValue={state?.email ?? ""}
        key={state?.email ?? "email"}
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        required
        autoComplete="current-password"
        labelAside={
          <Link href="/forgot-password" className="link text-[13px] text-muted hover:text-ink">
            Forgot password?
          </Link>
        }
      />

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        New to Embodied?{" "}
        <Link href={registerHref} className="link text-ink">
          Create an account
        </Link>
      </p>
    </form>
  );
}
