import { CheckIcon } from "./Icons";

const STEPS = ["Bag", "Shipping details", "Payment", "Confirmation"];

/** current is the 0-based index of the active step. */
export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol aria-label="Checkout progress" className="flex items-center gap-2 overflow-x-auto text-[12px] sm:gap-3">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} aria-current={active ? "step" : undefined} className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] tabular-nums ${
                done ? "border-ink bg-ink text-paper" : active ? "border-ink text-ink" : "border-line-strong text-subtle"
              }`}
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`${active ? "font-medium text-ink" : done ? "text-ink-soft" : "text-subtle"} ${active ? "" : "hidden sm:inline"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden className="h-px w-6 bg-line-strong sm:w-10" />}
          </li>
        );
      })}
    </ol>
  );
}
