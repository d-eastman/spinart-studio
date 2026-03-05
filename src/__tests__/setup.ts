import '@testing-library/jest-dom/vitest'

// Mock Canvas 2D context for jsdom
function createMockContext(): CanvasRenderingContext2D {
  return {
    canvas: document.createElement('canvas'),
    clearRect: () => {},
    fillRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    arc: () => {},
    clip: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    bezierCurveTo: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: () => {},
    getImageData: (_sx: number, _sy: number, sw: number, sh: number) => ({
      data: new Uint8ClampedArray(sw * sh * 4),
      width: sw,
      height: sh,
      colorSpace: 'srgb' as PredefinedColorSpace,
    }),
    putImageData: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    createPattern: () => null,
    setTransform: () => {},
    resetTransform: () => {},
    measureText: () => ({ width: 0 }),
    fillText: () => {},
    strokeText: () => {},
    set fillStyle(_: string | CanvasGradient | CanvasPattern) {},
    get fillStyle() { return '#000000' },
    set strokeStyle(_: string | CanvasGradient | CanvasPattern) {},
    get strokeStyle() { return '#000000' },
    set lineWidth(_: number) {},
    get lineWidth() { return 1 },
    set globalAlpha(_: number) {},
    get globalAlpha() { return 1 },
    set globalCompositeOperation(_: string) {},
    get globalCompositeOperation() { return 'source-over' },
    set font(_: string) {},
    get font() { return '10px sans-serif' },
    set textAlign(_: string) {},
    get textAlign() { return 'start' },
    set textBaseline(_: string) {},
    get textBaseline() { return 'alphabetic' },
    set lineCap(_: string) {},
    get lineCap() { return 'butt' },
    set lineJoin(_: string) {},
    get lineJoin() { return 'miter' },
    set shadowColor(_: string) {},
    get shadowColor() { return 'rgba(0,0,0,0)' },
    set shadowBlur(_: number) {},
    get shadowBlur() { return 0 },
    set shadowOffsetX(_: number) {},
    get shadowOffsetX() { return 0 },
    set shadowOffsetY(_: number) {},
    get shadowOffsetY() { return 0 },
  } as unknown as CanvasRenderingContext2D
}

const originalGetContext = HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: unknown[]) {
  if (contextId === '2d') {
    return createMockContext()
  }
  return originalGetContext.call(this, contextId, ...args)
} as typeof HTMLCanvasElement.prototype.getContext

// Mock toBlob
HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback) {
  callback(new Blob(['mock'], { type: 'image/png' }))
}
