import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import {scheduleVisibilityAwarePolling} from "@/lib/admin-polling";

describe("scheduleVisibilityAwarePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ejecuta tick al iniciar y en cada intervalo mientras visible", () => {
    const tick = vi.fn();
    const doc = {
      visibilityState: "visible" as DocumentVisibilityState,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const cleanup = scheduleVisibilityAwarePolling(tick, 1000, doc);
    expect(tick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(3000);
    expect(tick).toHaveBeenCalledTimes(4);

    cleanup();
  });

  it("pausa el intervalo cuando la pestaña no es visible", () => {
    const tick = vi.fn();
    let visibility: DocumentVisibilityState = "visible";
    const listeners = new Map<string, () => void>();
    const doc = {
      get visibilityState() {
        return visibility;
      },
      addEventListener: vi.fn((event: string, handler: () => void) => {
        listeners.set(event, handler);
      }),
      removeEventListener: vi.fn((event: string) => {
        listeners.delete(event);
      }),
    };

    scheduleVisibilityAwarePolling(tick, 1000, doc);
    expect(tick).toHaveBeenCalledTimes(1);

    visibility = "hidden";
    listeners.get("visibilitychange")?.();
    vi.advanceTimersByTime(5000);
    expect(tick).toHaveBeenCalledTimes(1);

    visibility = "visible";
    listeners.get("visibilitychange")?.();
    expect(tick).toHaveBeenCalledTimes(2);
  });
});
