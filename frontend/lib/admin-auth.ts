/** Clave de sessionStorage compartida con el monolito y la app pública. */
export const ADMIN_STORAGE_KEY = "emergency:adminToken";

const ADMIN_PREFIX = "/admin";

/** Indica si `pathname` pertenece al panel admin. */
export function isAdminPath(pathname: string): boolean {
  if (pathname === ADMIN_PREFIX) return true;
  return pathname.startsWith(`${ADMIN_PREFIX}/`);
}

function normalizeAdminPath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Ruta post-login: conserva deep links dentro de `/admin` o cae en Overview.
 * Rechaza URLs absolutas y rutas fuera del panel.
 */
export function resolvePostLoginPath(returnTo: string | null | undefined): string {
  if (!returnTo?.trim()) return ADMIN_PREFIX;

  const trimmed = returnTo.trim();

  if (
    trimmed.includes("://") ||
    trimmed.startsWith("//") ||
    !trimmed.startsWith("/")
  ) {
    return ADMIN_PREFIX;
  }

  const normalized = normalizeAdminPath(trimmed);
  return isAdminPath(normalized) ? normalized : ADMIN_PREFIX;
}
