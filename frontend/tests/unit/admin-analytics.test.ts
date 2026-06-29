import {describe, it, expect} from "vitest";
import {
  EXTERNAL_LINK_PROPS,
  OPENPANEL_MISSING_URL_MESSAGE,
  OPENPANEL_SETUP_HINT,
  openPanelClientIdLabel,
  openPanelClientIdConfigured,
  resolveOpenPanelConfig,
} from "@/lib/admin-analytics";

describe("resolveOpenPanelConfig", () => {
  it("devuelve null sin URL de dashboard", () => {
    expect(resolveOpenPanelConfig(undefined)).toBeNull();
    expect(resolveOpenPanelConfig(null)).toBeNull();
    expect(resolveOpenPanelConfig("")).toBeNull();
    expect(resolveOpenPanelConfig("   ")).toBeNull();
  });

  it("normaliza trailing slash y deriva realtime y events", () => {
    expect(resolveOpenPanelConfig("https://panel.example.com/")).toEqual({
      dashboardUrl: "https://panel.example.com",
      realtimeUrl: "https://panel.example.com/realtime",
      eventsUrl: "https://panel.example.com/events",
    });
  });

  it("conserva URL sin barra final", () => {
    expect(resolveOpenPanelConfig("https://panel.example.com")).toEqual({
      dashboardUrl: "https://panel.example.com",
      realtimeUrl: "https://panel.example.com/realtime",
      eventsUrl: "https://panel.example.com/events",
    });
  });
});

describe("openPanelClientIdLabel", () => {
  it("marca configurado cuando hay client id", () => {
    expect(openPanelClientIdLabel("abc-123")).toBe("Configurado");
    expect(openPanelClientIdConfigured("abc-123")).toBe(true);
  });

  it("marca pendiente sin client id", () => {
    expect(openPanelClientIdLabel(undefined)).toBe("Pendiente");
    expect(openPanelClientIdLabel("")).toBe("Pendiente");
    expect(openPanelClientIdLabel("  ")).toBe("Pendiente");
    expect(openPanelClientIdConfigured(null)).toBe(false);
  });
});

describe("OpenPanel copy constants", () => {
  it("expone mensajes de configuración pendiente", () => {
    expect(OPENPANEL_MISSING_URL_MESSAGE).toContain(
      "NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL",
    );
    expect(OPENPANEL_SETUP_HINT).toContain(
      "NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL",
    );
  });
});

describe("EXTERNAL_LINK_PROPS", () => {
  it("abre en pestaña nueva con noopener", () => {
    expect(EXTERNAL_LINK_PROPS).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });
});
