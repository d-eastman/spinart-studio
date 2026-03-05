import type { Particle } from './types'

/** Scale factor applied to μ drag coefficient */
const DRAG_SCALE = 60

/** Minimum surface friction — even "water" paint grips the wheel */
const BASE_FRICTION = 6

/** Scale factor to tame centrifugal force so paint doesn't instantly fly to the edge */
const CENTRIFUGAL_SCALE = 0.000004

/**
 * Apply one Euler integration step to a particle.
 *
 * Forces modeled:
 *   Centrifugal  — ω² · r · (1 − viscosity·0.5)  radially outward
 *   Viscous drag — −μ · DRAG_SCALE · v
 *
 * Phase 2 TODO:
 *   Coriolis     — −2ω × v_local  (deflects tendrils laterally)
 *   Surface tension (tendril formation at low viscosity)
 */
export function integrateParticle(
  p: Particle,
  dt: number,
  cx: number,
  cy: number,
  omega: number,
  viscosity: number,
  direction: number,
): void {
  const dx = p.x - cx
  const dy = p.y - cy
  const r = Math.sqrt(dx * dx + dy * dy)

  // Wheel surface velocity at this particle's position
  const surfVx = -omega * dy * direction
  const surfVy = omega * dx * direction

  if (r > 0) {
    const rx = dx / r
    const ry = dy / r

    // Centrifugal acceleration (outward)
    const centAcc = omega * omega * r * (1 - viscosity * 0.5) * CENTRIFUGAL_SCALE
    p.vx += rx * centAcc * dt
    p.vy += ry * centAcc * dt
  }

  // Viscous drag — relative to the wheel surface, not absolute
  // This is what makes paint "stick" to the spinning wheel
  const mu = BASE_FRICTION + viscosity * DRAG_SCALE
  const relVx = p.vx - surfVx
  const relVy = p.vy - surfVy
  p.vx -= mu * relVx * dt
  p.vy -= mu * relVy * dt

  // Integrate position
  p.x += p.vx * dt
  p.y += p.vy * dt

  p.age++
}

/** Adhesion threshold — lower viscosity → particles flow more before sticking */
export function adhesionThreshold(viscosity: number): number {
  return 2.0 + viscosity * 8
}

export function particleSpeed(p: Particle): number {
  return Math.sqrt(p.vx * p.vx + p.vy * p.vy)
}

/** Speed of a particle relative to the wheel surface at its position */
export function particleRelativeSpeed(
  p: Particle, cx: number, cy: number, omega: number, direction: number,
): number {
  const surfVx = -omega * (p.y - cy) * direction
  const surfVy = omega * (p.x - cx) * direction
  const relVx = p.vx - surfVx
  const relVy = p.vy - surfVy
  return Math.sqrt(relVx * relVx + relVy * relVy)
}

export function isInsideWheel(x: number, y: number, cx: number, cy: number, r: number): boolean {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}
