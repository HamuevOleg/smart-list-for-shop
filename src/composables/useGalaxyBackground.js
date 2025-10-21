// src/composables/useGalaxyBackground.js

import { ref, onMounted, onUnmounted } from 'vue'

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

#define BG_COLOR_CENTER vec3(0.02, 0.02, 0.05)
#define BG_COLOR_MID vec3(0.05, 0.05, 0.15)
#define BG_COLOR_EDGE vec3(0.08, 0.08, 0.25)

#define STAR_COLOR_HOT vec3(0.2, 0.8, 1.0)
#define STAR_COLOR_WARM vec3(1.0, 0.8, 0.2)
#define STAR_COLOR_COOL vec3(0.5, 0.2, 1.0)

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      vec3 starColor;
      if (seed < 0.33) {
        starColor = mix(STAR_COLOR_HOT, vec3(1.0), seed * 3.0 * 0.3);
      } else if (seed < 0.66) {
        starColor = mix(STAR_COLOR_WARM, vec3(1.0), (seed - 0.33) * 3.0 * 0.2);
      } else {
        starColor = mix(STAR_COLOR_COOL, vec3(1.0), (seed - 0.66) * 3.0 * 0.25);
      }

      float hue = atan(starColor.g - starColor.r, starColor.b - starColor.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(starColor - vec3(dot(starColor, vec3(0.299, 0.587, 0.114)))) * (1.0 + uSaturation);
      float val = max(max(starColor.r, starColor.g), starColor.b);
      starColor = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      float star = Star(gv - offset - pad, flareSize);

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * starColor;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  // Фон с градиентом
  vec3 bgColor = mix(BG_COLOR_CENTER, BG_COLOR_MID, 0.5);
  bgColor = mix(bgColor, BG_COLOR_EDGE, length(vUv - 0.5) * 1.5);

  // Звёзды
  vec3 starsCol = vec3(0.0);
  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    starsCol += StarLayer(uv * scale + i * 453.32) * fade;
  }

  // Композиция: звёзды поверх фона
  vec3 col = bgColor + starsCol;

  if (uTransparent) {
    float alpha = length(starsCol);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`

export function useGalaxyBackground(options = {}) {
  const {
    focal = [0.5, 0.5],
    rotation = [1.0, 0.0],
    starSpeed = 0.5,
    density = 1,
    hueShift = 140,
    disableAnimation = false,
    speed = 1.0,
    mouseInteraction = true,
    glowIntensity = 0.3,
    saturation = 0.0,
    mouseRepulsion = true,
    repulsionStrength = 2,
    twinkleIntensity = 0.3,
    rotationSpeed = 0.1,
    autoCenterRepulsion = 0,
    transparent = true,
  } = options

  const canvasRef = ref(null)
  let animateId = null
  let gl = null
  let program = null
  let posBuffer = null

  const targetMousePos = { x: 0.5, y: 0.5 }
  const smoothMousePos = { x: 0.5, y: 0.5 }
  let targetMouseActive = 0.0
  let smoothMouseActive = 0.0

  function compileShader(source, type) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader))
    }
    return shader
  }

  function createProgram() {
    const vs = compileShader(vertexShader, gl.VERTEX_SHADER)
    const fs = compileShader(fragmentShader, gl.FRAGMENT_SHADER)
    const p = gl.createProgram()
    gl.attachShader(p, vs)
    gl.attachShader(p, fs)
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error('Program error:', gl.getProgramInfoLog(p))
    }
    return p
  }

  function init(canvas) {
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return false

      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h

      gl.viewport(0, 0, w, h)
      gl.enable(gl.BLEND)

      if (transparent) {
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.clearColor(0, 0, 0, 0)
      } else {
        gl.clearColor(0, 0, 0, 1)
      }

      program = createProgram()
      if (!program) return false

      // Geometry: fullscreen quad
      posBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
      const verts = new Float32Array([
        -1, -1, 0, 0,
        3, -1, 2, 0,
        -1, 3, 0, 2
      ])
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

      gl.useProgram(program)

      const posLoc = gl.getAttribLocation(program, 'position')
      const uvLoc = gl.getAttribLocation(program, 'uv')

      gl.enableVertexAttribArray(posLoc)
      gl.enableVertexAttribArray(uvLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0)
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8)

      const uniforms = {
        uTime: gl.getUniformLocation(program, 'uTime'),
        uResolution: gl.getUniformLocation(program, 'uResolution'),
        uFocal: gl.getUniformLocation(program, 'uFocal'),
        uRotation: gl.getUniformLocation(program, 'uRotation'),
        uStarSpeed: gl.getUniformLocation(program, 'uStarSpeed'),
        uDensity: gl.getUniformLocation(program, 'uDensity'),
        uHueShift: gl.getUniformLocation(program, 'uHueShift'),
        uSpeed: gl.getUniformLocation(program, 'uSpeed'),
        uMouse: gl.getUniformLocation(program, 'uMouse'),
        uGlowIntensity: gl.getUniformLocation(program, 'uGlowIntensity'),
        uSaturation: gl.getUniformLocation(program, 'uSaturation'),
        uMouseRepulsion: gl.getUniformLocation(program, 'uMouseRepulsion'),
        uTwinkleIntensity: gl.getUniformLocation(program, 'uTwinkleIntensity'),
        uRotationSpeed: gl.getUniformLocation(program, 'uRotationSpeed'),
        uRepulsionStrength: gl.getUniformLocation(program, 'uRepulsionStrength'),
        uMouseActiveFactor: gl.getUniformLocation(program, 'uMouseActiveFactor'),
        uAutoCenterRepulsion: gl.getUniformLocation(program, 'uAutoCenterRepulsion'),
        uTransparent: gl.getUniformLocation(program, 'uTransparent'),
      }

      gl.uniform1f(uniforms.uTime, 0)
      gl.uniform3f(uniforms.uResolution, w, h, w / h)
      gl.uniform2f(uniforms.uFocal, focal[0], focal[1])
      gl.uniform2f(uniforms.uRotation, rotation[0], rotation[1])
      gl.uniform1f(uniforms.uStarSpeed, starSpeed)
      gl.uniform1f(uniforms.uDensity, density)
      gl.uniform1f(uniforms.uHueShift, hueShift)
      gl.uniform1f(uniforms.uSpeed, speed)
      gl.uniform2f(uniforms.uMouse, 0.5, 0.5)
      gl.uniform1f(uniforms.uGlowIntensity, glowIntensity)
      gl.uniform1f(uniforms.uSaturation, saturation)
      gl.uniform1i(uniforms.uMouseRepulsion, mouseRepulsion ? 1 : 0)
      gl.uniform1f(uniforms.uTwinkleIntensity, twinkleIntensity)
      gl.uniform1f(uniforms.uRotationSpeed, rotationSpeed)
      gl.uniform1f(uniforms.uRepulsionStrength, repulsionStrength)
      gl.uniform1f(uniforms.uMouseActiveFactor, 0)
      gl.uniform1f(uniforms.uAutoCenterRepulsion, autoCenterRepulsion)
      gl.uniform1i(uniforms.uTransparent, transparent ? 1 : 0)

      let startTime = Date.now()

      const animate = () => {
        animateId = requestAnimationFrame(animate)

        if (!disableAnimation) {
          const t = (Date.now() - startTime) * 0.001
          gl.uniform1f(uniforms.uTime, t)
          gl.uniform1f(uniforms.uStarSpeed, (t * starSpeed) / 10.0)
        }

        const lerp = 0.05
        smoothMousePos.x += (targetMousePos.x - smoothMousePos.x) * lerp
        smoothMousePos.y += (targetMousePos.y - smoothMousePos.y) * lerp
        smoothMouseActive += (targetMouseActive - smoothMouseActive) * lerp

        gl.uniform2f(uniforms.uMouse, smoothMousePos.x, smoothMousePos.y)
        gl.uniform1f(uniforms.uMouseActiveFactor, smoothMouseActive)

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }

      animate()

      const handleResize = () => {
        const nw = canvas.offsetWidth
        const nh = canvas.offsetHeight
        canvas.width = nw
        canvas.height = nh
        gl.viewport(0, 0, nw, nh)
        gl.uniform3f(uniforms.uResolution, nw, nh, nw / nh)
      }

      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        targetMousePos.x = (e.clientX - rect.left) / rect.width
        targetMousePos.y = 1.0 - (e.clientY - rect.top) / rect.height
        targetMouseActive = 1.0
      }

      const handleMouseLeave = () => {
        targetMouseActive = 0.0
      }

      window.addEventListener('resize', handleResize)
      if (mouseInteraction) {
        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseleave', handleMouseLeave)
      }

      return () => {
        cancelAnimationFrame(animateId)
        window.removeEventListener('resize', handleResize)
        if (mouseInteraction) {
          canvas.removeEventListener('mousemove', handleMouseMove)
          canvas.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    } catch (e) {
      console.error('Galaxy init error:', e)
      return false
    }
  }

  onMounted(() => {
    if (canvasRef.value) {
      init(canvasRef.value)
    }
  })

  onUnmounted(() => {
    if (animateId) cancelAnimationFrame(animateId)
  })

  return { canvasRef }
}
