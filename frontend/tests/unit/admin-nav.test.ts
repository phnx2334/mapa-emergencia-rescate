import {describe, it, expect} from "vitest";
import {
  ADMIN_NAV_ITEMS,
  buildAdminNavWithSeparators,
  deriveAdminNavBadges,
  filterAdminNavItems,
  resolveActiveAdminSection,
  type AdminLiveCounts,
  type AdminSectionId,
} from "@/lib/admin-nav";

describe("ADMIN_NAV_ITEMS", () => {
  it("lista las 8 admin sections con hrefs del ADR 0007", () => {
    expect(ADMIN_NAV_ITEMS).toHaveLength(8);
    expect(ADMIN_NAV_ITEMS.map((item) => [item.id, item.href])).toEqual([
      ["overview", "/admin"],
      ["analytics", "/admin/analytics"],
      ["reportes", "/admin/reportes"],
      ["desaparecidas", "/admin/desaparecidas"],
      ["chat", "/admin/chat"],
      ["insumos", "/admin/insumos"],
      ["donaciones", "/admin/donaciones"],
      ["contacto", "/admin/contacto"],
    ]);
  });

  it("asigna clusters y badge keys según CONTEXT.md", () => {
    const byId = Object.fromEntries(ADMIN_NAV_ITEMS.map((item) => [item.id, item]));
    expect(byId.overview?.cluster).toBe(1);
    expect(byId.analytics?.cluster).toBe(2);
    expect(byId.reportes?.cluster).toBe(3);
    expect(byId.desaparecidas?.cluster).toBe(3);
    expect(byId.chat?.cluster).toBe(3);
    expect(byId.insumos?.cluster).toBe(4);
    expect(byId.donaciones?.cluster).toBe(4);
    expect(byId.contacto?.cluster).toBe(4);

    expect(byId.reportes?.badgeKey).toBe("reportes");
    expect(byId.desaparecidas?.badgeKey).toBe("desaparecidas");
    expect(byId.chat?.badgeKey).toBe("chat");
    expect(byId.donaciones?.badgeKey).toBe("donaciones");
    expect(byId.contacto?.badgeKey).toBe("contactoUnread");
    expect(byId.overview?.badgeKey).toBeUndefined();
  });
});

describe("deriveAdminNavBadges", () => {
  it("devuelve conteos correctos con datos representativos", () => {
    const counts: AdminLiveCounts = {
      reportes: 12,
      desaparecidas: 34,
      chat: 5,
      donaciones: 7,
      contactoUnread: 2,
    };
    expect(deriveAdminNavBadges(counts)).toEqual({
      reportes: 12,
      desaparecidas: 34,
      chat: 5,
      donaciones: 7,
      contactoUnread: 2,
    });
  });

  it("trata ausencias y ceros como 0", () => {
    expect(deriveAdminNavBadges({})).toEqual({
      reportes: 0,
      desaparecidas: 0,
      chat: 0,
      donaciones: 0,
      contactoUnread: 0,
    });
    expect(
      deriveAdminNavBadges({
        reportes: 0,
        chat: 3,
      }),
    ).toEqual({
      reportes: 0,
      desaparecidas: 0,
      chat: 3,
      donaciones: 0,
      contactoUnread: 0,
    });
  });
});

describe("resolveActiveAdminSection", () => {
  it("resuelve /admin como overview", () => {
    expect(resolveActiveAdminSection("/admin")).toBe("overview");
    expect(resolveActiveAdminSection("/admin/")).toBe("overview");
  });

  it("resuelve sub-rutas conocidas", () => {
    expect(resolveActiveAdminSection("/admin/reportes")).toBe("reportes");
    expect(resolveActiveAdminSection("/admin/analytics")).toBe("analytics");
    expect(resolveActiveAdminSection("/admin/contacto")).toBe("contacto");
  });

  it("devuelve null para paths desconocidos", () => {
    expect(resolveActiveAdminSection("/admin/foo")).toBeNull();
    expect(resolveActiveAdminSection("/")).toBeNull();
  });
});

describe("filterAdminNavItems", () => {
  it("mantiene el orden original", () => {
    const allowed: AdminSectionId[] = ["chat", "overview", "donaciones"];
    expect(filterAdminNavItems(ADMIN_NAV_ITEMS, allowed).map((i) => i.id)).toEqual([
      "overview",
      "chat",
      "donaciones",
    ]);
  });

  it("oculta sections no permitidas sin romper clusters", () => {
    const allowed: AdminSectionId[] = [
      "overview",
      "reportes",
      "chat",
      "insumos",
      "contacto",
    ];
    const filtered = filterAdminNavItems(ADMIN_NAV_ITEMS, allowed);
    expect(filtered.map((i) => i.id)).toEqual([
      "overview",
      "reportes",
      "chat",
      "insumos",
      "contacto",
    ]);
    expect(filtered.map((i) => i.cluster)).toEqual([1, 3, 3, 4, 4]);
  });
});

describe("buildAdminNavWithSeparators", () => {
  it("inserta separadores entre clusters distintos", () => {
    const entries = buildAdminNavWithSeparators(ADMIN_NAV_ITEMS);
    expect(entries).toEqual([
      {type: "item", item: expect.objectContaining({id: "overview"})},
      {type: "separator"},
      {type: "item", item: expect.objectContaining({id: "analytics"})},
      {type: "separator"},
      {type: "item", item: expect.objectContaining({id: "reportes"})},
      {type: "item", item: expect.objectContaining({id: "desaparecidas"})},
      {type: "item", item: expect.objectContaining({id: "chat"})},
      {type: "separator"},
      {type: "item", item: expect.objectContaining({id: "insumos"})},
      {type: "item", item: expect.objectContaining({id: "donaciones"})},
      {type: "item", item: expect.objectContaining({id: "contacto"})},
    ]);
  });

  it("no inserta separador duplicado cuando el filtrado deja un solo ítem por cluster", () => {
    const filtered = filterAdminNavItems(ADMIN_NAV_ITEMS, [
      "overview",
      "analytics",
      "reportes",
      "insumos",
    ]);
    const entries = buildAdminNavWithSeparators(filtered);
    expect(entries.filter((e) => e.type === "separator")).toHaveLength(3);
    expect(entries.map((e) => (e.type === "item" ? e.item.id : "—"))).toEqual([
      "overview",
      "—",
      "analytics",
      "—",
      "reportes",
      "—",
      "insumos",
    ]);
  });
});
