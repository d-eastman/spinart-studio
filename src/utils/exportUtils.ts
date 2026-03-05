export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function timestampedFilename(prefix = 'spinart', ext = 'png'): string {
  return `${prefix}_${Date.now()}.${ext}`
}
