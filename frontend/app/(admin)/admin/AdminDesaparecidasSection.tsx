"use client";

import {useMemo, useState} from "react";
import {
  extractPhoneFromContact,
  filterModerationPeople,
  formatModerationTimestamp,
  MODERATION_EMPTY_COPY,
} from "@/lib/admin-moderation";
import AdminModerationSearch from "./AdminModerationSearch";
import {useAdminSession} from "./AdminSessionProvider";

export default function AdminDesaparecidasSection() {
  const {data, token, removePerson, restoreMissingPerson} = useAdminSession();
  const [query, setQuery] = useState("");

  const filteredPeople = useMemo(
    () => filterModerationPeople(data?.people ?? [], query),
    [data, query],
  );

  return (
    <section className="admin-desaparecidas">
      <div className="mb-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {filteredPeople.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              {data ? MODERATION_EMPTY_COPY.missing : "Cargando personas…"}
            </li>
          ) : (
            filteredPeople.map((person) => {
              const phone = extractPhoneFromContact(person.contact);
              const personMeta = [
                person.age !== null ? `${person.age} años` : null,
                person.nationality || null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={person.id} className="flex items-start gap-3 p-3">
                  {person.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-slate-100 text-2xl text-slate-400">
                      🧍
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {person.name}
                      {personMeta && (
                        <span className="font-normal text-slate-500">
                          {" "}
                          · {personMeta}
                        </span>
                      )}
                    </p>
                    {person.lastSeen && (
                      <p className="text-xs text-slate-600">📍 {person.lastSeen}</p>
                    )}
                    {person.description && (
                      <p className="mt-0.5 text-xs text-slate-600">
                        {person.description}
                      </p>
                    )}
                    {person.contact &&
                      (phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="text-xs font-medium text-red-700 hover:underline"
                        >
                          📞 {person.contact}
                        </a>
                      ) : (
                        <p className="text-xs text-slate-700">{person.contact}</p>
                      ))}
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {formatModerationTimestamp(person.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {person.status === "found" && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        ✓ Localizada
                      </span>
                    )}
                    {person.status === "found" && token && (
                      <button
                        type="button"
                        onClick={() => void restoreMissingPerson(person.id)}
                        className="rounded-md border border-amber-200 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                      >
                        Restaurar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void removePerson(person.id)}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
}
