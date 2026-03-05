import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadBlob, timestampedFilename } from '@/utils/exportUtils'

describe('downloadBlob', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a link, clicks it, and revokes the URL', () => {
    const fakeUrl = 'blob:http://localhost/fake'
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(fakeUrl)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const clickSpy = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement)

    const blob = new Blob(['test'], { type: 'text/plain' })
    downloadBlob(blob, 'test.txt')

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(clickSpy).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(fakeUrl)
  })
})

describe('timestampedFilename', () => {
  it('returns default prefix and extension', () => {
    const filename = timestampedFilename()
    expect(filename).toMatch(/^spinart_\d+\.png$/)
  })

  it('uses custom prefix and extension', () => {
    const filename = timestampedFilename('myart', 'gif')
    expect(filename).toMatch(/^myart_\d+\.gif$/)
  })

  it('uses current timestamp', () => {
    const before = Date.now()
    const filename = timestampedFilename()
    const after = Date.now()
    const ts = parseInt(filename.split('_')[1].split('.')[0])
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })
})
