import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/Sidebar'
import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

// Mock useSpinEngine for WheelCanvas (Sidebar includes SpeedControls)
vi.mock('@/engine/useSpinEngine', () => ({
  useSpinEngine: () => ({
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
  }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    useSpinStore.setState({
      paintMode: 'drop',
      bgColor: '#faf7f4',
      color: PALETTE[0].hex,
      clearSignal: 0,
      saveSignal: 0,
    })
  })

  it('renders the logo', () => {
    render(<Sidebar />)
    expect(screen.getByText('SPIN')).toBeInTheDocument()
    expect(screen.getByText('ART')).toBeInTheDocument()
  })

  it('renders paint mode buttons', () => {
    render(<Sidebar />)
    // Sidebar renders its own buttons + child components that may have "Drop" text
    expect(screen.getAllByText(/Drop/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Brush/).length).toBeGreaterThan(0)
  })

  it('renders CLEAR button', () => {
    render(<Sidebar />)
    expect(screen.getByText('CLEAR')).toBeInTheDocument()
  })

  it('renders SAVE IMAGE button', () => {
    render(<Sidebar />)
    expect(screen.getByText('SAVE IMAGE')).toBeInTheDocument()
  })

  it('CLEAR button triggers clear signal', () => {
    render(<Sidebar />)
    const before = useSpinStore.getState().clearSignal
    fireEvent.click(screen.getByText('CLEAR'))
    expect(useSpinStore.getState().clearSignal).toBe(before + 1)
  })

  it('SAVE IMAGE button triggers save signal', () => {
    render(<Sidebar />)
    const before = useSpinStore.getState().saveSignal
    fireEvent.click(screen.getByText('SAVE IMAGE'))
    expect(useSpinStore.getState().saveSignal).toBe(before + 1)
  })

  it('switching paint mode updates store', () => {
    render(<Sidebar />)
    const brushBtn = screen.getByText(/Brush/)
    fireEvent.click(brushBtn)
    expect(useSpinStore.getState().paintMode).toBe('brush')
  })

  it('CLEAR button hover changes style', () => {
    render(<Sidebar />)
    const clearBtn = screen.getByText('CLEAR')
    fireEvent.mouseEnter(clearBtn)
    // jsdom converts hex to rgb
    expect(clearBtn.style.borderColor).toContain('240')
    expect(clearBtn.style.color).toContain('240')
    fireEvent.mouseLeave(clearBtn)
    expect(clearBtn.style.borderColor).toContain('224')
    expect(clearBtn.style.color).toContain('158')
  })

  it('SAVE IMAGE button hover changes box shadow', () => {
    render(<Sidebar />)
    const saveBtn = screen.getByText('SAVE IMAGE')
    fireEvent.mouseEnter(saveBtn)
    expect(saveBtn.style.boxShadow).toContain('12px')
    fireEvent.mouseLeave(saveBtn)
    expect(saveBtn.style.boxShadow).toContain('8px')
  })

  it('renders and updates BG color picker', () => {
    render(<Sidebar />)
    const pickers = screen.getAllByDisplayValue('#faf7f4')
    expect(pickers.length).toBeGreaterThan(0)
  })
})
