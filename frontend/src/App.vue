<template>
  <canvas ref="canvasRef" id="bubble-background"></canvas>

  <div id="app-container" :class="{ 'sidebar-open': isTotalsSidebarOpen }">

    <div id="app-wrapper">

      <UserHeader v-if="route.name === 'list'" />

      <main>
        <div class="add-item-toggle" v-if="route.name === 'list' && !store.isAddItemFormVisible">
          <button class="btn btn-primary" @click="store.showAddItemForm">
            + Add item
          </button>
        </div>

        <AddItemForm v-if="route.name === 'list'" />

        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <ShareModal />
      <EditModal />
      <ItemDetailModal />
      <WelcomeModal />
      <ChatWidget v-if="route.name === 'list'" />

    </div>

    <!-- FAB-кнопка с суммой (открывает модалку) -->
    <button
      v-if="route.name === 'list' && !store.isAddItemFormVisible"
      class="btn-fab-totals"
      @click="showTotalsModal = true"
    >
      <span class="fab-icon">💰</span>
      <div class="fab-content">
        <span class="fab-label">Best Total</span>
        <span class="fab-value">{{ cheapestTotal }} MDL</span>
      </div>
    </button>

    <!-- Модалка с детальной информацией о ценах -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div class="totals-modal-backdrop" v-if="showTotalsModal" @click.self="showTotalsModal = false">
          <div class="totals-modal-content">
            <button class="modal-close-btn" @click="showTotalsModal = false">×</button>

            <div class="modal-header">
              <div class="modal-icon">💰</div>
              <h2>Price Summary</h2>
              <p class="modal-subtitle">Compare prices across stores</p>
            </div>

            <div class="modal-body">
              <!-- Store 1 -->
              <div class="price-card store1-card">
                <div class="card-header">
                  <span class="store-icon">🏪</span>
                  <span class="store-name">Metro</span>
                </div>
                <div class="card-body">
                  <div class="price-display">
                    <span class="price-value">{{ store.totals.store1 }}</span>
                    <span class="price-currency">MDL</span>
                  </div>
                </div>
              </div>

              <!-- Store 2 -->
              <div class="price-card store2-card">
                <div class="card-header">
                  <span class="store-icon">🏬</span>
                  <span class="store-name">Linella</span>
                </div>
                <div class="card-body">
                  <div class="price-display">
                    <span class="price-value">{{ store.totals.store2 }}</span>
                    <span class="price-currency">MDL</span>
                  </div>
                </div>
              </div>

              <!-- Difference Card -->
              <div class="difference-card" :class="diffCardClass">
                <div class="diff-header">
                  <span class="diff-icon">{{ diffIcon }}</span>
                  <span class="diff-label">{{ diffLabel }}</span>
                </div>
                <div class="diff-value">{{ Math.abs(Number(store.totals.diff)).toFixed(2) }} MDL</div>
              </div>

              <!-- Best Deal Banner -->
              <div class="best-deal-banner" v-if="bestStore">
                <span class="banner-icon">✨</span>
                <span class="banner-text">{{ bestStore }} has the best price!</span>
              </div>

              <p class="modal-note">* Only unpurchased items are calculated</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores/listStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'
import { useRoute, useRouter } from 'vue-router'

import UserHeader from './components/UserHeader.vue'
import AddItemForm from './components/AddItemForm.vue'
import ShareModal from './components/ShareModal.vue'
import EditModal from './components/EditModal.vue'
import ItemDetailModal from './components/ItemDetailModal.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import ChatWidget from './components/ChatWidget.vue'

const store = useListStore()
const { activeListId, isTotalsSidebarOpen, totals } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

const showTotalsModal = ref(false)

watch(activeListId, (newId) => {
  if (newId) {
    router.push(`/list/${newId}`)
  } else {
    router.push('/')
  }
})

store.backToListSelector = () => {
  store.activeListId = null
}

const cheapestTotal = computed(() => {
  const total1 = parseFloat(totals.value.store1)
  const total2 = parseFloat(totals.value.store2)

  if (total1 > 0 && total2 > 0) {
    return Math.min(total1, total2).toFixed(2)
  }
  return (total1 || total2).toFixed(2)
})

const diffCardClass = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'positive'
  if (diff > 0) return 'negative'
  return 'neutral'
})

const diffIcon = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return '📉'
  if (diff > 0) return '📈'
  return '➖'
})

const diffLabel = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'Metro is cheaper'
  if (diff > 0) return 'Linella is cheaper'
  return 'Same price'
})

const bestStore = computed(() => {
  const diff = Number(store.totals.diff)
  if (diff < 0) return 'Metro'
  if (diff > 0) return 'Linella'
  return null
})

const { canvasRef } = useGalaxyBackground({
  focal: [0.5, 0.5],
  rotation: [1.0, 0.0],
  starSpeed: 0.5,
  density: 1,
  hueShift: 140,
  speed: 1.0,
  glowIntensity: 0.3,
  saturation: 0.0,
  mouseRepulsion: true,
  repulsionStrength: 2,
  twinkleIntensity: 0.3,
  rotationSpeed: 0.1,
  transparent: true,
})
</script>

