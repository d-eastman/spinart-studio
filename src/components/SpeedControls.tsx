import { useSpinStore } from '@/store/useSpinStore'

export function SpeedControls() {
  const { rpm, setRpm, spinning, setSpinning, direction, setDirection } = useSpinStore()

  return (
    <div>
      <div className="section-label">Spin Speed</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <input
          type="range"
          min={0}
          max={50}
          value={rpm}
          onChange={(e) => setRpm(+e.target.value)}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 10, color: '#f06292', fontWeight: 'bold', minWidth: 32, textAlign: 'right' }}>
          {rpm}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {(['CW', 'STOP', 'CCW'] as const).map((label) => {
          let active = false
          if (label === 'CW')   active = spinning && direction === 1
          if (label === 'CCW')  active = spinning && direction === -1
          if (label === 'STOP') active = !spinning

          return (
            <button
              key={label}
              onClick={() => {
                if (label === 'CW')   { setDirection(1);  setSpinning(true)  }
                if (label === 'CCW')  { setDirection(-1); setSpinning(true)  }
                if (label === 'STOP') { setSpinning(false) }
              }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: `1px solid ${active ? '#f06292' : '#e0d8cf'}`,
                background: active ? '#f06292' : '#faf7f4',
                color: active ? 'white' : '#3e3232',
                fontFamily: 'Space Mono, monospace',
                fontSize: 10,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: active ? '0 2px 6px rgba(240,98,146,0.3)' : 'none',
              }}
            >
              {label === 'CW' ? '\u21BB CW' : label === 'CCW' ? '\u21BA CCW' : 'STOP'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
