/** Rutas activas del admin shell y helpers para verificar ausencia del monolito. */

import type {AdminSectionId} from "./admin-nav";

export interface AdminRouteSection {
  sectionId: AdminSectionId;
  href: string;
  pagePath: string;
  sectionComponent: string;
}

export const ADMIN_ROUTE_SECTIONS: readonly AdminRouteSection[] = [
  {
    sectionId: "overview",
    href: "/admin",
    pagePath: "page.tsx",
    sectionComponent: "AdminOverviewSection",
  },
  {
    sectionId: "analytics",
    href: "/admin/analytics",
    pagePath: "analytics/page.tsx",
    sectionComponent: "AdminAnalyticsSection",
  },
  {
    sectionId: "reportes",
    href: "/admin/reportes",
    pagePath: "reportes/page.tsx",
    sectionComponent: "AdminReportesSection",
  },
  {
    sectionId: "desaparecidas",
    href: "/admin/desaparecidas",
    pagePath: "desaparecidas/page.tsx",
    sectionComponent: "AdminDesaparecidasSection",
  },
  {
    sectionId: "chat",
    href: "/admin/chat",
    pagePath: "chat/page.tsx",
    sectionComponent: "AdminChatSection",
  },
  {
    sectionId: "insumos",
    href: "/admin/insumos",
    pagePath: "insumos/page.tsx",
    sectionComponent: "AdminInsumosSection",
  },
  {
    sectionId: "donaciones",
    href: "/admin/donaciones",
    pagePath: "donaciones/page.tsx",
    sectionComponent: "AdminDonacionesSection",
  },
  {
    sectionId: "contacto",
    href: "/admin/contacto",
    pagePath: "contacto/page.tsx",
    sectionComponent: "AdminContactoSection",
  },
];

const MONOLITH_IMPORT_RE =
  /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?["'][^"']*AdminDashboard["']/;

export function pageSourceUsesSection(source: string, sectionComponent: string): boolean {
  return source.includes(sectionComponent);
}

export function sourceImportsMonolith(source: string): boolean {
  return MONOLITH_IMPORT_RE.test(source);
}
