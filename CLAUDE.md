# SpinArt Studio — CLAUDE.md

## Project Overview

SpinArt Studio is a browser-based spin-art painting application built with React, TypeScript,
and Vite. It simulates the physical forces of a spinning wheel with virtual paint. Users apply
paint using multiple tools and brush shapes onto a rotating canvas, and the physics engine models
centrifugal force, viscous drag, and surface adhesion to produce realistic spin-art patterns.
Finished pieces can be saved as PNG images or animated spinning GIFs.

---

## Architecture

### Current Implementation

React + Vite + TypeScript SPA with Canvas 2D rendering and Web Worker physics.

```
src/
├── main.tsx                    — App entry point
├── App.tsx                     — Layout: TopBar, side panels, wheel, speed controls
├── gifenc.d.ts                 — Type declarations for gifenc library
├── index.css                   — Global styles, CSS variables, tooltips
├── components/
│   ├── ColorPalette.tsx        — 32-color swatch grid + custom picker
│   ├── ToolPicker.tsx          — Tool, shape, and size controls
│   ├── SpeedControls.tsx       — RPM slider, CW/CCW/STOP buttons
│   └── WheelCanvas.tsx         — Dual canvas + custom cursors + pointer events
├── engine/
│   ├── types.ts                — All shared types, tool/shape/viscosity configs
│   ├── renderer.ts             — Canvas2DRenderer: draw, stamp, export PNG/GIF
│   ├── particle.ts             — Particle spawn logic
│   ├── forces.ts               — Centrifugal, drag, adhesion physics
│   ├── useSpinEngine.ts        — Central hook: worker, RAF loop, pointer handling
│   └── PhysicsWorker.ts        — Web Worker for physics simulation
├── store/
│   └── useSpinStore.ts         — Zustand state: color, tool, speed, signals
└── utils/
    ├── colorUtils.ts           — hex/rgb utils, PALETTE with named colors
    └── exportUtils.ts          — Download blob helper, timestamped filenames
```

**Rendering pipeline (per frame):**
1. Clear `wheelCanvas`
2. Fill wheel background color
3. Draw radial guide lines (rotated by current `angle`)
4. Draw `settledBitmap` (offscreen canvas) rotated by `angle`
5. Clear `paintCanvas`
6. Draw all active particles on `paintCanvas`

**Settled paint storage:**
Paint particles that stick are stamped into `settledBitmap` in the **wheel's local coordinate
frame** (counter-rotated by `-angle` before stamping). This means the settled paint
rotates with the wheel correctly when rendered.

### Tech Stack

```
Frontend:   React 19 + Vite (TypeScript)
Rendering:  Canvas 2D API (dual canvas: wheel + paint overlay)
Physics:    Web Worker (separate thread for particle simulation)
State:      Zustand (shallow merge — avoid ES getters)
Export:     canvas.toBlob() → PNG, gifenc → animated GIF
Styles:     CSS variables + inline styles (no CSS framework)
A11y:       WCAG 2.1 AA compliant (contrast, focus, aria, touch targets)
```

---

## Physics Model

### Coordinate Systems

- **World frame:** fixed screen coordinates, origin at canvas top-left
- **Wheel local frame:** rotates with the wheel, origin at wheel center `(CX, CY)`
- Conversion: `local = rotate(world - center, -angle)`

### Forces Applied Per Particle (World Frame)

```
F_centrifugal = ω² · r · (1 - viscosity · 0.5)   [radially outward]
F_drag        = -μ · v                              [opposes velocity]

where:
  ω         = angular velocity (rad/s)
  r         = distance from wheel center
  μ         = viscosity drag coefficient (fixed at 0.12 — Acrylic)
  v         = particle velocity vector
```

Integration uses explicit Euler with capped DT = min(elapsed, 0.05s).

### Adhesion

A particle sticks when:
```
|v| < adhesionThreshold
  OR age > maxAge
  OR particle exits wheel boundary
```

`adhesionThreshold = 2.0 + viscosity * 8`

Once stuck, the particle fades and is stamped to `settledBitmap`.

---

## Paint Modes

### Drop Mode
Physics-based painting. Paint particles spawn, inherit wheel surface velocity, and are
affected by centrifugal force and drag. Four tools available:

| Tool   | Count (click) | Count (hold/frame) | Notes                              |
|--------|---------------|--------------------|------------------------------------|
| Drop   | 8             | 2/frame            | Default — blobs flung by physics   |
| Line   | 0             | 0                  | Stamps shape directly to bitmap    |
| Spray  | 15            | 6/frame            | Many tiny low-opacity particles    |
| Splash | 60            | 0 (one-shot)       | Single burst on click              |

### Brush Mode
Direct painting — stamps shapes onto the settled bitmap at pointer position.
No physics simulation; paint rotates with the wheel immediately.

---

## Brush Shapes

11 shapes available, used by all tools and both paint modes:

Round, Ring (hollow circle), Square, Rectangle, Star (5-pointed), Heart,
Triangle, Diamond, Plus, Splatter, Slash

