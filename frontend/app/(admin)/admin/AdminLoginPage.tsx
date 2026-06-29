"use client";

import Link from "next/link";
import {useState} from "react";
import {resolvePostLoginPath} from "@/lib/admin-auth";
import {useAdminSession} from "./AdminSessionProvider";

interface AdminLoginPageProps {
  returnTo: string;
}

export default function AdminLoginPage({returnTo}: AdminLoginPageProps) {
  const {login} = useAdminSession();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({password}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo iniciar sesión.");
      }
      login(password);
      window.location.assign(resolvePostLoginPath(returnTo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <main
      id="main"
      className="admin-login grid min-h-[calc(100dvh-var(--admin-flag-bar))] place-items-center bg-[var(--ebg)] p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--eborder)] bg-[var(--esurf)] p-6 shadow-[var(--eshadow)]">
        <h1 className="text-lg font-bold text-[var(--etext)]">
          Acceso de administrador
        </h1>
        <p className="mt-2 text-sm text-[var(--etext2)]">
          Ingresa la contraseña del panel para continuar.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1 block text-sm font-medium text-[var(--etext)]"
            >
              Contraseña
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-[var(--eborder)] bg-[var(--einput)] px-3 py-2 text-sm text-[var(--etext)] outline-none focus:border-[var(--etext3)]"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--qi-error-surface)] px-3 py-2 text-sm text-[var(--qi-error-strong)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--qi-ink-900)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Verificando…" : "Entrar"}
          </button>

          <Link
            href="/"
            className="block text-center text-sm text-[var(--etext2)] hover:text-[var(--etext)] hover:underline"
          >
            Volver al sitio
          </Link>
        </form>
      </div>
    </main>
  );
}
