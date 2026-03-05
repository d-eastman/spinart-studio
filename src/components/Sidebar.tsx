import { ColorPalette } from './ColorPalette'
import { ToolPicker } from './ToolPicker'
import { SpeedControls } from './SpeedControls'
import { useSpinStore } from '@/store/useSpinStore'

export function Sidebar() {
  const { bgColor, setBgColor, triggerClear, triggerSave, paintMode, setPaintMode } = useSpinStore()

  return (
    <div style={{
      width: 220,
      minWidth: 220,
      background: '#ffffff',
      borderRight: '1px solid #e0d8cf',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      gap: 20,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 28,
        letterSpacing: 3,
        lineHeight: 1,
        paddingBottom: 12,
        borderBottom: '1px solid #e0d8cf',
      }}>
        <span style={{ color: '#f06292' }}>SPIN</span>
        <span style={{ color: '#ffb74d' }}>ART</span>
      </div>

      {/* Paint mode toggle */}
      <div>
        <div className="section-label">Paint Mode</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {(['drop', 'brush'] as const).map((mode) => {
            const active = paintMode === mode
            return (
              <button
                key={mode}
                onClick={() => setPaintMode(mode)}
                style={{
                  padding: '8px 0',
                  border: `1px solid ${active ? '#f06292' : '#e0d8cf'}`,
                  background: active ? '#f06292' : '#faf7f4',
                  color: active ? 'white' : '#9e9494',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 10,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: active ? 'bold' : 'normal',
                  transition: 'all 0.15s',
                  boxShadow: active ? '0 2px 6px rgba(240,98,146,0.3)' : 'none',
                }}
              >
                {mode === 'drop' ? '💧 Drop' : '🖌️ Brush'}
              </button>
            )
          })}
        </div>
      </div>

      <ColorPalette />
      <ToolPicker />
      <SpeedControls />

      {/* Background color */}
      <div>
        <div className="section-label">Canvas BG</div>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          style={{ width: '100%', height: 28, border: '1px solid #e0d8cf', borderRadius: 6, cursor: 'pointer', padding: 0 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={triggerClear}
          style={{
            width: '100%',
            padding: 10,
            border: '1px solid #e0d8cf',
            borderRadius: 8,
            background: 'transparent',
            color: '#9e9494',
            fontFamily: 'Space Mono, monospace',
            fontSize: 11,
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f06292'; e.currentTarget.style.color = '#f06292' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e0d8cf'; e.currentTarget.style.color = '#9e9494' }}
        >
          CLEAR
        </button>
        <button
          onClick={triggerSave}
          style={{
            width: '100%',
            padding: 10,
            border: 'none',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #f06292, #ffb74d)',
            color: 'white',
            fontFamily: 'Space Mono, monospace',
            fontSize: 11,
            letterSpacing: 1,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.15s',
            boxShadow: '0 2px 8px rgba(240, 98, 146, 0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(240, 98, 146, 0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(240, 98, 146, 0.3)' }}
        >
          SAVE IMAGE
        </button>
      </div>
    </div>
  )
}
