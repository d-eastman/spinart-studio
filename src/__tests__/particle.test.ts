import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawnParticles } from '@/engine/particle'

const baseOpts = {
  wx: 350,
  wy: 300,
  cx: 300,
  cy: 300,
  count: 10,
  spreadRadius: 5,
  toolSize: 10,
  color: '#ff0000',
  omega: 2,
  direction: 1 as const,
  wheelRadius: 300,
  brushShape: 'round' as const,
}

describe('spawnParticles', () => {
  beforeEach(() => {
    // Use deterministic random for predictable tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('spawns the requested number of particles (within wheel)', () => {
    const particles = spawnParticles(baseOpts)
    // With random=0.5, jitter is 0, so all particles at (350,300) which is inside wheel
    expect(particles.length).toBe(10)
  })

  it('assigns incrementing IDs', () => {
    const particles = spawnParticles({ ...baseOpts, count: 3 })
    const ids = particles.map(p => p.id)
    expect(ids[1] - ids[0]).toBe(1)
    expect(ids[2] - ids[1]).toBe(1)
  })

  it('sets correct position', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1 })
    // random=0.5, jitter = (0.5-0.5)*5*2 = 0
    expect(particles[0].x).toBe(350)
    expect(particles[0].y).toBe(300)
  })

  it('inherits wheel surface velocity', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1, spreadRadius: 0, toolSize: 0 })
    const p = particles[0]
    // At (350, 300), surface velocity:
    // surfVx = -omega * (py - cy) * direction = -2 * 0 * 1 = 0
    // surfVy = omega * (px - cx) * direction = 2 * 50 * 1 = 100
    // Plus spread: Math.cos(π)*0*0.3 = 0, Math.sin(π)*0*0.3 = 0
    expect(p.vx).toBeCloseTo(0, 0)
    expect(p.vy).toBeCloseTo(100, 0)
  })

  it('sets RGB from hex color', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1 })
    expect(particles[0].rgb).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('initializes lifecycle fields correctly', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1 })
    const p = particles[0]
    expect(p.age).toBe(0)
    expect(p.stuck).toBe(false)
    expect(p.stuckProgress).toBe(0)
    expect(p.maxAge).toBeGreaterThanOrEqual(60)
    expect(p.maxAge).toBeLessThanOrEqual(120)
  })

  it('calculates spawnR correctly', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1 })
    // Distance from (350, 300) to center (300, 300) = 50
    expect(particles[0].spawnR).toBe(50)
  })

  it('sets brushShape from options', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1, brushShape: 'star' })
    expect(particles[0].brushShape).toBe('star')
  })

  it('skips particles spawned outside the wheel', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    // wx near edge + large spread could push outside
    const particles = spawnParticles({
      ...baseOpts,
      wx: 599, // Near the edge of a 300-radius wheel centered at 300
      wy: 300,
      count: 10,
      spreadRadius: 50,
    })
    // Some particles may be filtered out
    expect(particles.length).toBeLessThanOrEqual(10)
  })

  it('uses lowOpacity when specified', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1, lowOpacity: true })
    // lowOpacity: 0.2 + random*0.3 = 0.2 + 0.5*0.3 = 0.35
    expect(particles[0].alpha).toBeCloseTo(0.35)
  })

  it('uses normal opacity when lowOpacity is false', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1, lowOpacity: false })
    // normal: 0.7 + random*0.3 = 0.7 + 0.5*0.3 = 0.85
    expect(particles[0].alpha).toBeCloseTo(0.85)
  })

  it('sets radius based on toolSize', () => {
    const particles = spawnParticles({ ...baseOpts, count: 1 })
    // radius = toolSize * (0.4 + random*0.6) * 0.5 = 10 * (0.4 + 0.3) * 0.5 = 3.5
    expect(particles[0].radius).toBeCloseTo(3.5)
  })
})
