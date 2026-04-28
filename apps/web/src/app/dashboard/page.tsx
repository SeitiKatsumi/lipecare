const sections = [
  "Pacientes",
  "Sintomas",
  "Medidas",
  "Fotos evolutivas",
  "Conteudos",
  "Auditoria"
];

export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Painel profissional</p>
          <h1>LipeCare</h1>
        </div>
        <span className="environment-badge">staging-ready</span>
      </header>

      <section className="module-list">
        {sections.map((section) => (
          <article key={section}>
            <h2>{section}</h2>
            <p>Modulo preparado para a primeira entrega do MVP.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

