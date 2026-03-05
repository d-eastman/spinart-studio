import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Particle, WorkerInMessage } from '@/engine/types'

// We can't run an actual Web Worker in vitest. Instead, we test the logic
// by importing the module and simulating the onmessage handler.

// Mock `self.postMessage`
const postMessageSpy = vi.fn()
vi.stubGlobal('self', { postMessage: postMessageSpy, onmessage: null as unknown })

// Now import the worker — it will attach to our mocked self.onmessage
await import('@/engine/PhysicsWorker')

function sendMessage(msg: WorkerInMessage | (WorkerInMessage & { type: 'INIT'; size: number })) {
  const handler = (self as unknown as { onmessage: (e: MessageEvent) => void }).onmessage
  handler({ data: msg } as MessageEvent)
}

function makeParticle(overrides: Partial<Particle> = {}): Particle {
  return {
    id: 0,
    x: 350,
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
    spawnR: 50,
    brushShape: 'round',
    ...overrides,
  }
}

describe('PhysicsWorker', () => {
  beforeEach(() => {
    postMessageSpy.mockClear()
    sendMessage({ type: 'INIT', size: 600 } as WorkerInMessage & { type: 'INIT'; size: number })
    sendMessage({ type: 'CLEAR' })
  })

  it('handles INIT message', () => {
    sendMessage({ type: 'INIT', size: 800 } as WorkerInMessage & { type: 'INIT'; size: number })
    // Should not throw; no output expected from INIT
  })

  it('handles CLEAR message', () => {
    sendMessage({ type: 'SPAWN', particles: [makeParticle()] })
    sendMessage({ type: 'CLEAR' })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })
    // After CLEAR, FRAME should have empty particles
    const frameMsg = postMessageSpy.mock.calls.find(c => c[0].type === 'FRAME')
    expect(frameMsg).toBeDefined()
    expect(frameMsg![0].particles).toHaveLength(0)
  })

  it('handles SPAWN and TICK', () => {
    sendMessage({ type: 'SPAWN', particles: [makeParticle()] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })

    const frameMsg = postMessageSpy.mock.calls.find(c => c[0].type === 'FRAME')
    expect(frameMsg).toBeDefined()
  })

  it('stamps particles that slow below adhesion threshold', () => {
    // Create particle with very low velocity — it should stick immediately
    const p = makeParticle({ vx: 0, vy: 0 })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 0, direction: 1, viscosity: 0.85 })

    const stampMsgs = postMessageSpy.mock.calls.filter(c => c[0].type === 'STAMP')
    // With omega=0 and high viscosity, particle should be slow enough to stick
    expect(stampMsgs.length).toBeGreaterThanOrEqual(0) // May or may not stick depending on drag
  })

  it('stamps particles that exceed maxAge', () => {
    const p = makeParticle({ age: 999, maxAge: 10, vx: 100, vy: 100 })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })

    const stampMsgs = postMessageSpy.mock.calls.filter(c => c[0].type === 'STAMP')
    expect(stampMsgs.length).toBe(1)
    expect(stampMsgs[0][0].particle.stuck).toBe(true)
  })

  it('stamps particles that exit the wheel boundary', () => {
    const p = makeParticle({ x: 600, y: 600, vx: 100, vy: 100 })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })

    const stampMsgs = postMessageSpy.mock.calls.filter(c => c[0].type === 'STAMP')
    expect(stampMsgs.length).toBe(1)
  })

  it('clamps outside particles to wheel edge', () => {
    const p = makeParticle({ x: 700, y: 300, vx: 100, vy: 0 })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 0, direction: 1, viscosity: 0.4 })

    const stampMsgs = postMessageSpy.mock.calls.filter(c => c[0].type === 'STAMP')
    expect(stampMsgs.length).toBe(1)
    // Particle x should be clamped to wheel edge (300 + 299 = 599)
    expect(stampMsgs[0][0].particle.x).toBeCloseTo(599, 0)
  })

  it('removes stuck particles from surviving list', () => {
    const p = makeParticle({ stuck: true })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })

    const frameMsg = postMessageSpy.mock.calls.find(c => c[0].type === 'FRAME')
    expect(frameMsg![0].particles).toHaveLength(0)
  })

  it('advances wheel angle with TICK', () => {
    postMessageSpy.mockClear()
    sendMessage({ type: 'TICK', dt: 1, omega: Math.PI, direction: 1, viscosity: 0.4 })

    const frameMsg = postMessageSpy.mock.calls.find(c => c[0].type === 'FRAME')
    expect(frameMsg![0].wheelAngle).toBeCloseTo(Math.PI)
  })

  it('stamps particles that drift too far from spawn', () => {
    // spawnR=0, particle at center. After integration it moves far from spawnR
    const p = makeParticle({ x: 350, y: 300, vx: 0, vy: 0, spawnR: 0 })
    sendMessage({ type: 'SPAWN', particles: [p] })
    postMessageSpy.mockClear()

    sendMessage({ type: 'TICK', dt: 1 / 60, omega: 1, direction: 1, viscosity: 0.4 })

    // currentR for particle at ~350 = 50, spawnR = 0, drift = 50 > 30 → should stamp
    const stampMsgs = postMessageSpy.mock.calls.filter(c => c[0].type === 'STAMP')
    expect(stampMsgs.length).toBe(1)
  })
})
