import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

export function ColorPalette() {
  const { color, setColor, customColor, setCustomColor } = useSpinStore()

  return (
    <div>
      <div className="section-label">Color</div>
      <div role="radiogroup" aria-label="Paint color" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        {PALETTE.map((c) => {
          const active = color === c
          return (
            <button
              key={c}
              role="radio"
              aria-checked={active}
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: c,
                border: `3px solid ${active ? '#2d2222' : 'transparent'}`,
                cursor: 'pointer',
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.1s, border-color 0.1s',
                padding: 0,
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
          )
        })}
      </div>
      <div style={{ marginTop: 8 }}>
        <label htmlFor="custom-color" style={{ fontSize: 11, letterSpacing: 2, color: '#6b5e5e', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: 4 }}>
          Custom
        </label>
        <input
          id="custom-color"
          type="color"
          value={customColor}
          onChange={(e) => setCustomColor(e.target.value)}
          aria-label="Custom paint color picker"
          style={{
            width: '100%',
            height: 32,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            background: 'none',
            padding: 0,
          }}
        />
      </div>
    </div>
  )
}
