import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WheelCanvas } from '@/components/WheelCanvas'
import { useSpinStore } from '@/store/useSpinStore'

vi.mock('@/engine/useSpinEngine', () => ({
  useSpinEngine: () => ({
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
  }),
}))

describe('WheelCanvas', () => {
  it('renders the application container', () => {
    render(<WheelCanvas />)
    expect(screen.getByRole('application')).toBeInTheDocument()
  })

  it('renders two canvas elements', () => {
    const { container } = render(<WheelCanvas />)
    const canvases = container.querySelectorAll('canvas')
    expect(canvases.length).toBe(2)
  })

  it('renders hub dot', () => {
    const { container } = render(<WheelCanvas />)
    // Hub dot is a div with aria-hidden
    const hubDots = container.querySelectorAll('[aria-hidden="true"]')
    expect(hubDots.length).toBeGreaterThan(0)
  })

  it('generates cursor for drop mode', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'drop' })
    render(<WheelCanvas />)
    const app = screen.getByRole('application')
    // Drop mode uses teardrop cursor
    expect(app.style.cursor).toContain('data:image/svg+xml')
  })

  it('generates cursor for brush mode', () => {
    useSpinStore.setState({ paintMode: 'brush', brushShape: 'round' })
    render(<WheelCanvas />)
    const app = screen.getByRole('application')
    expect(app.style.cursor).toContain('data:image/svg+xml')
  })

  it('generates cursor for line tool', () => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'line', brushShape: 'square' })
    render(<WheelCanvas />)
    const app = screen.getByRole('application')
    expect(app.style.cursor).toContain('data:image/svg+xml')
  })

  it('generates different cursors for different brush shapes', () => {
    useSpinStore.setState({ paintMode: 'brush', brushShape: 'round' })
    const { unmount } = render(<WheelCanvas />)
    const roundCursor = screen.getByRole('application').style.cursor
    unmount()

    useSpinStore.setState({ paintMode: 'brush', brushShape: 'star' })
    render(<WheelCanvas />)
    const starCursor = screen.getByRole('application').style.cursor
    expect(roundCursor).not.toBe(starCursor)
  })

  it('generates cursors for all brush shapes in brush mode', () => {
    const shapes = [
      'round', 'hollowCircle', 'square', 'rectangle', 'star',
      'heart', 'triangle', 'diamond', 'plus', 'splatter', 'slash',
    ] as const

    for (const shape of shapes) {
      useSpinStore.setState({ paintMode: 'brush', brushShape: shape })
      const { unmount } = render(<WheelCanvas />)
      const app = screen.getByRole('application')
      expect(app.style.cursor).toContain('data:image/svg+xml')
      unmount()
    }
  })
})
