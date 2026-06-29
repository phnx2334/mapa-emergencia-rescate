import type {ChatMessage} from "@/lib/chat-types";
import type {MissingPerson} from "@/lib/missing";
import {REPORT_TYPES, type EmergencyReport, type ReportType} from "@/lib/types";

export type ModerationDeleteKind = "reports" | "chat" | "missing";

export interface AdminModerationStats {
  reports: {
    total: number;
    byType: Record<ReportType, number>;
    totalAffected: number;
    lastHour: number;
    last24h: number;
    withPhoto: number;
  };
  chat: {total: number; lastHour: number};
  missing: {
    total: number;
    active?: number;
    found?: number;
    withPhoto: number;
  };
}

export interface AdminModerationData {
  stats: AdminModerationStats;
  reports: EmergencyReport[];
  messages: ChatMessage[];
  people: MissingPerson[];
}

export function normalizeModerationSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function splitModerationSearchTerms(query: string): string[] {
  return normalizeModerationSearch(query).split(/\s+/).filter(Boolean);
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const hay = normalizeModerationSearch(haystack);
  return terms.every((term) => hay.includes(term));
}

export function filterModerationReports(
  reports: EmergencyReport[],
  query: string,
): EmergencyReport[] {
  const terms = splitModerationSearchTerms(query);
  return reports.filter((report) =>
    matchesAllTerms(
      `${report.place} ${report.needs} ${REPORT_TYPES[report.type].label}`,
      terms,
    ),
  );
}

export function filterModerationMessages(
  messages: ChatMessage[],
  query: string,
): ChatMessage[] {
  const terms = splitModerationSearchTerms(query);
  return messages.filter((message) =>
    matchesAllTerms(`${message.name} ${message.text}`, terms),
  );
}

export function filterModerationPeople(
  people: MissingPerson[],
  query: string,
): MissingPerson[] {
  const terms = splitModerationSearchTerms(query);
  return people.filter((person) =>
    matchesAllTerms(
      `${person.name} ${person.lastSeen} ${person.description} ${person.contact}`,
      terms,
    ),
  );
}

export function sortChatMessagesRecentFirst(
  messages: ChatMessage[],
): ChatMessage[] {
  return [...messages].sort((a, b) => b.createdAt - a.createdAt);
}

export function extractPhoneFromContact(contact: string): string | null {
  const digits = contact.replace(/[^\d+]/g, "");
  return digits.replace(/\D/g, "").length >= 7 ? digits : null;
}

export function moderationDeletePath(
  kind: ModerationDeleteKind,
  id: string,
): string {
  if (kind === "reports") return `/api/reports/${id}`;
  if (kind === "chat") return `/api/chat/${id}`;
  return `/api/missing/${id}`;
}

export function applyReportRemoval(
  data: AdminModerationData,
  id: string,
): AdminModerationData {
  const report = data.reports.find((item) => item.id === id);
  if (!report) return data;

  const reports = data.reports.filter((item) => item.id !== id);
  const byType = {...data.stats.reports.byType};
  if (byType[report.type] !== undefined) {
    byType[report.type] = Math.max(0, byType[report.type] - 1);
  }

  return {
    ...data,
    reports,
    stats: {
      ...data.stats,
      reports: {
        ...data.stats.reports,
        total: Math.max(0, data.stats.reports.total - 1),
        byType,
        totalAffected: Math.max(
          0,
          data.stats.reports.totalAffected - report.affected,
        ),
      },
    },
  };
}

export function applyMessageRemoval(
  data: AdminModerationData,
  id: string,
): AdminModerationData {
  const message = data.messages.find((item) => item.id === id);
  if (!message) return data;

  return {
    ...data,
    messages: data.messages.filter((item) => item.id !== id),
    stats: {
      ...data.stats,
      chat: {
        ...data.stats.chat,
        total: Math.max(0, data.stats.chat.total - 1),
      },
    },
  };
}

export function applyPersonRemoval(
  data: AdminModerationData,
  id: string,
): AdminModerationData {
  const person = data.people.find((item) => item.id === id);
  if (!person) return data;

  const people = data.people.filter((item) => item.id !== id);
  const missing = {...data.stats.missing};
  missing.total = Math.max(0, (missing.total ?? 0) - 1);
  if (person.status === "found") {
    missing.found = Math.max(0, (missing.found ?? 0) - 1);
  } else {
    missing.active = Math.max(0, (missing.active ?? 0) - 1);
  }

  return {
    ...data,
    people,
    stats: {
      ...data.stats,
      missing,
    },
  };
}

export function formatModerationTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("es-VE");
}

export const MODERATION_SEARCH_PLACEHOLDER = "Buscar en esta sección…";

export const MODERATION_EMPTY_COPY = {
  reports: "Sin reportes.",
  missing: "Sin personas reportadas.",
  chat: "Sin mensajes.",
} as const;

export function openStreetMapUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
