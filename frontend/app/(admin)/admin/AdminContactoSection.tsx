"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {
  buildContactEmailMailto,
  buildContactReplyMailto,
  filterManagementContactMessages,
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

export default function AdminContactoSection() {
  const {contactData, markContactRead} = useAdminSession();
  const [query, setQuery] = useState("");

  const filteredMessages = useMemo(
    () => filterManagementContactMessages(contactData?.messages ?? [], query),
    [contactData, query],
  );

  return (
    <section className="admin-contacto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
          Buzón de contacto
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Mensajes del formulario
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Los visitantes escriben desde{" "}
          <Link href="/contacto" className="font-medium underline">
            /contacto
          </Link>
          . Responde por correo o marca como leído cuando lo atiendas.
        </p>
      </div>

      <div className="border-b border-slate-100 p-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>

      <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
        <MetricCard
          label="Total"
          value={contactData?.stats.total ?? "—"}
          sub="Mensajes recibidos"
        />
        <MetricCard
          label="Sin leer"
          value={contactData?.stats.unread ?? "—"}
          sub="Pendientes de revisar"
          accent="#0284c7"
        />
        <MetricCard
          label="Últimas 24 h"
          value={contactData?.stats.last24h ?? "—"}
          sub="Mensajes del último día"
          accent="#6366f1"
        />
      </div>

      <ul className="divide-y divide-slate-100">
        {filteredMessages.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">
            {contactData ? MANAGEMENT_EMPTY_COPY.contact : "Cargando mensajes…"}
          </li>
        ) : (
          filteredMessages.map((message) => (
            <li
              key={message.id}
              className={`p-4 ${message.read ? "bg-white" : "bg-sky-50/70"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{message.name}</p>
                    {!message.read && (
                      <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">
                    <a
                      href={buildContactEmailMailto(message)}
                      className="font-medium text-slate-800 hover:underline"
                    >
                      {message.email}
                    </a>
                    {" · "}
                    <span className="text-slate-500">
                      {formatManagementTimestamp(message.createdAt)}
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {message.subject}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {message.message}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {!message.read && (
                    <button
                      type="button"
                      onClick={() => void markContactRead(message.id)}
                      className="rounded-md border border-sky-200 bg-white px-2 py-1 text-xs font-medium text-sky-800 hover:bg-sky-50"
                    >
                      Marcar leído
                    </button>
                  )}
                  <a
                    href={buildContactReplyMailto(message)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Responder
                  </a>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
