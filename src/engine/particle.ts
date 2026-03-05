import type { Particle, RGB, BrushShape } from './types'
import { hexToRgb } from '@/utils/colorUtils'

let _nextId = 0

/**
 * Spawn particles at world position (wx, wy) on a wheel spinning at omega rad/s.
 * Particles inherit the wheel's surface tangential velocity at the drop point,
 * plus a random spread component.
 */
export function spawnParticles(opts: {
  wx: number
  wy: number
  cx: number
  cy: number
  count: number
  spreadRadius: number
  toolSize: number
  color: string
  omega: number
  direction: 1 | -1
  wheelRadius: number
  brushShape: BrushShape
  lowOpacity?: boolean
}): Particle[] {
  const { wx, wy, cx, cy, count, spreadRadius, toolSize, color, omega, direction, wheelRadius, brushShape, lowOpacity } = opts
  const rgb: RGB = hexToRgb(color)
  const result: Particle[] = []

  for (let i = 0; i < count; i++) {
    // Random jitter within spread radius
    const jx = (Math.random() - 0.5) * spreadRadius * 2
    const jy = (Math.random() - 0.5) * spreadRadius * 2
    const px = wx + jx
    const py = wy + jy

    // Skip particles spawned outside the wheel
    if ((px - cx) ** 2 + (py - cy) ** 2 > wheelRadius * wheelRadius) continue

    // Surface velocity of the wheel at this point (tangential)
    // v_tangential = ω × r_vec rotated 90°
    const rdx = px - cx
    const rdy = py - cy
    const surfVx = -omega * rdy * direction
    const surfVy = omega * rdx * direction

    // Random spread component
    const spreadAngle = Math.random() * Math.PI * 2
    const spreadSpeed = Math.random() * toolSize * 0.3

    const spawnR = Math.sqrt(rdx * rdx + rdy * rdy)

    result.push({
      id: _nextId++,
      x: px,
      y: py,
      vx: surfVx + Math.cos(spreadAngle) * spreadSpeed,
      vy: surfVy + Math.sin(spreadAngle) * spreadSpeed,
      radius: toolSize * (0.4 + Math.random() * 0.6) * 0.5,
      alpha: lowOpacity ? 0.2 + Math.random() * 0.3 : 0.7 + Math.random() * 0.3,
      rgb,
      age: 0,
      maxAge: 60 + Math.random() * 60,
      stuck: false,
      stuckProgress: 0,
      spawnR,
      brushShape,
    })
  }

  return result
}
