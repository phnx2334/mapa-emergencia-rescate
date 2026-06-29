import type {ContactMessage, ContactStats} from "@/lib/contact-inbox";
import {formatDonationUsd, type Donation} from "@/lib/donation-shared";
import {
  normalizeModerationSearch,
  splitModerationSearchTerms,
} from "@/lib/admin-moderation";

export interface AdminManagementContactData {
  generatedAt: number;
  stats: ContactStats;
  messages: ContactMessage[];
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const hay = normalizeModerationSearch(haystack);
  return terms.every((term) => hay.includes(term));
}

export function filterManagementDonations(
  donations: Donation[],
  query: string,
): Donation[] {
  const terms = splitModerationSearchTerms(query);
  return donations.filter((donation) =>
    matchesAllTerms(
      `${donation.name} ${formatDonationUsd(donation.amountCents)}`,
      terms,
    ),
  );
}

export function filterManagementContactMessages(
  messages: ContactMessage[],
  query: string,
): ContactMessage[] {
  const terms = splitModerationSearchTerms(query);
  return messages.filter((message) =>
    matchesAllTerms(
      `${message.name} ${message.email} ${message.subject} ${message.message}`,
      terms,
    ),
  );
}

export function buildDonationsCsv(donations: Donation[]): string {
  if (donations.length === 0) return "";

  const rows = [
    ["nombre", "monto_usd", "fecha"],
    ...donations.map((donation) => [
      donation.name,
      (donation.amountCents / 100).toFixed(2),
      new Date(donation.createdAt).toISOString(),
    ]),
  ];

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
}

export function donationsCsvFilename(date = new Date()): string {
  return `donaciones-${date.toISOString().slice(0, 10)}.csv`;
}

export function applyContactRead(
  data: AdminManagementContactData,
  id: string,
): AdminManagementContactData {
  const target = data.messages.find((message) => message.id === id);
  if (!target || target.read) return data;

  return {
    ...data,
    stats: {
      ...data.stats,
      unread: Math.max(0, data.stats.unread - 1),
    },
    messages: data.messages.map((message) =>
      message.id === id ? {...message, read: true} : message,
    ),
  };
}

export function buildContactEmailMailto(message: ContactMessage): string {
  return `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
}

export function buildContactReplyMailto(message: ContactMessage): string {
  return `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}&body=${encodeURIComponent(`Hola ${message.name},\n\n`)}`;
}

export const MANAGEMENT_SEARCH_PLACEHOLDER = "Buscar en esta sección…";

export const MANAGEMENT_EMPTY_COPY = {
  donations: "Sin donaciones.",
  contact: "Sin mensajes.",
} as const;

export function formatManagementTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("es-VE");
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
