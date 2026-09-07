import * as THREE from 'three'

export function initGrowthScene(canvas, animate = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 10)
  camera.position.z = 5
  const field = new THREE.Group()
  scene.add(field)

  const colors = [0xe12afb, 0x2b7fff, 0x00d1ff, 0x00c951]
  const lines = []

  for (let index = 0; index < 6; index += 1) {
    const base = -10 + index * 4
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 7 }, (_, point) => {
        const x = -10 + point * (20 / 6)
        const y = base + Math.sin(point * 1.15 + index * 0.9) * (1.1 + index * 0.08)
        return new THREE.Vector3(x, y, 0)
      }),
    )
    const color = colors[index % colors.length]
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22 }),
    )
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(18)),
      new THREE.PointsMaterial({ color, size: 0.08, transparent: true, opacity: 0.7 }),
    )
    const layer = new THREE.Group()
    layer.add(line, particles)
    layer.userData = { phase: index * 0.8 }
    field.add(layer)
    lines.push(layer)
  }

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const vertical = 8 * (height / width)
    camera.top = vertical
    camera.bottom = -vertical
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  let frame
  const clock = new THREE.Clock()
  const render = () => {
    const time = clock.getElapsedTime()
    lines.forEach((line) => {
      line.position.x = Math.sin(time * 0.18 + line.userData.phase) * 0.3
      line.position.y = Math.cos(time * 0.12 + line.userData.phase) * 0.16
    })
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  if (animate) frame = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    scene.traverse((object) => {
      object.geometry?.dispose()
      object.material?.dispose()
    })
    renderer.dispose()
  }
}
