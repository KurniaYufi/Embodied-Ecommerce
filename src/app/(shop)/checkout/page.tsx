import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "@/components/CheckoutClient";
import CheckoutSteps from "@/components/CheckoutSteps";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [session, paymentMethods] = await Promise.all([
    auth(),
    prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true },
    }),
  ]);

  return (
    <div className="container-page py-10 lg:py-14">
      <CheckoutSteps current={1} />
      <h1 className="display mt-8 text-5xl">Checkout</h1>
      <CheckoutClient defaultName={session?.user?.name ?? ""} paymentMethods={paymentMethods} />
    </div>
  );
}
