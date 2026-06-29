import {describe, it, expect} from "vitest";
import type {ContactMessage} from "@/lib/contact-inbox";
import type {Donation} from "@/lib/donation-shared";
import {
  applyContactRead,
  buildDonationsCsv,
  buildContactEmailMailto,
  buildContactReplyMailto,
  donationsCsvFilename,
  filterManagementContactMessages,
  filterManagementDonations,
  type AdminManagementContactData,
} from "@/lib/admin-management";

const sampleDonation = (overrides: Partial<Donation> = {}): Donation => ({
  id: "d1",
  name: "Ana Donante",
  amountCents: 2500,
  createdAt: 1_700_000_000_000,
  ...overrides,
});

const sampleContact = (overrides: Partial<ContactMessage> = {}): ContactMessage => ({
  id: "c1",
  name: "Luis Visitante",
  email: "demo@example.com",
  subject: "Consulta general",
  message: "Necesito información sobre acopio",
  read: false,
  createdAt: 1_700_000_000_000,
  ...overrides,
});

const baseContactData = (): AdminManagementContactData => ({
  generatedAt: 1_700_000_000_000,
  stats: {total: 2, unread: 1, last24h: 1},
  messages: [
    sampleContact({id: "c1", read: false}),
    sampleContact({
      id: "c2",
      name: "María",
      email: "maria@example.com",
      subject: "Voluntariado",
      message: "Quiero ayudar",
      read: true,
    }),
  ],
});

describe("filterManagementDonations", () => {
  it("filtra por nombre y monto formateado", () => {
    const donations = [
      sampleDonation({name: "Ana Donante", amountCents: 2500}),
      sampleDonation({id: "d2", name: "Pedro", amountCents: 5000}),
    ];
    expect(filterManagementDonations(donations, "ana 25")).toHaveLength(1);
    expect(filterManagementDonations(donations, "50")).toHaveLength(1);
  });

  it("devuelve todo sin query", () => {
    const donations = [sampleDonation()];
    expect(filterManagementDonations(donations, "")).toEqual(donations);
  });
});

describe("filterManagementContactMessages", () => {
  it("filtra por nombre, correo, asunto y mensaje", () => {
    const messages = [
      sampleContact({name: "Luis", subject: "Consulta general"}),
      sampleContact({
        id: "c2",
        name: "María",
        email: "maria@example.com",
        subject: "Voluntariado",
      }),
    ];
    expect(filterManagementContactMessages(messages, "consulta luis")).toHaveLength(1);
    expect(filterManagementContactMessages(messages, "maria@example")).toHaveLength(1);
    expect(filterManagementContactMessages(messages, "voluntariado")).toHaveLength(1);
  });
});

describe("buildDonationsCsv", () => {
  it("genera CSV con encabezados y filas escapadas", () => {
    const csv = buildDonationsCsv([
      sampleDonation({
        name: 'Ana "Demo"',
        amountCents: 2550,
        createdAt: Date.parse("2024-01-15T12:00:00.000Z"),
      }),
    ]);
    expect(csv).toContain('"nombre","monto_usd","fecha"');
    expect(csv).toContain('"Ana ""Demo""","25.50","2024-01-15T12:00:00.000Z"');
  });

  it("devuelve cadena vacía sin donaciones", () => {
    expect(buildDonationsCsv([])).toBe("");
  });
});

describe("donationsCsvFilename", () => {
  it("incluye prefijo y fecha ISO", () => {
    expect(
      donationsCsvFilename(new Date("2024-06-15T10:30:00.000Z")),
    ).toBe("donaciones-2024-06-15.csv");
  });
});

describe("applyContactRead", () => {
  it("marca mensaje como leído y decrementa unread", () => {
    const next = applyContactRead(baseContactData(), "c1");
    expect(next.messages.find((m) => m.id === "c1")?.read).toBe(true);
    expect(next.stats.unread).toBe(0);
  });

  it("no cambia stats si el mensaje ya estaba leído", () => {
    const next = applyContactRead(baseContactData(), "c2");
    expect(next).toEqual(baseContactData());
  });
});

describe("contact mailto helpers", () => {
  it("construye enlace de correo con asunto Re", () => {
    const message = sampleContact();
    expect(buildContactEmailMailto(message)).toBe(
      "mailto:demo@example.com?subject=Re%3A%20Consulta%20general",
    );
  });

  it("construye enlace de respuesta con cuerpo inicial", () => {
    const message = sampleContact();
    expect(buildContactReplyMailto(message)).toBe(
      "mailto:demo@example.com?subject=Re%3A%20Consulta%20general&body=Hola%20Luis%20Visitante%2C%0A%0A",
    );
  });
});
