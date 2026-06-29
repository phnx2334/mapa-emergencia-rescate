import {describe, it, expect} from "vitest";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import {ADMIN_NAV_ITEMS} from "@/lib/admin-nav";
import {
  ADMIN_ROUTE_SECTIONS,
  pageSourceUsesSection,
  sourceImportsMonolith,
} from "@/lib/admin-routes";

const ADMIN_DIR = join(process.cwd(), "app/(admin)/admin");

function collectAdminSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, {withFileTypes: true});
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectAdminSourceFiles(fullPath));
      continue;
    }
    if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("ADMIN_ROUTE_SECTIONS", () => {
  it("cubre todas las admin sections del nav ADR 0007", () => {
    expect(ADMIN_ROUTE_SECTIONS.map((route) => route.sectionId).sort()).toEqual(
      ADMIN_NAV_ITEMS.map((item) => item.id).sort(),
    );
  });

  it("alinea hrefs con ADMIN_NAV_ITEMS", () => {
    const navById = Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.id, item]));
    for (const route of ADMIN_ROUTE_SECTIONS) {
      expect(navById[route.sectionId]?.href).toBe(route.href);
    }
  });
});

describe("pageSourceUsesSection", () => {
  it("detecta import del componente section", () => {
    const source = [
      'import AdminOverviewSection from "./AdminOverviewSection";',
      "export default function AdminOverviewPage() {",
      "  return <AdminOverviewSection />;",
      "}",
    ].join("\n");
    expect(pageSourceUsesSection(source, "AdminOverviewSection")).toBe(true);
  });

  it("rechaza cuando falta el componente esperado", () => {
    const source = 'import AdminDashboard from "./AdminDashboard";';
    expect(pageSourceUsesSection(source, "AdminOverviewSection")).toBe(false);
  });
});

describe("sourceImportsMonolith", () => {
  it("detecta import de AdminDashboard", () => {
    expect(sourceImportsMonolith('import AdminDashboard from "./AdminDashboard";')).toBe(
      true,
    );
  });

  it("ignora menciones en comentarios sin import", () => {
    expect(sourceImportsMonolith("// AdminDashboard legacy")).toBe(false);
  });
});

describe("admin shell routing (no monolith)", () => {
  it("cada ruta activa tiene page.tsx con su section component", () => {
    for (const route of ADMIN_ROUTE_SECTIONS) {
      const pagePath = join(ADMIN_DIR, route.pagePath);
      expect(existsSync(pagePath), `missing ${route.pagePath}`).toBe(true);
      const source = readFileSync(pagePath, "utf8");
      expect(pageSourceUsesSection(source, route.sectionComponent)).toBe(true);
      expect(sourceImportsMonolith(source)).toBe(false);
    }
  });

  it("AdminDashboard.tsx no existe en app/(admin)/admin", () => {
    expect(existsSync(join(ADMIN_DIR, "AdminDashboard.tsx"))).toBe(false);
  });

  it("ningún archivo activo en app/(admin)/admin importa AdminDashboard", () => {
    for (const file of collectAdminSourceFiles(ADMIN_DIR)) {
      const source = readFileSync(file, "utf8");
      expect(sourceImportsMonolith(source), file).toBe(false);
    }
  });
});
