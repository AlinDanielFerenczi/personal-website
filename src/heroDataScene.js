const COLORS = ['#e12afb', '#00d1ff', '#2b7fff', '#00c951']
const ease = (value) => value * value * (3 - 2 * value)
const hash = (value) => Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1
const mix = (from, to, amount) => from + (to - from) * amount
const clamp = (value) => Math.min(1, Math.max(0, value))

export function getJourneyState(scrollY, sectionTops, viewportHeight) {
  if (sectionTops.length < 2) return { scene: 0, next: 0, local: 0, transition: 0 }
  for (let scene = 0; scene < sectionTops.length - 1; scene += 1) {
    const boundary = sectionTops[scene + 1]
    const start = scene === 0 ? 0 : boundary - viewportHeight
    const end = boundary
    if (scrollY < start) return { scene, next: scene, local: 0, transition: 0 }
    if (scrollY <= end) {
      const local = clamp((scrollY - start) / Math.max(1, end - start))
      return { scene, next: scene + 1, local, transition: ease(local) }
    }
  }
  const scene = sectionTops.length - 1
  return { scene, next: scene, local: 0, transition: 0 }
}

export function getFunnelPoint(index) {
  const progress = Math.floor(index / 8) / 9
  const spread = 0.38 * (1 - progress) ** 1.6
  return {
    x: 0.55 + (hash(index + 29) - 0.5) * spread,
    y: 0.16 + progress * 0.34,
    progress,
  }
}

export function getTrunkPoint(index) {
  const progress = (index - 80) / 31
  return {
    x: 0.7 + Math.sin(progress * Math.PI) * 0.055,
    y: 0.74 - progress * 0.24,
  }
}

function createParticles(count = 240) {
  return Array.from({ length: count }, (_, index) => {
    const cluster = index % 4
    let targetX
    let targetY
    if (index < 80) {
      const point = getFunnelPoint(index)
      targetX = point.x
      targetY = point.y
    } else if (index < 112) {
      const point = getTrunkPoint(index)
      targetX = point.x
      targetY = point.y
    } else {
      const branch = (index - 112) % 6
      const progress = Math.floor((index - 112) / 6) / 21
      const ends = [[.88, .17], [.96, .29], [.9, .42], [.95, .57], [.9, .7], [.84, .82]]
      targetX = mix(.7, ends[branch][0], progress)
      targetY = mix(.5, ends[branch][1], progress)
    }
    return {
      startX: .08 + cluster * .085 + (hash(index + 3) - .5) * .1,
      startY: [.27, .44, .64, .78][cluster] + (hash(index + 11) - .5) * .16,
      targetX,
      targetY,
      burstAngle: hash(index + 47) * Math.PI * 2,
      burstForce: .38 + hash(index + 71) * .72,
      size: 2 + hash(index + 101) * 3.2,
      color: COLORS[index % COLORS.length],
    }
  })
}

function dot(context, x, y, size, color, alpha) {
  context.globalAlpha = alpha
  context.fillStyle = color
  context.shadowColor = color
  context.shadowBlur = 7
  context.beginPath()
  context.arc(x, y, size, 0, Math.PI * 2)
  context.fill()
}

function line(context, points, color, alpha, width = 1) {
  context.globalAlpha = alpha
  context.strokeStyle = color
  context.shadowColor = color
  context.shadowBlur = 7
  context.lineWidth = width
  context.lineCap = 'round'
  context.beginPath()
  points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y))
  context.stroke()
}

function collapsedPosition(particle, index, elapsed) {
  const angle = particle.burstAngle + elapsed * .00008
  const radius = .022 + hash(index + 19) * .06
  return [.62 + Math.cos(angle) * radius, .5 + Math.sin(angle) * radius]
}

function explodedPosition(particle) {
  return [
    particle.startX + Math.cos(particle.burstAngle) * particle.burstForce,
    particle.startY + Math.sin(particle.burstAngle) * particle.burstForce,
  ]
}

function leftClusterPosition(particle) {
  return [
    .24 + (particle.startX - .2) * .95,
    .5 + (particle.startY - .5) * .75,
  ]
}

function streamPoint(progress, lane, width, height) {
  const y = .2 + lane * .2 + Math.sin(progress * Math.PI * 2 + lane) * .055
  return [progress * width, y * height]
}

function orbitPosition(particle, index, width, height, elapsed) {
  const ring = index % 4
  const radius = 190 + ring * 95 + hash(index + 12) * 55
  const angle = particle.burstAngle + elapsed * .00014 * (ring % 2 ? -1 : 1)
  const tilt = -.28
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius * .32
  return [
    .5 + (x * Math.cos(tilt) - y * Math.sin(tilt)) / width,
    .32 + (x * Math.sin(tilt) + y * Math.cos(tilt)) / height,
  ]
}

