"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { savePaymentMethod, togglePaymentMethodActive, deletePaymentMethod } from "@/app/actions/payment-methods";

type PaymentMethod = {
  id: number;
  type: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
  imagePath: string | null;
  isActive: boolean;
};

export default function PaymentMethodsManager({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [type, setType] = useState<"bank" | "qris">("bank");
  const [name, setName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setType("bank");
    setName("");
    setAccountName("");
    setAccountNumber("");
    setIsActive(true);
    setPhoto(null);
    setRemovePhoto(false);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (pm: PaymentMethod) => {
    setEditing(pm);
    setType(pm.type as "bank" | "qris");
    setName(pm.name);
    setAccountName(pm.accountName ?? "");
    setAccountNumber(pm.accountNumber ?? "");
    setIsActive(pm.isActive);
    setPhoto(null);
    setRemovePhoto(false);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    const formData = new FormData();
    if (editing) formData.set("id", String(editing.id));
    formData.set("type", type);
    formData.set("name", name);
    formData.set("accountName", accountName);
    formData.set("accountNumber", accountNumber);
    formData.set("isActive", isActive ? "1" : "0");
    formData.set("removePhoto", removePhoto ? "1" : "0");
    if (photo) formData.set("photo", photo);

    const result = await savePaymentMethod(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  };

  const handleToggle = async (id: number) => {
    await togglePaymentMethodActive(id);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this payment method?")) return;
    await deletePaymentMethod(id);
    router.refresh();
  };

  return (
    <div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="bg-neutral-900 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white dark:bg-white dark:text-neutral-900"
        >
          New Payment Method
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentMethods.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No payment methods yet.
                </td>
              </tr>
            ) : (
              paymentMethods.map((pm) => (
                <tr key={pm.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-4 py-3">{pm.name}</td>
                  <td className="px-4 py-3 capitalize">{pm.type === "bank" ? "Bank Transfer" : "QRIS"}</td>
                  <td className="px-4 py-3">
                    {pm.type === "bank" ? (
                      pm.accountNumber
                    ) : pm.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pm.imagePath} alt={pm.name} className="h-10 w-10 object-contain" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(pm.id)}
                      className={`h-5 w-9 rounded-full p-0.5 transition-colors ${pm.isActive ? "bg-neutral-900" : "bg-neutral-300"}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${pm.isActive ? "translate-x-4" : ""}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(pm)} className="mr-3 text-neutral-600 underline underline-offset-4 hover:text-neutral-900">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(pm.id)} className="text-rose-600 underline underline-offset-4 hover:text-rose-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Payment Method" : "New Payment Method"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "bank" | "qris")}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="bank">Bank Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          {type === "bank" ? (
            <>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Account Name</label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">QRIS Image</label>
              {editing?.imagePath && !removePhoto && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editing.imagePath} alt="Current" className="h-16 w-16 object-contain" />
                  <label className="flex items-center gap-2 text-xs text-neutral-600">
                    <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
                    Remove image
                  </label>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm"
              />
            </div>
          )}

          <label className="flex items-center justify-between border border-neutral-200 p-3 dark:border-neutral-700">
            <span>
              <span className="block text-sm">Active</span>
              <span className="block text-xs text-neutral-500">Visible to customers at checkout</span>
            </span>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
          </label>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-[11px] uppercase tracking-wider text-neutral-600">
              Cancel
            </button>
            <button type="submit" disabled={pending} className="bg-neutral-900 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
