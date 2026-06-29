/** Intervalo de polling compartido del panel admin (ms). */
export const ADMIN_POLL_INTERVAL_MS = 7000;

/**
 * Programa polling con pausa cuando la pestaña no está visible.
 * Devuelve cleanup que detiene timers y listeners.
 */
export function scheduleVisibilityAwarePolling(
  tick: () => void,
  intervalMs: number,
  doc: Pick<Document, "visibilityState" | "addEventListener" | "removeEventListener"> = document,
): () => void {
  let interval: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (interval) clearInterval(interval);
    interval = null;
  };

  const start = () => {
    if (interval) return;
    tick();
    interval = setInterval(tick, intervalMs);
  };

  const onVisibility = () => {
    if (doc.visibilityState === "visible") start();
    else stop();
  };

  onVisibility();
  doc.addEventListener("visibilitychange", onVisibility);

  return () => {
    stop();
    doc.removeEventListener("visibilitychange", onVisibility);
  };
}
