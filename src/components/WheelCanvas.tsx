import { useRef, useEffect, useState, useMemo } from 'react'
import { useSpinEngine } from '@/engine/useSpinEngine'
import { useSpinStore } from '@/store/useSpinStore'

const MIN_SIZE = 320
const MAX_SIZE = 580

function computeSize(): number {
  const available = Math.min(
    window.innerWidth - 400,  // side panels + padding
    window.innerHeight - 160, // top + bottom bars
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
  const toolType = useSpinStore((s) => s.toolType)

  const cursorUrl = useMemo(() => {
    if (paintMode === 'brush' || toolType === 'line') {
      const r = Math.max(4, Math.min(toolSize, 32))
      const pad = Math.max(4, Math.ceil(r * 0.35) + 2)
      const svgSize = r * 2 + pad * 2
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
        case 'star': {
          let pts = ''
          for (let i = 0; i < 10; i++) {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2
            const d = i % 2 === 0 ? r : r * 0.4
            pts += `${c + Math.cos(a) * d},${c + Math.sin(a) * d} `
          }
          shape = `<polygon points='${pts.trim()}' ${fill}/><polygon points='${pts.trim()}' ${stroke}/>`
          break
        }
        case 'heart': {
          const hd = `M${c},${c + r * 0.3} C${c},${c - r * 0.4} ${c - r},${c - r * 0.4} ${c - r},${c + r * 0.1} C${c - r},${c + r * 0.55} ${c},${c + r} ${c},${c + r} C${c},${c + r} ${c + r},${c + r * 0.55} ${c + r},${c + r * 0.1} C${c + r},${c - r * 0.4} ${c},${c - r * 0.4} ${c},${c + r * 0.3}Z`
          shape = `<path d='${hd}' ${fill}/><path d='${hd}' ${stroke}/>`
          break
        }
        case 'triangle': {
          const tp = `${c},${c - r} ${c + r * 0.866},${c + r * 0.5} ${c - r * 0.866},${c + r * 0.5}`
          shape = `<polygon points='${tp}' ${fill}/><polygon points='${tp}' ${stroke}/>`
          break
        }
        case 'diamond': {
          const dp = `${c},${c - r} ${c + r * 0.7},${c} ${c},${c + r} ${c - r * 0.7},${c}`
          shape = `<polygon points='${dp}' ${fill}/><polygon points='${dp}' ${stroke}/>`
          break
        }
        case 'plus': {
          const pw = r * 0.35
          const pd = `M${c - pw},${c - r}h${pw * 2}v${r - pw}h${r - pw}v${pw * 2}h${-(r - pw)}v${r - pw}h${-pw * 2}v${-(r - pw)}h${-(r - pw)}v${-pw * 2}h${r - pw}Z`
          shape = `<path d='${pd}' ${fill}/><path d='${pd}' ${stroke}/>`
          break
        }
        case 'splatter': {
          const blobs = [
            [0, 0, 0.5], [0.7, -0.5, 0.25], [-0.6, 0.6, 0.2], [0.3, 0.8, 0.22],
            [-0.8, -0.3, 0.18], [0.9, 0.2, 0.15], [-0.2, -0.9, 0.2],
            [0.5, 0.5, 0.17], [-0.5, -0.7, 0.15],
          ]
          const circles = blobs.map(([bx, by, br]) =>
            `<circle cx='${c + bx * r}' cy='${c + by * r}' r='${br * r}' ${fill}/>`
          ).join('')
          shape = circles
          break
        }
        case 'slash': {
          const sin45 = 0.707
          const hw = r * 0.15
          const slp = `${c - r * sin45 - hw * sin45},${c + r * sin45 - hw * sin45} ${c - r * sin45 + hw * sin45},${c + r * sin45 + hw * sin45} ${c + r * sin45 + hw * sin45},${c - r * sin45 + hw * sin45} ${c + r * sin45 - hw * sin45},${c - r * sin45 - hw * sin45}`
          shape = `<polygon points='${slp}' ${fill}/><polygon points='${slp}' ${stroke}/>`
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
  }, [color, toolSize, paintMode, brushShape, toolType])

  useEffect(() => {
    function handleResize() { setSize(computeSize()) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      role="application"
      aria-label="Spin art canvas — click and drag to paint"
      style={{
        position: 'relative',
        width: size,
        height: size,
        cursor: cursorUrl,
        flexShrink: 0,
        userSelect: 'none',
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
        aria-hidden="true"
        style={{
          display: 'block',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #c8bfb6, 0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      />
      <canvas
        ref={paintRef}
        width={size}
        height={size}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      {/* Hub dot */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        width: 16,
        height: 16,
        background: '#c8bfb6',
        border: '2px solid #b0a89f',
        borderRadius: '50%',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
