import { Html, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import * as THREE from 'three'
import { REGIONS } from '../data/regions'
import { CENTER, SPATIAL } from '../data/regions3d'
import { BRAIN_3D } from '../lib/graph3d'
import { RegionPopup } from './RegionPopup'

const CENTER_V = new THREE.Vector3(...CENTER)
const TMP = new THREE.Vector3()

const LINE_BASE = [0.2, 0.52, 0.66] as const
const LINE_HIGH = [0.78, 1.0, 1.0] as const
const POINT_BASE = [0.6, 0.92, 1.0] as const
const POINT_HIGH = [1.0, 1.0, 1.0] as const

function fillColors(active: number, lines: Float32Array, points: Float32Array) {
  const { edges, regionIdx, count } = BRAIN_3D
  const dim = active >= 0

  for (let e = 0; e < edges.length / 2; e++) {
    const a = regionIdx[edges[e * 2]] === active
    const b = regionIdx[edges[e * 2 + 1]] === active
    let col: readonly number[] = LINE_BASE
    let k = 1
    if (dim) {
      if (a && b) col = LINE_HIGH
      else if (a || b) k = 0.5
      else k = 0.2
    }
    for (let v = 0; v < 2; v++) {
      lines[e * 6 + v * 3] = col[0] * k
      lines[e * 6 + v * 3 + 1] = col[1] * k
      lines[e * 6 + v * 3 + 2] = col[2] * k
    }
  }

  for (let i = 0; i < count; i++) {
    const inside = regionIdx[i] === active
    const col = dim && inside ? POINT_HIGH : POINT_BASE
    const k = dim && !inside ? 0.25 : 1
    points[i * 3] = col[0] * k
    points[i * 3 + 1] = col[1] * k
    points[i * 3 + 2] = col[2] * k
  }
}

function makeGlow(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,255,255,0.55)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function BrainMesh({ active, glow }: { active: number; glow: THREE.Texture }) {
  const buffers = useMemo(() => {
    const { edges, positions, count } = BRAIN_3D
    const edgeCount = edges.length / 2
    const linePos = new Float32Array(edgeCount * 6)
    for (let e = 0; e < edgeCount; e++) {
      for (let v = 0; v < 2; v++) {
        const n = edges[e * 2 + v]
        linePos[e * 6 + v * 3] = positions[n * 3]
        linePos[e * 6 + v * 3 + 1] = positions[n * 3 + 1]
        linePos[e * 6 + v * 3 + 2] = positions[n * 3 + 2]
      }
    }
    const lineColor = new Float32Array(edgeCount * 6)
    const pointColor = new Float32Array(count * 3)
    fillColors(-1, lineColor, pointColor)

    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColor, 3))

    const pointGeo = new THREE.BufferGeometry()
    pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointGeo.setAttribute('color', new THREE.BufferAttribute(pointColor, 3))
    return { lineGeo, pointGeo, lineColor, pointColor }
  }, [])

  const targets = useMemo(() => {
    const lines = new Float32Array(buffers.lineColor.length)
    const points = new Float32Array(buffers.pointColor.length)
    fillColors(active, lines, points)
    return { lines, points }
  }, [active, buffers])

  const settled = useRef(false)
  useEffect(() => {
    settled.current = false
  }, [targets])

  useFrame(() => {
    if (settled.current) return
    let maxDelta = 0
    const ease = (cur: Float32Array, tgt: Float32Array) => {
      for (let i = 0; i < cur.length; i++) {
        const d = tgt[i] - cur[i]
        cur[i] += d * 0.14
        const ad = Math.abs(d)
        if (ad > maxDelta) maxDelta = ad
      }
    }
    ease(buffers.lineColor, targets.lines)
    ease(buffers.pointColor, targets.points)
    buffers.lineGeo.attributes.color.needsUpdate = true
    buffers.pointGeo.attributes.color.needsUpdate = true
    if (maxDelta < 0.004) settled.current = true
  })

  return (
    <>
      <lineSegments geometry={buffers.lineGeo}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={buffers.pointGeo}>
        <pointsMaterial
          size={0.05}
          map={glow}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  )
}

type MarkerProps = {
  index: number
  glow: THREE.Texture
  selected: boolean
  hovered: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

function Marker({ index, glow, selected, hovered, onSelect, onHover }: MarkerProps) {
  const region = REGIONS[index]
  const spatial = SPATIAL[region.id]
  const gl = useThree((s) => s.gl)
  const halo = useRef<THREE.Sprite>(null)
  const core = useRef<THREE.Mesh>(null)
  const normal = useMemo(
    () => new THREE.Vector3(...spatial.pos).sub(CENTER_V).normalize(),
    [spatial],
  )
  const deep = spatial.kind === 'deep'
  const emphasised = selected || hovered

  useFrame(({ camera, clock }) => {
    if (!halo.current || !core.current) return
    TMP.copy(camera.position).sub(CENTER_V).normalize()
    const facing = deep ? 1 : THREE.MathUtils.smoothstep(normal.dot(TMP), -0.2, 0.4)
    const opacity = emphasised ? 1 : 0.28 + 0.72 * facing
    ;(halo.current.material as THREE.SpriteMaterial).opacity = opacity * 0.85
    ;(core.current.material as THREE.MeshBasicMaterial).opacity = opacity
    const pulse = 1 + 0.18 * Math.sin(clock.elapsedTime * 2.4 + index)
    halo.current.scale.setScalar((selected ? 0.3 : 0.2) * (hovered ? 1.3 : 1) * pulse)
  })

  return (
    <group position={[spatial.pos[0], spatial.pos[1], spatial.pos[2]]}>
      <sprite ref={halo}>
        <spriteMaterial
          map={glow}
          color={selected ? '#9fe9ff' : '#ffcf6e'}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <mesh ref={core}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial color={selected ? '#ffffff' : '#ffcf6e'} transparent toneMapped={false} />
      </mesh>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(region.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(region.id)
          gl.domElement.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          gl.domElement.style.cursor = ''
        }}
      >
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {emphasised && (
        <Html position={[0, 0.12, 0]} center pointerEvents="none">
          <div className="tag3d">{region.name}</div>
        </Html>
      )}
    </group>
  )
}

