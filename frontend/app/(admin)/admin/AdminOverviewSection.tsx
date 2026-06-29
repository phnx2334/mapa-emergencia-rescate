"use client";

import {useCallback, useState} from "react";
import {REPORT_TYPES, REPORT_TYPE_KEYS, type ReportType} from "@/lib/types";
import {timeAgo} from "@/lib/format";
import {
  hubTypeLabel,
  overviewMissingCount,
  type DuplicateReport,
} from "@/lib/admin-overview";
import {useAdminSession} from "./AdminSessionProvider";

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className="mt-1 text-3xl font-bold"
        style={{color: accent ?? "#0f172a"}}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function AdminOverviewSection() {
  const {
    data,
    hubStats,
    syncing,
    runSyncNow,
    resetSyncCursor,
    loadDuplicateReport,
  } = useAdminSession();
  const [dupReport, setDupReport] = useState<DuplicateReport | null>(null);
  const [loadingDup, setLoadingDup] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);

  const stats = data?.stats;

  const handleLoadDuplicates = useCallback(async () => {
    setLoadingDup(true);
    try {
      const report = await loadDuplicateReport();
      if (report) {
        setDupReport(report);
        setDupOpen(true);
      }
    } finally {
      setLoadingDup(false);
    }
  }, [loadDuplicateReport]);

  return (
    <div className="admin-overview">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Reportes"
          value={stats?.reports.total ?? "—"}
          sub={stats ? `${stats.reports.lastHour} en la última hora` : undefined}
          accent="#dc2626"
        />
        <MetricCard
          label="Personas afectadas"
          value={stats?.reports.totalAffected ?? "—"}
          sub="Suma reportada"
        />
        <MetricCard
          label="Desaparecidas"
          value={overviewMissingCount(stats?.missing)}
          sub={
            stats
              ? `${stats.missing.found ?? 0} localizadas · ${stats.missing.withPhoto} con foto`
              : undefined
          }
          accent="#9333ea"
        />
        <MetricCard
          label="Mensajes (chat)"
          value={stats?.chat.total ?? "—"}
          sub={stats ? `${stats.chat.lastHour} en la última hora` : undefined}
        />
        <MetricCard
          label="Reportes 24 h"
          value={stats?.reports.last24h ?? "—"}
          sub="Últimas 24 horas"
          accent="#0ea5e9"
        />
      </div>

      {stats && (
        <div className="mt-3 flex flex-wrap gap-2">
          {REPORT_TYPE_KEYS.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"
            >
              <span>{REPORT_TYPES[type].emoji}</span>
              <span className="text-slate-500">{REPORT_TYPES[type].label}:</span>
              <span className="font-semibold text-slate-900">
                {stats.reports.byType[type as ReportType] ?? 0}
              </span>
            </span>
          ))}
        </div>
      )}

      {hubStats && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Federación · datos de otros sitios
            </h2>
            <span className="text-sm text-slate-500">
              {hubStats.total.toLocaleString("es")} registros sincronizados
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hubStats.byType.map((s) => (
              <span
                key={s.type}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"
                title={
                  s.lastIngestedAt
                    ? `Último: ${new Date(s.lastIngestedAt).toLocaleString("es")}`
                    : "Sin sincronizar aún"
                }
              >
                <span className="text-slate-500">{hubTypeLabel(s.type)}:</span>
                <span className="font-semibold text-slate-900">
                  {s.count.toLocaleString("es")}
                </span>
                {s.photos !== undefined && (
                  <span className="text-xs text-slate-400">
                    ({s.photos} con foto
                    {s.broken ? `, ${s.broken} rotas` : ""})
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            🔄 Sincronización de fuentes
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void resetSyncCursor()}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reiniciar cursor
            </button>
            <button
              type="button"
              onClick={() => void runSyncNow()}
              disabled={syncing}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {syncing ? "Sincronizando…" : "Sincronizar ahora"}
            </button>
          </div>
        </div>

        {data?.sync?.state && data.sync.state.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.sync.state.map((s) => (
              <span
                key={s.source}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
              >
                <span className="font-medium text-slate-800">{s.source}</span>
                <span>
                  · pág {s.nextPage}
                  {s.totalPages ? `/${s.totalPages}` : ""}
                </span>
                {s.lastRunAt && (
                  <span className="text-slate-400">· {timeAgo(s.lastRunAt)}</span>
                )}
              </span>
            ))}
          </div>
        )}

        {data?.sync?.runs && data.sync.runs.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 text-xs">
            {data.sync.runs.map((r, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5"
              >
                <span className={r.ok ? "text-emerald-600" : "text-red-600"}>
                  {r.ok ? "✓" : "✕"}
                </span>
                <span className="text-slate-400">{timeAgo(r.startedAt)}</span>
                <span className="rounded bg-slate-100 px-1.5 text-slate-600">
                  {r.trigger ?? "?"}
                </span>
                <span className="text-slate-700">
                  pág {r.fromPage ?? "?"}–{r.toPage ?? "?"} · +{r.inserted} nuevos
                  {" / "}
                  {r.updated} act.
                  {r.errors > 0 && ` · ${r.errors} err`}
                  {r.cycleCompleted && " · ciclo ✓"}
                </span>
                {r.error && <span className="text-red-600">{r.error}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Aún no hay corridas registradas.
          </p>
        )}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              🔎 Reporte de posibles duplicados
            </h3>
            <div className="flex items-center gap-2">
              {dupReport && (
                <button
                  type="button"
                  onClick={() => setDupOpen((v) => !v)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {dupOpen ? "▲ Ocultar" : "▼ Mostrar"}
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleLoadDuplicates()}
                disabled={loadingDup}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingDup ? "Analizando…" : dupReport ? "Regenerar" : "Generar reporte"}
              </button>
            </div>
          </div>

          {dupReport && dupOpen && (
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricCard
                  label="Grupos con duplicados"
                  value={dupReport.duplicateGroups}
                  sub={`de ${dupReport.totalRows} registros`}
                />
                <MetricCard
                  label="Probable misma persona"
                  value={dupReport.samePersonGroups}
                  sub={`~${dupReport.samePersonCollapsible} filas colapsables`}
                  accent="#16a34a"
                />
                <MetricCard
                  label="Posibles homónimos"
                  value={dupReport.homonymGroups}
                  sub="revisar a mano (no agrupar)"
                  accent="#dc2626"
                />
                <MetricCard
                  label="Filas colapsables (techo)"
                  value={dupReport.collapsibleRows}
                  sub="si se colapsara todo"
                />
              </div>

              <ul className="mt-3 max-h-96 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100 text-xs">
                {dupReport.topGroups.map((g, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${g.classification === "same-person"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {g.classification === "same-person"
                        ? "misma persona"
                        : "homónimos"}
                    </span>
                    <span className="font-medium text-slate-900">{g.name}</span>
                    <span className="text-slate-500">
                      {g.count} registros · {g.distinctAges} edad(es) ·{" "}
                      {g.distinctLocations} ubicación(es)
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-400">
                Solo detección — no se modifica ni agrupa nada todavía.
                &quot;misma persona&quot; = edad consistente; &quot;homónimos&quot;
                = varias edades (probablemente personas distintas).
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
