import type { Renderer, DrawParams, Particle, BrushShape, RGB } from './types'
import { rgbToCss } from '@/utils/colorUtils'

/** Draw a brush shape onto a context */
function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, shape: BrushShape, color: string) {
  switch (shape) {
    case 'hollowCircle':
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(1, r * 0.35)
      ctx.stroke()
      break
    case 'square':
      ctx.fillStyle = color
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
      break
    case 'rectangle':
      ctx.fillStyle = color
      ctx.fillRect(x - r * 1.4, y - r * 0.7, r * 2.8, r * 1.4)
      break
    case 'star':
      ctx.beginPath()
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2
        const dist = i % 2 === 0 ? r : r * 0.4
        const px = x + Math.cos(angle) * dist
        const py = y + Math.sin(angle) * dist
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      break
    case 'heart': {
      ctx.beginPath()
      const hr = r * 0.55
      ctx.moveTo(x, y + r * 0.3)
      ctx.bezierCurveTo(x, y - r * 0.4, x - r, y - r * 0.4, x - r, y + r * 0.1)
      ctx.bezierCurveTo(x - r, y + r * 0.55, x, y + r, x, y + r)
      ctx.bezierCurveTo(x, y + r, x + r, y + r * 0.55, x + r, y + r * 0.1)
      ctx.bezierCurveTo(x + r, y - r * 0.4, x, y - r * 0.4, x, y + r * 0.3)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      break
    }
    case 'triangle':
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r * 0.866, y + r * 0.5)
      ctx.lineTo(x - r * 0.866, y + r * 0.5)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      break
    case 'diamond':
      ctx.beginPath()
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r * 0.7, y)
      ctx.lineTo(x, y + r)
      ctx.lineTo(x - r * 0.7, y)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      break
    case 'plus': {
      const pw = r * 0.35
      ctx.fillStyle = color
      ctx.fillRect(x - pw, y - r, pw * 2, r * 2)
      ctx.fillRect(x - r, y - pw, r * 2, pw * 2)
      break
    }
    case 'splatter': {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2)
      ctx.fill()
      const blobs = [
        [0.7, -0.5, 0.25], [-0.6, 0.6, 0.2], [0.3, 0.8, 0.22],
        [-0.8, -0.3, 0.18], [0.9, 0.2, 0.15], [-0.2, -0.9, 0.2],
        [0.5, 0.5, 0.17], [-0.5, -0.7, 0.15],
      ]
      for (const [bx, by, br] of blobs) {
        ctx.beginPath()
        ctx.arc(x + bx * r, y + by * r, br * r, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case 'slash': {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-Math.PI / 4)
      ctx.fillStyle = color
      ctx.fillRect(-r * 0.15, -r, r * 0.3, r * 2)
      ctx.restore()
      break
    }
    case 'round':
    default:
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      break
  }
}

function drawBrushShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, p: Particle, alpha: number) {
  drawShape(ctx, x, y, r, p.brushShape, rgbToCss(p.rgb, alpha))
}

/**
 * Canvas2DRenderer
 *
 * Implements the Renderer interface using the HTML5 Canvas 2D API.
 * Suitable for up to ~500 simultaneous particles at 60 fps.
 */
export class Canvas2DRenderer implements Renderer {
  private wheelCtx: CanvasRenderingContext2D
  private paintCtx: CanvasRenderingContext2D
  private settled: HTMLCanvasElement
  private sCtx: CanvasRenderingContext2D
  private size: number

  constructor(
    wheelCanvas: HTMLCanvasElement,
    paintCanvas: HTMLCanvasElement,
    size: number,
  ) {
    this.size = size
    this.wheelCtx = wheelCanvas.getContext('2d')!
    this.paintCtx = paintCanvas.getContext('2d')!
    this.settled = document.createElement('canvas')
    this.settled.width = size
    this.settled.height = size
    this.sCtx = this.settled.getContext('2d')!
  }

