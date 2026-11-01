import { useEffect, useState } from 'react'
import { BrainGraph } from './components/BrainGraph'
import { REGIONS } from './data/regions'
import './App.css'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Neuroanatomia interativa</p>
        <h1>Explore o cérebro</h1>
        <p className="lead">
          Clique em um dos pontos dourados para descobrir o nome da região e o que ela faz.
        </p>
      </header>

      <BrainGraph selectedId={selectedId} onSelect={setSelectedId} />

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
