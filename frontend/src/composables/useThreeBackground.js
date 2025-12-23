// src/composables/useThreeBackground.js
import * as THREE from 'three'
import { onMounted, onUnmounted } from 'vue'

export function useThreeBackground(canvasRef) {
  let scene, camera, renderer, animationId
  let particlesMesh, particlesMesh2
  const floatingShapes = []
  const glowSpheres = []

  let mouseX = 0
  let mouseY = 0
  let targetX = 0
  let targetY = 0

  const windowHalfX = window.innerWidth / 2
  const windowHalfY = window.innerHeight / 2

  const init = () => {
    if (!canvasRef.value) return

    // Scene
    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x0a0515, 0.0015)

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 40

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      alpha: true,
      antialias: true
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x060010, 1)

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5)
    scene.add(ambientLight)

    // Primary Pink Light (rotating)
    const pointLight1 = new THREE.PointLight(0xff3366, 30, 120)
    pointLight1.position.set(-25, 15, 25)
    scene.add(pointLight1)

    // Secondary Blue Light (rotating opposite)
    const pointLight2 = new THREE.PointLight(0x60a5fa, 25, 100)
    pointLight2.position.set(25, -15, 25)
    scene.add(pointLight2)

    // Accent Purple Light
    const pointLight3 = new THREE.PointLight(0x9333ea, 20, 80)
    pointLight3.position.set(0, 20, -20)
    scene.add(pointLight3)

    // Starfield Layer 1 (Fast moving)
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 3000
    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)

    for(let i = 0; i < particlesCount; i++) {
      const i3 = i * 3
      posArray[i3] = (Math.random() - 0.5) * 150
      posArray[i3 + 1] = (Math.random() - 0.5) * 150
      posArray[i3 + 2] = (Math.random() - 0.5) * 150

      // Random colors (white, pink, blue)
      const colorChoice = Math.random()
      if (colorChoice < 0.33) {
        colorsArray[i3] = 1
        colorsArray[i3 + 1] = 0.2
        colorsArray[i3 + 2] = 0.4
      } else if (colorChoice < 0.66) {
        colorsArray[i3] = 0.38
        colorsArray[i3 + 1] = 0.65
        colorsArray[i3 + 2] = 0.98
      } else {
        colorsArray[i3] = 1
        colorsArray[i3 + 1] = 1
        colorsArray[i3 + 2] = 1
      }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Starfield Layer 2 (Slower, smaller)
    const particlesGeometry2 = new THREE.BufferGeometry()
    const particlesCount2 = 1500
    const posArray2 = new Float32Array(particlesCount2 * 3)

    for(let i = 0; i < particlesCount2 * 3; i++) {
      posArray2[i] = (Math.random() - 0.5) * 100
    }

    particlesGeometry2.setAttribute('position', new THREE.BufferAttribute(posArray2, 3))

    const particlesMaterial2 = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    })

    particlesMesh2 = new THREE.Points(particlesGeometry2, particlesMaterial2)
    scene.add(particlesMesh2)

    // Glowing Spheres (Ambient orbs)
    for (let i = 0; i < 8; i++) {
      const sphereGeometry = new THREE.SphereGeometry(Math.random() * 2 + 1, 32, 32)
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xff3366 : 0x60a5fa,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      })

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
      )

      sphere.userData = {
        driftSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.01
        },
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      }

      scene.add(sphere)
      glowSpheres.push(sphere)
    }

    // Floating Geometric Shapes
    const geometryTypes = [
      new THREE.IcosahedronGeometry(1.5, 0),
      new THREE.TorusGeometry(1, 0.3, 16, 50),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1.5, 0)
    ]

    const shapeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.4
    })

    for (let i = 0; i < 20; i++) {
      const geom = geometryTypes[Math.floor(Math.random() * geometryTypes.length)].clone()
      const mesh = new THREE.Mesh(geom, shapeMaterial.clone())

      mesh.position.x = (Math.random() - 0.5) * 50
      mesh.position.y = (Math.random() - 0.5) * 50
      mesh.position.z = (Math.random() - 0.5) * 40

      const scale = Math.random() * 0.5 + 0.5
      mesh.scale.set(scale, scale, scale)

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.015 + 0.01,
        floatOffset: Math.random() * Math.PI * 2,
        floatAmplitude: Math.random() * 2 + 1,
        initialY: mesh.position.y,
        driftX: (Math.random() - 0.5) * 0.01,
        driftZ: (Math.random() - 0.5) * 0.01
      }

      scene.add(mesh)
      floatingShapes.push(mesh)
    }
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    const time = Date.now() * 0.001

    // Rotate Starfields
    if (particlesMesh) {
      particlesMesh.rotation.y += 0.0008
      particlesMesh.rotation.x += 0.0003
    }

    if (particlesMesh2) {
      particlesMesh2.rotation.y -= 0.0005
      particlesMesh2.rotation.x -= 0.0002
    }

    // Animate Glowing Spheres
    glowSpheres.forEach((sphere) => {
      sphere.position.x += sphere.userData.driftSpeed.x
      sphere.position.y += sphere.userData.driftSpeed.y
      sphere.position.z += sphere.userData.driftSpeed.z

      // Pulsing opacity
      const pulse = Math.sin(time * sphere.userData.pulseSpeed + sphere.userData.pulseOffset)
      sphere.material.opacity = 0.1 + pulse * 0.08

      // Boundary check
      if (Math.abs(sphere.position.x) > 60) sphere.userData.driftSpeed.x *= -1
      if (Math.abs(sphere.position.y) > 60) sphere.userData.driftSpeed.y *= -1
      if (Math.abs(sphere.position.z) > 40) sphere.userData.driftSpeed.z *= -1
    })

    // Animate Floating Shapes
    floatingShapes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotationSpeed.x
      mesh.rotation.y += mesh.userData.rotationSpeed.y
      mesh.rotation.z += mesh.userData.rotationSpeed.z

      mesh.position.y = mesh.userData.initialY +
        Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * mesh.userData.floatAmplitude

      mesh.position.x += mesh.userData.driftX
      mesh.position.z += mesh.userData.driftZ

      // Boundary check and reverse
      if (Math.abs(mesh.position.x) > 50) mesh.userData.driftX *= -1
      if (Math.abs(mesh.position.z) > 40) mesh.userData.driftZ *= -1
    })

    // Mouse Parallax
    targetX = mouseX * 0.0015
    targetY = mouseY * 0.0015

    if (particlesMesh) {
      particlesMesh.rotation.y += 0.03 * (targetX - particlesMesh.rotation.y)
      particlesMesh.rotation.x += 0.03 * (targetY - particlesMesh.rotation.x)
    }

    camera.position.x += (mouseX * 0.01 - camera.position.x) * 0.05
    camera.position.y += (-mouseY * 0.01 - camera.position.y) * 0.05
    camera.lookAt(scene.position)

    renderer.render(scene, camera)
  }

  const onWindowResize = () => {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  const onMouseMove = (event) => {
    mouseX = (event.clientX - windowHalfX)
    mouseY = (event.clientY - windowHalfY)
  }

  onMounted(() => {
    init()
    animate()
    window.addEventListener('resize', onWindowResize)
    document.addEventListener('mousemove', onMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize)
    document.removeEventListener('mousemove', onMouseMove)
    if (animationId) cancelAnimationFrame(animationId)

    if (renderer) renderer.dispose()
    if (scene) {
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }
  })

  return {}
}
