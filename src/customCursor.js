export function initCustomCursor(container) {
  const shadow = container.querySelector('[data-trail]')
  const trailLayer = container.querySelector('.cursor-trail-layer')
  if (!shadow) return () => {}

  document.documentElement.classList.add('has-cursor')
  let targetX = -100
  let targetY = -100
  let currentX = targetX
  let currentY = targetY
  let started = false
  let frame

  const onMouseMove = (event) => {
    targetX = event.clientX
    targetY = event.clientY
    if (!started) {
      currentX = targetX
      currentY = targetY
      started = true
    }
    const dark = Boolean(
      document.elementFromPoint(targetX, targetY)?.closest('.dark-section, .cta-section, .site-header, footer'),
    )
    trailLayer?.classList.toggle('on-light', !dark)
    shadow.style.opacity = '1'
  }

  const render = () => {
    currentX += (targetX - currentX) * 0.24
    currentY += (targetY - currentY) * 0.24
    shadow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`
    frame = requestAnimationFrame(render)
  }

  const hide = () => { shadow.style.opacity = '0' }
  const show = () => { if (started) shadow.style.opacity = '1' }

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseleave', hide)
  document.addEventListener('mouseenter', show)
  frame = requestAnimationFrame(render)

  return () => {
    document.documentElement.classList.remove('has-cursor')
    cancelAnimationFrame(frame)
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseleave', hide)
    document.removeEventListener('mouseenter', show)
  }
}
