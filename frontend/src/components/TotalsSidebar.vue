<template>
  <Transition name="sidebar-fade">
    <div
      class="sidebar-backdrop"
      v-if="store.isTotalsSidebarOpen"
      @click.self="store.closeTotalsSidebar"
    >
      <div class="sidebar-content">
        <header class="sidebar-header">
          <h2>💰 Price Breakdown</h2>
          <button class="btn-close" @click="store.closeTotalsSidebar">×</button>
        </header>

        <div class="sidebar-body">

          <!-- Карточки с ценами -->
          <div class="price-card metro">
            <div class="card-header">
              <span class="store-icon">🏪</span>
              <span class="store-name">Metro (Store 1)</span>
            </div>
            <div class="card-price">
              <span class="price-value">{{ store.totals.store1 }}</span>
              <span class="price-currency">MDL</span>
            </div>
          </div>

          <div class="price-card linella">
            <div class="card-header">
              <span class="store-icon">🛒</span>
              <span class="store-name">Linella (Store 2)</span>
            </div>
            <div class="card-price">
              <span class="price-value">{{ store.totals.store2 }}</span>
              <span class="price-currency">MDL</span>
            </div>
          </div>

          <!-- Разница -->
          <div class="difference-card" :class="diffClass">
            <div class="diff-icon">{{ diffIcon }}</div>
            <div class="diff-content">
              <span class="diff-label">You {{ diffLabel }}</span>
              <span class="diff-value">{{ Math.abs(Number(store.totals.diff)).toFixed(2) }} MDL</span>
            </div>
          </div>

          <!-- Инфо -->
          <p class="info-text">
            <span class="info-icon">ℹ️</span>
            Only unpurchased items are counted
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
const store = useListStore()

const diffClass = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'save' // Store 1 дешевле
  if (diff > 0) return 'lose' // Store 2 дешевле
  return 'equal'
})

const diffIcon = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return '💚'
  if (diff > 0) return '💸'
  return '🤝'
})

const diffLabel = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'save at Metro'
  if (diff > 0) return 'save at Linella'
  return 'pay the same'
})
</script>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 190;
  transition: opacity 0.3s ease;
}

.sidebar-content {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  max-width: 90%;
  height: 100%;
  background: var(--bg-color);
  border-left: 1px solid var(--border-color);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
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
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #fff;
  font-weight: 800;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.sidebar-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* Карточки магазинов */
.price-card {
  background: var(--card-color);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.price-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.price-card.metro {
  border-color: rgba(96, 165, 250, 0.4);
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1), transparent);
}

.price-card.linella {
  border-color: rgba(245, 158, 11, 0.4);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), transparent);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.store-icon {
  font-size: 1.5rem;
}

.store-name {
  font-size: 0.95rem;
  color: var(--text-light);
  font-weight: 600;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-color);
}

.price-currency {
  font-size: 1rem;
  color: var(--text-light);
  font-weight: 600;
}

/* Карточка разницы */
.difference-card {
  background: var(--card-color);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.difference-card.save {
  border-color: rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), transparent);
}

.difference-card.lose {
  border-color: rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent);
}

.difference-card.equal {
  border-color: var(--border-color);
}

.diff-icon {
  font-size: 2.5rem;
}

.diff-content {
  display: flex;
  flex-direction: column;
}

.diff-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 0.25rem;
}

.diff-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-color);
}

.difference-card.save .diff-value {
  color: #10b981;
}

.difference-card.lose .diff-value {
  color: #ef4444;
}

/* Инфо */
.info-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-light);
  background: var(--bg-input);
  padding: 1rem;
  border-radius: 12px;
  margin: 0;
}

.info-icon {
  font-size: 1.2rem;
}

/* Анимации */
.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.sidebar-fade-enter-from .sidebar-content,
.sidebar-fade-leave-to .sidebar-content {
  transform: translateX(100%);
}

/* Мобильная версия */
@media (max-width: 600px) {
  .sidebar-content {
    width: 100%;
    max-width: 100%;
  }

  .price-value {
    font-size: 2rem;
  }

  .diff-value {
    font-size: 1.5rem;
  }
}
</style>
