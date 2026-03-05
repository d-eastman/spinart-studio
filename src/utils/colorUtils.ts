import type { RGB } from '@/engine/types'

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function rgbToCss({ r, g, b }: RGB, alpha = 1): string {
  return `rgba(${r},${g},${b},${alpha})`
}

/** Simple additive blend — used for rough wet-paint preview.
 *  Phase 2: replace with Kubelka-Munk subtractive model. */
export function blendColors(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

export const PALETTE: string[] = [
  // Reds & pinks
  '#ff4d6d', '#e63946', '#d84373', '#ff006e',
  // Oranges
  '#f77f00', '#fb8500', '#ff9e00',
  // Yellows
  '#ffd166', '#e9c46a', '#ffea00',
  // Greens
  '#06d6a0', '#2dc653', '#007f5f', '#80b918',
  // Blues
  '#118ab2', '#0077b6', '#00b4d8', '#48cae4',
  // Purples & violets
  '#9b5de5', '#7209b7', '#560bad', '#b5179e',
  // Browns & earth tones
  '#a47148', '#6f4e37',
  // Neutrals & metallics
  '#ffffff', '#c0c0c0', '#808080', '#2d2222',
  // Teals & cyans
  '#a8dadc', '#40e0d0', '#20b2aa',
  // Pastels
  '#ffafcc', '#bde0fe', '#caffbf',
]
