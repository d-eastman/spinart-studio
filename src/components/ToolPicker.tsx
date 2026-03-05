import { useSpinStore } from '@/store/useSpinStore'
import { TOOLS, VISCOSITY_LEVELS, BRUSH_SHAPES } from '@/engine/types'
import type { ToolType } from '@/engine/types'

const TOOL_ORDER: ToolType[] = ['drip', 'stream', 'splash', 'pour']

export function ToolPicker() {
  const { toolType, setToolType, setToolSize, toolSize, setToolSize: setSize,
          viscosityIndex, setViscosityIndex, brushShape, setBrushShape, paintMode } = useSpinStore()

  function handleToolClick(t: ToolType) {
    setToolType(t)
  }

  return (
    <>
      {/* Tool buttons (drop mode only) */}
      {paintMode === 'drop' && (
        <div>
          <div className="section-label">Drip Tool</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {TOOL_ORDER.map((t) => {
              const cfg = TOOLS[t]
              const active = toolType === t
              return (
                <button
                  key={t}
                  onClick={() => handleToolClick(t)}
                  style={{
                    background: active ? '#f06292' : '#faf7f4',
                    border: `1px solid ${active ? '#f06292' : '#e0d8cf'}`,
                    color: active ? 'white' : '#3e3232',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: 10,
                    padding: '8px 4px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.15s',
                    boxShadow: active ? '0 2px 6px rgba(240,98,146,0.3)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Brush shape */}
      <div>
        <div className="section-label">Brush Shape</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {BRUSH_SHAPES.map((bs) => {
            const active = brushShape === bs.type
            return (
              <button
                key={bs.type}
                onClick={() => setBrushShape(bs.type)}
                style={{
                  padding: '5px 0',
                  border: `1px solid ${active ? '#f06292' : '#e0d8cf'}`,
                  background: active ? '#f06292' : '#faf7f4',
                  color: active ? 'white' : '#9e9494',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 9,
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: active ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                }}
              >
                {bs.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Drop size */}
      <div>
        <div className="section-label">{paintMode === 'drop' ? 'Drop Size' : 'Brush Size'}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="range"
            min={1}
            max={40}
            value={toolSize}
            onChange={(e) => setSize(+e.target.value)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 10, color: '#f06292', fontWeight: 'bold', minWidth: 24, textAlign: 'right' }}>
            {toolSize}
          </span>
        </div>
      </div>

      {/* Viscosity (drop mode only) */}
      {paintMode === 'drop' && (
        <div>
          <div className="section-label">Viscosity</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {VISCOSITY_LEVELS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setViscosityIndex(i)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  border: `1px solid ${viscosityIndex === i ? '#ffb74d' : '#e0d8cf'}`,
                  background: viscosityIndex === i ? '#ffb74d' : '#faf7f4',
                  color: viscosityIndex === i ? '#5d4037' : '#9e9494',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 9,
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontWeight: viscosityIndex === i ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
