import { memo, useMemo, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { VIEW } from '../data/outline'
import { REGIONS, REGION_BY_ID } from '../data/regions'
import { BRAIN_GRAPH, OUTLINE_PATH } from '../lib/graph'
import { RegionPopup } from './RegionPopup'

const { nodes, edges } = BRAIN_GRAPH
const plainNodes = nodes.filter((n) => !n.isAnchor)

const Mesh = memo(function Mesh() {
  return (
    <g className="mesh" aria-hidden="true">
      <path className="mesh-fill" d={OUTLINE_PATH} fill="url(#brain-fill)" />
      <g className="mesh-edges">
        {edges.map((e) => (
          <line
            key={`${e.a}-${e.b}`}
            x1={nodes[e.a].x}
            y1={nodes[e.a].y}
            x2={nodes[e.b].x}
            y2={nodes[e.b].y}
          />
        ))}
      </g>
      <g className="mesh-nodes">
        {plainNodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={n.r}
            style={{ animationDelay: `${n.delay.toFixed(2)}s` }}
          />
        ))}
      </g>
    </g>
  )
})

function RegionGlow({ regionId }: { regionId: string }) {
  const { glowEdges, glowNodes } = useMemo(
    () => ({
      glowEdges: edges.filter(
        (e) => nodes[e.a].regionId === regionId && nodes[e.b].regionId === regionId,
      ),
      glowNodes: nodes.filter((n) => n.regionId === regionId && !n.isAnchor),
    }),
    [regionId],
  )

  return (
    <g className="glow" filter="url(#brain-glow)" aria-hidden="true">
      {glowEdges.map((e) => (
        <line
          key={`${e.a}-${e.b}`}
          x1={nodes[e.a].x}
          y1={nodes[e.a].y}
          x2={nodes[e.b].x}
          y2={nodes[e.b].y}
        />
      ))}
      {glowNodes.map((n) => (
        <circle key={n.id} cx={n.x} cy={n.y} r={n.r + 0.8} />
      ))}
    </g>
  )
}

type Props = {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function BrainGraph({ selectedId, onSelect }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const activeId = hoverId ?? selectedId
  const selected = selectedId ? (REGION_BY_ID.get(selectedId) ?? null) : null

  const toggle = (id: string) => onSelect(selectedId === id ? null : id)

  const handleKey = (e: KeyboardEvent<SVGGElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle(id)
    }
  }

  const handleEnter = (e: PointerEvent<SVGGElement>, id: string) => {
    if (e.pointerType === 'mouse') setHoverId(id)
  }

  return (
    <div className="stage">
      <svg
        className={`brain${activeId ? ' has-active' : ''}`}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="group"
        aria-label="Grafo interativo do cérebro humano, com regiões clicáveis"
      >
        <defs>
          <radialGradient id="brain-fill" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#3bbfe0" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#3bbfe0" stopOpacity="0.03" />
          </radialGradient>
          <filter
            id="brain-glow"
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={VIEW.w}
            height={VIEW.h}
          >
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect className="backdrop" width={VIEW.w} height={VIEW.h} onClick={() => onSelect(null)} />

        <Mesh />
        {activeId && <RegionGlow regionId={activeId} />}

        <g className="anchors">
          {REGIONS.map((region, i) => {
            const isSelected = region.id === selectedId
            const isActive = region.id === activeId
            const labelOnLeft = region.anchor.x > 400
            const cls = `anchor${isSelected ? ' is-selected' : ''}${isActive ? ' is-active' : ''}`
            return (
              <g
                key={region.id}
                className={cls}
                transform={`translate(${region.anchor.x} ${region.anchor.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${region.name}: ver detalhes`}
                aria-pressed={isSelected}
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(region.id)
                }}
                onKeyDown={(e) => handleKey(e, region.id)}
                onPointerEnter={(e) => handleEnter(e, region.id)}
                onPointerLeave={() => setHoverId(null)}
              >
                <circle className="hit" r={22} />
                <circle className="pulse" r={6} style={{ animationDelay: `${(i * 0.23).toFixed(2)}s` }} />
                <circle className="core" r={5.2} />
                <text
                  className="label"
                  x={labelOnLeft ? -12 : 12}
                  y={3.6}
                  textAnchor={labelOnLeft ? 'end' : 'start'}
                >
                  {region.name}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {selected && <RegionPopup key={selected.id} region={selected} onClose={() => onSelect(null)} />}
    </div>
  )
}
