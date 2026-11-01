import { REGIONS } from '../data/regions'
import { SPATIAL } from '../data/regions3d'
import type { Vec3 } from '../data/regions3d'
import { mulberry32 } from './graph'

type Shape = { c: Vec3; r: Vec3; kind: 'cerebrum' | 'temporal' | 'cerebellum' }

type Kind = 'anchor' | 'cerebrum' | 'int-cerebrum' | 'temporal' | 'cerebellum' | 'stem'

export const SHAPES: readonly Shape[] = [
  { c: [0.36, 0.12, 0], r: [0.4, 0.58, 0.9], kind: 'cerebrum' },
  { c: [-0.36, 0.12, 0], r: [0.4, 0.58, 0.9], kind: 'cerebrum' },
  { c: [0.52, -0.28, 0.12], r: [0.2, 0.2, 0.48], kind: 'temporal' },
  { c: [-0.52, -0.28, 0.12], r: [0.2, 0.2, 0.48], kind: 'temporal' },
  { c: [0, -0.42, -0.72], r: [0.55, 0.24, 0.34], kind: 'cerebellum' },
]

const STEM_TOP: Vec3 = [0, -0.05, -0.08]
const STEM_BOTTOM: Vec3 = [0, -1.0, -0.42]
const STEM_R0 = 0.13
const STEM_R1 = 0.08

const SEED = 7
const SURFACE_GAP = 0.1
const INTERIOR_GAP = 0.17
const CELL = 0.19
const EDGE_NEAR = 0.2
const EDGE_NEAR_INTERIOR = 0.27
const NEIGHBORS = 5

export type Graph3D = {
  count: number
  positions: Float32Array
  regionIdx: Int16Array
  edges: Uint32Array
}

function ellipsoidValue(s: Shape, x: number, y: number, z: number): number {
  const dx = (x - s.c[0]) / s.r[0]
  const dy = (y - s.c[1]) / s.r[1]
  const dz = (z - s.c[2]) / s.r[2]
  return dx * dx + dy * dy + dz * dz
}

function stemPoint(t: number, theta: number): Vec3 {
  const dx = STEM_BOTTOM[0] - STEM_TOP[0]
  const dy = STEM_BOTTOM[1] - STEM_TOP[1]
  const dz = STEM_BOTTOM[2] - STEM_TOP[2]
  const len = Math.hypot(dx, dy, dz)
  const ny = dy / len
  const nz = dz / len
  const radius = STEM_R0 + (STEM_R1 - STEM_R0) * t
  const cx = STEM_TOP[0] + dx * t
  const cy = STEM_TOP[1] + dy * t
  const cz = STEM_TOP[2] + dz * t
  const cos = Math.cos(theta) * radius
  const sin = Math.sin(theta) * radius
  return [cx + cos, cy + sin * nz, cz - sin * ny]
}

