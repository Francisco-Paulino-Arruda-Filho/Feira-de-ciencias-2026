import "./SaudeMental.css";

export default function SaudeMental() {
  return (
    <article className="mental-health-page">
      <header className="mental-health-hero">
        <span className="eyebrow">CONSCIÊNCIA, CUIDADO E HUMANIDADE</span>

        <h1>Saúde Mental</h1>

        <p className="mental-health-lead">
          A saúde mental é parte essencial do bem-estar humano.
          Compreender a mente também significa reconhecer a importância
          do cuidado, do respeito e da empatia.
        </p>
      </header>

      <section className="mental-health-message">
        <div className="mental-health-symbol">
          <span>✦</span>
        </div>

        <div className="mental-health-quote">
          <span className="quote-label">UMA REFLEXÃO</span>

          <h2>
            Cuidar da mente é cuidar da vida.
          </h2>

          <div className="quote-divider" />

          <p>
            A evolução da medicina nos ensina que tratar a mente vai
            muito além de modificar o cérebro: é compreender, acolher
            e respeitar cada ser humano.
          </p>
        </div>
      </section>

      <footer className="mental-health-footer">
        <span className="footer-line" />
        <p>
          Ciência, empatia e respeito devem caminhar juntos.
        </p>
        <span className="footer-line" />
      </footer>
    </article>
  );
}