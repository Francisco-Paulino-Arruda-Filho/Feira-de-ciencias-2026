import "./Neuromodulacao.css";

export default function Neuromodulacao() {
  return (
    <article className="neuromodulation-page">
      <header className="neuromodulation-hero">
        <span className="eyebrow">TECNOLOGIA E NEUROCIÊNCIA</span>
        <h1>Neuromodulação</h1>
        <p className="neuromodulation-lead">
          Técnicas que permitem modificar a atividade do sistema nervoso
          e oferecem novas possibilidades para o tratamento de condições
          neurológicas e psiquiátricas.
        </p>
      </header>

      <section className="neuromodulation-card">
        <div className="neuromodulation-section-title">
          <span className="section-indicator" />
          <h2>O que é neuromodulação?</h2>
        </div>

        <p>
          A neuromodulação é um conjunto de técnicas médicas que busca
          modificar ou regular a atividade do sistema nervoso por meio
          de estímulos elétricos, magnéticos ou outros métodos. Seu
          objetivo é atuar sobre determinados circuitos cerebrais,
          contribuindo para o tratamento de algumas condições
          neurológicas e psiquiátricas.
        </p>

        <p>
          Diferentemente da lobotomia, que provocava alterações físicas
          nas conexões cerebrais, muitas técnicas de neuromodulação
          atuam por meio de estímulos que modificam o funcionamento
          dos neurônios, sem necessariamente destruir estruturas
          cerebrais.
        </p>

        <p>
          Entre as técnicas utilizadas estão a Estimulação Magnética
          Transcraniana (EMT), que utiliza campos magnéticos para
          estimular regiões do cérebro, e a Estimulação Cerebral
          Profunda (ECP), que envolve a implantação de eletrodos
          para fornecer estímulos elétricos a áreas específicas.
        </p>

        <p>
          Atualmente, a neuromodulação representa uma importante área
          de pesquisa e tratamento na medicina, oferecendo
          possibilidades terapêuticas para determinadas condições,
          embora seus resultados, benefícios e riscos variem conforme
          a técnica e o paciente.
        </p>
      </section>

      <aside className="neuromodulation-fact">
        <div className="neuromodulation-fact-icon">✦</div>

        <div>
          <span className="neuromodulation-fact-label">
            VOCÊ SABIA?
          </span>

          <h2>Estimulação sem cirurgia</h2>

          <p>
            A estimulação magnética transcraniana pode ser realizada
            sem cirurgia e é utilizada, por exemplo, no tratamento
            de alguns casos de depressão.
          </p>
        </div>
      </aside>
    </article>
  );
}