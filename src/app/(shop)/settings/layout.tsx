import type { Metadata } from "next";
import SettingsNav from "@/components/SettingsNav";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page max-w-5xl py-10 lg:py-14">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-5xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">Manage your profile and account settings.</p>

      <div className="mt-10 flex flex-col gap-10 border-t border-line pt-8 lg:flex-row lg:gap-16">
        <SettingsNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