  resize(size: number): void {
    this.size = size
    this.settled.width = size
    this.settled.height = size
  }

  clearSettled(): void {
    this.sCtx.clearRect(0, 0, this.size, this.size)
  }

  stampParticle(p: Particle, wheelAngle: number): void {
    const cx = this.size / 2
    const cy = this.size / 2
    const dx = p.x - cx
    const dy = p.y - cy
    const cosA = Math.cos(-wheelAngle)
    const sinA = Math.sin(-wheelAngle)
    const lx = cx + dx * cosA - dy * sinA
    const ly = cy + dx * sinA + dy * cosA

    drawBrushShape(this.sCtx, lx, ly, p.radius, p, p.alpha)
  }

  stampBrush(x: number, y: number, radius: number, shape: BrushShape, rgb: RGB, alpha: number, wheelAngle: number): void {
    const cx = this.size / 2
    const cy = this.size / 2
    const dx = x - cx
    const dy = y - cy
    const cosA = Math.cos(-wheelAngle)
    const sinA = Math.sin(-wheelAngle)
    const lx = cx + dx * cosA - dy * sinA
    const ly = cy + dx * sinA + dy * cosA

    drawShape(this.sCtx, lx, ly, radius, shape, rgbToCss(rgb, alpha))
  }

  drawFrame({ particles, wheelAngle, bgColor, size }: DrawParams): void {
    const cx = size / 2
    const cy = size / 2
    const r = size / 2
    const wCtx = this.wheelCtx
    const pCtx = this.paintCtx

    // ── Wheel canvas ─────────────────────────────────────────────────────────
    wCtx.clearRect(0, 0, size, size)
    wCtx.save()

    // Circular clip
    wCtx.beginPath()
    wCtx.arc(cx, cy, r, 0, Math.PI * 2)
    wCtx.clip()

    // Background fill
    wCtx.fillStyle = bgColor
    wCtx.fillRect(0, 0, size, size)

    // Subtle radial guide lines (rotate with wheel)
    wCtx.save()
    wCtx.strokeStyle = 'rgba(255,255,255,0.03)'
    wCtx.lineWidth = 1
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + wheelAngle
      wCtx.beginPath()
      wCtx.moveTo(cx, cy)
      wCtx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
      wCtx.stroke()
    }
    wCtx.restore()

    // Draw settled paint — rotated to match current wheel angle
    wCtx.save()
    wCtx.translate(cx, cy)
    wCtx.rotate(wheelAngle)
    wCtx.translate(-cx, -cy)
    wCtx.drawImage(this.settled, 0, 0)
    wCtx.restore()

    wCtx.restore()

    // ── Paint canvas (active in-flight particles) ─────────────────────────────
    pCtx.clearRect(0, 0, size, size)
    for (const p of particles) {
      const a = p.stuck ? p.alpha * (1 - p.stuckProgress) : p.alpha
      drawBrushShape(pCtx, p.x, p.y, p.radius, p, a)
    }
  }

  async exportBitmap({ particles, wheelAngle, bgColor, size }: DrawParams): Promise<Blob> {
    const cx = size / 2
    const cy = size / 2
    const r = size / 2

    const exp = document.createElement('canvas')
    exp.width = size
    exp.height = size
    const ectx = exp.getContext('2d')!

    ectx.beginPath()
    ectx.arc(cx, cy, r, 0, Math.PI * 2)
    ectx.clip()

    ectx.fillStyle = bgColor
    ectx.fillRect(0, 0, size, size)

    ectx.save()
    ectx.translate(cx, cy)
    ectx.rotate(wheelAngle)
    ectx.translate(-cx, -cy)
    ectx.drawImage(this.settled, 0, 0)
    ectx.restore()

    for (const p of particles) {
      drawBrushShape(ectx, p.x, p.y, p.radius, p, p.alpha)
    }

    return new Promise((resolve, reject) => {
      exp.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('toBlob returned null'))
      })
    })
  }
}
