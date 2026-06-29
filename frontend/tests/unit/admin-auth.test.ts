import {describe, it, expect} from "vitest";
import {
  ADMIN_STORAGE_KEY,
  isAdminPath,
  resolvePostLoginPath,
} from "@/lib/admin-auth";

describe("ADMIN_STORAGE_KEY", () => {
  it("usa la clave de sessionStorage existente del monolito", () => {
    expect(ADMIN_STORAGE_KEY).toBe("emergency:adminToken");
  });
});

describe("isAdminPath", () => {
  it("acepta /admin y sub-rutas", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/reportes")).toBe(true);
    expect(isAdminPath("/admin/analytics")).toBe(true);
  });

  it("rechaza rutas fuera del panel", () => {
    expect(isAdminPath("/")).toBe(false);
    expect(isAdminPath("/donaciones")).toBe(false);
    expect(isAdminPath("/administrator")).toBe(false);
  });
});

describe("resolvePostLoginPath", () => {
  it("redirige a /admin cuando no hay returnTo", () => {
    expect(resolvePostLoginPath(null)).toBe("/admin");
    expect(resolvePostLoginPath(undefined)).toBe("/admin");
    expect(resolvePostLoginPath("")).toBe("/admin");
  });

  it("conserva deep links válidos dentro de /admin", () => {
    expect(resolvePostLoginPath("/admin/reportes")).toBe("/admin/reportes");
    expect(resolvePostLoginPath("/admin/contacto")).toBe("/admin/contacto");
  });

  it("normaliza trailing slash en rutas admin", () => {
    expect(resolvePostLoginPath("/admin/reportes/")).toBe("/admin/reportes");
  });

  it("rechaza returnTo fuera de /admin y cae en /admin", () => {
    expect(resolvePostLoginPath("/")).toBe("/admin");
    expect(resolvePostLoginPath("https://evil.test/admin")).toBe("/admin");
    expect(resolvePostLoginPath("//evil.test/admin")).toBe("/admin");
  });
});
