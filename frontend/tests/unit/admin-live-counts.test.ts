import {describe, it, expect} from "vitest";
import {deriveAdminLiveCounts} from "@/lib/admin-live-counts";

describe("deriveAdminLiveCounts", () => {
  it("mapea conteos del provider a badges de nav", () => {
    expect(
      deriveAdminLiveCounts({
        reportes: 5,
        desaparecidas: 3,
        chat: 10,
        donaciones: 2,
        contactoUnread: 1,
      }),
    ).toEqual({
      reportes: 5,
      desaparecidas: 3,
      chat: 10,
      donaciones: 2,
      contactoUnread: 1,
    });
  });

  it("deriva reportes desde stats.reports.total", () => {
    expect(
      deriveAdminLiveCounts({
        stats: {reports: {total: 42}, chat: {total: 0}, missing: {total: 0}},
      }),
    ).toMatchObject({reportes: 42});
  });

  it("prefiere missing.active sobre missing.total para desaparecidas", () => {
    expect(
      deriveAdminLiveCounts({
        stats: {
          reports: {total: 0},
          chat: {total: 0},
          missing: {total: 10, active: 7},
        },
      }),
    ).toMatchObject({desaparecidas: 7});
  });

  it("usa missing.total si active no está definido", () => {
    expect(
      deriveAdminLiveCounts({
        stats: {
          reports: {total: 0},
          chat: {total: 0},
          missing: {total: 10},
        },
      }),
    ).toMatchObject({desaparecidas: 10});
  });

  it("deriva chat y donaciones desde sus endpoints", () => {
    expect(
      deriveAdminLiveCounts({
        stats: {reports: {total: 0}, chat: {total: 8}, missing: {total: 0}},
        donationsStats: {count: 4},
        contactStats: {unread: 0},
      }),
    ).toMatchObject({chat: 8, donaciones: 4, contactoUnread: 0});
  });

  it("devuelve ceros cuando faltan datos", () => {
    expect(deriveAdminLiveCounts({})).toEqual({
      reportes: 0,
      desaparecidas: 0,
      chat: 0,
      donaciones: 0,
      contactoUnread: 0,
    });
  });
});
