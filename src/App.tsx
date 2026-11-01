import { Component, Suspense, lazy, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { BrainGraph } from './components/BrainGraph'
import { REGIONS } from './data/regions'
import './App.css'

const Brain3D = lazy(() => import('./components/Brain3D'))

type Mode = '3d' | '2d'

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>(() => (hasWebGL() ? '3d' : '2d'))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const flat = <BrainGraph selectedId={selectedId} onSelect={setSelectedId} />

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Neuroanatomia interativa</p>
        <h1>Explore o cérebro</h1>
        <p className="lead">
          {mode === '3d'
            ? 'Arraste para girar e clique em um dos pontos dourados para descobrir o nome da região e o que ela faz.'
            : 'Clique em um dos pontos dourados para descobrir o nome da região e o que ela faz.'}
        </p>
      </header>

      <div className="modes" role="group" aria-label="Modo de visualização">
        {(['3d', '2d'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
            {m === '3d' ? 'Vista 3D' : 'Vista 2D'}
          </button>
        ))}
      </div>

      {mode === '3d' ? (
        <SceneBoundary fallback={flat}>
          <Suspense
            fallback={
              <div className="stage3d">
                <div className="canvas3d canvas3d--loading">Carregando o cérebro em 3D…</div>
              </div>
            }
          >
            <Brain3D selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
        </SceneBoundary>
      ) : (
        flat
      )}

      <nav className="chips" aria-label="Regiões do cérebro">
        {REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            className="chip"
            aria-pressed={selectedId === region.id}
            onClick={() => setSelectedId(selectedId === region.id ? null : region.id)}
          >
            {region.name}
          </button>
        ))}
      </nav>

      <footer className="note">
        Ilustração estilizada: as posições e os limites das regiões são aproximados e o conteúdo tem
        fins educativos.
      </footer>
    </main>
  )
}
