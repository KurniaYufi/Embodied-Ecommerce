import { prisma } from "@/lib/prisma";
import PaymentMethodsManager from "@/components/admin/PaymentMethodsManager";

export default async function SellerPaymentMethodsPage() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Master Data</p>
      <h1 className="mt-1 font-serif text-3xl">Payment Methods</h1>

      <PaymentMethodsManager paymentMethods={paymentMethods} />
    </div>
  );
}
