import { create } from 'zustand'
import type { ToolType, BrushShape, PaintMode } from '@/engine/types'
import { PALETTE } from '@/utils/colorUtils'

interface SpinState {
  // Color
  color: string
  setColor: (color: string) => void
  customColor: string
  setCustomColor: (color: string) => void

  // Paint mode
  paintMode: PaintMode
  setPaintMode: (m: PaintMode) => void

  // Tool
  toolType: ToolType
  setToolType: (t: ToolType) => void

  // Drop size (px radius)
  toolSize: number
  setToolSize: (s: number) => void

  // Brush shape
  brushShape: BrushShape
  setBrushShape: (s: BrushShape) => void

  // Viscosity (fixed — Acrylic default)
  viscosity: number

  // Wheel spin
  rpm: number
  setRpm: (rpm: number) => void
  spinning: boolean
  setSpinning: (s: boolean) => void
  direction: 1 | -1
  setDirection: (d: 1 | -1) => void
  omega: number  // rad/s

  // Background
  bgColor: string
  setBgColor: (c: string) => void

  // Actions
  clearSignal: number   // increment to trigger clear
  triggerClear: () => void
  saveSignal: number
  triggerSave: () => void
  saveGifSignal: number
  triggerSaveGif: () => void
}

function rpmToOmega(rpm: number): number {
  return (rpm / 60) * Math.PI * 2
}

export const useSpinStore = create<SpinState>((set, get) => ({
  // Color
  color: PALETTE[0].hex,
  setColor: (color) => set({ color }),
  customColor: '#6b21a8',
  setCustomColor: (color) => set({ color, customColor: color }),

  // Paint mode
  paintMode: 'drop',
  setPaintMode: (paintMode) => set({ paintMode }),

  // Tool
  toolType: 'drop',
  setToolType: (toolType) => set({ toolType }),

  // Drop size
  toolSize: 20,
  setToolSize: (toolSize) => set({ toolSize }),

  // Brush shape
  brushShape: 'round',
  setBrushShape: (brushShape) => set({ brushShape }),

  // Viscosity (fixed — Acrylic)
  viscosity: 0.12,

  // Spin
  rpm: 25,
  setRpm: (rpm) => set({ rpm, omega: rpmToOmega(rpm) }),
  spinning: true,
  setSpinning: (spinning) => set({ spinning }),
  direction: 1,
  setDirection: (direction) => set({ direction }),
  omega: rpmToOmega(25),

  // Background
  bgColor: '#faf7f4',
  setBgColor: (bgColor) => set({ bgColor }),

  // Signals
  clearSignal: 0,
  triggerClear: () => set((s) => ({ clearSignal: s.clearSignal + 1 })),
  saveSignal: 0,
  triggerSave: () => set((s) => ({ saveSignal: s.saveSignal + 1 })),
  saveGifSignal: 0,
  triggerSaveGif: () => set((s) => ({ saveGifSignal: s.saveGifSignal + 1 })),
}))
