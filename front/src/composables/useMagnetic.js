// src/composables/useMagnetic.js

import { ref, computed } from 'vue'

/**
 * @param {number} damping - Фактор "прилипания".
 * 0.1 = очень сильное (едва движется), 0.5 = слабое (движется сильно).
 */
export function useMagnetic(damping = 0.2) {
  // 1. Реактивные 'ref' для X и Y
  const x = ref(0)
  const y = ref(0)

  // 2. Вычисляемое свойство для :style
  const magneticStyle = computed(() => {
    // Мы используем 'translate3d' для GPU-ускорения
    return {
      transform: `translate3d(${x.value}px, ${y.value}px, 0)`,
    }
  })

  // 3. Обработчик движения мыши
  const onMouseMove = (event) => {
    const el = event.currentTarget
    if (!el) return

    const rect = el.getBoundingClientRect()
    const elCenterX = rect.left + rect.width / 2
    const elCenterY = rect.top + rect.height / 2

    // Разница между центром элемента и положением мыши
    const deltaX = event.clientX - elCenterX
    const deltaY = event.clientY - elCenterY

    // Применяем "демпфирование", чтобы элемент "притягивался",
    // а не следовал за мышью 1-в-1.
    x.value = deltaX * damping
    y.value = deltaY * damping
  }

  // 4. Обработчик ухода мыши (возвращаем в центр)
  const onMouseLeave = () => {
    x.value = 0
    y.value = 0
  }

  // 5. Возвращаем все, что нужно компоненту
  return {
    magneticStyle,
    onMouseMove,
    onMouseLeave,
  }
}
