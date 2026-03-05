import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorPalette } from '@/components/ColorPalette'
import { ToolPicker } from '@/components/ToolPicker'
import { SpeedControls } from '@/components/SpeedControls'
import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

// Mock useSpinEngine for WheelCanvas
vi.mock('@/engine/useSpinEngine', () => ({
  useSpinEngine: () => ({
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
  }),
}))

describe('ColorPalette', () => {
  beforeEach(() => {
    useSpinStore.setState({ color: PALETTE[0].hex })
  })

  it('renders all palette swatches', () => {
    render(<ColorPalette />)
    const buttons = screen.getAllByRole('radio')
    expect(buttons.length).toBe(PALETTE.length)
  })

  it('marks the active color as checked', () => {
    render(<ColorPalette />)
    const active = screen.getByRole('radio', { name: PALETTE[0].name })
    expect(active).toHaveAttribute('aria-checked', 'true')
  })

  it('clicking a swatch changes the color', () => {
    render(<ColorPalette />)
    const blue = screen.getByRole('radio', { name: 'Blue' })
    fireEvent.click(blue)
    expect(useSpinStore.getState().color).toBe('#0077b6')
  })

  it('renders custom color picker', () => {
    render(<ColorPalette />)
    const picker = screen.getByLabelText('Custom paint color picker')
    expect(picker).toBeInTheDocument()
  })

  it('custom color picker updates store', () => {
    render(<ColorPalette />)
    const picker = screen.getByLabelText('Custom paint color picker')
    fireEvent.change(picker, { target: { value: '#123456' } })
    expect(useSpinStore.getState().color).toBe('#123456')
    expect(useSpinStore.getState().customColor).toBe('#123456')
  })
})

describe('ToolPicker', () => {
  beforeEach(() => {
    useSpinStore.setState({ paintMode: 'drop', toolType: 'drop', brushShape: 'round', toolSize: 20 })
  })

  it('renders tool buttons in drop mode', () => {
    render(<ToolPicker />)
    expect(screen.getByRole('radio', { name: 'Drop' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Line' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Spray' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Splash' })).toBeInTheDocument()
  })

  it('hides tool buttons in brush mode', () => {
    useSpinStore.setState({ paintMode: 'brush' })
    render(<ToolPicker />)
    expect(screen.queryByRole('radio', { name: 'Drop' })).not.toBeInTheDocument()
  })

  it('clicking a tool updates the store', () => {
    render(<ToolPicker />)
    fireEvent.click(screen.getByRole('radio', { name: 'Spray' }))
    expect(useSpinStore.getState().toolType).toBe('spray')
  })

  it('renders all 11 brush shapes', () => {
    render(<ToolPicker />)
    const shapeGroup = screen.getByRole('radiogroup', { name: 'Brush shape' })
    const buttons = shapeGroup.querySelectorAll('[role="radio"]')
    expect(buttons.length).toBe(11)
  })

  it('clicking a shape updates the store', () => {
    render(<ToolPicker />)
    fireEvent.click(screen.getByRole('radio', { name: 'Star' }))
    expect(useSpinStore.getState().brushShape).toBe('star')
  })

  it('renders size slider', () => {
    render(<ToolPicker />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('20')
  })

  it('changing size slider updates the store', () => {
    render(<ToolPicker />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '30' } })
    expect(useSpinStore.getState().toolSize).toBe(30)
  })
})

describe('SpeedControls', () => {
  beforeEach(() => {
    useSpinStore.setState({
      rpm: 25,
      spinning: true,
      direction: 1,
      omega: (25 / 60) * Math.PI * 2,
    })
  })

  it('renders speed slider', () => {
    render(<SpeedControls />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('25')
  })

  it('changing speed slider updates rpm', () => {
    render(<SpeedControls />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '40' } })
    expect(useSpinStore.getState().rpm).toBe(40)
  })

  it('renders CW, STOP, CCW buttons', () => {
    render(<SpeedControls />)
    expect(screen.getByRole('radio', { name: 'Clockwise' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Counter-clockwise' })).toBeInTheDocument()
    // When spinning is true, STOP button says "Stop spinning"
    expect(screen.getByRole('radio', { name: 'Stop spinning' })).toBeInTheDocument()
  })

  it('CW button sets direction=1 and spinning=true', () => {
    useSpinStore.setState({ direction: -1, spinning: false })
    render(<SpeedControls />)
    fireEvent.click(screen.getByRole('radio', { name: 'Clockwise' }))
    const state = useSpinStore.getState()
    expect(state.direction).toBe(1)
    expect(state.spinning).toBe(true)
  })

  it('CCW button sets direction=-1 and spinning=true', () => {
    render(<SpeedControls />)
    fireEvent.click(screen.getByRole('radio', { name: 'Counter-clockwise' }))
    const state = useSpinStore.getState()
    expect(state.direction).toBe(-1)
    expect(state.spinning).toBe(true)
  })

  it('STOP button toggles spinning', () => {
    render(<SpeedControls />)
    fireEvent.click(screen.getByRole('radio', { name: 'Stop spinning' }))
    expect(useSpinStore.getState().spinning).toBe(false)
  })

  it('STOP shows SPIN label when not spinning', () => {
    useSpinStore.setState({ spinning: false })
    render(<SpeedControls />)
    expect(screen.getByText('SPIN')).toBeInTheDocument()
  })
})
