// src/composables/usePlasmaBackground.js

import { ref, onMounted, onUnmounted } from 'vue'
import * as ogl from 'ogl'

// --- 1. Вершинный шейдер (Vertex Shader) ---
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
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;

  // --- Палитра цветов ---
  const vec3 color1 = vec3(0.23, 0.51, 0.96); // Синий
  const vec3 color2 = vec3(0.12, 0.16, 0.21); // Темный
  const vec3 color3 = vec3(0.94, 0.96, 0.98); // Светлый

  // --- Функция плазмы ---
  float plasma(vec2 uv) {
    float c = 0.0;
    c += sin(uv.x * 4.0 + u_time);
    c += sin(uv.y * 3.0 + u_time * 0.5);
    c += sin((uv.x + uv.y) * 5.0 + u_time);
    c += sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 4.0 - u_time * 0.8);
    return c / 4.0;
  }

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
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

      if (!gl) {
        console.error('WebGL не поддерживается')
        return false
      }

      renderer = new ogl.Renderer({
        canvas,
        dpr: window.devicePixelRatio || 1,
        alpha: false
      })

      const { gl: rendererGl } = renderer
      renderer.setSize(window.innerWidth, window.innerHeight)

      // Создаем простую геометрию fullscreen quad
      const geometry = new ogl.Geometry(rendererGl, {
        position: {
          size: 2,
          data: new Float32Array([-1, -1, 3, -1, -1, 3])
        },
        uv: {
          size: 2,
          data: new Float32Array([0, 0, 2, 0, 0, 2])
        }
      })

      program = new ogl.Program(rendererGl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms,
      })

      mesh = new ogl.Mesh(rendererGl, { geometry, program })

      return true
    } catch (e) {
      console.error("Ошибка инициализации WebGL:", e)
      return false
    }
  }

  // --- Цикл Анимации ---
  const animate = (time) => {
    animationFrameId = requestAnimationFrame(animate)
    uniforms.u_time.value = time * 0.0003
    if (renderer && mesh) {
      renderer.render({ scene: mesh })
    }
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
      const success = init(canvasRef.value)
      if (success) {
        animate(0)
        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)
      }
    }
  })

  onUnmounted(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return {
    canvasRef,
  }
}
