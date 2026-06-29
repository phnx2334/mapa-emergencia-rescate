"use client";

import Link from "next/link";
import {Menu, Plug, X} from "lucide-react";
import type {AdminDrawer} from "@/lib/admin-drawer";

interface AdminHeaderProps {
  drawer: AdminDrawer;
  subtitle?: string | null;
  onToggleNav: () => void;
  onToggleIntegrations: () => void;
  onLogout: () => void;
}

export default function AdminHeader({
  drawer,
  subtitle,
  onToggleNav,
  onToggleIntegrations,
  onLogout,
}: AdminHeaderProps) {
  return (
    <header className="admin-header sticky top-0 z-30 shrink-0 border-b border-[var(--eborder)] bg-[var(--esurf)] lg:static">
      <div className="admin-header__inner flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="admin-header__menu grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--eborder)] text-[var(--etext)] lg:hidden"
            onClick={onToggleNav}
            aria-expanded={drawer === "nav"}
            aria-controls="admin-nav-drawer"
            aria-label={drawer === "nav" ? "Cerrar menú" : "Abrir menú"}
          >
            {drawer === "nav" ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-[var(--etext)] sm:text-lg">
              Panel de administración
            </h1>
            {subtitle && (
              <p className="truncate text-xs text-[var(--etext2)]">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="admin-header__plug grid h-9 w-9 place-items-center rounded-lg border border-[var(--eborder)] text-[var(--etext)] lg:hidden"
            onClick={onToggleIntegrations}
            aria-expanded={drawer === "integrations"}
            aria-controls="admin-integrations-drawer"
            aria-label={
              drawer === "integrations"
                ? "Cerrar integraciones"
                : "Abrir integraciones"
            }
          >
            {drawer === "integrations" ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Plug className="h-5 w-5" aria-hidden />
            )}
          </button>
          <Link
            href="/"
            className="rounded-lg border border-[var(--eborder)] bg-[var(--esurf)] px-3 py-1.5 text-sm font-medium text-[var(--etext)] hover:bg-[var(--einput)]"
          >
            Ver sitio
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-[var(--eborder)] bg-[var(--esurf)] px-3 py-1.5 text-sm font-medium text-[var(--etext)] hover:bg-[var(--einput)]"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
