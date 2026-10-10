"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { uploadPaymentProof } from "@/app/actions/orders";
import { useToast } from "@/contexts/ToastContext";
import { CheckIcon, CopyIcon } from "./Icons";

type PaymentMethod = {
  id: number;
  type: string;
  name: string;
  accountName: string | null;
  accountNumber: string | null;
  imagePath: string | null;
};

type Props = {
  token: string;
  paymentMethods: PaymentMethod[];
  subtotal: number;
  hasExistingProof: boolean;
  currentMethodName: string | null;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { show } = useToast();
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          show("Couldn't copy automatically — please select and copy it manually.", { tone: "error" });
        }
      }}
      className="inline-flex h-8 items-center gap-1.5 border border-line-strong px-2.5 text-[12px] text-ink hover:border-ink"
      aria-label={`Copy ${label}`}
    >
      {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function PaymentProofUpload({ token, paymentMethods, subtotal, hasExistingProof, currentMethodName }: Props) {
  const router = useRouter();
  const fileId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(paymentMethods[0]?.id ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  const selected = paymentMethods.find((pm) => pm.id === selectedId);

  const resetFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const chooseFile = (f: File | null) => {
    setError(null);
    setSuccess(false);
    if (f && !ACCEPT.split(",").includes(f.type)) {
      resetFile();
      setError("Please choose a JPG, PNG, WEBP or HEIC image.");
      return;
    }
    if (f && f.size > MAX_BYTES) {
      resetFile();
      setError("The image must be 5MB or smaller.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setError(null);

    if (!selectedId) {
      setError("Please choose a payment method.");
      return;
    }
    if (!file) {
      setError("Please choose an image of your payment proof.");
      return;
    }

    const formData = new FormData();
    formData.set("payment_method_id", String(selectedId));
    formData.set("proof", file);

    setPending(true);
    try {
      const result = await uploadPaymentProof(token, formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      resetFile();
      router.refresh();
    } catch {
      setError("Upload failed. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  if (paymentMethods.length === 0) {
    return (
      <div className="alert alert-warning">
        No payment method is available right now. Please{" "}
        <Link href="/help#contact" className="underline underline-offset-2">
          contact us
        </Link>{" "}
        with your order number so we can help you complete the payment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 sm:p-6" noValidate>
      <h2 className="display text-2xl">{hasExistingProof ? "Payment received" : "Pay for your order"}</h2>
      {hasExistingProof && (
        <p className="mt-2 text-sm text-muted">
          We have your proof{currentMethodName ? ` (${currentMethodName})` : ""}. You can replace it below if you uploaded the wrong image.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between border-y border-line py-4">
        <span className="text-sm text-muted">Amount to transfer</span>
        <span className="flex items-center gap-3">
          <span className="text-lg font-medium tabular-nums">{formatRupiah(subtotal)}</span>
          <CopyButton value={String(subtotal)} label="amount" />
        </span>
      </div>

      <fieldset className="mt-6">
        <legend className="label">1. Choose a payment method</legend>
        <div className="mt-2 space-y-2">
          {paymentMethods.map((pm) => (
            <label
              key={pm.id}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition-colors ${
                selectedId === pm.id ? "border-ink bg-paper" : "border-line-strong hover:border-muted"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value={pm.id}
                checked={selectedId === pm.id}
                onChange={() => setSelectedId(pm.id)}
                className="h-4 w-4 accent-ink"
              />
              <span className="flex-1 font-medium text-ink">{pm.name}</span>
              <span className="text-[11px] tracking-wider text-muted uppercase">{pm.type === "qris" ? "QRIS" : "Bank transfer"}</span>
            </label>
          ))}
        </div>

        {selected && (
          <div className="mt-4 bg-sunken p-4 text-sm">
            {selected.type === "bank" ? (
              <dl className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <dt className="text-[12px] text-muted">Account number</dt>
                    <dd className="font-medium tracking-wide text-ink tabular-nums">{selected.accountNumber}</dd>
                  </div>
                  {selected.accountNumber && <CopyButton value={selected.accountNumber} label="account number" />}
                </div>
                <div>
                  <dt className="text-[12px] text-muted">Account name</dt>
                  <dd className="text-ink">{selected.accountName}</dd>
                </div>
              </dl>
            ) : selected.imagePath ? (
              <div className="flex flex-col items-center gap-3 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.imagePath} alt={`${selected.name} QR code`} className="h-56 w-56 bg-white object-contain p-2" />
                <p className="text-[13px] text-muted">Scan with your banking or e-wallet app.</p>
              </div>
            ) : (
              <p className="text-[13px] text-warning">
                The QR code for this method isn&apos;t available right now. Please choose another method or contact us.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <div className="mt-6">
        <label htmlFor={fileId} className="label">
          2. {hasExistingProof ? "Replace proof of payment" : "Upload proof of payment"}
        </label>
        <label
          htmlFor={fileId}
          className="flex cursor-pointer items-center gap-4 border border-dashed border-line-strong bg-surface p-4 transition-colors hover:border-ink"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected payment proof" className="h-16 w-16 object-cover" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center bg-sunken text-[11px] text-muted">Image</span>
          )}
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate text-ink">{file ? file.name : "Choose an image"}</span>
            <span className="text-[12px] text-muted">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "JPG, PNG, WEBP or HEIC · max 5MB"}
            </span>
          </span>
        </label>
        <input
          ref={inputRef}
          id={fileId}
          type="file"
          accept={ACCEPT}
          onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
          className="sr-only"
          aria-describedby={error ? `${fileId}-error` : undefined}
        />
      </div>

      {error && (
        <p id={`${fileId}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-[13px] text-success">
          Proof uploaded. We&apos;ll confirm your payment shortly.
        </p>
      )}

      <button type="submit" disabled={pending || !file || !selectedId} className="btn btn-primary mt-6 w-full">
        {pending ? "Uploading…" : hasExistingProof ? "Replace Proof" : "Submit Payment Proof"}
      </button>
    </form>
  );
}
