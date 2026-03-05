import { useSpinStore } from '@/store/useSpinStore'

export function SpeedControls() {
  const { rpm, setRpm, spinning, setSpinning, direction, setDirection } = useSpinStore()

  return (
    <div role="region" aria-label="Spin speed controls" style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
      justifyContent: 'center',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(8px)',
      borderRadius: 14,
      border: '1px solid #c8bfb6',
      padding: '10px 18px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    }}>
      <label htmlFor="speed-slider" style={{ fontSize: 11, color: '#6b5e5e', fontFamily: 'Space Mono, monospace', letterSpacing: 1, fontWeight: 'bold' }}>
        SPEED
      </label>
      <input
        id="speed-slider"
        type="range"
        min={0}
        max={50}
        value={rpm}
        onChange={(e) => setRpm(+e.target.value)}
        aria-label={`Spin speed: ${rpm} RPM`}
        style={{ width: 120 }}
      />
      <span style={{ fontSize: 13, color: '#d84373', fontWeight: 'bold', minWidth: 28, textAlign: 'right' }} aria-hidden="true">
        {rpm}
      </span>

      <div style={{ width: 1, height: 24, background: '#c8bfb6' }} aria-hidden="true" />

      <div role="radiogroup" aria-label="Spin direction" style={{ display: 'flex', gap: 6 }}>
        {(['CW', 'STOP', 'CCW'] as const).map((label) => {
          let active = false
          if (label === 'CW')   active = spinning && direction === 1
          if (label === 'CCW')  active = spinning && direction === -1
          if (label === 'STOP') active = !spinning

          return (
            <button
              key={label}
              role="radio"
              aria-checked={active}
              aria-label={label === 'CW' ? 'Clockwise' : label === 'CCW' ? 'Counter-clockwise' : spinning ? 'Stop spinning' : 'Start spinning'}
              onClick={() => {
                if (label === 'CW')   { setDirection(1);  setSpinning(true)  }
                if (label === 'CCW')  { setDirection(-1); setSpinning(true)  }
                if (label === 'STOP') { setSpinning(!spinning) }
              }}
              style={{
                padding: '8px 14px',
                flexShrink: 0,
                border: `2px solid ${active ? '#d84373' : '#c8bfb6'}`,
                background: active ? '#d84373' : '#faf7f4',
                color: active ? 'white' : '#2d2222',
                fontFamily: 'Space Mono, monospace',
                fontSize: 12,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? '0 2px 6px rgba(216,67,115,0.3)' : 'none',
                minHeight: 36,
              }}
            >
              {label === 'CW' ? '\u21BB CW' : label === 'CCW' ? '\u21BA CCW' : spinning ? 'STOP' : 'SPIN'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
