export type Vec3 = readonly [number, number, number]

export type SpatialKind = 'cerebrum' | 'temporal' | 'cerebellum' | 'stem' | 'deep'

export type Spatial = {
  pos: Vec3
  kind: SpatialKind
  view?: Vec3
}

/** Centro de rotação da câmera. O eixo +z aponta para a frente do cérebro e +x para a direita. */
export const CENTER: Vec3 = [0, -0.2, -0.1]

export const SPATIAL: Readonly<Record<string, Spatial>> = {
  frontal: { pos: [0.622, 0.283, 0.632], kind: 'cerebrum' },
  motor: { pos: [0.568, 0.587, 0.256], kind: 'cerebrum' },
  somatossensorial: { pos: [0.576, 0.605, -0.088], kind: 'cerebrum' },
  parietal: { pos: [0.591, 0.455, -0.52], kind: 'cerebrum' },
  occipital: { pos: [0.506, 0.252, -0.818], kind: 'cerebrum' },
  temporal: { pos: [0.716, -0.319, 0.214], kind: 'temporal' },
  broca: { pos: [0.698, 0.094, 0.48], kind: 'cerebrum' },
  wernicke: { pos: [0.734, 0.177, -0.31], kind: 'cerebrum' },
  talamo: { pos: [0.08, 0.05, 0.0], kind: 'deep', view: [1, 0.25, 0.3] },
  hipocampo: { pos: [0.38, -0.2, 0.0], kind: 'deep', view: [1, 0.2, 0.2] },
  cerebelo: { pos: [0.53, -0.391, -0.802], kind: 'cerebellum' },
  tronco: { pos: [0.0975, -0.6675, -0.301], kind: 'stem', view: [1, -0.05, 0.25] },
}
