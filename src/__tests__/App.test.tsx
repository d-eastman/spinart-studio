import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '@/App'
import { useSpinStore } from '@/store/useSpinStore'

// Mock useSpinEngine to avoid Worker/Canvas issues in test
vi.mock('@/engine/useSpinEngine', () => ({
  useSpinEngine: () => ({
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders the logo', () => {
    render(<App />)
    expect(screen.getByText('SPIN')).toBeInTheDocument()
    expect(screen.getByText('ART')).toBeInTheDocument()
  })

  it('renders paint mode toggle', () => {
    render(<App />)
    // Use getAllByRole since "Drop" matches both paint mode toggle and tool picker
    const dropButtons = screen.getAllByRole('radio', { name: /drop/i })
    expect(dropButtons.length).toBeGreaterThanOrEqual(1)
    const brushBtn = screen.getByRole('radio', { name: /brush/i })
    expect(brushBtn).toBeInTheDocument()
  })

  it('renders CLEAR button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Clear canvas' })).toBeInTheDocument()
  })

  it('renders PNG button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Save image as PNG' })).toBeInTheDocument()
  })

  it('renders GIF button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Save spinning animation as GIF' })).toBeInTheDocument()
  })

  it('CLEAR button triggers clear signal', () => {
    render(<App />)
    const before = useSpinStore.getState().clearSignal
    fireEvent.click(screen.getByRole('button', { name: 'Clear canvas' }))
    expect(useSpinStore.getState().clearSignal).toBe(before + 1)
  })

  it('PNG button triggers save signal', () => {
    render(<App />)
    const before = useSpinStore.getState().saveSignal
    fireEvent.click(screen.getByRole('button', { name: 'Save image as PNG' }))
    expect(useSpinStore.getState().saveSignal).toBe(before + 1)
  })

  it('GIF button triggers saveGif signal', () => {
    render(<App />)
    const before = useSpinStore.getState().saveGifSignal
    fireEvent.click(screen.getByRole('button', { name: 'Save spinning animation as GIF' }))
    expect(useSpinStore.getState().saveGifSignal).toBe(before + 1)
  })

  it('paint mode toggle switches to brush', () => {
    render(<App />)
    const brushBtn = screen.getByRole('radio', { name: /brush/i })
    fireEvent.click(brushBtn)
    expect(useSpinStore.getState().paintMode).toBe('brush')
  })

  it('BG color picker is present', () => {
    render(<App />)
    expect(screen.getByLabelText('Canvas background color')).toBeInTheDocument()
  })

  it('BG color picker updates store', () => {
    render(<App />)
    const picker = screen.getByLabelText('Canvas background color')
    fireEvent.change(picker, { target: { value: '#ff0000' } })
    expect(useSpinStore.getState().bgColor).toBe('#ff0000')
  })

  it('renders color palette region', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: 'Color palette' })).toBeInTheDocument()
  })

  it('renders tool settings region', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: 'Tool settings' })).toBeInTheDocument()
  })

  it('renders spin art canvas', () => {
    render(<App />)
    expect(screen.getByRole('application', { name: /spin art canvas/i })).toBeInTheDocument()
  })

  it('renders speed controls', () => {
    render(<App />)
    expect(screen.getByRole('region', { name: 'Spin speed controls' })).toBeInTheDocument()
  })

  it('CLEAR button hover changes style', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Clear canvas' })
    fireEvent.mouseEnter(btn)
    expect(btn.style.borderColor).toContain('216')
    expect(btn.style.color).toContain('216')
    fireEvent.mouseLeave(btn)
    expect(btn.style.borderColor).toContain('200')
    expect(btn.style.color).toContain('107')
  })

  it('PNG button hover changes box shadow', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Save image as PNG' })
    fireEvent.mouseEnter(btn)
    expect(btn.style.boxShadow).toContain('12px')
    fireEvent.mouseLeave(btn)
    expect(btn.style.boxShadow).toContain('8px')
  })

  it('GIF button hover changes style', () => {
    render(<App />)
    const btn = screen.getByRole('button', { name: 'Save spinning animation as GIF' })
    fireEvent.mouseEnter(btn)
    expect(btn.style.background).toContain('199')
    expect(btn.style.color).toBe('white')
    fireEvent.mouseLeave(btn)
    expect(btn.style.background).toBe('transparent')
    expect(btn.style.color).toContain('199')
  })
})