Each shape is rendered via:
- `renderer.ts` `drawShape()` — Canvas 2D for on-canvas rendering
- `WheelCanvas.tsx` cursor SVG — inline SVG data URL for custom cursors

---

## UI Layout

```
┌─────────────────── TopBar ──────────────────────┐
│ SPINART  │ Drop/Brush │ BG │ CLEAR │ PNG │ GIF  │
├──────┬──────────────────────┬───────────────────┤
│Color │                      │ Tool (4-col grid) │
│Palette│     WheelCanvas     │ Shape (4-col grid)│
│(4-col)│    (dual canvas)    │ Size slider       │
├──────┴──────────────────────┴───────────────────┤
│            SpeedControls (bottom bar)            │
│        SPEED slider │ ↻CW │ STOP │ ↺CCW         │
└─────────────────────────────────────────────────┘
```

### Color Palette
32 named colors organized by hue family (reds, oranges, yellows, greens, blues,
purples, browns, neutrals, teals, pastels) + custom color picker.
Color names shown on hover via CSS tooltips (100ms delay).

### Export
- **PNG** — static snapshot of current canvas state
- **GIF** — animated 36-frame loop of the painting spinning (capped at 400px, ~80ms/frame)
  Uses `gifenc` library for in-browser GIF encoding with 256-color quantization per frame.

---

## UI Controls Reference

| Control         | Range / Options              | Effect                              |
|-----------------|------------------------------|-------------------------------------|
| Color swatches  | 32 named presets + custom    | Sets `color` hex string             |
| Paint mode      | Drop / Brush                 | Switches between physics and direct |
| Tool (drop)     | Drop / Line / Spray / Splash | Sets particle spawn behavior        |
| Shape           | 11 brush shapes              | Sets `brushShape` for rendering     |
| Size            | 1–40                         | Sets `toolSize` (spawn/stamp radius)|
| Spin Speed      | 0–50 RPM                     | Sets `omega = rpm/60 * 2π`          |
| CW / CCW        | Toggle                       | Sets `direction = ±1`               |
| SPIN / STOP     | Toggle                       | Sets `spinning` boolean             |
| Canvas BG       | Color picker                 | Sets `bgColor`                      |
| CLEAR           | Button                       | Clears particles + settledBitmap    |
| PNG             | Button                       | Downloads PNG composite             |
| GIF             | Button                       | Downloads animated spinning GIF     |

---

## Known Issues / Gotchas

- **Stamp coordinate transform:** When stamping to `settledBitmap`, always counter-rotate by
  `-angle` before drawing. Forgetting this causes paint to appear fixed in screen space
  rather than rotating with the wheel.

- **Particle count budget:** Canvas 2D degrades past ~500 simultaneous particles. Keep
  `maxAge` reasonable or throttle spawn rate at high RPM. WebGL target is 10k+.

- **DT capping:** Physics uses `dt = Math.min(elapsed, 0.05)` to prevent particles
  teleporting when the tab is backgrounded.

- **Zustand shallow merge:** Never use ES getters in the store. Computed values (like `omega`)
  must be set explicitly in setter functions.

- **Custom cursors:** SVG data URL cursors are capped at ~32px by browsers. The cursor
  shape matches the selected brush shape in brush/line mode, teardrop in drop mode.

- **GIF export:** 256-color limit per frame. Complex paintings may lose color fidelity.
  GIF size capped at 400px to keep file size reasonable (typically 2-10MB).

---

## Development Commands

```bash
npm install
npm run dev        # Vite dev server, hot reload
npm run build      # Production bundle
npm run preview    # Preview production build locally
```

---

## Roadmap

### Phase 1 — Physics Fidelity
- [ ] Implement Coriolis deflection in rotating frame
- [ ] Paint trail smearing — elongated strokes in direction of motion
- [ ] Particle-to-particle interaction: same-color merge, cross-color mixing
- [ ] Surface tension model: low-viscosity paint beads into tendrils

### Phase 2 — Rendering Quality
- [ ] Port particle system to WebGL for GPU-accelerated rendering (target: 10k+ particles)
- [ ] Kubelka-Munk pigment mixing shader for realistic color blends
- [ ] Noise texture overlay on settled paint (canvas grain / brushstroke feel)
- [ ] Glow / wet-paint sheen effect on active particles

### Phase 3 — UX Polish
- [ ] Undo / redo stack (snapshot settledBitmap at each drip event)
- [ ] Session save/load (serialize particles + bitmap as JSON + base64)
- [ ] 4x resolution export for print quality
- [ ] Preset "recipes": galaxy swirl, tie-dye, mandala, Jackson Pollock
- [ ] WebM video export
- [ ] Mobile: pinch-to-zoom, multi-touch pour

---

## References

- Centrifugal / Coriolis forces: Kleppner & Kolenkow, *An Introduction to Mechanics*, Ch. 8
- Kubelka-Munk paint mixing: https://en.wikipedia.org/wiki/Kubelka%E2%80%93Munk_theory
- WebGL particle systems: https://webglfundamentals.org/webgl/lessons/webgl-gpgpu.html
- `OffscreenCanvas` + Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
- gifenc GIF encoder: https://github.com/mattdesl/gifenc
