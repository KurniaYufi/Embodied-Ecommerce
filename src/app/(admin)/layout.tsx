import { auth } from "@/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-cream dark:bg-neutral-900 dark:text-neutral-100">
      <AdminSidebar userName={session?.user?.name ?? ""} userEmail={session?.user?.email ?? ""} />
      <main className="flex-1 overflow-x-hidden px-6 py-8 sm:px-10">{children}</main>
    </div>
  );
}
