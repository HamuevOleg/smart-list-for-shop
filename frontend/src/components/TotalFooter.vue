<template>
  <footer class="total-footer">
    <div class="total-content">
      <div class="price-group">
        <span class="store-name">Shop 1 (Leu):</span>
        <span class="price store1">{{ store.totals.store1 }}</span>
      </div>
      <div class="price-group">
        <span class="store-name">Shop 2 (Leu):</span>
        <span class="price store2">{{ store.totals.store2 }}</span>
      </div>
      <div class="price-group difference">
        <span class="store-name">Difference:</span>
        <span class="price" :class="diffClass">{{ store.totals.diff }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
const store = useListStore()

const diffClass = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'positive' // Магазин 1 дешевле
  if (diff > 0) return 'negative' // Магазин 2 дешевле
  return ''
})
</script>

<style scoped>
.total-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  z-index: 50;
}
.total-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
}
.price-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.store-name {
  font-size: 0.8rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}
.price {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--secondary-color);
}

.price.store1 {
  color: var(--primary-color);
}
.price.store2 {
  color: #f59e0b; /* Желтый/Оранжевый для 2го магазина */
}

.difference .price.positive {
  color: #10b981; /* Зеленый (выгодно) */
}
.difference .price.negative {
  color: #ef4444; /* Красный (невыгодно) */
}

/* СКРЫВАЕМ FOOTER НА МОБИЛЬНЫХ И ПЛАНШЕТАХ */
@media (max-width: 900px) {
  .total-footer {
    display: none;
  }
}
</style>
