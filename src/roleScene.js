import * as THREE from 'three'

export function initRoleScene(canvas, animate = true) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-4, 4, 6, -6, 0.1, 20)
  camera.position.z = 8
  const group = new THREE.Group()
  scene.add(group)

  const geometries = [
    new THREE.IcosahedronGeometry(1.1, 1),
    new THREE.TorusKnotGeometry(0.78, 0.22, 96, 12),
    new THREE.OctahedronGeometry(1.15, 1),
  ]
  const colors = [0xe12afb, 0x00d1ff, 0x2b7fff]
  const positions = [new THREE.Vector3(1.9, 3.7, 0), new THREE.Vector3(-1.8, 0, 0), new THREE.Vector3(1.9, -3.7, 0)]

  const shapes = geometries.map((geometry, index) => {
    const shape = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: colors[index], wireframe: true, transparent: true, opacity: 0.5 }),
    )
    shape.position.copy(positions[index])
    shape.rotation.set(index * 0.4, index * 0.55, 0)
    group.add(shape)
    return shape
  })

  const path = new THREE.CatmullRomCurve3(positions)
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(path.getPoints(80)),
    new THREE.LineBasicMaterial({ color: 0x8f5cff, transparent: true, opacity: 0.24 }),
  ))

  let pointerX = 0
  let pointerY = 0
  const onPointerMove = (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = Math.min(0.5, Math.max(-0.5, (event.clientX - rect.left) / rect.width - 0.5))
    const y = Math.min(0.5, Math.max(-0.5, (event.clientY - rect.top) / rect.height - 0.5))
    pointerX = x * 0.7
    pointerY = y * 0.5
  }

  const resize = () => {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (!width || !height) return
    renderer.setSize(width, height, false)
    const horizontal = 6 * (width / height)
    camera.left = -horizontal
    camera.right = horizontal
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  let frame
  const clock = new THREE.Clock()
  const render = () => {
    const time = clock.getElapsedTime()
    group.rotation.y += (pointerX - group.rotation.y) * 0.04
    group.rotation.x += (-pointerY - group.rotation.x) * 0.04
    shapes.forEach((shape, index) => {
      shape.rotation.x = time * (0.12 + index * 0.025)
      shape.rotation.y = time * (0.16 + index * 0.03)
    })
    renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  resize()
  if (animate) frame = requestAnimationFrame(render)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    scene.traverse((object) => {
      object.geometry?.dispose()
      object.material?.dispose()
    })
    renderer.dispose()
  }
}
