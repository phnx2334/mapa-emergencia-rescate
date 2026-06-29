"use client";

import {useCallback, useEffect, useMemo, useReducer, useRef, type ReactNode} from "react";
import {usePathname} from "next/navigation";
import {reduceAdminDrawer, type AdminDrawer} from "@/lib/admin-drawer";
import {formatOverviewHeaderSubtitle, isOverviewSection} from "@/lib/admin-overview";
import AdminHeader from "./AdminHeader";
import AdminIntegrationsPanel from "./AdminIntegrationsPanel";
import AdminNav from "./AdminNav";
import {useAdminSession} from "./AdminSessionProvider";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useAdminScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    document.body.classList.add("admin-drawer-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.body.classList.remove("admin-drawer-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const root = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;

      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}

function drawerReducer(state: AdminDrawer, action: Parameters<typeof reduceAdminDrawer>[1]) {
  return reduceAdminDrawer(state, action);
}

export default function AdminShell({children}: {children: ReactNode}) {
  const pathname = usePathname() ?? "/admin";
  const {error, logout, data} = useAdminSession();
  const [drawer, dispatchDrawer] = useReducer(drawerReducer, "none");
  const navDrawerRef = useRef<HTMLElement>(null);
  const integrationsDrawerRef = useRef<HTMLElement>(null);

  const headerSubtitle = useMemo(() => {
    if (!isOverviewSection(pathname)) return null;
    return formatOverviewHeaderSubtitle(data);
  }, [pathname, data]);

  const drawerOpen = drawer !== "none";
  useAdminScrollLock(drawerOpen);
  useFocusTrap(drawer === "nav", navDrawerRef);
  useFocusTrap(drawer === "integrations", integrationsDrawerRef);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatchDrawer({type: "escape"});
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => {
    dispatchDrawer({type: "close"});
  }, []);

  const onNavNavigate = useCallback(() => {
    dispatchDrawer({type: "navigate"});
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/admin";
  }, [logout]);

  return (
    <div className="admin-shell bg-[var(--ebg)]">
      <AdminHeader
        drawer={drawer}
        subtitle={headerSubtitle}
        onToggleNav={() => dispatchDrawer({type: "toggle", drawer: "nav"})}
        onToggleIntegrations={() =>
          dispatchDrawer({type: "toggle", drawer: "integrations"})
        }
        onLogout={handleLogout}
      />

      <div className="admin-shell__body mx-auto flex w-full max-w-[1600px]">
        <aside
          className="admin-shell__nav hidden w-[240px] shrink-0 border-r border-[var(--eborder)] bg-[var(--esurf)] p-4 lg:block"
          aria-label="Navegación del panel"
        >
          <AdminNav />
        </aside>

        <main id="main" className="admin-shell__main min-w-0 flex-1 p-4 lg:p-6">
          {error && (
            <p className="mb-4 rounded-lg bg-[var(--qi-error-surface)] px-3 py-2 text-sm text-[var(--qi-error-strong)]">
              {error}
            </p>
          )}
          {children}
        </main>

        <aside
          className="admin-shell__integrations hidden w-[280px] shrink-0 border-l border-[var(--eborder)] bg-[var(--esurf)] p-4 lg:block"
          aria-label="Integraciones"
        >
          <AdminIntegrationsPanel />
        </aside>
      </div>

      {drawerOpen && (
        <button
          type="button"
          className="admin-shell__backdrop fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Cerrar panel"
          onClick={closeDrawer}
        />
      )}

      <aside
        id="admin-nav-drawer"
        ref={navDrawerRef}
        className={`admin-shell__nav-drawer fixed inset-y-0 left-0 z-50 w-[min(280px,88vw)] border-r border-[var(--eborder)] bg-[var(--esurf)] p-4 shadow-[var(--eshadow)] transition-transform duration-200 lg:hidden ${drawer === "nav" ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        aria-hidden={drawer !== "nav"}
      >
        <AdminNav onNavigate={onNavNavigate} />
      </aside>

      <aside
        id="admin-integrations-drawer"
        ref={integrationsDrawerRef}
        className={`admin-shell__integrations-drawer fixed inset-y-0 right-0 z-50 w-[min(300px,88vw)] border-l border-[var(--eborder)] bg-[var(--esurf)] p-4 shadow-[var(--eshadow)] transition-transform duration-200 lg:hidden ${drawer === "integrations"
          ? "translate-x-0"
          : "translate-x-full pointer-events-none"
          }`}
        aria-hidden={drawer !== "integrations"}
      >
        <AdminIntegrationsPanel />
      </aside>
    </div>
  );
}
