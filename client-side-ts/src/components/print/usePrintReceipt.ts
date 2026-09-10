import { useCallback, useEffect, useState } from "react";

/**
 * Drives the browser print dialog for an off-screen receipt.
 *
 * Render the returned `receipt` inside a `<PrintShell>`, then call `print(data)`.
 * The shell is committed to the DOM first, and `window.print()` fires once it is
 * on screen.
 */
export const usePrintReceipt = <T,>() => {
  const [receipt, setReceipt] = useState<T | null>(null);
  // Printing the same row twice sets identical state, which would not re-run the
  // effect — this counter makes every request distinct.
  const [ticket, setTicket] = useState(0);

  useEffect(() => {
    if (!receipt || ticket === 0) return;

    // Give React a beat to commit the shell before the browser snapshots the DOM.
    const timer = window.setTimeout(() => {
      window.print();
    }, 150);

    return () => window.clearTimeout(timer);
  }, [receipt, ticket]);

  useEffect(() => {
    const handleAfterPrint = () => setReceipt(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const print = useCallback((data: T) => {
    setReceipt(data);
    setTicket((current) => current + 1);
  }, []);

  return { receipt, print };
};
