"use client";

import { useSyncExternalStore } from "react";

type Mode = "light" | "dark" | "system";

const KEY = "embodied-appearance";
const EVENT = "appearance:changed";

function read(): Mode {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function apply(mode: Mode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", mode === "dark" || (mode === "system" && prefersDark));
}

const OPTIONS: { value: Mode; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Warm paper tones" },
  { value: "dark", label: "Dark", hint: "Easier at night" },
  { value: "system", label: "System", hint: "Match your device" },
];

export default function AppearanceSwitcher() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode);

  const choose = (next: Mode) => {
    try {
      window.localStorage.setItem(KEY, next);
    } catch {}
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <fieldset>
      <legend className="sr-only">Colour theme</legend>
      <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors ${
              mode === opt.value ? "border-ink bg-surface" : "border-line-strong hover:border-muted"
            }`}
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="appearance"
                value={opt.value}
                checked={mode === opt.value}
                onChange={() => choose(opt.value)}
                className="h-4 w-4 accent-ink"
              />
              <span className="text-sm font-medium text-ink">{opt.label}</span>
            </span>
            <span className="pl-6 text-[13px] text-muted">{opt.hint}</span>
          </label>
        ))}
      </div>
      <p className="field-hint mt-4">Saved on this device.</p>
    </fieldset>
  );
}
