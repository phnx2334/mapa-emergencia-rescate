import {describe, it, expect} from "vitest";
import {
  formatOverviewHeaderSubtitle,
  hubTypeLabel,
  isOverviewSection,
  overviewMissingCount,
} from "@/lib/admin-overview";

describe("isOverviewSection", () => {
  it("identifica la ruta overview exacta", () => {
    expect(isOverviewSection("/admin")).toBe(true);
    expect(isOverviewSection("/admin/")).toBe(true);
  });

  it("excluye sub-rutas admin", () => {
    expect(isOverviewSection("/admin/reportes")).toBe(false);
    expect(isOverviewSection("/admin/analytics")).toBe(false);
    expect(isOverviewSection("/")).toBe(false);
  });
});

describe("formatOverviewHeaderSubtitle", () => {
  const now = Date.UTC(2026, 5, 28, 12, 0, 0);

  it("muestra cargando cuando no hay datos", () => {
    expect(formatOverviewHeaderSubtitle(null, now)).toBe("Cargando datos…");
    expect(formatOverviewHeaderSubtitle(undefined, now)).toBe("Cargando datos…");
  });

  it("incluye timestamp relativo cuando hay datos", () => {
    const fiveMinAgo = now - 5 * 60 * 1000;
    expect(formatOverviewHeaderSubtitle({generatedAt: fiveMinAgo, persistent: true}, now)).toBe(
      "Actualizado hace 5 min",
    );
  });

  it("añade aviso demo solo cuando persistent es false", () => {
    const ts = now - 60_000;
    expect(
      formatOverviewHeaderSubtitle({generatedAt: ts, persistent: false}, now),
    ).toBe("Actualizado hace 1 min · ⚠️ Modo demo (sin persistencia)");
    expect(
      formatOverviewHeaderSubtitle({generatedAt: ts, persistent: true}, now),
    ).toBe("Actualizado hace 1 min");
  });
});

describe("overviewMissingCount", () => {
  it("prefiere active sobre total", () => {
    expect(overviewMissingCount({total: 10, active: 7, withPhoto: 3})).toBe(7);
  });

  it("usa total si active no está definido", () => {
    expect(overviewMissingCount({total: 10, withPhoto: 0})).toBe(10);
  });

  it("devuelve em dash sin stats", () => {
    expect(overviewMissingCount(undefined)).toBe("—");
  });
});

describe("hubTypeLabel", () => {
  it("traduce tipos conocidos del hub", () => {
    expect(hubTypeLabel("missing_person")).toBe("Desaparecidas");
    expect(hubTypeLabel("help_request")).toBe("Solicitudes de ayuda");
  });

  it("devuelve el tipo crudo si no hay etiqueta", () => {
    expect(hubTypeLabel("unknown_type")).toBe("unknown_type");
  });
});
