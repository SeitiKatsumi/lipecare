import Link from "next/link";
import { Activity, CalendarCheck, ShieldCheck } from "lucide-react";

const metrics = [
  { label: "Pacientes acompanhados", value: "0" },
  { label: "Avaliacoes pendentes", value: "0" },
  { label: "Alertas clinicos", value: "0" }
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">LipeCare</p>
          <h1>Cuidado clinico continuo, seguro e humanizado.</h1>
          <p className="hero-copy">
            Plataforma para acompanhamento de pacientes com lipedema, com
            registro de sintomas, medidas, fotos evolutivas, conteudos e apoio
            a decisao clinica.
          </p>
          <div className="actions">
            <Link className="primary-action" href="/dashboard">
              Abrir painel
            </Link>
            <Link className="secondary-action" href="/login">
              Entrar
            </Link>
          </div>
        </div>
        <div className="status-panel" aria-label="Resumo operacional">
          {metrics.map((metric) => (
            <div className="metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-grid" aria-label="Pilares do MVP">
        <article>
          <Activity aria-hidden="true" />
          <h2>Monitoramento</h2>
          <p>Sintomas, medidas, habitos e evolucao em uma linha clinica clara.</p>
        </article>
        <article>
          <CalendarCheck aria-hidden="true" />
          <h2>Acompanhamento</h2>
          <p>Agenda, periodicidade e lembretes preparados para a rotina do paciente.</p>
        </article>
        <article>
          <ShieldCheck aria-hidden="true" />
          <h2>Seguranca</h2>
          <p>Multi-tenant, auditoria e arquivos privados desde a fundacao.</p>
        </article>
      </section>
    </main>
  );
}

