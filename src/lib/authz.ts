import { auth } from "@/auth";

/**
 * Server actions are public HTTP endpoints, so the proxy's page-level redirect is not enough —
 * every admin mutation re-checks the role itself.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

export const FORBIDDEN = { success: false as const, error: "You are not allowed to perform this action." };
