import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

export function ColorPalette() {
  const { color, setColor } = useSpinStore()

  return (
    <div>
      <div className="section-label">Color</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '50%',
              background: c,
              border: `2px solid ${color === c ? 'white' : 'transparent'}`,
              cursor: 'pointer',
              transform: color === c ? 'scale(1.15)' : 'scale(1)',
              transition: 'transform 0.1s, border-color 0.1s',
              padding: 0,
            }}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{
            gridColumn: 'span 5',
            width: '100%',
            height: 28,
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            background: 'none',
            padding: 0,
          }}
          title="Custom color"
        />
      </div>
    </div>
  )
}
