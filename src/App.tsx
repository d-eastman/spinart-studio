import { Sidebar } from '@/components/Sidebar'
import { WheelCanvas } from '@/components/WheelCanvas'

export default function App() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      userSelect: 'none',
      background: '#f5f0eb',
      color: '#3e3232',
    }}>
      <Sidebar />

      {/* Main area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 20% 80%, rgba(240,98,146,0.07) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(255,183,77,0.07) 0%, transparent 50%),
          #f5f0eb
        `,
        gap: 16,
      }}>
        <WheelCanvas />
        <div style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 13,
          letterSpacing: 4,
          color: '#9e9494',
        }}>
          click &amp; drag on the wheel to drip paint
        </div>
      </div>
    </div>
  )
}
