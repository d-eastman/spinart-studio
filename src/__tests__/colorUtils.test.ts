import { describe, it, expect } from 'vitest'
import { hexToRgb, rgbToHex, rgbToCss, blendColors, PALETTE } from '@/utils/colorUtils'

describe('hexToRgb', () => {
  it('converts a hex string with #', () => {
    expect(hexToRgb('#ff4d6d')).toEqual({ r: 255, g: 77, b: 109 })
  })

  it('converts a hex string without #', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('handles black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('handles white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 })
  })
})

describe('rgbToHex', () => {
  it('converts RGB to hex with zero-padding', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('converts a color', () => {
    expect(rgbToHex({ r: 255, g: 77, b: 109 })).toBe('#ff4d6d')
  })

  it('converts white', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff')
  })
})

describe('rgbToCss', () => {
  it('returns rgba string with default alpha', () => {
    expect(rgbToCss({ r: 255, g: 0, b: 0 })).toBe('rgba(255,0,0,1)')
  })

  it('returns rgba string with custom alpha', () => {
    expect(rgbToCss({ r: 100, g: 200, b: 50 }, 0.5)).toBe('rgba(100,200,50,0.5)')
  })
})

describe('blendColors', () => {
  it('returns color a at t=0', () => {
    const a = { r: 255, g: 0, b: 0 }
    const b = { r: 0, g: 255, b: 0 }
    expect(blendColors(a, b, 0)).toEqual({ r: 255, g: 0, b: 0 })
  })

  it('returns color b at t=1', () => {
    const a = { r: 255, g: 0, b: 0 }
    const b = { r: 0, g: 255, b: 0 }
    expect(blendColors(a, b, 1)).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('blends at midpoint', () => {
    const a = { r: 0, g: 0, b: 0 }
    const b = { r: 100, g: 200, b: 50 }
    const result = blendColors(a, b, 0.5)
    expect(result).toEqual({ r: 50, g: 100, b: 25 })
  })
})

describe('PALETTE', () => {
  it('has 34 colors', () => {
    expect(PALETTE).toHaveLength(34)
  })

  it('each entry has hex and name', () => {
    for (const pc of PALETTE) {
      expect(pc.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(pc.name).toBeTruthy()
    }
  })

  it('has unique hex values', () => {
    const hexes = PALETTE.map(p => p.hex)
    expect(new Set(hexes).size).toBe(hexes.length)
  })
})
