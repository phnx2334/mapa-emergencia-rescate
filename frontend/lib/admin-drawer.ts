/** Estado del drawer móvil del admin shell (ADR 0007). */

export type AdminDrawer = "none" | "nav" | "integrations";

export type AdminDrawerAction =
  | {type: "open"; drawer: Exclude<AdminDrawer, "none">}
  | {type: "toggle"; drawer: Exclude<AdminDrawer, "none">}
  | {type: "close"}
  | {type: "escape"}
  | {type: "navigate"};

export function isAdminDrawerOpen(drawer: AdminDrawer): boolean {
  return drawer !== "none";
}

export function reduceAdminDrawer(
  state: AdminDrawer,
  action: AdminDrawerAction,
): AdminDrawer {
  switch (action.type) {
    case "open":
      return action.drawer;
    case "toggle":
      return state === action.drawer ? "none" : action.drawer;
    case "close":
    case "escape":
      return "none";
    case "navigate":
      return state === "nav" ? "none" : state;
    default:
      return state;
  }
}
