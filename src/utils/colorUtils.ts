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
  '#ff4d6d', '#ffd166', '#06d6a0', '#118ab2', '#9b5de5',
  '#f77f00', '#ffffff', '#a8dadc', '#e9c46a', '#264653',
]
