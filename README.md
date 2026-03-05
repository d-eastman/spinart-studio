# SpinArt Studio

A browser-based spin-art painting app that simulates the physics of a spinning wheel with virtual paint. Drop, spray, splash, or draw paint onto a rotating canvas and watch centrifugal force fling it into beautiful patterns.

## Features

- **Physics simulation** — centrifugal force, viscous drag, and surface adhesion modeled in a Web Worker
- **Two paint modes** — Drop mode (physics-based) and Brush mode (direct painting)
- **Four tools** — Drop, Line, Spray, and Splash with distinct behaviors
- **11 brush shapes** — Round, Ring, Square, Rectangle, Star, Heart, Triangle, Diamond, Plus, Splatter, Slash
- **32 named colors** — organized by hue family, plus a custom color picker
- **Adjustable speed** — 0-50 RPM with clockwise/counter-clockwise/stop controls
- **Export** — save as PNG image or animated spinning GIF
- **Accessible** — WCAG 2.1 AA compliant with keyboard navigation, focus indicators, and screen reader support

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Use

1. Pick a color from the left palette
2. Choose a tool and brush shape from the right panel
3. Click or drag on the spinning wheel to apply paint
4. Adjust speed and direction with the bottom controls
5. Export your creation as PNG or animated GIF

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Zustand** for state management
- **Canvas 2D API** for rendering (dual canvas: wheel + paint overlay)
- **Web Worker** for physics simulation
- **gifenc** for animated GIF export

## Build

```bash
npm run build      # Production bundle
npm run preview    # Preview production build
```

## License

MIT
