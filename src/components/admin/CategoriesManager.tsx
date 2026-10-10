"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Modal from "@/components/Modal";
import { saveCategory, deleteCategory } from "@/app/actions/categories";

type Category = { id: number; name: string; slug: string; productsCount: number };

export default function CategoriesManager({
  initialCategories,
  initialSearch,
}: {
  initialCategories: Category[];
  initialSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`${pathname}?${params.toString()}`);
  };

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    const result = await saveCategory({ id: editingId, name });
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category? Products in it will become uncategorized.")) return;
    await deleteCategory(id);
    router.refresh();
  };

  return (
    <div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search categories"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full max-w-xs border border-neutral-300 bg-cream px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={openCreate}
          className="flex-shrink-0 bg-neutral-900 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white dark:bg-white dark:text-neutral-900"
        >
          New Category
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {initialCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  No categories yet.
                </td>
              </tr>
            ) : (
              initialCategories.map((category) => (
                <tr key={category.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-4 py-3">{category.name}</td>
                  <td className="px-4 py-3">{category.productsCount}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(category)} className="mr-3 text-neutral-600 underline underline-offset-4 hover:text-neutral-900">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(category.id)} className="text-rose-600 underline underline-offset-4 hover:text-rose-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Women"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
          </div>
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
