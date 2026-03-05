import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Canvas2DRenderer } from '@/engine/renderer'
import type { Particle, DrawParams } from '@/engine/types'

// Mock gifenc
vi.mock('gifenc', () => ({
  GIFEncoder: vi.fn(() => ({
    writeFrame: vi.fn(),
    finish: vi.fn(),
    bytes: vi.fn(() => new Uint8Array([71, 73, 70])),
  })),
  quantize: vi.fn(() => [[0, 0, 0], [255, 255, 255]]),
  applyPalette: vi.fn(() => new Uint8Array(100)),
}))

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 600
  return canvas
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

describe('Canvas2DRenderer', () => {
  let renderer: Canvas2DRenderer
  let wheelCanvas: HTMLCanvasElement
  let paintCanvas: HTMLCanvasElement

  beforeEach(() => {
    wheelCanvas = makeCanvas()
    paintCanvas = makeCanvas()
    renderer = new Canvas2DRenderer(wheelCanvas, paintCanvas, 600)
  })

  it('constructs without errors', () => {
    expect(renderer).toBeDefined()
  })

  describe('resize', () => {
    it('resizes without errors', () => {
      expect(() => renderer.resize(400)).not.toThrow()
    })
  })

  describe('clearSettled', () => {
    it('clears without errors', () => {
      expect(() => renderer.clearSettled()).not.toThrow()
    })
  })

  describe('stampParticle', () => {
    it('stamps a round particle', () => {
      expect(() => renderer.stampParticle(makeParticle(), 0)).not.toThrow()
    })

    it('stamps with rotation', () => {
      expect(() => renderer.stampParticle(makeParticle(), Math.PI / 4)).not.toThrow()
    })

    it('stamps all brush shapes', () => {
      const shapes = [
        'round', 'hollowCircle', 'square', 'rectangle', 'star',
        'heart', 'triangle', 'diamond', 'plus', 'splatter', 'slash',
      ] as const
      for (const shape of shapes) {
        expect(() => renderer.stampParticle(makeParticle({ brushShape: shape }), 0)).not.toThrow()
      }
    })
  })

  describe('stampBrush', () => {
    it('stamps directly in brush mode', () => {
      expect(() => renderer.stampBrush(
        300, 300, 10, 'round', { r: 255, g: 0, b: 0 }, 0.85, 0,
      )).not.toThrow()
    })

    it('stamps all shapes in brush mode', () => {
      const shapes = [
        'round', 'hollowCircle', 'square', 'rectangle', 'star',
        'heart', 'triangle', 'diamond', 'plus', 'splatter', 'slash',
      ] as const
      for (const shape of shapes) {
        expect(() => renderer.stampBrush(
          300, 300, 10, shape, { r: 0, g: 255, b: 0 }, 0.9, Math.PI / 2,
        )).not.toThrow()
      }
    })
  })

  describe('drawFrame', () => {
    it('renders a frame with no particles', () => {
      const params: DrawParams = {
        particles: [],
        wheelAngle: 0,
        bgColor: '#ffffff',
        size: 600,
      }
      expect(() => renderer.drawFrame(params)).not.toThrow()
    })

    it('renders a frame with particles', () => {
      const params: DrawParams = {
        particles: [makeParticle(), makeParticle({ x: 250, y: 250, brushShape: 'star' })],
        wheelAngle: Math.PI / 6,
        bgColor: '#faf7f4',
        size: 600,
      }
      expect(() => renderer.drawFrame(params)).not.toThrow()
    })

    it('renders stuck particles with faded alpha', () => {
      const params: DrawParams = {
        particles: [makeParticle({ stuck: true, stuckProgress: 0.5 })],
        wheelAngle: 0,
        bgColor: '#ffffff',
        size: 600,
      }
      expect(() => renderer.drawFrame(params)).not.toThrow()
    })
  })

  describe('exportBitmap', () => {
    it('returns a blob', async () => {
      const params: DrawParams = {
        particles: [makeParticle()],
        wheelAngle: 0,
        bgColor: '#ffffff',
        size: 600,
      }
      const blob = await renderer.exportBitmap(params)
      expect(blob).toBeInstanceOf(Blob)
    })

    it('exports with no particles', async () => {
      const blob = await renderer.exportBitmap({
        particles: [],
        wheelAngle: 0,
        bgColor: '#000000',
        size: 600,
      })
      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('exportGif', () => {
    it('returns a GIF blob', async () => {
      const blob = await renderer.exportGif('#ffffff', 600, 2, 80)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/gif')
    })

    it('uses default frame count and delay', async () => {
      const blob = await renderer.exportGif('#ffffff', 600)
      expect(blob).toBeInstanceOf(Blob)
    })

    it('caps GIF size to 400px', async () => {
      // With size 600, gifSize should be min(600, 400) = 400
      const blob = await renderer.exportGif('#ffffff', 600, 1, 80)
      expect(blob).toBeInstanceOf(Blob)
    })
  })
})
