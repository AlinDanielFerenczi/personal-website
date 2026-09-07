const COLORS = ['#e12afb', '#00d1ff', '#2b7fff', '#00c951']
const CYCLE = 15100
const ease = (value) => value * value * (3 - 2 * value)
const converge = (value) => value ** 3
const burst = (value) => value === 1 ? 1 : 1 - 2 ** (-10 * value)
const hash = (value) => Math.abs(Math.sin(value * 12.9898) * 43758.5453) % 1
const mix = (from, to, amount) => from + (to - from) * amount

export function getDataPhase(elapsed) {
  const time = ((elapsed % CYCLE) + CYCLE) % CYCLE
  if (time < 2400) return { name: 'cluster', amount: 0 }
  if (time < 5000) return { name: 'forming', amount: ease((time - 2400) / 2600) }
  if (time < 7200) return { name: 'structure', amount: 1 }
  if (time < 9700) return { name: 'collapse', amount: converge((time - 7200) / 2500) }
  if (time < 10700) return { name: 'singularity', amount: 1 }
  if (time < 11600) return { name: 'explode', amount: burst((time - 10700) / 900) }
  return { name: 'reset', amount: ease((time - 11600) / 3500) }
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

function createParticles(count = 280) {
  return Array.from({ length: count }, (_, index) => {
    const cluster = index % 4
    const clusterX = 0.08 + cluster * 0.085 + (hash(index + 3) - 0.5) * 0.1
    const clusterY = [0.27, 0.44, 0.64, 0.78][cluster] + (hash(index + 11) - 0.5) * 0.16
    let targetX
    let targetY

    if (index < 80) {
      const funnel = getFunnelPoint(index)
      targetX = funnel.x
      targetY = funnel.y
    } else if (index < 112) {
      const trunk = getTrunkPoint(index)
      targetX = trunk.x
      targetY = trunk.y
    } else {
      const branch = (index - 112) % 6
      const progress = Math.floor((index - 112) / 6) / 27
      const ends = [
        [0.88, 0.17], [0.96, 0.29], [0.9, 0.42],
        [0.94, 0.57], [0.9, 0.7], [0.84, 0.82],
      ]
      targetX = mix(0.7, ends[branch][0], progress)
      targetY = mix(0.5, ends[branch][1], progress) + Math.sin(progress * Math.PI) * (branch < 3 ? -0.035 : 0.035)
    }

    const angle = hash(index + 47) * Math.PI * 2
    const force = 0.45 + hash(index + 71) * 0.75
    return {
      clusterX,
      clusterY,
      targetX,
      targetY,
      explodeX: 0.72 + Math.cos(angle) * force,
      explodeY: 0.5 + Math.sin(angle) * force,
      drift: hash(index + 91) * Math.PI * 2,
      size: 1.1 + hash(index + 101) * 2.2,
      color: COLORS[index % COLORS.length],
    }
  })
}

function positionParticle(particle, phase, elapsed) {
  const pulse = elapsed * 0.001
  const clusterX = particle.clusterX + Math.sin(pulse * 1.7 + particle.drift) * 0.018
  const clusterY = particle.clusterY + Math.cos(pulse * 1.3 + particle.drift) * 0.025

  if (phase.name === 'cluster') return [clusterX, clusterY]
  if (phase.name === 'forming') return [mix(clusterX, particle.targetX, phase.amount), mix(clusterY, particle.targetY, phase.amount)]
  if (phase.name === 'structure') return [particle.targetX, particle.targetY]
  if (phase.name === 'collapse') return [mix(particle.targetX, 0.72, phase.amount), mix(particle.targetY, 0.5, phase.amount)]
  if (phase.name === 'singularity') return [0.72, 0.5]
  if (phase.name === 'explode') return [mix(0.72, particle.explodeX, phase.amount), mix(0.5, particle.explodeY, phase.amount)]
  return [mix(particle.explodeX, clusterX, phase.amount), mix(particle.explodeY, clusterY, phase.amount)]
}

function drawStructure(context, width, height, strength) {
  if (strength < 0.05) return
  const gradient = context.createLinearGradient(width * 0.38, 0, width * 0.96, 0)
  gradient.addColorStop(0, '#e12afb')
  gradient.addColorStop(0.52, '#2b7fff')
  gradient.addColorStop(1, '#00d1ff')
  context.save()
  context.globalAlpha = strength * 0.28
  context.strokeStyle = gradient
  context.lineWidth = 1.15
  context.lineCap = 'round'
  context.shadowColor = '#2b7fff'
  context.shadowBlur = 9
  const path = (points) => {
    context.beginPath()
    context.moveTo(points[0][0] * width, points[0][1] * height)
    points.slice(1).forEach(([x, y]) => context.lineTo(x * width, y * height))
    context.stroke()
  }
  path([[.36, .16], [.455, .28], [.527, .41], [.55, .5]])
  path([[.74, .16], [.645, .28], [.573, .41], [.55, .5]])
  path([[.55, .5], [.62, .5], [.7, .5]])
  ;[[.89, .17], [.96, .29], [.91, .42], [.95, .57], [.9, .7], [.84, .82]].forEach((end, index) => {
    path([[.7, .5], [.76, .47 + (index - 2.5) * .015], end])
  })
  context.restore()
}

export function initHeroDataScene(canvas, animate = true) {
  const context = canvas.getContext('2d')
  const particles = createParticles()
  let width = 0
  let height = 0
  let frame
  let visible = true
  const start = performance.now()

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1.5)
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    draw(animate ? performance.now() - start : 6000)
  }

  const draw = (elapsed) => {
    if (!width || !height) return
    const phase = getDataPhase(elapsed)
    const positions = particles.map((particle) => positionParticle(particle, phase, elapsed))
    const structureStrength = phase.name === 'forming' ? phase.amount : phase.name === 'structure' ? 1 : phase.name === 'collapse' ? 1 - phase.amount : 0

    context.clearRect(0, 0, width, height)
    context.save()
    drawStructure(context, width, height, structureStrength)
    context.globalCompositeOperation = 'multiply'
    if (structureStrength > 0.08) {
      context.globalAlpha = structureStrength * 0.12
      context.lineWidth = 0.7
      for (let index = 1; index < positions.length; index += 1) {
        const [x, y] = positions[index]
        const [previousX, previousY] = positions[index - 1]
        if (Math.hypot(x - previousX, y - previousY) > 0.09) continue
        context.strokeStyle = particles[index].color
        context.beginPath()
        context.moveTo(previousX * width, previousY * height)
        context.lineTo(x * width, y * height)
        context.stroke()
      }
    }

    context.globalCompositeOperation = 'source-over'
    positions.forEach(([x, y], index) => {
      const particle = particles[index]
      const explosionBoost = phase.name === 'explode' ? Math.sin(phase.amount * Math.PI) * 2.2 : 0
      context.globalAlpha = 0.58 + explosionBoost * 0.1
      context.fillStyle = particle.color
      context.shadowColor = particle.color
      context.shadowBlur = 7 + explosionBoost * 5
      context.beginPath()
      context.arc(x * width, y * height, particle.size + explosionBoost, 0, Math.PI * 2)
      context.fill()
    })
    context.restore()
  }

  const render = (now) => {
    if (visible) draw(now - start)
    frame = requestAnimationFrame(render)
  }

  const resizeObserver = new ResizeObserver(resize)
  const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
  resizeObserver.observe(canvas)
  visibilityObserver.observe(canvas)
  resize()
  if (animate) frame = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    visibilityObserver.disconnect()
  }
}