<style>
#bubble-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

#app-container {
  display: flex;
  justify-content: center;
}

#app-wrapper {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

#app-container.sidebar-open #app-wrapper {
  transform: translateX(-160px);
  max-width: 600px;
  opacity: 0.8;
}

@media (max-width: 900px) {
  #app-container.sidebar-open #app-wrapper {
    transform: translateX(0);
    max-width: 800px;
    opacity: 0.5;
    filter: blur(2px);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.add-item-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}
.add-item-toggle .btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
}

/* ===== FAB КНОПКА ===== */
.btn-fab-totals {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 50;

  background: linear-gradient(135deg, rgba(26, 15, 31, 0.95), rgba(46, 26, 61, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid var(--primary-color);
  color: #fff;

  border-radius: 20px;
  padding: 1rem 1.5rem;
  cursor: pointer;

  display: flex;
  align-items: center;
  gap: 1rem;

  box-shadow:
    0 10px 40px rgba(255, 51, 102, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-fab-totals:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 50px rgba(255, 51, 102, 0.5);
  border-color: var(--primary-hover);
}

.btn-fab-totals:active {
  transform: translateY(-2px) scale(1.02);
}

.fab-icon {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.fab-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fab-label {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.fab-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary-color);
  text-shadow: 0 0 20px rgba(255, 51, 102, 0.6);
  line-height: 1;
}

/* Скрываем FAB на мобильных */
@media (max-width: 600px) {
  .btn-fab-totals {
    display: none;
  }
}

/* ===== МОДАЛКА С ЦЕНАМИ ===== */
.totals-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto; /* Скролл если модалка не влезает */
}

.totals-modal-content {
  background: var(--card-color);
  border: 2px solid var(--primary-color);
  border-radius: 25px;
  width: 90%; /* Процент от ширины экрана */
  max-width: 450px; /* Максимальная ширина */
  max-height: 90vh; /* Максимальная высота */
  overflow-y: auto; /* Скролл внутри модалки */
  position: relative;
  box-shadow:
    0 25px 80px rgba(255, 51, 102, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Для скролла внутри */
  scrollbar-width: thin;
  scrollbar-color: var(--primary-color) transparent;
}

.totals-modal-content::-webkit-scrollbar {
  width: 8px;
}

.totals-modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.totals-modal-content::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-light);
  font-size: 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  line-height: 1;
  z-index: 10;
}

.modal-close-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: rotate(90deg);
}

.modal-header {
  text-align: center;
  padding: 2.5rem 2rem 1.5rem;
  background: linear-gradient(180deg, rgba(255, 51, 102, 0.1), transparent);
}

.modal-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.modal-header h2 {
  font-size: 1.8rem;
  color: #fff;
  margin: 0 0 0.5rem 0;
  font-weight: 800;
}

.modal-subtitle {
  color: var(--text-light);
  font-size: 0.9rem;
  margin: 0;
}

.modal-body {
  padding: 1rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Price Cards */
.price-card {
  background: var(--bg-input);
  border: 2px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.price-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.store1-card:hover {
  border-color: #60a5fa;
}

.store2-card:hover {
  border-color: #f59e0b;
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
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.card-body {
  display: flex;
  justify-content: center;
}

.price-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-color);
  text-shadow: 0 0 20px rgba(255, 51, 102, 0.4);
}

.store1-card .price-value {
  color: #60a5fa;
  text-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
}

.store2-card .price-value {
  color: #f59e0b;
  text-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
}

.price-currency {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
}

/* Difference Card */
.difference-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
  border: 2px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  text-align: center;
}

.difference-card.positive {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
}

.difference-card.negative {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
}

.diff-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.diff-icon {
  font-size: 1.2rem;
}

.diff-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
}

.diff-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
}

.difference-card.positive .diff-value {
  color: #10b981;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
}

.difference-card.negative .diff-value {
  color: #ef4444;
  text-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

/* Best Deal Banner */
.best-deal-banner {
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  color: white;
  padding: 0.875rem 1.25rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 25px rgba(255, 51, 102, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.banner-icon {
  font-size: 1.3rem;
  animation: spin 3s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.modal-note {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-light);
  margin: 0.5rem 0 0 0;
  font-style: italic;
  opacity: 0.7;
}

/* Modal Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .totals-modal-content,
.modal-fade-leave-to .totals-modal-content {
  transform: translateY(50px) scale(0.9);
}

/* Responsive */
@media (max-width: 600px) {
  .totals-modal-content {
    width: 95%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 2rem 1.5rem 1rem;
  }

  .modal-icon {
    font-size: 3rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 1rem 1.25rem 1.5rem;
    gap: 0.875rem;
  }

  .price-card {
    padding: 1rem;
  }

  .store-icon {
    font-size: 1.3rem;
  }

  .price-value {
    font-size: 1.75rem;
  }

  .diff-value {
    font-size: 1.5rem;
  }

  .best-deal-banner {
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
  }
}
</style>
