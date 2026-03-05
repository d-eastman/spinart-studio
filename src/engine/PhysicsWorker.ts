/**
 * PhysicsWorker.ts
 *
 * Runs the particle simulation entirely off the main thread.
 * The main thread sends TICK messages each animation frame;
 * the worker responds with FRAME (updated particles) and STAMP
 * messages (for particles that have just adhered to the wheel).
 *
 * Message protocol: see WorkerInMessage / WorkerOutMessage in types.ts
 */

import type { Particle, WorkerInMessage, WorkerOutMessage } from './types'
import { integrateParticle, adhesionThreshold, particleRelativeSpeed, isInsideWheel } from './forces'

// Wheel geometry — sent once via INIT or derived from first TICK
// For now we assume a square canvas; size is communicated via INIT.
let CX = 300
let CY = 300
let WHEEL_RADIUS = 300
let wheelAngle = 0

let particles: Particle[] = []

self.onmessage = (e: MessageEvent<WorkerInMessage>) => {
  const msg = e.data

  if (msg.type === 'INIT') {
    const m = msg as WorkerInMessage & { type: 'INIT' }
    CX = m.size / 2
    CY = m.size / 2
    WHEEL_RADIUS = m.size / 2
    wheelAngle = 0
    return
  }

  if (msg.type === 'SPAWN') {
    particles.push(...msg.particles)
    return
  }

  if (msg.type === 'CLEAR') {
    particles = []
    wheelAngle = 0
    return
  }

  if (msg.type === 'TICK') {
    const { dt, omega, direction, viscosity } = msg

    // Advance wheel angle
    wheelAngle += omega * dt * direction

    const stickQueue: Particle[] = []
    const surviving: Particle[] = []
    const threshold = adhesionThreshold(viscosity)

    for (const p of particles) {
      if (p.stuck) {
        // Already stamped on the frame it stuck — discard
        continue
      }

      integrateParticle(p, dt, CX, CY, omega, viscosity, direction)

      const speed = particleRelativeSpeed(p, CX, CY, omega, direction)
      const outside = !isInsideWheel(p.x, p.y, CX, CY, WHEEL_RADIUS)
      const expired = p.age > p.maxAge
      const currentR = Math.sqrt((p.x - CX) ** 2 + (p.y - CY) ** 2)
      const driftedTooFar = currentR - p.spawnR > 30

      if (speed < threshold || outside || expired || driftedTooFar) {
        // Clamp to wheel edge if outside
        if (outside) {
          const dx = p.x - CX
          const dy = p.y - CY
          const r = Math.sqrt(dx * dx + dy * dy)
          if (r > 0) {
            p.x = CX + (dx / r) * (WHEEL_RADIUS - 1)
            p.y = CY + (dy / r) * (WHEEL_RADIUS - 1)
          }
        }
        // Stamp immediately — no fade-out delay
        p.stuck = true
        stickQueue.push({ ...p })
      } else {
        surviving.push(p)
      }
    }

    particles = surviving

    // Send stamp messages first so main thread can update bitmap
    for (const p of stickQueue) {
      const out: WorkerOutMessage = { type: 'STAMP', particle: p, wheelAngle }
      self.postMessage(out)
    }

    // Send updated particle list for rendering
    const frame: WorkerOutMessage = { type: 'FRAME', particles: [...particles], wheelAngle }
    self.postMessage(frame)
  }
}
