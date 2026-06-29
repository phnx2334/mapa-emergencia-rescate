"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {
  ADMIN_NAV_ITEMS,
  buildAdminNavWithSeparators,
  deriveAdminNavBadges,
  filterAdminNavItems,
  allAdminSectionIds,
  resolveActiveAdminSection,
} from "@/lib/admin-nav";
import {useAdminSession} from "./AdminSessionProvider";

interface AdminNavProps {
  onNavigate?: () => void;
  className?: string;
}

export default function AdminNav({onNavigate, className = ""}: AdminNavProps) {
  const pathname = usePathname() ?? "/admin";
  const {liveCounts} = useAdminSession();
  const badges = deriveAdminNavBadges(liveCounts);
  const activeSection = resolveActiveAdminSection(pathname);
  const items = filterAdminNavItems(ADMIN_NAV_ITEMS, allAdminSectionIds());
  const entries = buildAdminNavWithSeparators(items);

  return (
    <nav
      aria-label="Secciones del panel"
      className={`admin-nav flex flex-col gap-0.5 ${className}`}
    >
      {entries.map((entry, index) => {
        if (entry.type === "separator") {
          return (
            <hr
              key={`sep-${index}`}
              className="my-2 border-0 border-t border-[var(--eborder)]"
            />
          );
        }

        const {item} = entry;
        const isActive = activeSection === item.id;
        const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`admin-nav__link flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                ? "bg-[var(--einput)] text-[var(--etext)]"
                : "text-[var(--etext2)] hover:bg-[var(--einput)] hover:text-[var(--etext)]"
              }`}
          >
            <span>{item.label}</span>
            {badgeCount > 0 && (
              <span
                className="min-w-[1.25rem] rounded-full bg-[var(--qi-ink-900)] px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white"
                aria-label={`${badgeCount} pendientes`}
              >
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
