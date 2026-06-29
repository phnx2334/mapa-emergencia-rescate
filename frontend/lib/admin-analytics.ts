export interface OpenPanelConfig {
  dashboardUrl: string;
  realtimeUrl: string;
  eventsUrl: string;
}

export const OPENPANEL_MISSING_URL_MESSAGE =
  "Falta NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL";

export const OPENPANEL_SETUP_HINT =
  "Configura `NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL` en Vercel y vuelve a desplegar para mostrar el dashboard aquí.";

export const OPENPANEL_SDK_LABEL = "Instalado";

export const OPENPANEL_TRACKING_LOCAL_LABEL =
  "Desactivado fuera de producción";

export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function resolveOpenPanelConfig(
  dashboardUrl: string | undefined | null,
): OpenPanelConfig | null {
  const trimmed = dashboardUrl?.trim();
  if (!trimmed) return null;
  const base = trimmed.replace(/\/$/, "");
  return {
    dashboardUrl: base,
    realtimeUrl: `${base}/realtime`,
    eventsUrl: `${base}/events`,
  };
}

export function openPanelClientIdLabel(
  clientId: string | undefined | null,
): "Configurado" | "Pendiente" {
  return clientId?.trim() ? "Configurado" : "Pendiente";
}

export function openPanelClientIdConfigured(
  clientId: string | undefined | null,
): boolean {
  return openPanelClientIdLabel(clientId) === "Configurado";
}
