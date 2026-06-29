"use client";

import {MODERATION_SEARCH_PLACEHOLDER} from "@/lib/admin-moderation";

interface AdminModerationSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AdminModerationSearch({
  value,
  onChange,
}: AdminModerationSearchProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={MODERATION_SEARCH_PLACEHOLDER}
        className="w-full max-w-md rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-900"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔎
      </span>
    </div>
  );
}
