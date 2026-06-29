"use client";

import {useMemo, useState} from "react";
import {
  filterModerationMessages,
  formatModerationTimestamp,
  MODERATION_EMPTY_COPY,
  sortChatMessagesRecentFirst,
} from "@/lib/admin-moderation";
import AdminModerationSearch from "./AdminModerationSearch";
import {useAdminSession} from "./AdminSessionProvider";

export default function AdminChatSection() {
  const {data, removeMessage} = useAdminSession();
  const [query, setQuery] = useState("");

  const filteredMessages = useMemo(() => {
    const filtered = filterModerationMessages(data?.messages ?? [], query);
    return sortChatMessagesRecentFirst(filtered);
  }, [data, query]);

  return (
    <section className="admin-chat">
      <div className="mb-4">
        <AdminModerationSearch value={query} onChange={setQuery} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {filteredMessages.length === 0 ? (
            <li className="p-6 text-center text-sm text-slate-500">
              {data ? MODERATION_EMPTY_COPY.chat : "Cargando mensajes…"}
            </li>
          ) : (
            filteredMessages.map((message) => (
              <li key={message.id} className="flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-slate-900">
                      {message.name}
                    </span>{" "}
                    <span className="text-[11px] text-slate-400">
                      {formatModerationTimestamp(message.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-slate-700">{message.text}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeMessage(message.id)}
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
