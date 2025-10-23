<template>
  <div class="popover-wrapper" ref="wrapperRef">`
    <div @click="toggle">
      <slot name="trigger"></slot>
    </div>

    <Transition name="popover-fade">
      <div class="popover-content" v-if="isOpen">
        <slot name="content" :close="close"></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = ref(false)
const wrapperRef = ref(null)

const toggle = () => (isOpen.value = !isOpen.value)
const close = () => (isOpen.value = false)

// Закрываем по клику мимо
const handleClickOutside = (event) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
})
</script>

<style scoped>
.popover-wrapper {
  position: relative;
  width: 100%;
}

.popover-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 300px;
  background: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
  z-index: 100;
  padding: 1rem;
}

/* Анимация */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: all 0.2s ease;
}
.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
