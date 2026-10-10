"use client";

import { logoutAction } from "@/app/actions/logout";

export default function LogoutButtonClientForm() {
  return (
    <form action={logoutAction} className="mt-2">
      <button type="submit" className="text-[11px] uppercase tracking-wider text-neutral-500 hover:text-neutral-900">
        Log Out
      </button>
    </form>
  );
}
