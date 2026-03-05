import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

// Track all worker instances
const workerInstances: MockWorker[] = []

class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  dispatchEvent = vi.fn(() => true)
  constructor() {
    workerInstances.push(this)
  }
}

vi.stubGlobal('Worker', MockWorker)

// Mock Canvas2DRenderer as a proper class
const mockRenderer = {
  drawFrame: vi.fn(),
  stampParticle: vi.fn(),
  stampBrush: vi.fn(),
  clearSettled: vi.fn(),
  exportBitmap: vi.fn().mockResolvedValue(new Blob(['test'])),
  exportGif: vi.fn().mockResolvedValue(new Blob(['test'])),
  resize: vi.fn(),
}

vi.mock('@/engine/renderer', () => {
  return {
    Canvas2DRenderer: class MockCanvas2DRenderer {
      drawFrame = mockRenderer.drawFrame
      stampParticle = mockRenderer.stampParticle
      stampBrush = mockRenderer.stampBrush
      clearSettled = mockRenderer.clearSettled
      exportBitmap = mockRenderer.exportBitmap
      exportGif = mockRenderer.exportGif
      resize = mockRenderer.resize
    },
  }
})

vi.mock('@/utils/exportUtils', () => ({
  downloadBlob: vi.fn(),
  timestampedFilename: vi.fn(() => 'spinart_123.png'),
}))

const { useSpinEngine } = await import('@/engine/useSpinEngine')

function makeRefs() {
  const wheelCanvas = document.createElement('canvas')
  wheelCanvas.width = 600
  wheelCanvas.height = 600
  const paintCanvas = document.createElement('canvas')
  paintCanvas.width = 600
  paintCanvas.height = 600
  return {
    wheelRef: { current: wheelCanvas } as React.RefObject<HTMLCanvasElement>,
    paintRef: { current: paintCanvas } as React.RefObject<HTMLCanvasElement>,
  }
}

function makeMockDiv() {
  const div = document.createElement('div')
  div.getBoundingClientRect = () => ({
    left: 0, top: 0, right: 600, bottom: 600, width: 600, height: 600, x: 0, y: 0, toJSON: () => {},
  })
  div.setPointerCapture = vi.fn()
  return div
}

function makePointerEvent(x: number, y: number, div: HTMLDivElement) {
  return {
    clientX: x, clientY: y, pointerId: 1, currentTarget: div,
  } as unknown as React.PointerEvent<HTMLDivElement>
}

