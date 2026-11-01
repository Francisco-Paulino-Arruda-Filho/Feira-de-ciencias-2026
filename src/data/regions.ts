export type Region = {
  id: string
  name: string
  group: string
  anchor: { x: number; y: number }
  description: string
  functions: string[]
}

export const REGIONS: readonly Region[] = [
  {
    id: 'frontal',
    name: 'Lobo frontal',
    group: 'Lobo cerebral',
    anchor: { x: 165, y: 135 },
    description:
      'Ocupa a porção anterior do cérebro, logo atrás da testa. Abriga o córtex pré-frontal, que sustenta o planejamento, a tomada de decisões, o controle de impulsos e boa parte do que chamamos de personalidade.',
    functions: ['Planejamento', 'Tomada de decisão', 'Controle de impulsos', 'Memória de trabalho'],
  },
  {
    id: 'motor',
    name: 'Córtex motor primário',
    group: 'Área funcional',
    anchor: { x: 292, y: 70 },
    description:
      'Faixa de córtex no giro pré-central, logo à frente do sulco central. Envia os comandos para os músculos do lado oposto do corpo, e cada parte do corpo ocupa uma porção própria dessa faixa (o chamado homúnculo motor).',
    functions: ['Movimento voluntário', 'Precisão motora', 'Mapa do corpo (homúnculo)'],
  },
  {
    id: 'somatossensorial',
    name: 'Córtex somatossensorial',
    group: 'Área funcional',
    anchor: { x: 350, y: 75 },
    description:
      'Fica no giro pós-central, no lobo parietal, logo atrás do sulco central. Recebe e interpreta as informações de tato, pressão, temperatura, dor e posição do corpo vindas do lado oposto.',
    functions: ['Tato e pressão', 'Temperatura e dor', 'Propriocepção'],
  },
  {
    id: 'parietal',
    name: 'Lobo parietal',
    group: 'Lobo cerebral',
    anchor: { x: 415, y: 115 },
    description:
      'Fica no topo e na parte posterior do cérebro. Integra informações dos sentidos para construir a noção de espaço, de movimento e do próprio corpo, além de participar da atenção e do cálculo.',
    functions: ['Orientação espacial', 'Atenção', 'Integração sensorial', 'Cálculo'],
  },
  {
    id: 'occipital',
    name: 'Lobo occipital',
    group: 'Lobo cerebral',
    anchor: { x: 482, y: 205 },
    description:
      'É a região mais posterior do cérebro e abriga o córtex visual primário. Processa o que chega pelos olhos (contornos, cores, movimento e profundidade) antes de enviar a informação a outras áreas para o reconhecimento.',
    functions: ['Visão', 'Cores e contornos', 'Percepção de movimento'],
  },
  {
    id: 'temporal',
    name: 'Lobo temporal',
    group: 'Lobo cerebral',
    anchor: { x: 215, y: 285 },
    description:
      'Situado nas laterais do cérebro, na altura das orelhas. Processa os sons, participa da compreensão da linguagem e do reconhecimento de rostos e objetos, e reúne estruturas ligadas à memória e às emoções.',
    functions: ['Audição', 'Compreensão da linguagem', 'Reconhecimento de faces', 'Memória'],
  },
  {
    id: 'broca',
    name: 'Área de Broca',
    group: 'Área funcional',
    anchor: { x: 135, y: 225 },
    description:
      'Região do giro frontal inferior, na grande maioria das pessoas no hemisfério esquerdo. É essencial para a produção da fala: organiza palavras e gramática para que possam ser articuladas. Lesões nessa área causam a afasia de Broca, em que a pessoa entende o que ouve, mas tem grande dificuldade para falar.',
    functions: ['Produção da fala', 'Gramática', 'Articulação'],
  },
  {
    id: 'wernicke',
    name: 'Área de Wernicke',
    group: 'Área funcional',
    anchor: { x: 368, y: 200 },
    description:
      'Fica na transição entre os lobos temporal e parietal, também no hemisfério dominante para a linguagem. Responde pela compreensão da fala e da escrita. Lesões aqui causam a afasia de Wernicke: a fala é fluente, porém sem sentido, e a compreensão fica prejudicada.',
    functions: ['Compreensão da linguagem', 'Significado das palavras', 'Leitura'],
  },
  {
    id: 'talamo',
    name: 'Tálamo',
    group: 'Estrutura profunda',
    anchor: { x: 310, y: 195 },
    description:
      'Massa de substância cinzenta no centro do cérebro que funciona como uma central de retransmissão: quase todas as informações sensoriais (exceto o olfato) passam por ele antes de chegar ao córtex. Também participa da regulação da consciência, do sono e da atenção.',
    functions: ['Retransmissão sensorial', 'Consciência e sono', 'Atenção'],
  },
  {
    id: 'hipocampo',
    name: 'Hipocampo',
    group: 'Estrutura profunda',
    anchor: { x: 268, y: 262 },
    description:
      'Estrutura curva, parecida com um cavalo-marinho, dentro do lobo temporal medial (há um em cada hemisfério). É fundamental para formar novas memórias e para a navegação espacial, e está entre as primeiras regiões afetadas na doença de Alzheimer.',
    functions: ['Formação de memórias', 'Navegação espacial', 'Memória declarativa'],
  },
  {
    id: 'cerebelo',
    name: 'Cerebelo',
    group: 'Cerebelo e tronco',
    anchor: { x: 440, y: 335 },
    description:
      'Fica na parte inferior e posterior do crânio, sob o lobo occipital. Ocupa cerca de 10% do volume do encéfalo, mas concentra a maior parte dos neurônios. Ajusta e coordena os movimentos, mantém o equilíbrio e a postura e participa do aprendizado de habilidades motoras.',
    functions: ['Coordenação motora', 'Equilíbrio', 'Postura', 'Aprendizado motor'],
  },
  {
    id: 'tronco',
    name: 'Tronco encefálico',
    group: 'Cerebelo e tronco',
    anchor: { x: 338, y: 415 },
    description:
      'Formado por mesencéfalo, ponte e bulbo, conecta o cérebro à medula espinal. Controla funções vitais automáticas, como respiração, batimentos cardíacos e pressão arterial, regula o ciclo sono-vigília e dá origem à maior parte dos nervos cranianos.',
    functions: ['Respiração', 'Batimentos cardíacos', 'Sono e vigília', 'Nervos cranianos'],
  },
]

export const REGION_BY_ID: ReadonlyMap<string, Region> = new Map(REGIONS.map((r) => [r.id, r]))
