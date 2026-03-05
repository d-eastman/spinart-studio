import { useRef, useEffect, useState, useMemo } from 'react'
import { useSpinEngine } from '@/engine/useSpinEngine'
import { useSpinStore } from '@/store/useSpinStore'

const MIN_SIZE = 320
const MAX_SIZE = 580

function computeSize(): number {
  const available = Math.min(
    window.innerWidth - 260,  // sidebar width
    window.innerHeight - 80,
  )
  return Math.max(MIN_SIZE, Math.min(MAX_SIZE, available))
}

export function WheelCanvas() {
  const [size, setSize] = useState(computeSize)
  const wheelRef = useRef<HTMLCanvasElement>(null)
  const paintRef = useRef<HTMLCanvasElement>(null)

  const { onPointerDown, onPointerMove, onPointerUp } = useSpinEngine(wheelRef, paintRef, size)

  const color = useSpinStore((s) => s.color)
  const toolSize = useSpinStore((s) => s.toolSize)
  const paintMode = useSpinStore((s) => s.paintMode)
  const brushShape = useSpinStore((s) => s.brushShape)

  const cursorUrl = useMemo(() => {
    if (paintMode === 'brush') {
      const r = Math.max(4, Math.min(toolSize, 32))
      const svgSize = r * 2 + 4
      const c = svgSize / 2
      let shape: string
      const fill = `fill='${color}' opacity='0.7'`
      const stroke = `fill='none' stroke='white' stroke-width='1' opacity='0.8'`

      switch (brushShape) {
        case 'hollowCircle':
          shape = `<circle cx='${c}' cy='${c}' r='${r}' fill='none' stroke='${color}' stroke-width='${Math.max(1, r * 0.35)}' opacity='0.7'/><circle cx='${c}' cy='${c}' r='${r}' ${stroke}/>`
          break
        case 'square':
          shape = `<rect x='${c - r}' y='${c - r}' width='${r * 2}' height='${r * 2}' ${fill}/><rect x='${c - r}' y='${c - r}' width='${r * 2}' height='${r * 2}' ${stroke}/>`
          break
        case 'rectangle': {
          const rw = r * 1.4
          const rh = r * 0.7
          shape = `<rect x='${c - rw}' y='${c - rh}' width='${rw * 2}' height='${rh * 2}' ${fill}/><rect x='${c - rw}' y='${c - rh}' width='${rw * 2}' height='${rh * 2}' ${stroke}/>`
          break
        }
        case 'round':
        default:
          shape = `<circle cx='${c}' cy='${c}' r='${r}' ${fill}/><circle cx='${c}' cy='${c}' r='${r}' ${stroke}/>`
          break
      }

      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${svgSize}' height='${svgSize}'>${shape}</svg>`
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${c} ${c}, crosshair`
    }
    // Drop mode: teardrop shape
    const w = 24
    const h = 32
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><path d='M12 2 C12 2 4 14 4 20 C4 24.4 7.6 28 12 28 C16.4 28 20 24.4 20 20 C20 14 12 2 12 2Z' fill='${color}' opacity='0.85' stroke='white' stroke-width='1.2'/></svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 28, crosshair`
  }, [color, toolSize, paintMode, brushShape])

  useEffect(() => {
    function handleResize() { setSize(computeSize()) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: cursorUrl,
        flexShrink: 0,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <canvas
        ref={wheelRef}
        width={size}
        height={size}
        style={{
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #e0d8cf, 0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      />
      <canvas
        ref={paintRef}
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      {/* Hub dot */}
      <div style={{
        position: 'absolute',
        width: 16,
        height: 16,
        background: '#e0d8cf',
        border: '2px solid #c8bfb6',
        borderRadius: '50%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
