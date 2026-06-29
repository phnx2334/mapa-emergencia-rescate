"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {apiFetch} from "@/lib/api";
import {ADMIN_STORAGE_KEY} from "@/lib/admin-auth";
import {deriveAdminLiveCounts} from "@/lib/admin-live-counts";
import type {AdminLiveCounts} from "@/lib/admin-nav";
import type {
  DuplicateReport,
  HubStats,
  SyncRun,
  SyncStateRow,
} from "@/lib/admin-overview";
import {SYNC_RESET_CONFIRM_MESSAGE} from "@/lib/admin-overview";
import {
  ADMIN_POLL_INTERVAL_MS,
  scheduleVisibilityAwarePolling,
} from "@/lib/admin-polling";
import {
  applyMessageRemoval,
  applyPersonRemoval,
  applyReportRemoval,
  moderationDeletePath,
  type AdminModerationData,
} from "@/lib/admin-moderation";
import {applyContactRead} from "@/lib/admin-management";
import type {ContactMessage} from "@/lib/contact-inbox";
import type {Donation} from "@/lib/donation-shared";
import type {ReportType} from "@/lib/types";

export interface AdminDataStats {
  reports: {
    total: number;
    byType: Record<ReportType, number>;
    totalAffected: number;
    lastHour: number;
    last24h: number;
    withPhoto: number;
  };
  chat: {total: number; lastHour: number};
  missing: {
    total: number;
    active?: number;
    found?: number;
    withPhoto: number;
  };
}

export interface AdminSessionData extends AdminModerationData {
  generatedAt: number;
  persistent: boolean;
  sync?: {runs: SyncRun[]; state: SyncStateRow[]};
}

export interface AdminDonationsSlice {
  generatedAt: number;
  stats: {
    count: number;
    totalCents: number;
    last24hCount: number;
    last24hCents: number;
  };
  donations: Donation[];
}

export interface AdminContactSlice {
  generatedAt: number;
  stats: {
    total: number;
    unread: number;
    last24h: number;
  };
  messages: ContactMessage[];
}

interface AdminSessionContextValue {
  ready: boolean;
  token: string | null;
  error: string | null;
  data: AdminSessionData | null;
  donationsData: AdminDonationsSlice | null;
  contactData: AdminContactSlice | null;
  hubStats: HubStats | null;
  syncing: boolean;
  liveCounts: AdminLiveCounts;
  login: (token: string) => void;
  logout: () => void;
  refreshAll: () => Promise<void>;
  runSyncNow: () => Promise<void>;
  resetSyncCursor: () => Promise<void>;
  loadDuplicateReport: () => Promise<DuplicateReport | null>;
  removeReport: (id: string) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  removePerson: (id: string) => Promise<void>;
  restoreMissingPerson: (id: string) => Promise<void>;
  markContactRead: (id: string) => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function useAdminSession(): AdminSessionContextValue {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) {
    throw new Error("useAdminSession debe usarse dentro de AdminSessionProvider");
  }
  return ctx;
}

async function fetchWithAdminToken<T>(
  url: string,
  token: string,
): Promise<{ok: true; data: T} | {ok: false; status: number}> {
  const res = await apiFetch(url, {
    headers: {"x-admin-token": token},
    cache: "no-store",
  });
  if (!res.ok) return {ok: false, status: res.status};
  return {ok: true, data: (await res.json()) as T};
}

