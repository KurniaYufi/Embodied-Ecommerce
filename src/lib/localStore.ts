"use client";

import { useSyncExternalStore } from "react";

/**
 * A tiny localStorage-backed store for useSyncExternalStore. The parsed value is cached per raw
 * string so snapshots stay referentially stable, and changes propagate to every subscriber in
 * this tab (custom event) and in other tabs (storage event).
 */
export function createLocalStore<T>(key: string, fallback: T, validate: (value: unknown) => T) {
  const EVENT = `localstore:${key}`;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function read(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw ? validate(JSON.parse(raw)) : fallback;
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function write(next: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage full or blocked: keep the in-memory value so the UI still reflects the action.
      cachedRaw = undefined;
      cachedValue = next;
    }
    window.dispatchEvent(new Event(EVENT));
  }

  function subscribe(callback: () => void) {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) callback();
    };
    window.addEventListener(EVENT, callback);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, callback);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { read, write, useValue };
}

/** True after hydration; lets components avoid rendering browser-only state on the server. */
const noopSubscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
