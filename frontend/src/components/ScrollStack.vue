<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  items: { type: Array, required: true },
  itemDistance: { type: Number, default: 40 } // Отступ между карточками
});

const wrapperRef = ref(null);
const cardsRef = ref([]);

const handleScroll = () => {
  if (!wrapperRef.value) return;

  // Получаем карточки (DOM элементы)
  const cards = wrapperRef.value.querySelectorAll('.stack-card');
  const wrapperRect = wrapperRef.value.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();

    // Вычисляем дистанцию до верха зоны фиксации
    // (Примерно 15% от верха экрана)
    const targetTop = windowHeight * 0.15 + (index * props.itemDistance);

    // Дистанция от текущего положения до "точки слипания"
    const distanceToTarget = rect.top - targetTop;

    // Если карточка уже "прилипла" или близка к этому (следующая наезжает)
    // Логика: если следующая карточка наезжает, текущая уменьшается

    let scale = 1;
    let blur = 0;
    let brightness = 1;

    // Смотрим на следующую карточку
    const nextCard = cards[index + 1];
    if (nextCard) {
      const nextRect = nextCard.getBoundingClientRect();
      const nextTargetTop = targetTop + props.itemDistance;

      // Насколько следующая карточка близка к своей точке фиксации
      const nextDist = nextRect.top - nextTargetTop;

      // Если следующая карточка начала "давить" на текущую (она близко)
      if (nextDist < 500 && nextDist > 0) {
        // Линейная интерполяция
        const progress = 1 - (nextDist / 500);
        scale = 1 - (progress * 0.05); // Уменьшаем на 5%
        blur = progress * 4; // Блюр
        brightness = 1 - (progress * 0.2); // Затемнение
      } else if (nextDist <= 0) {
        // Следующая карточка полностью наехала
        scale = 0.95;
        blur = 4;
        brightness = 0.8;
      }
    }

    // Применяем стили через JS для производительности
    card.style.transform = `scale(${scale})`;
    card.style.filter = `blur(${blur}px) brightness(${brightness})`;
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Init check
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="scroll-stack-wrapper" ref="wrapperRef">
    <div
      v-for="(item, index) in items"
      :key="item.id || index"
      class="stack-card-container"
      :style="{ height: '400px', marginBottom: '20px' }"
    >
      <div
        class="stack-card"
        :class="item.colorClass"
        :style="{ top: `calc(15vh + ${index * itemDistance}px)` }"
      >
        <slot name="card" :item="item" :index="index"></slot>
      </div>
    </div>
    <div class="spacer"></div>
  </div>
</template>

<style scoped>
.scroll-stack-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 10vh;
}

.stack-card-container {
  /* Контейнер задает высоту скролла */
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.stack-card {
  /* Sticky - это магия, которая держит карточку */
  position: sticky;
  height: 300px; /* Фиксированная высота карточки */
  width: 100%;
  border-radius: 24px;
  padding: 2rem;
  box-sizing: border-box;

  /* Стили оформления */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px -5px rgba(0,0,0,0.5);

  transform-origin: top center;
  transition: transform 0.1s linear, filter 0.1s linear;
  will-change: transform, filter;
}

.spacer { height: 20vh; }
</style>
