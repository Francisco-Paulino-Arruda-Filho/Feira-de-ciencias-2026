import { Delaunay } from 'd3-delaunay'
import { OUTLINE_CONTROL } from '../data/outline'
import type { Point } from '../data/outline'
import { REGIONS } from '../data/regions'

export type GraphNode = {
  id: number
  x: number
  y: number
  r: number
  delay: number
  regionId: string
  isAnchor: boolean
}

export type GraphEdge = { a: number; b: number }

export type BrainGraphData = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  outline: Point[]
}

const SEED = 11
const MIN_DIST = 19
const BOUNDARY_STEP = 17
const MAX_ATTEMPTS = 12000
const MAX_EDGE = 48

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pointInPolygon(p: Point, poly: readonly Point[]): boolean {
  const [x, y] = p
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function chaikin(points: readonly Point[], iterations: number): Point[] {
  let current: Point[] = points.map((p) => [p[0], p[1]] as Point)
  for (let it = 0; it < iterations; it++) {
    const next: Point[] = []
    for (let i = 0; i < current.length; i++) {
      const [x0, y0] = current[i]
      const [x1, y1] = current[(i + 1) % current.length]
      next.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1])
      next.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1])
    }
    current = next
  }
  return current
}

function sampleBoundary(poly: readonly Point[], step: number): Point[] {
  const out: Point[] = []
  let carry = 0
  for (let i = 0; i < poly.length; i++) {
    const [x0, y0] = poly[i]
    const [x1, y1] = poly[(i + 1) % poly.length]
    const len = Math.hypot(x1 - x0, y1 - y0)
    let d = carry === 0 ? 0 : step - carry
    while (d < len) {
      const t = d / len
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
      d += step
    }
    carry = len - (d - step)
  }
  return out
}

function triangleInside(tri: readonly [Point, Point, Point], poly: readonly Point[]): boolean {
  const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3
  const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3
  if (!pointInPolygon([cx, cy], poly)) return false
  for (let i = 0; i < 3; i++) {
    const [vx, vy] = tri[i]
    const [wx, wy] = tri[(i + 1) % 3]
    const mx = (vx + wx) / 2
    const my = (vy + wy) / 2
    if (!pointInPolygon([mx + 0.15 * (cx - mx), my + 0.15 * (cy - my)], poly)) return false
    if (!pointInPolygon([cx + 0.7 * (vx - cx), cy + 0.7 * (vy - cy)], poly)) return false
  }
  return true
}

export function buildBrainGraph(): BrainGraphData {
  const rand = mulberry32(SEED)
  const outline = chaikin(OUTLINE_CONTROL, 2)

  const pts: Point[] = []
  const anchorCount = REGIONS.length
  for (const region of REGIONS) pts.push([region.anchor.x, region.anchor.y])

  const boundaryStart = pts.length
  for (const p of sampleBoundary(outline, BOUNDARY_STEP)) pts.push(p)
  const interiorStart = pts.length

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const [x, y] of outline) {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const x = minX + rand() * (maxX - minX)
    const y = minY + rand() * (maxY - minY)
    if (!pointInPolygon([x, y], outline)) continue
    let ok = true
    for (const [px, py] of pts) {
      if (Math.hypot(px - x, py - y) < MIN_DIST) {
        ok = false
        break
      }
    }
    if (ok) pts.push([x, y])
  }

  const delaunay = Delaunay.from(pts as unknown as [number, number][])
  const tris = delaunay.triangles
  const seen = new Set<number>()
  const edges: GraphEdge[] = []
  const n = pts.length
  const addEdge = (a: number, b: number) => {
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const key = lo * n + hi
    if (seen.has(key)) return
    seen.add(key)
    edges.push({ a: lo, b: hi })
  }

  for (let i = 0; i < tris.length; i += 3) {
    const a = tris[i]
    const b = tris[i + 1]
    const c = tris[i + 2]
    const tri = [pts[a], pts[b], pts[c]] as const
    const longest = Math.max(
      Math.hypot(tri[0][0] - tri[1][0], tri[0][1] - tri[1][1]),
      Math.hypot(tri[1][0] - tri[2][0], tri[1][1] - tri[2][1]),
      Math.hypot(tri[2][0] - tri[0][0], tri[2][1] - tri[0][1]),
    )
    if (longest > MAX_EDGE) continue
    if (!triangleInside(tri, outline)) continue
    addEdge(a, b)
    addEdge(b, c)
    addEdge(c, a)
  }

  const used = new Set<number>()
  for (const e of edges) {
    used.add(e.a)
    used.add(e.b)
  }

  const remap = new Map<number, number>()
  const nodes: GraphNode[] = []
  for (let i = 0; i < pts.length; i++) {
    const isAnchor = i < anchorCount
    if (!isAnchor && !used.has(i)) continue
    const [x, y] = pts[i]
    let regionId = ''
    if (isAnchor) {
      regionId = REGIONS[i].id
    } else {
      let best = Infinity
      for (const region of REGIONS) {
        const d = Math.hypot(region.anchor.x - x, region.anchor.y - y)
        if (d < best) {
          best = d
          regionId = region.id
        }
      }
    }
    const onBoundary = i >= boundaryStart && i < interiorStart
    remap.set(i, nodes.length)
    nodes.push({
      id: nodes.length,
      x,
      y,
      r: isAnchor ? 5.5 : onBoundary ? 1.7 : 1.3 + rand() * 1.1,
      delay: rand() * 6,
      regionId,
      isAnchor,
    })
  }

  const finalEdges = edges.map((e) => ({ a: remap.get(e.a)!, b: remap.get(e.b)! }))
  return { nodes, edges: finalEdges, outline }
}

export const BRAIN_GRAPH: BrainGraphData = buildBrainGraph()

export const OUTLINE_PATH = `M${BRAIN_GRAPH.outline
  .map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`)
  .join('L')}Z`
