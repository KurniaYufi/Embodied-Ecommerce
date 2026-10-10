import { STATUS_LABELS, STATUS_STEPS } from "@/lib/orderStatus";
import { CheckIcon, CloseIcon } from "./Icons";

export default function OrderTracker({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 text-danger">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-soft">
          <CloseIcon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium">Order cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);

  return (
    <ol aria-label="Order progress" className="grid grid-cols-5 gap-1">
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIndex || (i === currentIndex && step === "completed");
        const active = i === currentIndex && !done;
        return (
          <li key={step} aria-current={active ? "step" : undefined} className="flex flex-col gap-3">
            <div className="flex items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                  done ? "border-ink bg-ink text-paper" : active ? "border-ink bg-paper text-ink ring-4 ring-ink/10" : "border-line-strong text-subtle"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < STATUS_STEPS.length - 1 && <span aria-hidden className={`h-px flex-1 ${i < currentIndex ? "bg-ink" : "bg-line-strong"}`} />}
            </div>
            <span className={`pr-2 text-[11px] leading-tight sm:text-[13px] ${done || active ? "text-ink" : "text-subtle"} ${active ? "font-medium" : ""}`}>
              {STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
