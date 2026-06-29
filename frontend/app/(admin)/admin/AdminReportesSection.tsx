"use client";

import {useMemo, useState} from "react";
import {
  filterModerationReports,
  formatModerationTimestamp,
  MODERATION_EMPTY_COPY,
  openStreetMapUrl,
} from "@/lib/admin-moderation";
import {REPORT_TYPES} from "@/lib/types";
import AdminModerationSearch from "./AdminModerationSearch";
import {useAdminSession} from "./AdminSessionProvider";

export default function AdminReportesSection() {
  const {data, removeReport} = useAdminSession();
  const [query, setQuery] = useState("");

  const filteredReports = useMemo(
    () => filterModerationReports(data?.reports ?? [], query),
    [data, query],
  );

  return (
    <section className="admin-reportes">
      <div className="mb-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {filteredReports.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              {data ? MODERATION_EMPTY_COPY.reports : "Cargando reportes…"}
            </li>
          ) : (
            filteredReports.map((report) => (
              <li key={report.id} className="flex items-start gap-3 p-3">
                {report.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={report.photoUrl}
                    alt={report.place}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div
                    className="grid h-16 w-16 shrink-0 place-items-center rounded-lg text-2xl text-white"
                    style={{background: REPORT_TYPES[report.type].color}}
                    aria-hidden
                  >
                    {REPORT_TYPES[report.type].icon}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {report.place}
                  </p>
                  <p className="text-xs text-slate-500">
                    {REPORT_TYPES[report.type].label}
                    {report.affected > 0 && ` · ${report.affected} afectada(s)`} ·{" "}
                    {formatModerationTimestamp(report.createdAt)}
                  </p>
                  {report.needs && (
                    <p className="mt-0.5 text-xs text-slate-600">{report.needs}</p>
                  )}
                  <a
                    href={openStreetMapUrl(report.lat, report.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block text-xs text-sky-700 hover:underline"
                  >
                    Ver ubicación ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void removeReport(report.id)}
                  className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
