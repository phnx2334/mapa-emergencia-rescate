import type {AdminLiveCounts} from "@/lib/admin-nav";

/** Subconjunto de stats del endpoint /api/admin/data relevante para badges. */
export interface AdminDataStatsSlice {
  reports?: {total?: number};
  chat?: {total?: number};
  missing?: {total?: number; active?: number};
}

export interface AdminLiveCountsInput {
  reportes?: number;
  desaparecidas?: number;
  chat?: number;
  donaciones?: number;
  contactoUnread?: number;
  stats?: AdminDataStatsSlice;
  donationsStats?: {count?: number};
  contactStats?: {unread?: number};
}

/** Deriva conteos en vivo para badges de nav desde el estado del provider. */
export function deriveAdminLiveCounts(
  input: AdminLiveCountsInput,
): AdminLiveCounts {
  const missing = input.stats?.missing;
  const desaparecidas =
    input.desaparecidas ??
    missing?.active ??
    missing?.total ??
    0;

  return {
    reportes: input.reportes ?? input.stats?.reports?.total ?? 0,
    desaparecidas,
    chat: input.chat ?? input.stats?.chat?.total ?? 0,
    donaciones: input.donaciones ?? input.donationsStats?.count ?? 0,
    contactoUnread:
      input.contactoUnread ?? input.contactStats?.unread ?? 0,
  };
}
