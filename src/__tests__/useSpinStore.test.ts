import { describe, it, expect, beforeEach } from 'vitest'
import { useSpinStore } from '@/store/useSpinStore'
import { PALETTE } from '@/utils/colorUtils'

describe('useSpinStore', () => {
  beforeEach(() => {
    // Reset store to initial state
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

  describe('color', () => {
    it('initial color is first palette color', () => {
      expect(useSpinStore.getState().color).toBe(PALETTE[0].hex)
    })

    it('setColor updates color', () => {
      useSpinStore.getState().setColor('#00ff00')
      expect(useSpinStore.getState().color).toBe('#00ff00')
    })

    it('setCustomColor updates both color and customColor', () => {
      useSpinStore.getState().setCustomColor('#abcdef')
      const state = useSpinStore.getState()
      expect(state.color).toBe('#abcdef')
      expect(state.customColor).toBe('#abcdef')
    })
  })

  describe('paint mode', () => {
    it('default is drop', () => {
      expect(useSpinStore.getState().paintMode).toBe('drop')
    })

    it('setPaintMode switches to brush', () => {
      useSpinStore.getState().setPaintMode('brush')
      expect(useSpinStore.getState().paintMode).toBe('brush')
    })
  })

  describe('tool', () => {
    it('default toolType is drop', () => {
      expect(useSpinStore.getState().toolType).toBe('drop')
    })

    it('setToolType updates', () => {
      useSpinStore.getState().setToolType('spray')
      expect(useSpinStore.getState().toolType).toBe('spray')
    })
  })

  describe('toolSize', () => {
    it('default is 20', () => {
      expect(useSpinStore.getState().toolSize).toBe(20)
    })

    it('setToolSize updates', () => {
      useSpinStore.getState().setToolSize(5)
      expect(useSpinStore.getState().toolSize).toBe(5)
    })
  })

  describe('brushShape', () => {
    it('default is round', () => {
      expect(useSpinStore.getState().brushShape).toBe('round')
    })

    it('setBrushShape updates', () => {
      useSpinStore.getState().setBrushShape('star')
      expect(useSpinStore.getState().brushShape).toBe('star')
    })
  })

  describe('viscosity', () => {
    it('fixed at 0.12', () => {
      expect(useSpinStore.getState().viscosity).toBe(0.12)
    })
  })

  describe('wheel spin', () => {
    it('default rpm is 25', () => {
      expect(useSpinStore.getState().rpm).toBe(25)
    })

    it('setRpm updates rpm and omega', () => {
      useSpinStore.getState().setRpm(50)
      const state = useSpinStore.getState()
      expect(state.rpm).toBe(50)
      expect(state.omega).toBeCloseTo((50 / 60) * Math.PI * 2)
    })

    it('setRpm to 0 sets omega to 0', () => {
      useSpinStore.getState().setRpm(0)
      expect(useSpinStore.getState().omega).toBe(0)
    })

    it('default spinning is true', () => {
      expect(useSpinStore.getState().spinning).toBe(true)
    })

    it('setSpinning toggles', () => {
      useSpinStore.getState().setSpinning(false)
      expect(useSpinStore.getState().spinning).toBe(false)
    })

    it('default direction is 1 (CW)', () => {
      expect(useSpinStore.getState().direction).toBe(1)
    })

    it('setDirection changes to -1', () => {
      useSpinStore.getState().setDirection(-1)
      expect(useSpinStore.getState().direction).toBe(-1)
    })
  })

  describe('background', () => {
    it('default bgColor', () => {
      expect(useSpinStore.getState().bgColor).toBe('#faf7f4')
    })

    it('setBgColor updates', () => {
      useSpinStore.getState().setBgColor('#000000')
      expect(useSpinStore.getState().bgColor).toBe('#000000')
    })
  })

  describe('signals', () => {
    it('triggerClear increments clearSignal', () => {
      const before = useSpinStore.getState().clearSignal
      useSpinStore.getState().triggerClear()
      expect(useSpinStore.getState().clearSignal).toBe(before + 1)
    })

    it('triggerSave increments saveSignal', () => {
      const before = useSpinStore.getState().saveSignal
      useSpinStore.getState().triggerSave()
      expect(useSpinStore.getState().saveSignal).toBe(before + 1)
    })

    it('triggerSaveGif increments saveGifSignal', () => {
      const before = useSpinStore.getState().saveGifSignal
      useSpinStore.getState().triggerSaveGif()
      expect(useSpinStore.getState().saveGifSignal).toBe(before + 1)
    })
  })
})
