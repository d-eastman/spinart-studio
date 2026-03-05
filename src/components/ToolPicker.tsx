import { useSpinStore } from '@/store/useSpinStore'
import { TOOLS, BRUSH_SHAPES } from '@/engine/types'
import type { ToolType } from '@/engine/types'

const TOOL_ORDER: ToolType[] = ['drop', 'line', 'spray', 'splash']

export function ToolPicker() {
  const { toolType, setToolType, toolSize, setToolSize,
          brushShape, setBrushShape, paintMode } = useSpinStore()

  return (
    <>
      {/* Tool buttons (drop mode only) */}
      {paintMode === 'drop' && (
        <div>
          <div className="section-label">Tool</div>
          <div role="radiogroup" aria-label="Drip tool" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {TOOL_ORDER.map((t) => {
              const cfg = TOOLS[t]
              const active = toolType === t
              return (
                <button
                  key={t}
                  role="radio"
                  aria-checked={active}
                  aria-label={cfg.label}
                  onClick={() => setToolType(t)}
                  style={{
                    background: active ? '#d84373' : '#faf7f4',
                    border: `2px solid ${active ? '#d84373' : '#c8bfb6'}`,
                    color: active ? 'white' : '#2d2222',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 11,
                    padding: '8px 4px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 2px 6px rgba(216,67,115,0.3)' : 'none',
                    minHeight: 44,
                  }}
                >
                  <span style={{ fontSize: 18 }} aria-hidden="true">{cfg.icon}</span>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Brush shape */}
      <div>
        <div className="section-label">Shape</div>
        <div role="radiogroup" aria-label="Brush shape" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {BRUSH_SHAPES.map((bs) => {
            const active = brushShape === bs.type
            return (
              <button
                key={bs.type}
                role="radio"
                aria-checked={active}
                aria-label={bs.label}
                onClick={() => setBrushShape(bs.type)}
                style={{
                  padding: '8px 4px',
                  border: `2px solid ${active ? '#d84373' : '#c8bfb6'}`,
                  background: active ? '#d84373' : '#faf7f4',
                  color: active ? 'white' : '#6b5e5e',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 11,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: active ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: active ? '0 2px 6px rgba(216,67,115,0.3)' : 'none',
                  minHeight: 44,
                }}
              >
                <span style={{ fontSize: 18 }} aria-hidden="true">{bs.icon}</span>
                {bs.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <label htmlFor="tool-size" className="section-label" style={{ display: 'block' }}>Size</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            id="tool-size"
            type="range"
            min={1}
            max={40}
            value={toolSize}
            onChange={(e) => setToolSize(+e.target.value)}
            aria-label={`${paintMode === 'drop' ? 'Drop' : 'Brush'} size: ${toolSize}`}
            style={{ flex: 1, width: '100%' }}
          />
          <span style={{ fontSize: 12, color: '#d84373', fontWeight: 'bold', minWidth: 20, textAlign: 'right' }} aria-hidden="true">
            {toolSize}
          </span>
        </div>
      </div>

    </>
  )
}
