import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export function initSmoothScroll() {
  const lenis = new Lenis({
    autoRaf: true,
    anchors: true,
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  })

  return () => lenis.destroy()
}
