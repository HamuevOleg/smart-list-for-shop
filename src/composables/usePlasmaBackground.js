// src/composables/usePlasmaBackground.js

import { ref, onMounted, onUnmounted } from 'vue'
// 1. ОСТАВЛЯЕМ этот импорт - он правильный
import * as ogl from 'ogl'

// --- 1. Вершинный шейдер (Vertex Shader) ---
// (без изменений)
const vertexShader = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`

// --- 2. Фрагментный шейдер (Fragment Shader) ---
// (без изменений, рабочая версия)
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  // --- Наша палитра (из main.css) ---
  const vec3 color1 = vec3(0.23, 0.51, 0.96);
  const vec3 color2 = vec3(0.12, 0.16, 0.21);
  const vec3 color3 = vec3(0.94, 0.96, 0.98);

  // --- Новая, простая функция плазмы ---
  float plasma(vec2 uv) {
    float c = 0.0;
    c += sin(uv.x * 4.0 + u_time);
    c += sin(uv.y * 3.0 + u_time * 0.5);
    c += sin((uv.x + uv.y) * 5.0 + u_time);
    c += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 4.0 - u_time * 0.8);
    return c / 4.0;
  }

  // --- Основная функция ---
  void main() {
    vec2 uv = (vUv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 mouse = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);

    float mouseDist = distance(uv, mouse);
    float distortion = 1.0 - smoothstep(0.0, 0.25, mouseDist);
    uv -= normalize(uv - mouse) * distortion * 0.15;

    float noise = plasma(uv * 4.0);
    noise = (noise + 1.0) * 0.5;

    vec3 color = mix(color2, color1, noise);
    color = mix(color, color3, noise * 0.3);

    float vignette = 1.0 - length(vUv - 0.5) * 0.8;
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`

// --- 3. Composable-функция ---
export function usePlasmaBackground() {
  const canvasRef = ref(null)
  let animationFrameId = null
  let renderer, mesh, program

  const uniforms = {
    u_time: { value: 0 },
    u_mouse: { value: [0.5, 0.5] },
    u_resolution: { value: [window.innerWidth, window.innerHeight] },
  }

  // --- Инициализация ---
  const init = (canvas) => {
    renderer = new ogl.Renderer({ canvas, dpr: window.devicePixelRatio || 1 })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // 2. ВОЗВРАЩАЕМСЯ К ЭТОМУ КОДУ
    // 'ogl.Triangle' - это специальный класс, который УЖЕ
    // содержит 'position' и 'uv'. Мой 'new ogl.Geometry' был не нужен.
    const geometry = new ogl.Triangle(renderer.gl)

    program = new ogl.Program(renderer.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms,
    })

    mesh = new ogl.Mesh(renderer.gl, { geometry, program })
  }

  // --- Цикл Анимации ---
  const animate = (time) => {
    animationFrameId = requestAnimationFrame(animate)
    uniforms.u_time.value = time * 0.0003
    renderer.render({ mesh })
  }

  // --- Обработчики ---
  const handleResize = () => {
    if (!renderer) return
    renderer.setSize(window.innerWidth, window.innerHeight)
    uniforms.u_resolution.value = [window.innerWidth, window.innerHeight]
  }

  const handleMouseMove = (event) => {
    uniforms.u_mouse.value = [
      event.clientX / window.innerWidth,
      1.0 - event.clientY / window.innerHeight,
    ]
  }

  // --- Хуки Жизненного Цикла ---
  onMounted(() => {
    if (canvasRef.value) {
      try {
        init(canvasRef.value)
        animate(0)
        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)
      } catch (e) {
        console.error("Ошибка инициализации WebGL:", e)
      }
    }
  })

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return {
    canvasRef,
  }
}
