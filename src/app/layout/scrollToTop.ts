export function scrollWindowToTop(): void {
  if (typeof window === 'undefined') return

  window.requestAnimationFrame(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    } catch {
      window.scrollTo(0, 0)
    }
  })
}