function scenePosition(scene, particle, index, count, width, height, elapsed) {
  if (scene === 0) return collapsedPosition(particle, index, elapsed)
  if (scene === 1) return explodedPosition(particle)
  if (scene === 2) return leftClusterPosition(particle)
  if (scene === 3) return [particle.targetX, particle.targetY]
  if (scene === 4) {
    const lane = index % 4
    const progress = (index / count + elapsed * .00009 + lane * .11) % 1
    const [x, y] = streamPoint(progress, lane, width, height)
    return [x / width, y / height]
  }
  return orbitPosition(particle, index, width, height, elapsed)
}

function drawGuides(context, scene, width, height, particles, alpha) {
  if (scene === 0) {
    dot(context, width * .62, height * .5, 7, '#e12afb', alpha * .9)
  }
  if (scene === 3) {
    for (let index = 0; index < particles.length; index += 12) {
      const particle = particles[index]
      line(context, [[.7 * width, .5 * height], [particle.targetX * width, particle.targetY * height]], particle.color, alpha * .2)
    }
  }
  if (scene === 4) {
    COLORS.forEach((color, lane) => {
      const points = Array.from({ length: 52 }, (_, index) => streamPoint(index / 51, lane, width, height))
      line(context, points, color, alpha * .48, 1.5)
    })
  }
  if (scene === 5) {
    ;[190, 285, 380, 475].forEach((radius, index) => {
      context.globalAlpha = alpha * (.5 - index * .06)
      context.strokeStyle = COLORS[index]
      context.lineWidth = 1.5
      context.beginPath()
      context.ellipse(width * .5, height * .32, radius, radius * .32, -.28, 0, Math.PI * 2)
      context.stroke()
    })
  }
}

function drawJourney(context, state, width, height, particles, elapsed) {
  const amount = state.scene === 0 ? 1 - (1 - state.transition) ** 2.4 : state.transition
  drawGuides(context, state.scene, width, height, particles, 1 - amount)
  if (state.next !== state.scene) drawGuides(context, state.next, width, height, particles, amount)

  particles.forEach((particle, index) => {
    const from = scenePosition(state.scene, particle, index, particles.length, width, height, elapsed)
    const to = scenePosition(state.next, particle, index, particles.length, width, height, elapsed)
    const x = mix(from[0], to[0], amount) * width
    const y = mix(from[1], to[1], amount) * height
    const transitionBoost = Math.sin(amount * Math.PI) * 2
    dot(context, x, y, particle.size + transitionBoost, particle.color, .96)
  })
}

export function initHeroDataScene(canvas, header, sections, options = {}) {
  const animate = options.animate ?? true
  const context = canvas.getContext('2d')
  const particles = createParticles()
  let width = 0
  let height = 0
  let frame
  const start = performance.now()

  header.style.animation = 'none'
  const draw = (elapsed) => {
    if (!width || !height) return
    const sectionTops = sections.map((section) => section.offsetTop)
    const state = animate ? getJourneyState(window.scrollY, sectionTops, height) : { scene: 0, next: 0, local: 0, transition: 0 }
    const intro = sections[0]
    const exit = state.scene === 0 ? ease(clamp((state.local - .68) / .32)) : 1
    const scrollFade = state.scene === 0 ? ease(clamp(state.local / .75)) : 1
    intro.style.setProperty('--journey-exit', exit)
    intro.style.setProperty('--scroll-fade', scrollFade)
    intro.style.setProperty('--journey-shift', `${-exit * 32}px`)

    const proofStart = sectionTops[1] || height
    const retreat = animate ? clamp((window.scrollY - proofStart - 160) / 280) : 0
    header.style.transform = `translate(-50%, ${-125 * retreat}%)`
    header.style.opacity = String(1 - retreat)

    context.clearRect(0, 0, width, height)
    drawJourney(context, state, width, height, particles, elapsed)
  }

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1.5)
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    draw(animate ? performance.now() - start : 0)
  }

  const render = (now) => {
    draw(now - start)
    frame = requestAnimationFrame(render)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(document.documentElement)
  resize()
  if (animate) frame = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    sections[0].style.removeProperty('--journey-exit')
    sections[0].style.removeProperty('--scroll-fade')
    sections[0].style.removeProperty('--journey-shift')
    header.removeAttribute('style')
  }
}
