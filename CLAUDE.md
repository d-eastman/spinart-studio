# SpinArt Studio — CLAUDE.md

## Project Overview

SpinArt Studio is a browser-based spin-art painting application that simulates the physical
forces of a spinning wheel with virtual paint. Users drip paint onto a rotating canvas and the
physics engine models centrifugal force, viscous drag, and surface adhesion to produce realistic
spin-art patterns. Finished pieces can be saved as PNG images.

---

## Architecture

### Current Implementation (Prototype)

Single-file HTML/JS app using Canvas 2D API.

```
spinart.html
  ├── <canvas id="wheelCanvas">   — wheel background + settled paint composite
  ├── <canvas id="paintCanvas">   — active in-flight particles (overlay)
  └── <div id="sidebar">          — controls UI
```

**Rendering pipeline (per frame):**
1. Clear `wheelCanvas`
2. Fill wheel background color
3. Draw radial guide lines (rotated by current `angle`)
4. Draw `settledBitmap` (offscreen canvas) rotated by `angle` — this is where finished paint lives
5. Clear `paintCanvas`
6. Draw all active particles on `paintCanvas`

**Settled paint storage:**
Paint particles that stick are stamped into `settledBitmap` in the **wheel's local coordinate
frame** (i.e., counter-rotated by `-angle` before stamping). This means the settled paint
rotates with the wheel correctly when rendered.

### Recommended Production Stack

```
Frontend:   React + Vite (TypeScript)
Rendering:  WebGL via Three.js or raw WebGL2 shaders
Physics:    Web Worker (OffscreenCanvas) — keeps UI thread at 60 fps
Export:     canvas.toBlob() → PNG download
State:      Zustand for UI state; serializable session state for save/load
Backend:    Next.js + Supabase (optional, for saving/sharing gallery)
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
  μ         = viscosity drag coefficient (see Viscosity section)
  v         = particle velocity vector
```

Integration uses explicit Euler at DT = 1/60 s.

### Adhesion

A particle sticks when:
```
|v| < adhesionThreshold
  OR age > maxAge
  OR particle exits wheel boundary
```

`adhesionThreshold = 0.5 + viscosity * 3`

Once stuck, the particle fades over ~20 frames and is stamped to `settledBitmap`.

### Coriolis Effect (Not Yet Implemented — Phase 2)

In the rotating reference frame, the Coriolis acceleration is:
```
a_coriolis = -2 · ω × v_local
```
For a 2D wheel spinning about Z: `a_x = 2ω·v_y`, `a_y = -2ω·v_x` (in local frame).
This causes moving particles to curve laterally and creates characteristic spiral tendrils.

### Viscosity Levels

| Label   | μ (drag) | Behavior                                   |
|---------|----------|--------------------------------------------|
| Water   | 0.02     | Runs freely to wheel edge, long tendrils   |
| Acrylic | 0.12     | Mid-length runs, visible spreading         |
| Thick   | 0.45     | Sticks near drop point, blobs              |

Full drag applied: `dv/dt = -μ·8·v` (the ×8 scale factor is a tuning constant).

---

## Particle System

### Spawn Parameters by Tool

| Tool   | Count (click) | Count (hold/frame) | Spread radius | Notes                  |
|--------|---------------|--------------------|---------------|------------------------|
| Drip   | 8             | 2/frame            | toolSize      | Default tool           |
| Stream | 4             | 1/frame            | toolSize      | Narrow, continuous     |
| Pour   | 20            | 3/frame            | toolSize      | Wide, heavy flow       |
| Splash | 60            | 0 (one-shot only)  | toolSize      | Single burst on click  |

### Particle Properties

```javascript
{
  x, y,          // world position
  vx, vy,        // world velocity (inherits wheel surface velocity at spawn)
  r,             // radius (0.4–1.0 × toolSize × 0.5)
  alpha,         // opacity (0.7–1.0)
  rgb,           // { r, g, b } from hex color
  age,           // frames alive
  maxAge,        // 180–300 frames
  stuck,         // boolean — in adhesion fade-out phase
  stuckProgress, // 0→1 fade, stamped to bitmap at 1.0
}
```

### Initial Velocity

Particles spawn with the wheel's **surface velocity** at the drop point:
```javascript
surfVx = -ω · (py - CY)   // tangential, rightward for CW rotation
surfVy =  ω · (px - CX)
```
Plus a random spread component scaled by `toolSize * 0.3`.

---

## Rendering Details

### Canvas Clipping