function viewDirection(id: string): THREE.Vector3 {
  const s = SPATIAL[id]
  if (s.view) return new THREE.Vector3(...s.view).normalize()
  return new THREE.Vector3(
    s.pos[0] - CENTER[0],
    (s.pos[1] - CENTER[1]) * 0.5,
    s.pos[2] - CENTER[2],
  ).normalize()
}

type SceneProps = {
  selectedId: string | null
  hoverId: string | null
  autoRotate: boolean
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

function Scene({ selectedId, hoverId, autoRotate, onSelect, onHover }: SceneProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const fly = useRef<THREE.Vector3 | null>(null)
  const gl = useThree((s) => s.gl)
  const glow = useMemo(() => makeGlow(), [])
  const activeId = hoverId ?? selectedId
  const active = activeId ? REGIONS.findIndex((r) => r.id === activeId) : -1

  useEffect(() => {
    gl.domElement.style.touchAction = 'pan-y'
  }, [gl])

  useEffect(() => {
    fly.current = selectedId ? viewDirection(selectedId) : null
  }, [selectedId])

  const shift = useRef(0)
  useFrame(({ camera, size }, dt) => {
    const cam = camera as THREE.PerspectiveCamera
    const goal = selectedId && size.width > 640 ? 0.17 : 0
    shift.current += (goal - shift.current) * (1 - Math.exp(-dt * 5))
    if (goal === 0 && shift.current < 0.0008) {
      if (shift.current !== 0 || cam.view?.enabled) {
        shift.current = 0
        cam.clearViewOffset()
      }
      return
    }
    cam.setViewOffset(size.width, size.height, shift.current * size.width, 0, size.width, size.height)
  })

  useFrame((state, dt) => {
    const ctrl = controls.current
    const want = fly.current
    if (!ctrl || !want) return
    const cam = state.camera
    const offset = TMP.copy(cam.position).sub(ctrl.target)
    const dist = offset.length()
    offset.normalize().lerp(want, 1 - Math.exp(-dt * 3.5)).normalize()
    cam.position.copy(ctrl.target).addScaledVector(offset, THREE.MathUtils.lerp(dist, 3.3, 0.04))
    ctrl.update()
    if (offset.angleTo(want) < 0.012) fly.current = null
  })

  return (
    <>
      <BrainMesh active={active} glow={glow} />
      {REGIONS.map((r, i) => (
        <Marker
          key={r.id}
          index={i}
          glow={glow}
          selected={r.id === selectedId}
          hovered={r.id === hoverId}
          onSelect={(id) => onSelect(id === selectedId ? null : id)}
          onHover={onHover}
        />
      ))}
      <OrbitControls
        ref={controls}
        makeDefault
        target={[CENTER[0], CENTER[1], CENTER[2]]}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.7}
        autoRotate={autoRotate && !selectedId && !hoverId}
        autoRotateSpeed={0.8}
        onStart={() => {
          fly.current = null
        }}
      />
    </>
  )
}

type Props = {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export default function Brain3D({ selectedId, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const selected = selectedId ? (REGIONS.find((r) => r.id === selectedId) ?? null) : null

  return (
    <div className="stage3d">
      <div
        className="canvas3d"
        role="img"
        aria-label="Cérebro em 3D. Arraste para girar e clique nos pontos dourados. Também é possível escolher a região na lista abaixo."
      >
        <Canvas
          camera={{ position: [2.5, 0.9, 1.9], fov: 38 }}
          dpr={[1, 2]}
          onPointerMissed={() => onSelect(null)}
        >
          <fog attach="fog" args={['#061723', 2.8, 6.4]} />
          <Scene
            selectedId={selectedId}
            hoverId={hoverId}
            autoRotate={autoRotate}
            onSelect={onSelect}
            onHover={setHoverId}
          />
        </Canvas>
        <button
          className="spin"
          type="button"
          aria-pressed={autoRotate}
          onClick={() => setAutoRotate((v) => !v)}
        >
          {autoRotate ? 'Pausar rotação' : 'Girar sozinho'}
        </button>
        <p className="hint3d">Arraste para girar</p>
      </div>
      {selected && (
        <RegionPopup key={selected.id} region={selected} onClose={() => onSelect(null)} docked />
      )}
    </div>
  )
}