function buildGraph3D(): Graph3D {
  const rand = mulberry32(SEED)
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())

  const xs: number[] = []
  const ys: number[] = []
  const zs: number[] = []
  const kinds: Kind[] = []
  const region: number[] = []
  const grid = new Map<number, number[]>()
  const key = (ix: number, iy: number, iz: number) => ((ix + 32) * 64 + (iy + 32)) * 64 + (iz + 32)

  const add = (p: Vec3, kind: Kind, regionIdx = -1) => {
    const i = xs.length
    xs.push(p[0])
    ys.push(p[1])
    zs.push(p[2])
    kinds.push(kind)
    region.push(regionIdx)
    const k = key(Math.floor(p[0] / CELL), Math.floor(p[1] / CELL), Math.floor(p[2] / CELL))
    const bucket = grid.get(k)
    if (bucket) bucket.push(i)
    else grid.set(k, [i])
  }

  const tooClose = (p: Vec3, gap: number) => {
    const ix = Math.floor(p[0] / CELL)
    const iy = Math.floor(p[1] / CELL)
    const iz = Math.floor(p[2] / CELL)
    const g2 = gap * gap
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        for (let c = -1; c <= 1; c++) {
          const bucket = grid.get(key(ix + a, iy + b, iz + c))
          if (!bucket) continue
          for (const j of bucket) {
            const dx = xs[j] - p[0]
            const dy = ys[j] - p[1]
            const dz = zs[j] - p[2]
            if (dx * dx + dy * dy + dz * dz < g2) return true
          }
        }
      }
    }
    return false
  }

  const insideOther = (p: Vec3, self: number, limit: number) =>
    SHAPES.some((s, i) => i !== self && ellipsoidValue(s, p[0], p[1], p[2]) < limit)

  REGIONS.forEach((r, i) => add(SPATIAL[r.id].pos, 'anchor', i))

  const randomDir = (): Vec3 => {
    const x = gauss()
    const y = gauss()
    const z = gauss()
    const n = Math.hypot(x, y, z) || 1
    return [x / n, y / n, z / n]
  }

  SHAPES.forEach((s, i) => {
    const attempts = s.kind === 'cerebrum' ? 16000 : s.kind === 'temporal' ? 6000 : 7000
    for (let n = 0; n < attempts; n++) {
      const d = randomDir()
      const p: Vec3 = [s.c[0] + d[0] * s.r[0], s.c[1] + d[1] * s.r[1], s.c[2] + d[2] * s.r[2]]
      if (insideOther(p, i, 0.97) || tooClose(p, SURFACE_GAP)) continue
      add(p, s.kind)
    }
  })

  for (let n = 0; n < 4000; n++) {
    const t = rand()
    const p = stemPoint(t, rand() * Math.PI * 2)
    if (insideOther(p, -1, 0.97) || tooClose(p, SURFACE_GAP)) continue
    add(p, 'stem')
  }

  SHAPES.forEach((s, i) => {
    const attempts = s.kind === 'cerebrum' ? 4000 : 1200
    for (let n = 0; n < attempts; n++) {
      const d = randomDir()
      const k = 0.8 * Math.cbrt(rand())
      const p: Vec3 = [
        s.c[0] + d[0] * s.r[0] * k,
        s.c[1] + d[1] * s.r[1] * k,
        s.c[2] + d[2] * s.r[2] * k,
      ]
      if (insideOther(p, i, 0.9) || tooClose(p, INTERIOR_GAP)) continue
      add(p, s.kind === 'cerebrum' ? 'int-cerebrum' : s.kind)
    }
  })

  const idxOf = (id: string) => REGIONS.findIndex((r) => r.id === id)
  const TEMPORAL = idxOf('temporal')
  const CEREBELLUM = idxOf('cerebelo')
  const STEM = idxOf('tronco')
  const surfaceAnchors = REGIONS.map((r, i) => ({ i, k: SPATIAL[r.id].kind })).filter(
    (a) => a.k === 'cerebrum',
  )
  const innerAnchors = REGIONS.map((r, i) => ({ i, k: SPATIAL[r.id].kind })).filter(
    (a) => a.k === 'cerebrum' || a.k === 'deep',
  )

  const nearest = (i: number, pool: { i: number }[]) => {
    const x = Math.abs(xs[i])
    let best = Infinity
    let bestIdx = pool[0].i
    for (const a of pool) {
      const p = SPATIAL[REGIONS[a.i].id].pos
      const d = (p[0] - x) ** 2 + (p[1] - ys[i]) ** 2 + (p[2] - zs[i]) ** 2
      if (d < best) {
        best = d
        bestIdx = a.i
      }
    }
    return bestIdx
  }

  for (let i = 0; i < xs.length; i++) {
    const kind = kinds[i]
    if (kind === 'anchor') continue
    if (kind === 'temporal') region[i] = TEMPORAL
    else if (kind === 'cerebellum') region[i] = CEREBELLUM
    else if (kind === 'stem') region[i] = STEM
    else if (kind === 'cerebrum') region[i] = nearest(i, surfaceAnchors)
    else region[i] = nearest(i, innerAnchors)
  }

  const n = xs.length
  const near = new Map<number, number[]>()
  const CELL2 = EDGE_NEAR_INTERIOR
  const key2 = (ix: number, iy: number, iz: number) => ((ix + 32) * 64 + (iy + 32)) * 64 + (iz + 32)
  for (let i = 0; i < n; i++) {
    const k = key2(Math.floor(xs[i] / CELL2), Math.floor(ys[i] / CELL2), Math.floor(zs[i] / CELL2))
    const bucket = near.get(k)
    if (bucket) bucket.push(i)
    else near.set(k, [i])
  }

  const seen = new Set<number>()
  const pairs: number[] = []
  for (let i = 0; i < n; i++) {
    const ix = Math.floor(xs[i] / CELL2)
    const iy = Math.floor(ys[i] / CELL2)
    const iz = Math.floor(zs[i] / CELL2)
    const cand: { j: number; d: number }[] = []
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        for (let c = -1; c <= 1; c++) {
          const bucket = near.get(key2(ix + a, iy + b, iz + c))
          if (!bucket) continue
          for (const j of bucket) {
            if (j === i) continue
            const d = Math.hypot(xs[j] - xs[i], ys[j] - ys[i], zs[j] - zs[i])
            const interior = kinds[i] === 'int-cerebrum' || kinds[j] === 'int-cerebrum'
            if (d <= (interior ? EDGE_NEAR_INTERIOR : EDGE_NEAR)) cand.push({ j, d })
          }
        }
      }
    }
    cand.sort((p, q) => p.d - q.d)
    for (const { j } of cand.slice(0, NEIGHBORS)) {
      const lo = Math.min(i, j)
      const hi = Math.max(i, j)
      const k = lo * n + hi
      if (seen.has(k)) continue
      seen.add(k)
      pairs.push(lo, hi)
    }
  }

  const positions = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    positions[i * 3] = xs[i]
    positions[i * 3 + 1] = ys[i]
    positions[i * 3 + 2] = zs[i]
  }

  return {
    count: n,
    positions,
    regionIdx: Int16Array.from(region),
    edges: Uint32Array.from(pairs),
  }
}

export const BRAIN_3D: Graph3D = buildGraph3D()
