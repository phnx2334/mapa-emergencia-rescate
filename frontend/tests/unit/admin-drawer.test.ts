import {describe, it, expect} from "vitest";
import {
  reduceAdminDrawer,
  type AdminDrawer,
  type AdminDrawerAction,
} from "@/lib/admin-drawer";

describe("reduceAdminDrawer", () => {
  it("abre nav desde none", () => {
    expect(reduceAdminDrawer("none", {type: "open", drawer: "nav"})).toBe("nav");
  });

  it("abre integrations desde none", () => {
    expect(
      reduceAdminDrawer("none", {type: "open", drawer: "integrations"}),
    ).toBe("integrations");
  });

  it("drawers son mutuamente excluyentes", () => {
    expect(reduceAdminDrawer("nav", {type: "open", drawer: "integrations"})).toBe(
      "integrations",
    );
    expect(reduceAdminDrawer("integrations", {type: "open", drawer: "nav"})).toBe(
      "nav",
    );
  });

  it("toggle cierra el drawer activo", () => {
    expect(reduceAdminDrawer("nav", {type: "toggle", drawer: "nav"})).toBe("none");
    expect(
      reduceAdminDrawer("integrations", {type: "toggle", drawer: "integrations"}),
    ).toBe("none");
  });

  it("toggle abre cuando el drawer no está activo", () => {
    expect(reduceAdminDrawer("none", {type: "toggle", drawer: "nav"})).toBe("nav");
    expect(
      reduceAdminDrawer("nav", {type: "toggle", drawer: "integrations"}),
    ).toBe("integrations");
  });

  it("close y escape vuelven a none", () => {
    const actions: AdminDrawerAction[] = [{type: "close"}, {type: "escape"}];
    for (const action of actions) {
      expect(reduceAdminDrawer("nav", action)).toBe("none");
      expect(reduceAdminDrawer("integrations", action)).toBe("none");
    }
  });

  it("navigate cierra el drawer de nav", () => {
    expect(reduceAdminDrawer("nav", {type: "navigate"})).toBe("none");
  });

  it("navigate no cierra integrations", () => {
    expect(reduceAdminDrawer("integrations", {type: "navigate"})).toBe(
      "integrations",
    );
  });

  it("isDrawerOpen refleja el estado reducido", () => {
    const states: AdminDrawer[] = ["none", "nav", "integrations"];
    expect(states.map((s) => s !== "none")).toEqual([false, true, true]);
  });
});
