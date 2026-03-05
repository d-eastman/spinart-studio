import { describe, it, expect } from 'vitest'
import { TOOLS, BRUSH_SHAPES, VISCOSITY_LEVELS } from '@/engine/types'
import type { ToolType, BrushShape } from '@/engine/types'

describe('TOOLS', () => {
  it('has all four tool types', () => {
    const types: ToolType[] = ['drop', 'line', 'spray', 'splash']
    for (const t of types) {
      expect(TOOLS[t]).toBeDefined()
      expect(TOOLS[t].type).toBe(t)
    }
  })

  it('drop tool has correct config', () => {
    expect(TOOLS.drop.clickCount).toBe(8)
    expect(TOOLS.drop.holdCount).toBe(2)
    expect(TOOLS.drop.label).toBe('Drop')
  })

  it('line tool has zero counts (stamps directly)', () => {
    expect(TOOLS.line.clickCount).toBe(0)
    expect(TOOLS.line.holdCount).toBe(0)
  })

  it('spray tool spawns many particles', () => {
    expect(TOOLS.spray.clickCount).toBe(15)
    expect(TOOLS.spray.holdCount).toBe(6)
  })

  it('splash tool is one-shot only', () => {
    expect(TOOLS.splash.clickCount).toBe(60)
    expect(TOOLS.splash.holdCount).toBe(0)
  })

  it('all tools have icons and labels', () => {
    for (const key of Object.keys(TOOLS) as ToolType[]) {
      expect(TOOLS[key].icon).toBeTruthy()
      expect(TOOLS[key].label).toBeTruthy()
    }
  })
})

describe('BRUSH_SHAPES', () => {
  it('has 11 shapes', () => {
    expect(BRUSH_SHAPES).toHaveLength(11)
  })

  const expectedTypes: BrushShape[] = [
    'round', 'hollowCircle', 'square', 'rectangle', 'star',
    'heart', 'triangle', 'diamond', 'plus', 'splatter', 'slash',
  ]

  it('contains all expected shape types', () => {
    const types = BRUSH_SHAPES.map(s => s.type)
    for (const t of expectedTypes) {
      expect(types).toContain(t)
    }
  })

  it('each shape has type, label, and icon', () => {
    for (const shape of BRUSH_SHAPES) {
      expect(shape.type).toBeTruthy()
      expect(shape.label).toBeTruthy()
      expect(shape.icon).toBeTruthy()
    }
  })
})

describe('VISCOSITY_LEVELS', () => {
  it('has 3 levels', () => {
    expect(VISCOSITY_LEVELS).toHaveLength(3)
  })

  it('has increasing mu values', () => {
    for (let i = 1; i < VISCOSITY_LEVELS.length; i++) {
      expect(VISCOSITY_LEVELS[i].mu).toBeGreaterThan(VISCOSITY_LEVELS[i - 1].mu)
    }
  })

  it('Water has lowest drag', () => {
    expect(VISCOSITY_LEVELS[0].label).toBe('Water')
    expect(VISCOSITY_LEVELS[0].mu).toBe(0.15)
  })

  it('Thick has highest drag', () => {
    expect(VISCOSITY_LEVELS[2].label).toBe('Thick')
    expect(VISCOSITY_LEVELS[2].mu).toBe(0.85)
  })
})
