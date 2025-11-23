<template>
  <Transition name="sidebar-fade">
    <div
      class="sidebar-backdrop"
      v-if="store.isTotalsSidebarOpen"
      @click.self="store.closeTotalsSidebar"
    >
      <div class="sidebar-content">
        <header class="sidebar-header">
          <h2>Price Summary</h2>
          <button class="btn-close" @click="store.closeTotalsSidebar">×</button>
        </header>

        <div class="sidebar-body">
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
          <p class="totals-info">* Only unpurchased goods are taken into account.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
const store = useListStore()

// Логика осталась та же, что и в TotalFooter
const diffClass = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'positive' // Магазин 1 дешевле
  if (diff > 0) return 'negative' // Магазин 2 дешевле
  return ''
})
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 190;
  transition: opacity 0.3s ease;
}

.sidebar-content {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: var(--bg-color); /* Наш самый темный фон */
  border-left: 1px solid var(--border-color);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-light);
  padding: 0.5rem;
}

.sidebar-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.price-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--bg-input);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}
.store-name {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}
.price {
  font-size: 2rem; /* Сделаем крупнее */
  font-weight: 700;
  color: var(--text-color);
}

.price.store1 {
  color: var(--primary-color); /* Наш неон */
}
.price.store2 {
  color: #f59e0b; /* Оранжевый */
}

.difference .price.positive {
  color: #10b981; /* Зеленый */
}
.difference .price.negative {
  color: #ef4444; /* Красный */
}

.totals-info {
  font-size: 0.85rem;
  color: var(--text-light);
  text-align: center;
  margin-top: 1rem;
}

/* Анимации появления */
.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.sidebar-fade-enter-from .sidebar-content,
.sidebar-fade-leave-to .sidebar-content {
  transform: translateX(100%);
}
</style>
