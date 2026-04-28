export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">LipeCare</p>
        <h1>Entrar</h1>
        <form className="form">
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" />
          </label>
          <button type="button">Acessar</button>
        </form>
      </section>
    </main>
  );
}

