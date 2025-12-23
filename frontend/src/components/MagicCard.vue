<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  enableStars: { type: Boolean, default: true },
  enableTilt: { type: Boolean, default: true },
  enableMagnetism: { type: Boolean, default: true },
  glowColor: { type: String, default: '236, 72, 153' }, // Pink default
  className: { type: String, default: '' }
});

const cardRef = ref(null);
const isHovered = ref(false);
const particles = ref([]); // Храним ссылки на DOM элементы частиц

// --- Config ---
const particleCount = 12;

// --- Methods ---
const createParticle = (x, y) => {
  const el = document.createElement('div');
  el.classList.add('particle');
  el.style.background = `rgba(${props.glowColor}, 1)`;
  el.style.boxShadow = `0 0 6px rgba(${props.glowColor}, 0.6)`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  return el;
};

const animateParticles = () => {
  if (!cardRef.value || !isHovered.value) return;
  const { width, height } = cardRef.value.getBoundingClientRect();

  // Создаем частицы "на лету"
  for (let i = 0; i < particleCount; i++) {
    // Задержка для каждой частицы
    setTimeout(() => {
      if (!isHovered.value || !cardRef.value) return;

      const x = Math.random() * width;
      const y = Math.random() * height;
      const particle = createParticle(x, y);

      cardRef.value.appendChild(particle);
      particles.value.push(particle);

      // Animation: Appear
      gsap.fromTo(particle,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );

      // Animation: Float
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        rotation: Math.random() * 360,
        duration: 2 + Math.random() * 2,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });

      // Animation: Pulse
      gsap.to(particle, {
        opacity: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });

    }, i * 100);
  }
};

const clearParticles = () => {
  particles.value.forEach(p => {
    gsap.to(p, {
      scale: 0, opacity: 0, duration: 0.3,
      onComplete: () => p.remove()
    });
  });
  particles.value = [];
};

// --- Handlers ---
const handleMouseEnter = () => {
  isHovered.value = true;
  if (props.enableStars) animateParticles();

  if (props.enableTilt) {
    gsap.to(cardRef.value, { rotateX: 5, rotateY: 5, duration: 0.3 });
  }
};

const handleMouseLeave = () => {
  isHovered.value = false;
  clearParticles();

  // Reset Transforms
  gsap.to(cardRef.value, {
    rotateX: 0, rotateY: 0, x: 0, y: 0,
    duration: 0.5, ease: 'power2.out'
  });
};

const handleMouseMove = (e) => {
  if (!cardRef.value) return;
  const rect = cardRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  if (props.enableTilt) {
    const rotateX = ((y - centerY) / centerY) * -10; // инверсия для тилта
    const rotateY = ((x - centerX) / centerX) * 10;
    gsap.to(cardRef.value, {
      rotateX, rotateY,
      duration: 0.1, ease: 'power2.out', transformPerspective: 1000
    });
  }

  if (props.enableMagnetism) {
    const magnetX = (x - centerX) * 0.1;
    const magnetY = (y - centerY) * 0.1;
    gsap.to(cardRef.value, { x: magnetX, y: magnetY, duration: 0.3 });
  }
};

const handleClick = (e) => {
  const rect = cardRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Создаем Ripple
  const ripple = document.createElement('div');
  ripple.classList.add('ripple');
  ripple.style.background = `radial-gradient(circle, rgba(${props.glowColor}, 0.4) 0%, transparent 70%)`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  cardRef.value.appendChild(ripple);

  gsap.fromTo(ripple,
    { scale: 0, opacity: 1 },
    { scale: 4, opacity: 0, duration: 0.8, onComplete: () => ripple.remove() }
  );
};
</script>

<template>
  <div
    ref="cardRef"
    class="magic-card"
    :class="className"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousemove="handleMouseMove"
    @click="handleClick"
    :style="{ '--glow-color': glowColor }"
  >
    <div class="card-border"></div>

    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style>
.magic-card {
  position: relative;
  background: rgba(10, 10, 12, 0.8); /* Dark base */
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
  /* Для прожектора */
  --glow-intensity: 0;
  --glow-x: 0;
  --glow-y: 0;
}

/* Эффект прожектора (Spotlight) на самой карточке */
.magic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    800px circle at var(--glow-x) var(--glow-y),
    rgba(var(--glow-color), var(--glow-intensity)) 0%,
    transparent 100%
  );
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
}

/* Border Glow */
.card-border {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1px; /* Толщина рамки */
  background: radial-gradient(
    400px circle at var(--glow-x) var(--glow-y),
    rgba(var(--glow-color), 1),
    transparent 40%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  z-index: 2;
  pointer-events: none;
  opacity: 0.6;
}

.card-content {
  position: relative;
  z-index: 10;
  height: 100%;
  width: 100%;
}

/* Частицы */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 5;
}

.ripple {
  position: absolute;
  width: 100px; height: 100px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 4;
}

.magic-card {
  position: relative;
  background: rgba(20, 20, 25, 0.6); /* Чуть светлее фон */
  backdrop-filter: blur(20px);        /* Размытие фона за карточкой */
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;

  /* ВАЖНО: Фиксируем цвет текста */
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.05);

  --glow-intensity: 0;
  --glow-x: 0;
  --glow-y: 0;
}

/* Остальные стили (.card-border, .particle и т.д.) оставь без изменений */

</style>
