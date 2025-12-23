<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  glowColor: { type: String, default: '236, 72, 153' }
});

const gridRef = ref(null);
const spotlightRef = ref(null);

const handleMouseMove = (e) => {
  // Исправлено для Vue (.value)
  if (!gridRef.value || !spotlightRef.value) return;

  const rect = gridRef.value.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;

  gsap.to(spotlightRef.value, { x, y, duration: 0.2, ease: 'power2.out' });

  const cards = gridRef.value.querySelectorAll('.magic-card');
  cards.forEach(card => {
    const cardRect = card.getBoundingClientRect();
    const relativeX = x - cardRect.left;
    const relativeY = y - cardRect.top;

    card.style.setProperty('--glow-x', `${relativeX}px`);
    card.style.setProperty('--glow-y', `${relativeY}px`);

    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;
    const dist = Math.hypot(x - centerX, y - centerY);
    const proximity = 400;

    let intensity = 0;
    if (dist < proximity) {
      intensity = 1 - (dist / proximity);
    }
    card.style.setProperty('--glow-intensity', intensity.toFixed(2));
  });

  const isInside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  gsap.to(spotlightRef.value, { opacity: isInside ? 0.3 : 0, duration: 0.3 });
};

onMounted(() => { window.addEventListener('mousemove', handleMouseMove); });
onBeforeUnmount(() => { window.removeEventListener('mousemove', handleMouseMove); });
</script>

<template>
  <div class="magic-bento-section" ref="gridRef">
    <div
      ref="spotlightRef"
      class="global-spotlight"
      :style="{ background: `radial-gradient(circle, rgba(${glowColor}, 0.2) 0%, transparent 60%)` }"
    ></div>
    <div class="bento-grid-layout">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.magic-bento-section { position: relative; width: 100%; padding: 20px 0; }
.global-spotlight {
  position: fixed; top: 0; left: 0; width: 500px; height: 500px; border-radius: 50%;
  pointer-events: none; transform: translate(-50%, -50%); z-index: 1; opacity: 0; mix-blend-mode: screen;
}
.bento-grid-layout {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Ровно 3 колонки */
  grid-auto-rows: 340px; /* Фиксированная высота ряда */
  gap: 24px;
  position: relative; z-index: 2;
}

@media (max-width: 900px) {
  .bento-grid-layout { grid-template-columns: 1fr; grid-auto-rows: auto; }
}
</style>
