// ─── Particle ────────────────────────────────────────────────────────────────

export interface RGB {
  r: number
  g: number
  b: number
}

export interface Particle {
  id: number
  // World-space position
  x: number
  y: number
  // World-space velocity (px/s)
  vx: number
  vy: number
  // Visual
  radius: number
  alpha: number
  rgb: RGB
  // Lifecycle
  age: number          // frames alive
  maxAge: number
  stuck: boolean       // in adhesion / fade-out phase
  stuckProgress: number // 0 → 1; stamped to bitmap at 1.0
  // Spawn distance from center — used to cap radial drift
  spawnR: number
  // Brush shape for rendering
  brushShape: BrushShape
}

// ─── Paint Mode ──────────────────────────────────────────────────────────────

export type PaintMode = 'drop' | 'brush'

// ─── Brush Shape ─────────────────────────────────────────────────────────────

export type BrushShape = 'round' | 'hollowCircle' | 'square' | 'rectangle'

export const BRUSH_SHAPES: { type: BrushShape; label: string }[] = [
  { type: 'round',        label: 'Round' },
  { type: 'hollowCircle', label: 'Ring' },
  { type: 'square',       label: 'Square' },
  { type: 'rectangle',    label: 'Rect' },
]

// ─── Tool ────────────────────────────────────────────────────────────────────

export type ToolType = 'drip' | 'stream' | 'pour' | 'splash'

export interface ToolConfig {
  type: ToolType
  /** Particles spawned on initial click */
  clickCount: number
  /** Particles spawned per frame while held */
  holdCount: number
  /** Default drop radius (px) */
  defaultSize: number
  label: string
  icon: string
}

export const TOOLS: Record<ToolType, ToolConfig> = {
  drip:   { type: 'drip',   clickCount: 8,  holdCount: 2, defaultSize: 6,  label: 'Drip',   icon: '💧' },
  stream: { type: 'stream', clickCount: 4,  holdCount: 1, defaultSize: 3,  label: 'Stream', icon: '〰️' },
  pour:   { type: 'pour',   clickCount: 20, holdCount: 3, defaultSize: 10, label: 'Pour',   icon: '🫗' },
  splash: { type: 'splash', clickCount: 60, holdCount: 0, defaultSize: 16, label: 'Splash', icon: '💦' },
}

// ─── Viscosity ───────────────────────────────────────────────────────────────

export interface ViscosityLevel {
  label: string
  /** Drag coefficient μ — applied as dv/dt = -μ * DRAG_SCALE * v */
  mu: number
}

export const VISCOSITY_LEVELS: ViscosityLevel[] = [
  { label: 'Water',   mu: 0.15 },
  { label: 'Acrylic', mu: 0.40 },
  { label: 'Thick',   mu: 0.85 },
]

// ─── Renderer interface ──────────────────────────────────────────────────────
// Keeping this as an interface from day one lets us swap Canvas2D → WebGL
// without touching any React components.

export interface DrawParams {
  particles: Particle[]
  wheelAngle: number   // radians
  bgColor: string
  size: number
}

export interface Renderer {
  /** Composite one full frame onto the target canvas */
  drawFrame(params: DrawParams): void
  /** Stamp a stuck particle into the settled bitmap (wheel-local coords) */
  stampParticle(p: Particle, wheelAngle: number): void
  /** Wipe the settled bitmap */
  clearSettled(): void
  /** Produce a PNG blob of the current state */
  exportBitmap(params: DrawParams): Promise<Blob>
  /** Paint directly onto the settled bitmap at a screen position (brush mode) */
  stampBrush(x: number, y: number, radius: number, shape: BrushShape, rgb: RGB, alpha: number, wheelAngle: number): void
  /** Resize the renderer (e.g. on window resize) */
  resize(size: number): void
}

// ─── Physics worker messages ─────────────────────────────────────────────────

export type WorkerInMessage =
  | { type: 'TICK'; dt: number; omega: number; direction: 1 | -1; viscosity: number }
  | { type: 'SPAWN'; particles: Particle[] }
  | { type: 'CLEAR' }

export type WorkerOutMessage =
  | { type: 'FRAME'; particles: Particle[]; wheelAngle: number }
  | { type: 'STAMP'; particle: Particle; wheelAngle: number }
