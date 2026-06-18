import { ExternalLink, Network } from "lucide-react";
import { portalApps } from "./app-registry";

export default function PortalPage() {
  return (
    <main className="portal-shell">
      <header className="portal-header">
        <div>
          <p className="eyebrow">localhost:3000</p>
          <h1>Portal das aplicacoes</h1>
          <p>
            Hub local para abrir rapidamente cada aplicacao do monorepo, com portas
            fixas e links versionados junto com o codigo.
          </p>
        </div>
        <div className="network-mark" aria-hidden="true">
          <Network />
        </div>
      </header>

      <section className="app-grid" aria-label="Aplicacoes locais">
        {portalApps.map((app) => {
          const Icon = app.icon;

          return (
            <article className="app-card" key={app.name}>
              <div className="app-card-header">
                <span className="icon-box">
                  <Icon aria-hidden="true" />
                </span>
                <span className="port-badge">:{app.port}</span>
              </div>
              <div>
                <p className="kind">{app.kind}</p>
                <h2>{app.name}</h2>
                <p>{app.description}</p>
              </div>
              <a className="open-link" href={app.href}>
                Abrir
                <ExternalLink aria-hidden="true" />
              </a>
            </article>
          );
        })}
      </section>
    </main>
  );
}
