import {describe, it, expect} from "vitest";
import type {ChatMessage} from "@/lib/chat-types";
import type {MissingPerson} from "@/lib/missing";
import type {EmergencyReport} from "@/lib/types";
import {
  applyMessageRemoval,
  applyPersonRemoval,
  applyReportRemoval,
  extractPhoneFromContact,
  filterModerationMessages,
  filterModerationPeople,
  filterModerationReports,
  moderationDeletePath,
  sortChatMessagesRecentFirst,
  splitModerationSearchTerms,
} from "@/lib/admin-moderation";
import type {AdminModerationData} from "@/lib/admin-moderation";

const sampleReport = (overrides: Partial<EmergencyReport> = {}): EmergencyReport => ({
  id: "r1",
  type: "critical",
  lat: 10,
  lng: -66,
  place: "Caracas Centro",
  affected: 2,
  needs: "Agua potable",
  photoUrl: null,
  confirmations: 0,
  createdAt: 1_700_000_000_000,
  ...overrides,
});

const sampleMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: "m1",
  name: "Ana Rescatista",
  text: "Necesitamos refuerzos en la zona norte",
  role: "rescuer",
  createdAt: 1_700_000_000_000,
  replyTo: null,
  replyPreview: null,
  threadRootId: "m1",
  threadBumpedAt: 1_700_000_000_000,
  ...overrides,
});

const samplePerson = (overrides: Partial<MissingPerson> = {}): MissingPerson => ({
  id: "p1",
  name: "María Demo",
  age: 34,
  nationality: "VE",
  description: "Vestía camisa azul",
  lastSeen: "Plaza Bolívar",
  contact: "0412-5551234",
  photoUrl: null,
  status: "active",
  resolutionNote: null,
  resolutionPhotoUrl: null,
  resolvedAt: null,
  createdAt: 1_700_000_000_000,
  ...overrides,
});

const baseData = (): AdminModerationData => ({
  stats: {
    reports: {
      total: 2,
      byType: {
        critical: 1,
        supplies: 0,
        shelter: 0,
        nopower: 0,
        missing: 0,
        building: 0,
        starlink: 1,
      },
      totalAffected: 3,
      lastHour: 1,
      last24h: 2,
      withPhoto: 0,
    },
    chat: {total: 2, lastHour: 1},
    missing: {total: 2, active: 1, found: 1, withPhoto: 0},
  },
  reports: [
    sampleReport({id: "r1", place: "Caracas Centro"}),
    sampleReport({id: "r2", type: "starlink", place: "Maracaibo Norte"}),
  ],
  messages: [
    sampleMessage({id: "m1", createdAt: 100}),
    sampleMessage({id: "m2", name: "Luis", text: "Confirmado", createdAt: 200}),
  ],
  people: [
    samplePerson({id: "p1", status: "active"}),
    samplePerson({id: "p2", name: "Pedro Demo", status: "found"}),
  ],
});

describe("splitModerationSearchTerms", () => {
  it("divide por espacios y normaliza acentos", () => {
    expect(splitModerationSearchTerms("  Água   potável ")).toEqual([
      "agua",
      "potavel",
    ]);
  });

  it("devuelve arreglo vacío sin términos", () => {
    expect(splitModerationSearchTerms("   ")).toEqual([]);
  });
});

describe("filterModerationReports", () => {
  it("filtra por lugar, necesidades y tipo", () => {
    const reports = [
      sampleReport({place: "Caracas Centro", needs: "Agua"}),
      sampleReport({id: "r2", type: "starlink", place: "Maracaibo"}),
    ];
    expect(filterModerationReports(reports, "caracas agua")).toHaveLength(1);
    expect(filterModerationReports(reports, "emergencia")).toHaveLength(1);
  });

  it("devuelve todo sin query", () => {
    const reports = [sampleReport()];
    expect(filterModerationReports(reports, "")).toEqual(reports);
  });
});

describe("filterModerationMessages", () => {
  it("filtra por nombre y texto", () => {
    const messages = [
      sampleMessage({name: "Ana", text: "Zona norte"}),
      sampleMessage({id: "m2", name: "Luis", text: "Confirmado"}),
    ];
    expect(filterModerationMessages(messages, "ana norte")).toHaveLength(1);
    expect(filterModerationMessages(messages, "luis")).toHaveLength(1);
  });
});

describe("filterModerationPeople", () => {
  it("filtra por nombre, última vista, descripción y contacto", () => {
    const people = [
      samplePerson({name: "María", lastSeen: "Plaza Bolívar"}),
      samplePerson({id: "p2", name: "Pedro", contact: "demo@example.com"}),
    ];
    expect(filterModerationPeople(people, "plaza maria")).toHaveLength(1);
    expect(filterModerationPeople(people, "demo@example")).toHaveLength(1);
  });
});

describe("sortChatMessagesRecentFirst", () => {
  it("ordena del más reciente al más antiguo", () => {
    const sorted = sortChatMessagesRecentFirst([
      sampleMessage({id: "old", createdAt: 100}),
      sampleMessage({id: "new", createdAt: 300}),
      sampleMessage({id: "mid", createdAt: 200}),
    ]);
    expect(sorted.map((m) => m.id)).toEqual(["new", "mid", "old"]);
  });
});

describe("extractPhoneFromContact", () => {
  it("extrae teléfono con al menos 7 dígitos", () => {
    expect(extractPhoneFromContact("0412-5551234")).toBe("04125551234");
  });

  it("devuelve null sin dígitos suficientes", () => {
    expect(extractPhoneFromContact("sin teléfono")).toBeNull();
  });
});

describe("moderationDeletePath", () => {
  it("mapea kind a endpoint DELETE", () => {
    expect(moderationDeletePath("reports", "abc")).toBe("/api/reports/abc");
    expect(moderationDeletePath("chat", "abc")).toBe("/api/chat/abc");
    expect(moderationDeletePath("missing", "abc")).toBe("/api/missing/abc");
  });
});

describe("applyReportRemoval", () => {
  it("elimina reporte y decrementa stats", () => {
    const next = applyReportRemoval(baseData(), "r1");
    expect(next.reports.map((r) => r.id)).toEqual(["r2"]);
    expect(next.stats.reports.total).toBe(1);
    expect(next.stats.reports.byType.critical).toBe(0);
  });
});

describe("applyMessageRemoval", () => {
  it("elimina mensaje y decrementa stats de chat", () => {
    const next = applyMessageRemoval(baseData(), "m1");
    expect(next.messages.map((m) => m.id)).toEqual(["m2"]);
    expect(next.stats.chat.total).toBe(1);
  });
});

describe("applyPersonRemoval", () => {
  it("elimina persona activa y ajusta conteos missing", () => {
    const next = applyPersonRemoval(baseData(), "p1");
    expect(next.people.map((p) => p.id)).toEqual(["p2"]);
    expect(next.stats.missing.total).toBe(1);
    expect(next.stats.missing.active).toBe(0);
    expect(next.stats.missing.found).toBe(1);
  });

  it("elimina persona localizada y decrementa found", () => {
    const next = applyPersonRemoval(baseData(), "p2");
    expect(next.stats.missing.found).toBe(0);
    expect(next.stats.missing.active).toBe(1);
  });
});
