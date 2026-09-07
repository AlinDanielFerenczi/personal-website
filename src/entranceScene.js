import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const range = (value, start, end) => clamp((value - start) / (end - start))
const ease = (value) => value * value * (3 - 2 * value)

function makeMetalTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 1024
  const context = canvas.getContext('2d')
  const gradient = context.createLinearGradient(0, 0, 512, 0)
  gradient.addColorStop(0, '#111214')
  gradient.addColorStop(0.42, '#555a5f')
  gradient.addColorStop(0.52, '#1a1c1f')
  gradient.addColorStop(1, '#34383c')
  context.fillStyle = gradient
  context.fillRect(0, 0, 512, 1024)
  for (let y = 0; y < 1024; y += 2) {
    context.fillStyle = `rgba(255,255,255,${0.045 + (y % 7) * 0.006})`
    context.fillRect(0, y, 512, 1)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeCeramicTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1024
  const context = canvas.getContext('2d')
  const base = context.createLinearGradient(0, 0, 1024, 1024)
  base.addColorStop(0, '#e7e5e3')
  base.addColorStop(0.45, '#ffffff')
  base.addColorStop(1, '#dfe5e8')
  context.fillStyle = base
  context.fillRect(0, 0, 1024, 1024)
  const pearl = context.createRadialGradient(260, 220, 20, 260, 220, 760)
  pearl.addColorStop(0, 'rgba(225,42,251,.13)')
  pearl.addColorStop(0.48, 'rgba(255,255,255,0)')
  pearl.addColorStop(1, 'rgba(0,209,255,.11)')
  context.fillStyle = pearl
  context.fillRect(0, 0, 1024, 1024)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function initEntrance(container, canvas, header, reducedMotion = false) {
  if (reducedMotion) {
    container.classList.add('entrance-complete')
    header.style.transform = 'translateX(-50%)'
    return () => {}
  }

  document.documentElement.classList.add('entrance-active')
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  camera.position.z = 5
  scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1.35))
  const edgeLight = new THREE.DirectionalLight(0xffffff, 2.6)
  edgeLight.position.set(-2, 3, 4)
  scene.add(edgeLight)
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.2)
  rimLight.position.set(3, -1, 2)
  scene.add(rimLight)
  const magentaGlow = new THREE.PointLight(0xe12afb, 2.2, 8)
  magentaGlow.position.set(-2.5, 1.2, 2.5)
  scene.add(magentaGlow)
  const cyanGlow = new THREE.PointLight(0x00d1ff, 2.2, 8)
  cyanGlow.position.set(2.5, -1.2, 2.5)
  scene.add(cyanGlow)

  const metalTexture = makeMetalTexture()
  const ceramicTexture = makeCeramicTexture()
  const panel = new THREE.MeshPhysicalMaterial({
    map: ceramicTexture,
    color: 0xffffff,
    metalness: 0.04,
    roughness: 0.24,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
    iridescence: 0.42,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 360],
  })
  const trim = new THREE.MeshStandardMaterial({ map: metalTexture, color: 0xffffff, metalness: 0.98, roughness: 0.2 })
  const doors = []

  for (let index = 0; index < 2; index += 1) {
    const door = new THREE.Group()
    const slab = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.12), panel)
    door.add(slab)
    door.userData.slab = slab
    door.userData.horizontalBars = []
    door.userData.verticalBars = []

    for (const y of [-0.985, -0.5, 0, 0.5, 0.985]) {
      const thickness = Math.abs(y) > 0.9 ? 0.035 : 0.022
      const bar = new THREE.Mesh(new RoundedBoxGeometry(1, thickness, 0.06, 3, Math.min(0.008, thickness / 3)), trim)
      bar.position.set(0, y, 0.073)
      door.add(bar)
      door.userData.horizontalBars.push(bar)
    }

    for (const x of [-0.49, 0.49]) {
      const bar = new THREE.Mesh(new RoundedBoxGeometry(0.035, 2.04, 0.06, 3, 0.008), trim)
      bar.position.set(x, 0, 0.073)
      door.add(bar)
      door.userData.verticalBars.push(bar)
    }

    scene.add(door)
    doors.push(door)
  }

  let doorWidth = 1
  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const aspect = width / height
    camera.left = -aspect
    camera.right = aspect
    camera.updateProjectionMatrix()
    doorWidth = aspect + 0.04
    doors.forEach((door, index) => {
      door.userData.slab.scale.x = doorWidth
      door.userData.horizontalBars.forEach((bar) => { bar.scale.x = doorWidth * 0.964 })
      door.userData.verticalBars[0].position.x = -doorWidth * 0.482
      door.userData.verticalBars[1].position.x = doorWidth * 0.482
      door.position.x = index ? aspect / 2 : -aspect / 2
    })
    update()
  }

  const heroContent = container.querySelector('.hero-content')
  const explore = container.querySelector('.hero-scroll-button')
  const gate = container.querySelector('.entrance-gate')
  const prompt = container.querySelector('.entrance-prompt')
  let progress = 0

  const update = () => {
    const scrollLength = Math.max(1, container.offsetHeight - window.innerHeight)
    progress = clamp((window.scrollY - container.offsetTop) / scrollLength)
    const opening = ease(range(progress, 0.06, 0.78))
    const aspect = camera.right

    doors[0].position.x = -aspect / 2 - opening * (doorWidth + 0.08)
    doors[1].position.x = aspect / 2 + opening * (doorWidth + 0.08)
    doors[0].rotation.y = opening * -0.08
    doors[1].rotation.y = opening * 0.08
    gate.style.opacity = String(1 - range(progress, 0.72, 0.98))
    gate.style.pointerEvents = progress > 0.94 ? 'none' : 'auto'
    prompt.style.opacity = String(1 - range(progress, 0.02, 0.24))
    heroContent.style.transform = `translateY(${(1 - opening) * 2.5}rem)`
    heroContent.style.opacity = String(range(progress, 0.42, 0.75))
    explore.style.opacity = String(range(progress, 0.66, 0.88))

    const reveal = ease(range(progress, 0.34, 0.7))
    const stretch = 0.42 + reveal * 0.58 + Math.sin(reveal * Math.PI) * 0.18
    const sectionEnd = container.offsetTop + scrollLength
    const retreat = range(window.scrollY - sectionEnd, 160, 440)
    header.style.transform = `translate(-50%, ${-112 * (1 - reveal) - 125 * retreat}%) scaleY(${stretch})`
    header.style.opacity = String(range(reveal, 0.05, 0.25))
    renderer.render(scene, camera)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  window.addEventListener('scroll', update, { passive: true })
  resize()

  return () => {
    window.removeEventListener('scroll', update)
    observer.disconnect()
    document.documentElement.classList.remove('entrance-active')
    scene.traverse((object) => object.geometry?.dispose())
    ;[panel, trim].forEach((material) => material.dispose())
    metalTexture.dispose()
    ceramicTexture.dispose()
    renderer.dispose()
    header.removeAttribute('style')
  }
}
