import { describe, it, expect } from 'vitest'
import {
  integrateParticle,
  adhesionThreshold,
  particleSpeed,
  particleRelativeSpeed,
  isInsideWheel,
} from '@/engine/forces'
import type { Particle } from '@/engine/types'

function makeParticle(overrides: Partial<Particle> = {}): Particle {
  return {
    id: 0,
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 5,
    alpha: 1,
    rgb: { r: 255, g: 0, b: 0 },
    age: 0,
    maxAge: 120,
    stuck: false,
    stuckProgress: 0,
    spawnR: 0,
    brushShape: 'round',
    ...overrides,
  }
}

describe('integrateParticle', () => {
  it('increments age', () => {
    const p = makeParticle()
    integrateParticle(p, 1 / 60, 300, 300, 1, 0.4, 1)
    expect(p.age).toBe(1)
  })

  it('updates position based on velocity', () => {
    const p = makeParticle({ x: 350, y: 300, vx: 60, vy: 0 })
    integrateParticle(p, 1 / 60, 300, 300, 0, 0.4, 1)
    // With omega=0, there's drag that changes velocity, but position should still move
    expect(p.x).not.toBe(350)
  })

  it('applies centrifugal force away from center', () => {
    const p = makeParticle({ x: 350, y: 300, vx: 0, vy: 0 })
    const omega = 5
    integrateParticle(p, 1 / 60, 300, 300, omega, 0.4, 1)
    // Centrifugal pushes radially outward (positive x from center)
    // After drag and centrifugal, particle should have moved outward
    expect(p.vx).not.toBe(0)
  })

  it('applies viscous drag relative to wheel surface', () => {
    // Particle at rest while wheel spins — drag should pull it along
    const p = makeParticle({ x: 350, y: 300, vx: 0, vy: 0 })
    integrateParticle(p, 1 / 60, 300, 300, 2, 0.4, 1)
    // Drag relative to surface velocity should accelerate the particle
    expect(p.vy).not.toBe(0)
  })

  it('handles particle at center (r=0)', () => {
    const p = makeParticle({ x: 300, y: 300 })
    // Should not throw when r=0
    integrateParticle(p, 1 / 60, 300, 300, 5, 0.4, 1)
    expect(p.age).toBe(1)
  })

  it('direction affects surface velocity', () => {
    const p1 = makeParticle({ x: 350, y: 300, vx: 0, vy: 0 })
    const p2 = makeParticle({ x: 350, y: 300, vx: 0, vy: 0 })
    integrateParticle(p1, 1 / 60, 300, 300, 2, 0.4, 1)
    integrateParticle(p2, 1 / 60, 300, 300, 2, 0.4, -1)
    // Different directions should produce opposite tangential drag effects
    expect(Math.sign(p1.vy)).not.toBe(Math.sign(p2.vy))
  })

  it('higher viscosity increases drag', () => {
    const pLow = makeParticle({ x: 350, y: 300, vx: 10, vy: 0 })
    const pHigh = makeParticle({ x: 350, y: 300, vx: 10, vy: 0 })
    integrateParticle(pLow, 1 / 60, 300, 300, 0, 0.15, 1)
    integrateParticle(pHigh, 1 / 60, 300, 300, 0, 0.85, 1)
    // Higher viscosity = more drag = velocity should be reduced more
    expect(Math.abs(pHigh.vx)).toBeLessThan(Math.abs(pLow.vx))
  })
})

describe('adhesionThreshold', () => {
  it('returns base + viscosity * 8', () => {
    expect(adhesionThreshold(0)).toBe(2.0)
    expect(adhesionThreshold(0.5)).toBe(6.0)
    expect(adhesionThreshold(1)).toBe(10.0)
  })
})

describe('particleSpeed', () => {
  it('returns magnitude of velocity', () => {
    const p = makeParticle({ vx: 3, vy: 4 })
    expect(particleSpeed(p)).toBe(5)
  })

  it('returns 0 for stationary particle', () => {
    const p = makeParticle({ vx: 0, vy: 0 })
    expect(particleSpeed(p)).toBe(0)
  })
})

describe('particleRelativeSpeed', () => {
  it('returns speed relative to wheel surface', () => {
    // Particle at (350, 300) on wheel centered at (300, 300)
    // Surface velocity at this point: surfVx = -omega*(y-cy)*dir = 0, surfVy = omega*(x-cx)*dir = 2*50*1 = 100
    const p = makeParticle({ x: 350, y: 300, vx: 0, vy: 100 })
    const speed = particleRelativeSpeed(p, 300, 300, 2, 1)
    // Particle matches surface velocity, so relative speed ≈ 0
    expect(speed).toBeCloseTo(0)
  })

  it('returns absolute speed when wheel is stationary', () => {
    const p = makeParticle({ vx: 3, vy: 4 })
    const speed = particleRelativeSpeed(p, 300, 300, 0, 1)
    expect(speed).toBe(5)
  })
})

describe('isInsideWheel', () => {
  it('returns true for point at center', () => {
    expect(isInsideWheel(300, 300, 300, 300, 200)).toBe(true)
  })

  it('returns true for point on boundary', () => {
    expect(isInsideWheel(500, 300, 300, 300, 200)).toBe(true)
  })

  it('returns false for point outside', () => {
    expect(isInsideWheel(501, 300, 300, 300, 200)).toBe(false)
  })

  it('returns true for point inside', () => {
    expect(isInsideWheel(350, 350, 300, 300, 200)).toBe(true)
  })
})