Both canvases are clipped to a circle of radius `R = SIZE / 2` via CSS `border-radius: 50%`
and a `ctx.arc` clip path in the wheel drawing routine.

### Color Blending

Active particles use `rgba(r, g, b, alpha)` fills — browser default source-over compositing.
For more realistic wet-paint mixing in Phase 2, switch to:
- `globalCompositeOperation = 'multiply'` for dark-on-light blending
- Custom WebGL shader with subtractive pigment mixing (Kubelka-Munk model)

### Export

```javascript
// Composite export (respects current rotation):
const exp = document.createElement('canvas');
// fill bg → draw settledBitmap rotated by angle → draw active particles
exp.toBlob(blob => { /* download */ });
```

---

## UI Controls Reference

| Control         | Range / Options              | Effect                              |
|-----------------|------------------------------|-------------------------------------|
| Color swatches  | 10 presets + custom picker   | Sets `color` hex string             |
| Drop Size       | 1–40                         | Sets `toolSize` (spawn radius)      |
| Viscosity       | Water / Acrylic / Thick      | Sets `viscosity` drag coefficient   |
| Spin Speed      | 0–300 RPM                    | Sets `omega = rpm/60 * 2π`          |
| CW / CCW        | Toggle                       | Sets `direction = ±1`               |
| SPIN / STOP     | Toggle                       | Sets `spinning` boolean             |
| Canvas BG       | Color picker                 | Sets `bgColor`                      |
| CLEAR           | Button                       | Clears particles + settledBitmap    |
| SAVE IMAGE      | Button                       | Downloads PNG composite             |

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
- [ ] 4× resolution export for print quality
- [ ] Preset "recipes": galaxy swirl, tie-dye, mandala, Jackson Pollock
- [ ] Animation export: record frames to GIF/WebM showing paint in motion
- [ ] Mobile: pinch-to-zoom, multi-touch pour

### Phase 4 — Full-Stack (Optional)
- [ ] Next.js frontend (TypeScript, app router)
- [ ] Supabase: user auth, gallery table, image storage bucket
- [ ] Resend: share-by-email with preview image
- [ ] Vercel deploy
- [ ] Public gallery with unguessable share URLs (matching So Many Books pattern)

---

## Known Issues / Gotchas

- **Stamp coordinate transform:** When stamping to `settledBitmap`, always counter-rotate by
  `-angle` before drawing. Forgetting this causes paint to appear fixed in screen space
  rather than rotating with the wheel.

- **Particle count budget:** Canvas 2D degrades past ~500 simultaneous particles. Keep
  `maxAge` reasonable or throttle spawn rate at high RPM. WebGL target is 10k+.

- **DT fixed at 1/60:** Physics uses a fixed timestep. If the tab is backgrounded and
  `requestAnimationFrame` fires slowly, cap `dt = Math.min(elapsed, 0.05)` to prevent
  particles teleporting.

- **Export vs. display mismatch:** The export routine re-composites from source; it does not
  screenshot the canvas. Active (in-flight) particles at the moment of save are included but
  render without the circular clip — add a clip path to the export context.

- **Touch events:** `touchmove` must call `e.preventDefault()` with `{passive: false}` or
  the browser will scroll the page instead of painting.

---

## File Structure (Production Target)

```
spinart/
├── CLAUDE.md
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── ColorPalette.tsx
│   │   ├── ToolPicker.tsx
│   │   └── SpeedControls.tsx
│   ├── engine/
│   │   ├── PhysicsWorker.ts     — runs in Web Worker
│   │   ├── particle.ts          — Particle type + spawn logic
│   │   ├── forces.ts            — centrifugal, coriolis, drag, adhesion
│   │   └── renderer.ts          — WebGL or Canvas 2D adapter
│   ├── store/
│   │   └── useSpinStore.ts      — Zustand: color, tool, viscosity, rpm
│   └── utils/
│       ├── colorUtils.ts        — hex↔rgb, pigment mixing
│       └── exportUtils.ts       — PNG, GIF, WebM export
├── public/
└── index.html
```

---

## Development Commands (Production)

```bash
npm install
npm run dev        # Vite dev server, hot reload
npm run build      # Production bundle
npm run preview    # Preview production build locally
```

---

## References

- Centrifugal / Coriolis forces: Kleppner & Kolenkow, *An Introduction to Mechanics*, Ch. 8
- Kubelka-Munk paint mixing: https://en.wikipedia.org/wiki/Kubelka%E2%80%93Munk_theory
- WebGL particle systems: https://webglfundamentals.org/webgl/lessons/webgl-gpgpu.html
- `OffscreenCanvas` + Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
