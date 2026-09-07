export function initHorizontalProof(section) {
  const track = section.querySelector('.proof-track')
  const viewport = section.querySelector('.proof-viewport')
  const current = section.querySelector('[data-proof-current]')
  const slideCount = track?.children.length || 1
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let maxTravel = 0
  let frame

  if (!track || !viewport) return () => {}

  const update = () => {
    frame = undefined
    if (reducedMotion || window.innerWidth <= 760) return
    const distance = Math.max(1, section.offsetHeight - window.innerHeight)
    const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance))
    track.style.transform = `translate3d(${-maxTravel * progress}px, 0, 0)`
    section.style.setProperty('--proof-progress', progress)
    if (current) current.textContent = String(Math.min(slideCount, Math.floor(progress * slideCount) + 1)).padStart(2, '0')
  }

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update)
  }

  const layout = () => {
    if (reducedMotion || window.innerWidth <= 760) {
      section.classList.add('proof-static')
      section.style.height = 'auto'
      track.style.transform = ''
      return
    }
    section.classList.remove('proof-static')
    maxTravel = Math.max(0, track.scrollWidth - viewport.clientWidth)
    section.style.height = `${window.innerHeight + maxTravel * 0.72}px`
    update()
  }

  window.addEventListener('scroll', requestUpdate, { passive: true })
  window.addEventListener('resize', layout)
  layout()

  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', requestUpdate)
    window.removeEventListener('resize', layout)
    section.style.height = ''
    section.style.removeProperty('--proof-progress')
    track.style.transform = ''
  }
}
