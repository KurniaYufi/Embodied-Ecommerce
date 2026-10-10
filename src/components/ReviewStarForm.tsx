"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReview } from "@/app/actions/orders";
import { useToast } from "@/contexts/ToastContext";
import { StarIcon } from "./Icons";

export default function ReviewStarForm({
  token,
  productId,
  productName,
  existingRating,
}: {
  token: string;
  productId: number;
  productName: string;
  existingRating?: number;
}) {
  const router = useRouter();
  const { show } = useToast();
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hover, setHover] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await submitReview(token, productId, rating);
      if (!result.success) {
        setError(result.error);
        return;
      }
      show(existingRating ? "Your rating was updated." : "Thanks for rating this piece!", { tone: "success" });
      router.refresh();
    } catch {
      setError("Couldn't save your rating. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label={`Rate ${productName}`} className="flex items-center" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i === 1 ? "" : "s"}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(0)}
              onClick={() => setRating(i)}
              className="inline-flex h-9 w-8 items-center justify-center"
            >
              <StarIcon filled={i <= shown} className={`h-5 w-5 transition-colors ${i <= shown ? "text-amber-500" : "text-line-strong"}`} />
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={pending || rating < 1 || rating === existingRating}
          className="btn btn-secondary btn-sm h-9 px-4"
        >
          {pending ? "Saving…" : existingRating ? "Update" : "Submit"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
