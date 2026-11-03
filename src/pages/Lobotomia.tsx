import "./Lobotomia.css";

export default function Lobotomia() {
  return (
    <article className="lobotomy-page">
      <header className="lobotomy-hero">
        <span className="eyebrow">HISTÓRIA DA NEUROCIÊNCIA</span>
        <h1>Lobotomia</h1>
        <p className="lobotomy-lead">
          Um procedimento neurocirúrgico controverso que marcou a
          história da psiquiatria e revelou os limites da medicina.
        </p>
      </header>

      <section className="lobotomy-card">
        <div className="lobotomy-section-title">
          <span className="section-indicator" />
          <h2>O que é lobotomia?</h2>
        </div>

        <p>
          A lobotomia foi um procedimento neurocirúrgico utilizado
          principalmente durante o século XX como tentativa de tratar
          transtornos psiquiátricos graves. Desenvolvida em 1935 pelo
          neurologista português António Egas Moniz, a técnica tinha como
          objetivo modificar determinadas conexões entre regiões do
          cérebro, especialmente aquelas relacionadas ao lobo frontal.
        </p>

        <p>
          Na época, acreditava-se que alterar essas conexões poderia
          reduzir sintomas de alguns transtornos mentais. Entretanto,
          o procedimento frequentemente provocava consequências graves,
          como mudanças na personalidade, dificuldades cognitivas,
          alterações emocionais e perda de autonomia dos pacientes.
        </p>

        <p>
          Com o avanço da neurociência e o desenvolvimento de novos
          tratamentos, as limitações e os riscos da lobotomia passaram
          a ser cada vez mais reconhecidos. Sua utilização foi
          abandonada, tornando-se um exemplo histórico dos perigos de
          procedimentos médicos realizados sem conhecimento científico
          e critérios éticos suficientes.
        </p>
      </section>

      <aside className="lobotomy-fact">
        <div className="fact-icon">✦</div>
        <div>
          <span className="fact-label">VOCÊ SABIA?</span>
          <h2>Prêmio Nobel de Medicina</h2>
          <p>
            António Egas Moniz recebeu o Prêmio Nobel de Medicina em
            1949 por seu trabalho sobre a leucotomia pré-frontal,
            técnica relacionada à lobotomia.
          </p>
        </div>
      </aside>
    </article>
  );
}