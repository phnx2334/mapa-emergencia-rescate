"use client";

import {
  EXTERNAL_LINK_PROPS,
  OPENPANEL_MISSING_URL_MESSAGE,
  OPENPANEL_SDK_LABEL,
  OPENPANEL_SETUP_HINT,
  OPENPANEL_TRACKING_LOCAL_LABEL,
  openPanelClientIdLabel,
  resolveOpenPanelConfig,
} from "@/lib/admin-analytics";

const OPENPANEL_CLIENT_ID = process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID;
const openPanelConfig = resolveOpenPanelConfig(
  process.env.NEXT_PUBLIC_OPENPANEL_DASHBOARD_URL,
);
const clientIdLabel = openPanelClientIdLabel(OPENPANEL_CLIENT_ID);
const clientIdConfigured = clientIdLabel === "Configurado";

export default function AdminAnalyticsSection() {
  return (
    <section className="admin-analytics overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            OpenPanel
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Usuarios en vivo y tráfico
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Las métricas de tráfico se muestran desde OpenPanel. Si ves una
            pantalla de login, inicia sesión en OpenPanel en este navegador y
            vuelve a cargar el admin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {openPanelConfig && (
            <>
              <a
                href={openPanelConfig.realtimeUrl}
                {...EXTERNAL_LINK_PROPS}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Realtime
              </a>
              <a
                href={openPanelConfig.eventsUrl}
                {...EXTERNAL_LINK_PROPS}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Eventos
              </a>
              <a
                href={openPanelConfig.dashboardUrl}
                {...EXTERNAL_LINK_PROPS}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Abrir OpenPanel
              </a>
            </>
          )}
          {!openPanelConfig && (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              {OPENPANEL_MISSING_URL_MESSAGE}
            </span>
          )}
        </div>
      </div>

      {openPanelConfig ? (
        <iframe
          title="OpenPanel analytics"
          src={openPanelConfig.dashboardUrl}
          className="h-[75vh] min-h-[680px] w-full bg-white"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
        />
      ) : (
        <div className="p-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {OPENPANEL_SETUP_HINT}
          </div>
        </div>
      )}

      <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-4 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <span className="text-slate-500">SDK</span>
          <p className="font-semibold text-emerald-700">{OPENPANEL_SDK_LABEL}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <span className="text-slate-500">Client ID</span>
          <p
            className={
              clientIdConfigured
                ? "font-semibold text-emerald-700"
                : "font-semibold text-amber-700"
            }
          >
            {clientIdLabel}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <span className="text-slate-500">Tracking local</span>
          <p className="font-semibold text-slate-900">
            {OPENPANEL_TRACKING_LOCAL_LABEL}
          </p>
        </div>
      </div>
    </section>
  );
}
