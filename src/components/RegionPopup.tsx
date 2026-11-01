import type { CSSProperties } from 'react'
import { VIEW } from '../data/outline'
import type { Region } from '../data/regions'

type Props = {
  region: Region
  onClose: () => void
  docked?: boolean
}

export function RegionPopup({ region, onClose, docked = false }: Props) {
  const side = region.anchor.x < VIEW.w / 2 ? 'right' : 'left'
  const style = {
    '--px': `${(region.anchor.x / VIEW.w) * 100}%`,
    '--py': `${(region.anchor.y / VIEW.h) * 100}%`,
  } as CSSProperties

  return (
    <div
      className={docked ? 'popup popup--dock' : `popup popup--${side}`}
      style={docked ? undefined : style}
      role="dialog"
      aria-labelledby="popup-title"
      aria-live="polite"
    >
      <button className="popup-close" type="button" onClick={onClose} aria-label="Fechar">
        ×
      </button>
      <p className="popup-group">{region.group}</p>
      <h2 id="popup-title" className="popup-title">
        {region.name}
      </h2>
      <p className="popup-text">{region.description}</p>
      <ul className="popup-tags" aria-label="Funções principais">
        {region.functions.map((fn) => (
          <li key={fn}>{fn}</li>
        ))}
      </ul>
    </div>
  )
}
