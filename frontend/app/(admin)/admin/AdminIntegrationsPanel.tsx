const PLANNED_INTEGRATIONS = [
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    description: "Canal de mensajes entrantes y respuestas automatizadas.",
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Bot de coordinación para operadores y voluntarios.",
  },
  {
    id: "sms",
    label: "SMS",
    description: "Alertas y confirmaciones por mensaje de texto.",
  },
  {
    id: "email",
    label: "Email entrante",
    description: "Bandeja unificada para correos de contacto.",
  },
] as const;

interface AdminIntegrationsPanelProps {
  className?: string;
}

export default function AdminIntegrationsPanel({
  className = "",
}: AdminIntegrationsPanelProps) {
  return (
    <aside
      aria-label="Integraciones planificadas"
      className={`admin-integrations flex flex-col ${className}`}
    >
      <h2 className="text-sm font-bold text-[var(--etext)]">Integraciones (solo placeholders)</h2>
      <p className="mt-1 text-xs leading-snug text-[var(--etext2)]">
        Roadmap de canales externos. Las conexiones reales llegarán en slices
        posteriores.
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {PLANNED_INTEGRATIONS.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-dashed border-[var(--eborder)] bg-[var(--einput)] px-3 py-3"
          >
            <p className="text-sm font-semibold text-[var(--etext)]">
              {item.label}
            </p>
            <p className="mt-1 text-xs text-[var(--etext2)]">
              {item.description}
            </p>
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[var(--etext3)]">
              Próximamente
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
