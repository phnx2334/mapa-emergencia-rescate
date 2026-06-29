"use client";

import {useCallback, useMemo, useState} from "react";
import {formatDonationUsd} from "@/lib/donation-shared";
import {
  buildDonationsCsv,
  downloadTextFile,
  donationsCsvFilename,
  filterManagementDonations,
  formatManagementTimestamp,
  MANAGEMENT_EMPTY_COPY,
} from "@/lib/admin-management";
import AdminModerationSearch from "./AdminModerationSearch";
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

export default function AdminDonacionesSection() {
  const {donationsData} = useAdminSession();
  const [query, setQuery] = useState("");

  const filteredDonations = useMemo(
    () => filterManagementDonations(donationsData?.donations ?? [], query),
    [donationsData, query],
  );

  const exportCsv = useCallback(() => {
    const csv = buildDonationsCsv(filteredDonations);
    if (!csv) return;
    downloadTextFile(csv, donationsCsvFilename());
  }, [filteredDonations]);

  return (
    <section className="admin-donaciones overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Donaciones
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Intenciones registradas
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Lista de personas que iniciaron una donación desde el sitio. Los
            montos reflejan lo declarado antes de ir a PayPal.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredDonations.length === 0}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>

      <div className="border-b border-slate-100 p-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
        <MetricCard
          label="Total recaudado"
          value={
            donationsData
              ? formatDonationUsd(donationsData.stats.totalCents)
              : "—"
          }
          sub="Suma de montos declarados"
          accent="#d97706"
        />
        <MetricCard
          label="Donantes"
          value={donationsData?.stats.count ?? "—"}
          sub="Personas que iniciaron donación"
        />
        <MetricCard
          label="Últimas 24 h"
          value={
            donationsData
              ? `${donationsData.stats.last24hCount} · ${formatDonationUsd(donationsData.stats.last24hCents)}`
              : "—"
          }
          sub="Cantidad y monto del último día"
          accent="#9333ea"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-white text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDonations.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {donationsData
                    ? MANAGEMENT_EMPTY_COPY.donations
                    : "Cargando donaciones…"}
                </td>
              </tr>
            ) : (
              filteredDonations.map((donation) => (
                <tr key={donation.id} className="bg-white">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {donation.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDonationUsd(donation.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatManagementTimestamp(donation.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
