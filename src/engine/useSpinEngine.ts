/**
 * useSpinEngine
 *
 * Central hook that owns:
 *   - The Web Worker (physics)
 *   - The Canvas2DRenderer instance
 *   - The requestAnimationFrame loop
 *   - Pointer event handling → particle spawning or direct brush painting
 */
import { useEffect, useRef, useCallback, RefObject } from 'react'
import { Canvas2DRenderer } from '@/engine/renderer'
import { spawnParticles } from '@/engine/particle'
import type { WorkerOutMessage, WorkerInMessage } from '@/engine/types'
import { TOOLS } from '@/engine/types'
import { useSpinStore } from '@/store/useSpinStore'
import { downloadBlob, timestampedFilename } from '@/utils/exportUtils'
import { hexToRgb } from '@/utils/colorUtils'

export function useSpinEngine(
  wheelRef: RefObject<HTMLCanvasElement>,
  paintRef: RefObject<HTMLCanvasElement>,
  size: number,
) {
  const rendererRef = useRef<Canvas2DRenderer | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const rafRef = useRef<number>(0)
  const lastRef = useRef<number>(performance.now())
  const wheelAngleRef = useRef<number>(0)

  // Pouring state
  const isPouringRef = useRef(false)
  const pourPosRef = useRef<{ x: number; y: number } | null>(null)

  // Latest store values via refs (avoid stale closure in RAF)
  const storeRef = useRef(useSpinStore.getState())
  useEffect(() => useSpinStore.subscribe((s) => { storeRef.current = s }), [])

  // ── Init renderer + worker ────────────────────────────────────────────────
  useEffect(() => {
    if (!wheelRef.current || !paintRef.current) return

    rendererRef.current = new Canvas2DRenderer(wheelRef.current, paintRef.current, size)

    workerRef.current = new Worker(
      new URL('./PhysicsWorker.ts', import.meta.url),
      { type: 'module' },
    )

    // Send init size to worker
    const initMsg: WorkerInMessage = { type: 'INIT', size }
    workerRef.current.postMessage(initMsg)

    workerRef.current.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const msg = e.data
      if (!rendererRef.current) return

      if (msg.type === 'STAMP') {
        rendererRef.current.stampParticle(msg.particle, msg.wheelAngle)
      }

      if (msg.type === 'FRAME') {
        wheelAngleRef.current = msg.wheelAngle
        const s = storeRef.current
        rendererRef.current.drawFrame({
          particles: msg.particles,
          wheelAngle: msg.wheelAngle,
          bgColor: s.bgColor,
          size,
        })
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      workerRef.current?.terminate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  // ── RAF loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function loop(now: number) {
      const elapsed = Math.min((now - lastRef.current) / 1000, 0.05)
      lastRef.current = now

      const s = storeRef.current
      if (!workerRef.current) { rafRef.current = requestAnimationFrame(loop); return }

      // Continuous drop/spray (drop mode, not line tool)
      if (s.paintMode === 'drop' && isPouringRef.current && pourPosRef.current) {
        const tool = TOOLS[s.toolType]
        if (tool.type === 'line') {
          // Line tool: stamp directly onto settled bitmap
          lineStampAt(pourPosRef.current.x, pourPosRef.current.y)
        } else if (tool.holdCount > 0) {
          const ps = spawnParticles({
            wx: pourPosRef.current.x,
            wy: pourPosRef.current.y,
            cx: size / 2,
            cy: size / 2,
            count: tool.holdCount,
            spreadRadius: tool.type === 'spray' ? s.toolSize * 1.5 : s.toolSize,
            toolSize: tool.type === 'spray' ? s.toolSize * 0.3 : s.toolSize,
            color: s.color,
            omega: s.omega,
            direction: s.direction,
            wheelRadius: size / 2,
            brushShape: s.brushShape,
            lowOpacity: tool.type === 'spray',
          })
          if (ps.length > 0) {
            const spawnMsg: WorkerInMessage = { type: 'SPAWN', particles: ps }
            workerRef.current.postMessage(spawnMsg)
          }
        }
      }

      // Continuous brush painting
      if (s.paintMode === 'brush' && isPouringRef.current && pourPosRef.current) {
        brushStampAt(pourPosRef.current.x, pourPosRef.current.y)
      }

      const tickMsg: WorkerInMessage = {
        type: 'TICK',
        dt: s.spinning ? elapsed : 0,
        omega: s.omega,
        direction: s.direction,
        viscosity: s.viscosity,
      }
      workerRef.current.postMessage(tickMsg)

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size])

  // ── Clear signal ──────────────────────────────────────────────────────────
  const { clearSignal } = useSpinStore()
  useEffect(() => {
    if (clearSignal === 0) return
    rendererRef.current?.clearSettled()
    workerRef.current?.postMessage({ type: 'CLEAR' } as WorkerInMessage)
  }, [clearSignal])

  // ── Save signal ───────────────────────────────────────────────────────────
  const { saveSignal } = useSpinStore()
  useEffect(() => {
    if (saveSignal === 0) return
    const s = storeRef.current
    rendererRef.current
      ?.exportBitmap({
        particles: [],
        wheelAngle: 0,
        bgColor: s.bgColor,
        size,
      })
      .then((blob) => downloadBlob(blob, timestampedFilename()))
      .catch(console.error)
  }, [saveSignal, size])

  // ── Save GIF signal ──────────────────────────────────────────────────────
  const { saveGifSignal } = useSpinStore()
  useEffect(() => {
    if (saveGifSignal === 0) return
    const s = storeRef.current
    rendererRef.current
      ?.exportGif(s.bgColor, size)
      .then((blob) => downloadBlob(blob, timestampedFilename('spinart', 'gif')))
      .catch(console.error)
  }, [saveGifSignal, size])

  // ── Pointer helpers ───────────────────────────────────────────────────────
  function inWheel(x: number, y: number) {
    const cx = size / 2, cy = size / 2, r = size / 2
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
  }

  function brushStampAt(x: number, y: number) {
    const s = storeRef.current
    if (!rendererRef.current) return
    const rgb = hexToRgb(s.color)
    rendererRef.current.stampBrush(
      x, y, s.toolSize * 0.5, s.brushShape, rgb, 0.85, wheelAngleRef.current,
    )
  }

  function lineStampAt(x: number, y: number) {
    const s = storeRef.current
    if (!rendererRef.current) return
    const rgb = hexToRgb(s.color)
    rendererRef.current.stampBrush(
      x, y, s.toolSize * 0.5, s.brushShape, rgb, 0.9, wheelAngleRef.current,
    )
  }

  function spawnAt(x: number, y: number, count: number, isSpray = false) {
    const s = storeRef.current
    const ps = spawnParticles({
      wx: x, wy: y,
      cx: size / 2, cy: size / 2,
      count,
      spreadRadius: isSpray ? s.toolSize * 1.5 : s.toolSize,
      toolSize: isSpray ? s.toolSize * 0.3 : s.toolSize,
      color: s.color,
      omega: s.omega,
      direction: s.direction,
      wheelRadius: size / 2,
      brushShape: s.brushShape,
      lowOpacity: isSpray,
    })
    if (ps.length > 0 && workerRef.current) {
      workerRef.current.postMessage({ type: 'SPAWN', particles: ps } as WorkerInMessage)
    }
  }

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (!inWheel(x, y)) return
    isPouringRef.current = true
    pourPosRef.current = { x, y }

    const s = storeRef.current
    if (s.paintMode === 'brush') {
      brushStampAt(x, y)
    } else if (s.toolType === 'line') {
      lineStampAt(x, y)
    } else {
      const tool = TOOLS[s.toolType]
      if (tool.type === 'spray') {
        spawnAt(x, y, tool.clickCount, true)
      } else {
        spawnAt(x, y, tool.clickCount, false)
      }
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (isPouringRef.current && inWheel(x, y)) {
      pourPosRef.current = { x, y }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size])

  const onPointerUp = useCallback(() => {
    isPouringRef.current = false
    pourPosRef.current = null
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp }
}
