/** Config declarativa y helpers puros para la navegación del admin shell (ADR 0007). */

export type AdminSectionId =
  | "overview"
  | "analytics"
  | "reportes"
  | "desaparecidas"
  | "chat"
  | "insumos"
  | "donaciones"
  | "contacto";

export type AdminNavCluster = 1 | 2 | 3 | 4;

export type AdminNavBadgeKey =
  | "reportes"
  | "desaparecidas"
  | "chat"
  | "donaciones"
  | "contactoUnread";

export interface AdminNavItem {
  id: AdminSectionId;
  label: string;
  href: string;
  cluster: AdminNavCluster;
  badgeKey?: AdminNavBadgeKey;
}

/** Conteos agregados del provider de sesión admin para badges en vivo. */
export interface AdminLiveCounts {
  reportes?: number;
  desaparecidas?: number;
  chat?: number;
  donaciones?: number;
  contactoUnread?: number;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/admin",
    cluster: 1,
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    cluster: 2,
  },
  {
    id: "reportes",
    label: "Reportes",
    href: "/admin/reportes",
    cluster: 3,
    badgeKey: "reportes",
  },
  {
    id: "desaparecidas",
    label: "Desaparecidas",
    href: "/admin/desaparecidas",
    cluster: 3,
    badgeKey: "desaparecidas",
  },
  {
    id: "chat",
    label: "Chat",
    href: "/admin/chat",
    cluster: 3,
    badgeKey: "chat",
  },
  {
    id: "insumos",
    label: "Insumos hospitalarios",
    href: "/admin/insumos",
    cluster: 4,
  },
  {
    id: "donaciones",
    label: "Donaciones",
    href: "/admin/donaciones",
    cluster: 4,
    badgeKey: "donaciones",
  },
  {
    id: "contacto",
    label: "Contacto",
    href: "/admin/contacto",
    cluster: 4,
    badgeKey: "contactoUnread",
  },
] as const;

const PATH_TO_SECTION = new Map<string, AdminSectionId>(
  ADMIN_NAV_ITEMS.map((item) => [item.href, item.id]),
);

const ALL_BADGE_KEYS: readonly AdminNavBadgeKey[] = [
  "reportes",
  "desaparecidas",
  "chat",
  "donaciones",
  "contactoUnread",
] as const;

export function deriveAdminNavBadges(
  counts: AdminLiveCounts,
): Record<AdminNavBadgeKey, number> {
  return {
    reportes: counts.reportes ?? 0,
    desaparecidas: counts.desaparecidas ?? 0,
    chat: counts.chat ?? 0,
    donaciones: counts.donaciones ?? 0,
    contactoUnread: counts.contactoUnread ?? 0,
  };
}

export function resolveActiveAdminSection(pathname: string): AdminSectionId | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return PATH_TO_SECTION.get(normalized) ?? null;
}

export function filterAdminNavItems(
  items: readonly AdminNavItem[],
  allowedIds: ReadonlySet<AdminSectionId> | readonly AdminSectionId[],
): AdminNavItem[] {
  const allowed =
    allowedIds instanceof Set ? allowedIds : new Set<AdminSectionId>(allowedIds);
  return items.filter((item) => allowed.has(item.id));
}

export type AdminNavEntry =
  | {type: "item"; item: AdminNavItem}
  | {type: "separator"};

export function buildAdminNavWithSeparators(
  items: readonly AdminNavItem[],
): AdminNavEntry[] {
  const entries: AdminNavEntry[] = [];
  let previousCluster: AdminNavCluster | null = null;

  for (const item of items) {
    if (previousCluster !== null && item.cluster !== previousCluster) {
      entries.push({type: "separator"});
    }
    entries.push({type: "item", item});
    previousCluster = item.cluster;
  }

  return entries;
}

/** Todas las section ids — v1 muestra todo; filtrar con `filterAdminNavItems`. */
export function allAdminSectionIds(): AdminSectionId[] {
  return ADMIN_NAV_ITEMS.map((item) => item.id);
}

/** Badge keys soportados (para iterar sin acoplar a React). */
export function adminNavBadgeKeys(): readonly AdminNavBadgeKey[] {
  return ALL_BADGE_KEYS;
}
