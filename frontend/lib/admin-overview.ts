import {resolveActiveAdminSection} from "@/lib/admin-nav";
import {timeAgo} from "@/lib/format";

export interface HubTypeStat {
  type: string;
  count: number;
  photos?: number;
  broken?: number;
  lastIngestedAt: number | null;
}

export interface HubStats {
  total: number;
  byType: HubTypeStat[];
}

export interface SyncRun {
  source: string;
  trigger: string | null;
  ok: boolean;
  fetched: number;
  inserted: number;
  updated: number;
  errors: number;
  fromPage: number | null;
  toPage: number | null;
  cycleCompleted: boolean | null;
  error: string | null;
  durationMs: number;
  startedAt: number;
}

export interface SyncStateRow {
  source: string;
  nextPage: number;
  totalPages: number | null;
  lastRunAt: number | null;
  lastCycleCompletedAt: number | null;
}

export interface DuplicateGroup {
  name: string;
  count: number;
  distinctAges: number;
  distinctLocations: number;
  classification: "same-person" | "homonyms";
}

export interface DuplicateReport {
  totalRows: number;
  duplicateGroups: number;
  collapsibleRows: number;
  samePersonGroups: number;
  samePersonCollapsible: number;
  homonymGroups: number;
  topGroups: DuplicateGroup[];
  generatedAt: number;
}

export interface OverviewHeaderData {
  generatedAt: number;
  persistent: boolean;
}

export interface OverviewMissingStats {
  total: number;
  active?: number;
  found?: number;
  withPhoto: number;
}

const HUB_TYPE_LABEL: Record<string, string> = {
  missing_person: "Desaparecidas",
  checkin: "Check-ins",
  help_request: "Solicitudes de ayuda",
  help_offer: "Ofertas de ayuda",
  damaged_building: "Edificios dañados",
};

export function isOverviewSection(pathname: string): boolean {
  return resolveActiveAdminSection(pathname) === "overview";
}

export function formatOverviewHeaderSubtitle(
  data: OverviewHeaderData | null | undefined,
  now: number = Date.now(),
): string {
  if (!data) return "Cargando datos…";
  const base = `Actualizado ${timeAgo(data.generatedAt, now)}`;
  if (!data.persistent) {
    return `${base} · ⚠️ Modo demo (sin persistencia)`;
  }
  return base;
}

export function overviewMissingCount(
  missing: OverviewMissingStats | undefined,
): number | string {
  if (!missing) return "—";
  return missing.active ?? missing.total;
}

export function hubTypeLabel(type: string): string {
  return HUB_TYPE_LABEL[type] ?? type;
}

export const SYNC_RESET_CONFIRM_MESSAGE =
  "¿Reiniciar el cursor a la página 1? El próximo barrido empezará desde el inicio.";