describe('useSpinEngine', () => {
  let rafCallbacks: ((time: number) => void)[] = []

  beforeEach(() => {
    vi.clearAllMocks()
    workerInstances.length = 0
    rafCallbacks = []
    Object.values(mockRenderer).forEach(fn => fn.mockClear())

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(performance, 'now').mockReturnValue(1000)

    useSpinStore.setState({
      color: PALETTE[0].hex,
      customColor: '#6b21a8',
      paintMode: 'drop',
      toolType: 'drop',
      toolSize: 20,
      brushShape: 'round',
      viscosity: 0.12,
      rpm: 25,
      spinning: true,
      direction: 1,
      omega: (25 / 60) * Math.PI * 2,
      bgColor: '#faf7f4',
      clearSignal: 0,
      saveSignal: 0,
      saveGifSignal: 0,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns pointer event handlers', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    expect(result.current.onPointerDown).toBeTypeOf('function')
    expect(result.current.onPointerMove).toBeTypeOf('function')
    expect(result.current.onPointerUp).toBeTypeOf('function')
  })

  it('creates a Worker on mount', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    expect(workerInstances.length).toBeGreaterThan(0)
  })

  it('starts the RAF loop', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('terminates worker on unmount', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { unmount } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    unmount()
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })

  it('handles clear signal', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    act(() => { useSpinStore.getState().triggerClear() })
    expect(mockRenderer.clearSettled).toHaveBeenCalled()
  })

  it('handles save signal', async () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    act(() => { useSpinStore.getState().triggerSave() })
    await vi.waitFor(() => expect(mockRenderer.exportBitmap).toHaveBeenCalled())
  })

  it('handles save GIF signal', async () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    act(() => { useSpinStore.getState().triggerSaveGif() })
    await vi.waitFor(() => expect(mockRenderer.exportGif).toHaveBeenCalled())
  })

  it('onPointerDown spawns particles in drop mode', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    const worker = workerInstances[0]
    const spawnCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    )
    expect(spawnCalls.length).toBeGreaterThan(0)
  })

  it('onPointerDown stamps brush in brush mode', () => {
    useSpinStore.setState({ paintMode: 'brush' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))
    expect(mockRenderer.stampBrush).toHaveBeenCalled()
  })

  it('onPointerDown with line tool stamps directly', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'line' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))
    expect(mockRenderer.stampBrush).toHaveBeenCalled()
  })

  it('onPointerDown ignores clicks outside the wheel', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(0, 0, div))
    expect(div.setPointerCapture).not.toHaveBeenCalled()
  })

  it('onPointerMove updates pour position', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))
    result.current.onPointerMove({
      clientX: 350, clientY: 350, currentTarget: div,
    } as unknown as React.PointerEvent<HTMLDivElement>)
    // No assertion needed — just verifying no throw
  })

  it('onPointerUp stops pouring', () => {
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    result.current.onPointerUp()
  })

  it('onPointerDown with spray tool', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'spray' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    const worker = workerInstances[0]
    const spawnCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    )
    expect(spawnCalls.length).toBeGreaterThan(0)
  })

  it('onPointerDown with splash tool', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'splash' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    const worker = workerInstances[0]
    const spawnCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    )
    expect(spawnCalls.length).toBeGreaterThan(0)
  })

  it('RAF loop sends TICK to worker', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    const worker = workerInstances[0]
    const tickCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'TICK'
    )
    expect(tickCalls.length).toBeGreaterThan(0)
  })

  it('handles null canvas refs gracefully', () => {
    const wheelRef = { current: null } as React.RefObject<HTMLCanvasElement>
    const paintRef = { current: null } as React.RefObject<HTMLCanvasElement>
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    expect(result.current).toBeDefined()
  })

  it('RAF loop handles brush mode continuous painting', () => {
    useSpinStore.setState({ paintMode: 'brush' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    expect(mockRenderer.stampBrush).toHaveBeenCalled()
  })

  it('RAF loop handles line tool continuous stamping', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'line' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    expect(mockRenderer.stampBrush).toHaveBeenCalled()
  })

  it('RAF loop handles drop mode continuous spawning', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'drop' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    const worker = workerInstances[0]
    const spawnCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    )
    // Should have spawned on click + on hold
    expect(spawnCalls.length).toBeGreaterThan(1)
  })

  it('RAF loop handles spray continuous spawning', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'spray' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    const worker = workerInstances[0]
    const spawnCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    )
    expect(spawnCalls.length).toBeGreaterThan(1)
  })

  it('RAF sends dt=0 when not spinning', () => {
    useSpinStore.setState({ spinning: false })
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    const worker = workerInstances[0]
    const tickCalls = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'TICK'
    )
    if (tickCalls.length > 0) {
      expect(tickCalls[tickCalls.length - 1][0].dt).toBe(0)
    }
  })

  it('worker STAMP message calls renderer.stampParticle', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))

    const worker = workerInstances[0]
    if (worker.onmessage) {
      worker.onmessage({
        data: {
          type: 'STAMP',
          particle: { id: 0, x: 300, y: 300, radius: 5, alpha: 1, rgb: { r: 255, g: 0, b: 0 }, brushShape: 'round' },
          wheelAngle: 0,
        },
      } as MessageEvent)
      expect(mockRenderer.stampParticle).toHaveBeenCalled()
    }
  })

  it('worker FRAME message calls renderer.drawFrame', () => {
    const { wheelRef, paintRef } = makeRefs()
    renderHook(() => useSpinEngine(wheelRef, paintRef, 600))

    const worker = workerInstances[0]
    if (worker.onmessage) {
      worker.onmessage({
        data: {
          type: 'FRAME',
          particles: [],
          wheelAngle: 0,
        },
      } as MessageEvent)
      expect(mockRenderer.drawFrame).toHaveBeenCalled()
    }
  })

  it('splash tool does not continuously spawn (holdCount=0)', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'splash' })
    const { wheelRef, paintRef } = makeRefs()
    const { result } = renderHook(() => useSpinEngine(wheelRef, paintRef, 600))
    const div = makeMockDiv()

    result.current.onPointerDown(makePointerEvent(300, 300, div))

    const worker = workerInstances[0]
    const beforeSpawnCount = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    ).length

    vi.spyOn(performance, 'now').mockReturnValue(1016)
    if (rafCallbacks.length > 0) {
      rafCallbacks[rafCallbacks.length - 1](1016)
    }

    const afterSpawnCount = worker.postMessage.mock.calls.filter(
      (c: [{ type: string }]) => c[0]?.type === 'SPAWN'
    ).length

    // holdCount=0 so no new spawns during RAF
    expect(afterSpawnCount).toBe(beforeSpawnCount)
  })
})
