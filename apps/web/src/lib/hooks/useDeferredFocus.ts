import { useEffect, useRef, type RefObject } from "react";

// focuses the returned ref once `ready` turns true, after a short delay
export function useDeferredFocus<T extends HTMLElement>(ready: boolean) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      ref.current?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(t);
  }, [ready]);
  return ref as RefObject<T | null>;
}
