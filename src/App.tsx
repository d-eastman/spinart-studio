import { WheelCanvas } from '@/components/WheelCanvas'
import { ColorPalette } from '@/components/ColorPalette'
import { ToolPicker } from '@/components/ToolPicker'
import { SpeedControls } from '@/components/SpeedControls'
import { useSpinStore } from '@/store/useSpinStore'

function TopBar() {
  const { paintMode, setPaintMode, triggerClear, triggerSave, triggerSaveGif, bgColor, setBgColor } = useSpinStore()

  return (
    <nav aria-label="Main controls" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: '12px 20px',
      flexWrap: 'wrap',
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 26,
        letterSpacing: 3,
        lineHeight: 1,
      }} aria-label="SpinArt Studio" role="heading" aria-level={1}>
        <span style={{ color: '#d84373' }}>SPIN</span>
        <span style={{ color: '#c77a00' }}>ART</span>
      </div>

      <div style={{ width: 1, height: 24, background: '#c8bfb6' }} aria-hidden="true" />

      {/* Paint mode toggle */}
      <div role="radiogroup" aria-label="Paint mode" style={{ display: 'flex', gap: 4 }}>
        {(['drop', 'brush'] as const).map((mode) => {
          const active = paintMode === mode
          return (
            <button
              key={mode}
              role="radio"
              aria-checked={active}
              onClick={() => setPaintMode(mode)}
              style={{
                padding: '8px 16px',
                border: `2px solid ${active ? '#d84373' : '#c8bfb6'}`,
                background: active ? '#d84373' : '#faf7f4',
                color: active ? 'white' : '#2d2222',
                fontFamily: 'Space Mono, monospace',
                fontSize: 13,
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: active ? 'bold' : 'normal',
                transition: 'all 0.15s',
                boxShadow: active ? '0 2px 6px rgba(216,67,115,0.3)' : 'none',
              }}
            >
              {mode === 'drop' ? '💧 Drop' : '🖌️ Brush'}
            </button>
          )
        })}
      </div>

      <div style={{ width: 1, height: 24, background: '#c8bfb6' }} aria-hidden="true" />

      {/* BG color */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label htmlFor="bg-color" style={{ fontSize: 12, color: '#6b5e5e', fontFamily: 'Space Mono, monospace', letterSpacing: 1, fontWeight: 'bold' }}>BG</label>
        <input
          id="bg-color"
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          aria-label="Canvas background color"
          style={{ width: 36, height: 36, border: '2px solid #c8bfb6', borderRadius: 6, cursor: 'pointer', padding: 0 }}
        />
      </div>

      <div style={{ width: 1, height: 24, background: '#c8bfb6' }} aria-hidden="true" />

      {/* Actions */}
      <button
        onClick={triggerClear}
        aria-label="Clear canvas"
        style={{
          padding: '8px 18px',
          border: '2px solid #c8bfb6',
          borderRadius: 20,
          background: 'transparent',
          color: '#6b5e5e',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          letterSpacing: 1,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d84373'; e.currentTarget.style.color = '#d84373' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#c8bfb6'; e.currentTarget.style.color = '#6b5e5e' }}
      >
        CLEAR
      </button>
      <button
        onClick={triggerSave}
        aria-label="Save image as PNG"
        style={{
          padding: '8px 18px',
          border: 'none',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #d84373, #c77a00)',
          color: 'white',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          letterSpacing: 1,
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.15s',
          boxShadow: '0 2px 8px rgba(216, 67, 115, 0.3)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(216, 67, 115, 0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(216, 67, 115, 0.3)' }}
      >
        PNG
      </button>
      <button
        onClick={triggerSaveGif}
        aria-label="Save spinning animation as GIF"
        style={{
          padding: '8px 18px',
          border: '2px solid #c77a00',
          borderRadius: 20,
          background: 'transparent',
          color: '#c77a00',
          fontFamily: 'Space Mono, monospace',
          fontSize: 13,
          letterSpacing: 1,
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#c77a00'; e.currentTarget.style.color = 'white' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c77a00' }}
      >
        GIF
      </button>
    </nav>
  )
}

export default function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: `
        radial-gradient(ellipse at 20% 80%, rgba(216,67,115,0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(199,122,0,0.07) 0%, transparent 50%),
        #f5f0eb
      `,
      color: '#2d2222',
    }}>
      <TopBar />

      {/* Center row: colors | wheel | tools */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '0 20px',
        minHeight: 0,
      }}>
        {/* Left panel — colors */}
        <div className="side-panel" role="region" aria-label="Color palette" style={{ maxWidth: 170 }}>
          <ColorPalette />
        </div>

        {/* Wheel */}
        <WheelCanvas />

        {/* Right panel — tools */}
        <div className="side-panel" role="region" aria-label="Tool settings" style={{ maxWidth: 280, minWidth: 220 }}>
          <ToolPicker />
        </div>
      </div>

      {/* Bottom bar — speed controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 20px',
      }}>
        <SpeedControls />
      </div>
    </div>
  )
}
