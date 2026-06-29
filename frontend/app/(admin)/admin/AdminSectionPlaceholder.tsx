interface AdminSectionPlaceholderProps {
  title: string;
}

export default function AdminSectionPlaceholder({
  title,
}: AdminSectionPlaceholderProps) {
  return (
    <div className="admin-section-placeholder rounded-2xl border border-[var(--eborder)] bg-[var(--esurf)] p-6 shadow-[var(--eshadow)]">
      <h1 className="text-xl font-bold text-[var(--etext)]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--etext2)]">
        Esta sección se migrará desde el panel monolítico en un slice posterior.
      </p>
    </div>
  );
}