export function AdminSessionProvider({children}: {children: ReactNode}) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminSessionData | null>(null);
  const [donationsData, setDonationsData] = useState<AdminDonationsSlice | null>(
    null,
  );
  const [contactData, setContactData] = useState<AdminContactSlice | null>(null);
  const [hubStats, setHubStats] = useState<HubStats | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setToken(sessionStorage.getItem(ADMIN_STORAGE_KEY));
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setToken(null);
    setData(null);
    setDonationsData(null);
    setContactData(null);
    setHubStats(null);
    setSyncing(false);
    setError(null);
  }, []);

  const login = useCallback((nextToken: string) => {
    sessionStorage.setItem(ADMIN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setError(null);
  }, []);

  const fetchData = useCallback(async () => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return;
    const result = await fetchWithAdminToken<AdminSessionData>(
      "/api/admin/data",
      current,
    );
    if (!result.ok) {
      if (result.status === 401) {
        logout();
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      }
      return;
    }
    setData(result.data);
    setError(null);
  }, [logout]);

  const fetchDonations = useCallback(async () => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return;
    const result = await fetchWithAdminToken<AdminDonationsSlice>(
      "/api/admin/donations",
      current,
    );
    if (!result.ok) {
      if (result.status === 401) {
        logout();
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      }
      return;
    }
    setDonationsData(result.data);
  }, [logout]);

  const fetchContact = useCallback(async () => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return;
    const result = await fetchWithAdminToken<AdminContactSlice>(
      "/api/admin/contact",
      current,
    );
    if (!result.ok) {
      if (result.status === 401) {
        logout();
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      }
      return;
    }
    setContactData(result.data);
  }, [logout]);

  const fetchHubStats = useCallback(async () => {
    try {
      const res = await apiFetch("/api/hub/stats", {cache: "no-store"});
      if (!res.ok) return;
      setHubStats((await res.json()) as HubStats);
    } catch {
      // se reintenta en el siguiente ciclo
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchData(), fetchDonations(), fetchContact(), fetchHubStats()]);
  }, [fetchData, fetchDonations, fetchContact, fetchHubStats]);

  const runSyncNow = useCallback(async () => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current || syncing) return;
    setSyncing(true);
    try {
      await apiFetch("/api/sync/run?mode=chunk", {
        method: "POST",
        headers: {"x-admin-token": current},
      });
      await fetchData();
    } catch {
      // se refleja en el próximo poll
    } finally {
      setSyncing(false);
    }
  }, [syncing, fetchData]);

  const resetSyncCursor = useCallback(async () => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return;
    if (!window.confirm(SYNC_RESET_CONFIRM_MESSAGE)) return;
    try {
      await apiFetch("/api/sync/reset", {
        method: "POST",
        headers: {"x-admin-token": current},
      });
      await fetchData();
    } catch {
      // se refleja en el próximo poll
    }
  }, [fetchData]);

  const removeModerationItem = useCallback(
    async (kind: "reports" | "chat" | "missing", id: string) => {
      const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!current) return;

      setData((prev) => {
        if (!prev) return prev;
        if (kind === "reports") return {...prev, ...applyReportRemoval(prev, id)};
        if (kind === "chat") return {...prev, ...applyMessageRemoval(prev, id)};
        return {...prev, ...applyPersonRemoval(prev, id)};
      });

      await apiFetch(moderationDeletePath(kind, id), {
        method: "DELETE",
        headers: {"x-admin-token": current},
      }).catch(() => { });
    },
    [],
  );

  const removeReport = useCallback(
    (id: string) => removeModerationItem("reports", id),
    [removeModerationItem],
  );

  const removeMessage = useCallback(
    (id: string) => removeModerationItem("chat", id),
    [removeModerationItem],
  );

  const removePerson = useCallback(
    (id: string) => removeModerationItem("missing", id),
    [removeModerationItem],
  );

  const restoreMissingPerson = useCallback(
    async (id: string) => {
      const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!current) return;
      await apiFetch(`/api/missing/${id}/restore`, {
        method: "POST",
        headers: {"x-admin-token": current},
      }).catch(() => null);
      await fetchData();
    },
    [fetchData],
  );

  const markContactRead = useCallback(async (id: string) => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return;

    setContactData((prev) => {
      if (!prev) return prev;
      return applyContactRead(prev, id);
    });

    await apiFetch("/api/admin/contact", {
      method: "PATCH",
      headers: {
        "x-admin-token": current,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id}),
    }).catch(() => { });
  }, []);

  const loadDuplicateReport = useCallback(async (): Promise<DuplicateReport | null> => {
    const current = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!current) return null;
    try {
      // El reporte ya no corre inline (audit M-2): se encola y se hace
      // status-poll hasta que termina (patrón Hermes/boahaus 202 + poll).
      const enq = await apiFetch("/api/sync/duplicates?limit=50", {
        method: "POST",
        headers: {"x-admin-token": current},
        cache: "no-store",
      });
      if (!enq.ok) return null;
      const {jobId} = (await enq.json()) as {jobId?: string};
      if (!jobId) return null;

      const deadline = Date.now() + 90_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 1500));
        const sres = await apiFetch(
          `/api/sync/status?jobId=${encodeURIComponent(jobId)}`,
          {headers: {"x-admin-token": current}, cache: "no-store"},
        );
        if (!sres.ok) continue;
        const st = (await sres.json()) as {
          state?: string;
          result?: DuplicateReport;
        };
        if (st.state === "completed") return st.result ?? null;
        if (st.state === "failed") return null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    return scheduleVisibilityAwarePolling(
      () => {
        void fetchData();
        void fetchDonations();
        void fetchContact();
        void fetchHubStats();
      },
      ADMIN_POLL_INTERVAL_MS,
    );
  }, [token, fetchData, fetchDonations, fetchContact, fetchHubStats]);

  const liveCounts = useMemo(
    () =>
      deriveAdminLiveCounts({
        stats: data?.stats,
        donationsStats: donationsData?.stats,
        contactStats: contactData?.stats,
      }),
    [data, donationsData, contactData],
  );

  const value = useMemo(
    () => ({
      ready,
      token,
      error,
      data,
      donationsData,
      contactData,
      hubStats,
      syncing,
      liveCounts,
      login,
      logout,
      refreshAll,
      runSyncNow,
      resetSyncCursor,
      loadDuplicateReport,
      removeReport,
      removeMessage,
      removePerson,
      restoreMissingPerson,
      markContactRead,
    }),
    [
      ready,
      token,
      error,
      data,
      donationsData,
      contactData,
      hubStats,
      syncing,
      liveCounts,
      login,
      logout,
      refreshAll,
      runSyncNow,
      resetSyncCursor,
      loadDuplicateReport,
      removeReport,
      removeMessage,
      removePerson,
      restoreMissingPerson,
      markContactRead,
    ],
  );

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  );
}
