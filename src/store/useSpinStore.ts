import { create } from 'zustand'
import type { ToolType, BrushShape, PaintMode } from '@/engine/types'
import { VISCOSITY_LEVELS } from '@/engine/types'
import { PALETTE } from '@/utils/colorUtils'

interface SpinState {
  // Color
  color: string
  setColor: (color: string) => void

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

  // Viscosity
  viscosityIndex: number
  setViscosityIndex: (i: number) => void
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
}

function rpmToOmega(rpm: number): number {
  return (rpm / 60) * Math.PI * 2
}

export const useSpinStore = create<SpinState>((set, get) => ({
  // Color
  color: PALETTE[0],
  setColor: (color) => set({ color }),

  // Paint mode
  paintMode: 'drop',
  setPaintMode: (paintMode) => set({ paintMode }),

  // Tool
  toolType: 'drip',
  setToolType: (toolType) => set({ toolType }),

  // Drop size
  toolSize: 6,
  setToolSize: (toolSize) => set({ toolSize }),

  // Brush shape
  brushShape: 'round',
  setBrushShape: (brushShape) => set({ brushShape }),

  // Viscosity
  viscosityIndex: 0,
  setViscosityIndex: (viscosityIndex) => set({ viscosityIndex, viscosity: VISCOSITY_LEVELS[viscosityIndex].mu }),
  viscosity: VISCOSITY_LEVELS[0].mu,

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
}))
