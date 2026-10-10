"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import ProductImage from "@/components/ProductImage";
import { formatRupiah } from "@/lib/format";
import { saveProduct, deleteProduct } from "@/app/actions/products";
import { GRADIENTS } from "@/lib/gradients";

type Product = {
  id: number;
  name: string;
  slug: string;
  categoryId: number | null;
  categoryName: string | null;
  description: string;
  price: number;
  stock: number;
  gradient: string;
  image: string | null;
  isBestseller: boolean;
  isNew: boolean;
  sizeIds: number[];
  sizeLabels: string[];
};

type Category = { id: number; name: string };
type Size = { id: number; label: string };

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  stock: "0",
  gradient: Object.keys(GRADIENTS)[0],
  isBestseller: false,
  isNew: false,
  sizeIds: [] as number[],
};

export default function ProductsManager({
  initialProducts,
  categories,
  sizes,
  initialSearch,
}: {
  initialProducts: Product[];
  categories: Category[];
  sizes: Size[];
  initialSearch: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
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
    setEditing(null);
    setForm(EMPTY_FORM);
    setPhoto(null);
    setRemovePhoto(false);
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      gradient: product.gradient,
      isBestseller: product.isBestseller,
      isNew: product.isNew,
      sizeIds: product.sizeIds,
    });
    setPhoto(null);
    setRemovePhoto(false);
    setError(null);
    setModalOpen(true);
  };

  const toggleSize = (id: number) => {
    setForm((f) => ({
      ...f,
      sizeIds: f.sizeIds.includes(id) ? f.sizeIds.filter((s) => s !== id) : [...f.sizeIds, id],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);

    const formData = new FormData();
    if (editing) formData.set("id", String(editing.id));
    formData.set("name", form.name);
    formData.set("categoryId", form.categoryId);
    formData.set("description", form.description);
    formData.set("price", form.price);
    formData.set("stock", form.stock);
    formData.set("gradient", form.gradient);
    formData.set("isBestseller", form.isBestseller ? "1" : "0");
    formData.set("isNew", form.isNew ? "1" : "0");
    formData.set("removePhoto", removePhoto ? "1" : "0");
    form.sizeIds.forEach((id) => formData.append("sizeIds", String(id)));
    if (photo) formData.set("photo", photo);

    const result = await saveProduct(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    router.refresh();
  };

  return (
    <div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <input
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full max-w-xs border border-neutral-300 bg-cream px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="button"
          onClick={openCreate}
          className="flex-shrink-0 bg-neutral-900 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white dark:bg-white dark:text-neutral-900"
        >
          New Product
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500 dark:border-neutral-800">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Badges</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Sizes</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {initialProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  No products yet.
                </td>
              </tr>
            ) : (
              initialProducts.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-4 py-3">
                    <div className="h-12 w-10 overflow-hidden bg-neutral-100">
                      <ProductImage image={product.image} gradient={product.gradient} alt={product.name} />
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.categoryName ?? "Uncategorized"}</td>
                  <td className="px-4 py-3">{formatRupiah(product.price)}</td>
                  <td className="px-4 py-3">
                    {product.isBestseller && <span className="mr-1 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-white">Bestseller</span>}
                    {product.isNew && <span className="bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-700">New</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 text-[10px] ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-rose-100 text-rose-800"}`}>
                      {product.stock > 0 ? product.stock : "Out of stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{product.sizeLabels.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(product)} className="mr-3 text-neutral-600 underline underline-offset-4 hover:text-neutral-900">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(product.id)} className="text-rose-600 underline underline-offset-4 hover:text-rose-800">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "New Product"} maxWidth="max-w-2xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Price (Rp)</label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Stock Quantity</label>
              <input
                type="number"
                required
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Photo</label>
            {editing?.image && !removePhoto && (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-16 w-14 overflow-hidden bg-neutral-100">
                  <ProductImage image={editing.image} gradient={editing.gradient} alt={editing.name} />
                </div>
                <label className="flex items-center gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={removePhoto} onChange={(e) => setRemovePhoto(e.target.checked)} />
                  Remove photo
                </label>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm" />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              {editing?.image && !removePhoto ? "Backdrop Tone (used if photo is removed)" : "Backdrop Tone"}
            </label>
            <select
              value={form.gradient}
              onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
              className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
            >
              {Object.entries(GRADIENTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Available Sizes</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {sizes.map((size) => (
                <label key={size.id} className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={form.sizeIds.includes(size.id)} onChange={() => toggleSize(size.id)} />
                  {size.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Badge</p>
            <div className="mt-2 flex gap-5">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.isBestseller}
                  onChange={(e) => setForm((f) => ({ ...f, isBestseller: e.target.checked }))}
                />
                Bestseller badge
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" checked={form.isNew} onChange={(e) => setForm((f) => ({ ...f, isNew: e.target.checked }))} />
                New badge
              </label>
            </div>
          </div>

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
