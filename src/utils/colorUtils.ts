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

export interface PaletteColor {
  hex: string
  name: string
}

export const PALETTE: PaletteColor[] = [
  // Reds & pinks
  { hex: '#ff4d6d', name: 'Rose' },
  { hex: '#e63946', name: 'Red' },
  { hex: '#d84373', name: 'Raspberry' },
  { hex: '#ff006e', name: 'Hot Pink' },
  // Oranges
  { hex: '#f77f00', name: 'Orange' },
  { hex: '#fb8500', name: 'Tangerine' },
  { hex: '#ff9e00', name: 'Amber' },
  // Yellows
  { hex: '#ffd166', name: 'Sunflower' },
  { hex: '#e9c46a', name: 'Gold' },
  { hex: '#ffea00', name: 'Lemon' },
  // Greens
  { hex: '#06d6a0', name: 'Mint' },
  { hex: '#2dc653', name: 'Green' },
  { hex: '#007f5f', name: 'Forest' },
  { hex: '#80b918', name: 'Lime' },
  // Blues
  { hex: '#118ab2', name: 'Ocean' },
  { hex: '#0077b6', name: 'Blue' },
  { hex: '#00b4d8', name: 'Sky' },
  { hex: '#48cae4', name: 'Powder' },
  // Purples & violets
  { hex: '#9b5de5', name: 'Violet' },
  { hex: '#7209b7', name: 'Purple' },
  { hex: '#560bad', name: 'Indigo' },
  { hex: '#b5179e', name: 'Magenta' },
  // Browns & earth tones
  { hex: '#a47148', name: 'Caramel' },
  { hex: '#6f4e37', name: 'Coffee' },
  // Neutrals & metallics
  { hex: '#ffffff', name: 'White' },
  { hex: '#c0c0c0', name: 'Silver' },
  { hex: '#808080', name: 'Grey' },
  { hex: '#2d2222', name: 'Black' },
  // Teals & cyans
  { hex: '#a8dadc', name: 'Ice' },
  { hex: '#40e0d0', name: 'Turquoise' },
  { hex: '#20b2aa', name: 'Teal' },
  // Pastels
  { hex: '#ffafcc', name: 'Blush' },
  { hex: '#bde0fe', name: 'Baby Blue' },
  { hex: '#caffbf', name: 'Pistachio' },
]
