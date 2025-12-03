<template>
  <canvas ref="canvasRef" id="bubble-background"></canvas>

  <div id="app-container" :class="{ 'sidebar-open': isTotalsSidebarOpen }">

    <Transition name="slide-down">
      <div v-if="!isOnline" class="offline-banner">
        <div class="spinner"></div>
        <span>No Internet Connection - Offline Mode</span>
      </div>
    </Transition>

    <div id="app-wrapper">

      <UserHeader v-if="route.name === 'list'" />

      <div class="content-grid" :class="{ 'closed-sidebar': !store.isHelpSidebarOpen || route.name !== 'list' }">
        <main class="main-column">

          <div class="top-controls" v-if="!store.isHelpSidebarOpen && route.name === 'list'">
            <button class="btn-show-help" @click="store.toggleHelpSidebar">
              <span class="help-icon">💡</span>
              <span>How it works?</span>
            </button>
          </div>

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

        <aside class="sidebar-column" v-if="route.name === 'list'">
          <Transition name="slide-fade">
            <HowItWorksSidebar v-show="store.isHelpSidebarOpen" />
          </Transition>
        </aside>
      </div>

      <ShareModal />
      <EditModal />
      <ItemDetailModal />
      <WelcomeModal />
      <ChatWidget v-if="route.name === 'list'" />

    </div>

    <button
      v-if="route.name === 'list' && !store.isAddItemFormVisible"
      class="btn-fab-totals"
      @click="store.toggleTotalsModal"
    >
      <span class="fab-icon">💰</span>
      <div class="fab-content">
        <span class="fab-label">Best Total</span>
        <span class="fab-value">{{ cheapestTotal }} MDL</span>
      </div>
    </button>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div class="totals-modal-backdrop" v-if="store.isTotalsModalOpen" @click.self="store.toggleTotalsModal">
          <div class="totals-modal-content">
            <button class="modal-close-btn" @click="store.toggleTotalsModal">×</button>

            <div class="modal-header">
              <div class="modal-icon">💰</div>
              <h2>Price Summary</h2>
            </div>

            <div class="modal-body">
              <div class="price-row store1">
                <span class="store-name">🏪 Metro</span>
                <span class="price-value">{{ store.totals.store1 }} <small>MDL</small></span>
              </div>

              <div class="price-row store2">
                <span class="store-name">🏬 Linella</span>
                <span class="price-value">{{ store.totals.store2 }} <small>MDL</small></span>
              </div>

              <div class="divider"></div>

              <div class="difference-box" :class="diffCardClass">
                <div class="diff-header">
                  <span>{{ diffIcon }} {{ diffLabel }}</span>
                </div>
                <div class="diff-value">{{ Math.abs(Number(store.totals.diff)).toFixed(2) }} MDL</div>
              </div>

              <div class="best-deal-banner" v-if="bestStore">
                <span>✨ Best Deal: {{ bestStore }}</span>
              </div>

              <p class="modal-note">* Only unpurchased items are counted</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
import HowItWorksSidebar from './components/HowItWorksSidebar.vue'

const store = useListStore()
const { activeListId, isTotalsSidebarOpen, totals, isTotalsModalOpen } = storeToRefs(store)

const route = useRoute()
const router = useRouter()
const isOnline = ref(navigator.onLine)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    store.syncPendingActions()
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
  document.body.style.overflow = ''
})

// --- WATCHERS ---

watch(activeListId, (newId) => {
  if (newId) {
    router.push(`/list/${newId}`)
  } else {
    router.push('/')
  }
})

watch(isTotalsModalOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

// Automatically close help sidebar when leaving list view
watch(() => route.name, (newRouteName) => {
  if (newRouteName !== 'list') {
    store.isHelpSidebarOpen = false
  }
}, { immediate: true })

store.backToListSelector = () => {
  store.activeListId = null
}

const cheapestTotal = computed(() => {
  const total1 = parseFloat(totals.value.store1) || 0
  const total2 = parseFloat(totals.value.store2) || 0
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
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
}

#app-container {
  display: flex; justify-content: center;
  padding-top: 40px;
}

#app-wrapper {
  max-width: 1280px; width: 100%; margin: 0 auto; padding: 2rem 1rem;
  position: relative; z-index: 1; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

#app-container.sidebar-open #app-wrapper {
  transform: translateX(-160px); opacity: 0.8;
}

@media (max-width: 900px) {
  #app-container.sidebar-open #app-wrapper {
    transform: translateX(0); opacity: 0.5; filter: blur(2px);
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

<style scoped>
* {
  box-sizing: border-box;
}

/* === MAIN GRID LAYOUT & ANIMATION === */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2rem;
  align-items: start;
  transition: grid-template-columns 0.5s cubic-bezier(0.4, 0, 0.2, 1), gap 0.5s ease;
}

.content-grid.closed-sidebar {
  grid-template-columns: 1fr 0px;
  gap: 0;
}

.main-column {
  min-width: 0;
}

.sidebar-column {
  overflow: hidden;
}

/* === TOP CONTROLS (Open Help Btn) === */
.top-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
  animation: fadeIn 0.5s ease;
}

.btn-show-help {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-show-help:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 51, 102, 0.3);
  border-color: var(--primary-color);
}

.help-icon {
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .content-grid, .content-grid.closed-sidebar {
    grid-template-columns: 1fr;
  }
  .sidebar-column {
    margin-top: 2rem;
    overflow: visible;
  }
}

.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ef4444;
  color: #fff;
  font-weight: 700;
  text-align: center;
  padding: 0.8rem;
  z-index: 9999;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-down-enter-active, .slide-down-leave-active { transition: transform 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-100%); }

.add-item-toggle {
  display: flex; justify-content: center; margin-bottom: 2rem;
}
.add-item-toggle .btn {
  padding: 0.75rem 1.5rem; font-size: 1rem; width: 100%; max-width: 400px;
}

.btn-fab-totals {
  position: fixed; bottom: 2rem; left: 2rem; z-index: 50;
  background: linear-gradient(135deg, rgba(26, 15, 31, 0.95), rgba(46, 26, 61, 0.95));
  backdrop-filter: blur(20px);
  border: 2px solid var(--primary-color);
  color: #fff;
  border-radius: 20px; padding: 1rem 1.5rem; cursor: pointer;
  display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 10px 40px rgba(255, 51, 102, 0.3);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-fab-totals:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 50px rgba(255, 51, 102, 0.5);
}
.fab-icon { font-size: 2rem; }
.fab-content { display: flex; flex-direction: column; gap: 0.25rem; }
.fab-label { font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; font-weight: 600; }
.fab-value { font-size: 1.5rem; font-weight: 800; color: var(--primary-color); line-height: 1; }

@media (max-width: 600px) {
  .btn-fab-totals { display: none; }
}

.totals-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.totals-modal-content {
  background: var(--card-color);
  border: 2px solid var(--primary-color);
  border-radius: 20px;
  width: 100%; max-width: 360px;
  box-shadow: 0 25px 80px rgba(255, 51, 102, 0.4);
  position: relative;
  display: flex; flex-direction: column;
  box-sizing: border-box;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-close-btn {
  position: absolute; top: 0.5rem; right: 0.5rem;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.1); border: none;
  color: #fff; font-size: 1.5rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
}

.modal-header {
  text-align: center; padding: 1.5rem 1rem 0.5rem;
}
.modal-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.modal-header h2 { font-size: 1.5rem; margin: 0; color: #fff; }

.modal-body {
  padding: 1rem 1.5rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.75rem;
}

.price-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem;
  background: var(--bg-input); border-radius: 12px;
  border: 1px solid var(--border-color);
}
.store1 { border-left: 4px solid #60a5fa; }
.store2 { border-left: 4px solid #f59e0b; }

.store-name { font-weight: 600; color: var(--text-light); font-size: 0.95rem; }
.price-value { font-size: 1.25rem; font-weight: 800; color: #fff; }
.price-value small { font-size: 0.8rem; font-weight: 400; opacity: 0.7; margin-left: 2px; }

.divider { height: 1px; background: var(--border-color); margin: 0.25rem 0; opacity: 0.5; }

.difference-box {
  text-align: center; padding: 0.75rem; border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
}
.difference-box.positive { color: #10b981; border: 1px solid #10b981; background: rgba(16, 185, 129, 0.1); }
.difference-box.negative { color: #ef4444; border: 1px solid #ef4444; background: rgba(239, 68, 68, 0.1); }

.diff-header { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.25rem; }
.diff-value { font-size: 1.4rem; font-weight: 800; }

.best-deal-banner {
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  color: #fff; padding: 0.6rem; border-radius: 10px;
  text-align: center; font-weight: 700; font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(255, 51, 102, 0.3);
}

.modal-note {
  text-align: center; font-size: 0.75rem; color: var(--text-light); margin: 0; opacity: 0.6;
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }

@media (max-width: 600px) {
  .totals-modal-backdrop {
    backdrop-filter: none;
    background: rgba(0, 0, 0, 0.9);
  }

  .totals-modal-content {
    width: 95%;
    max-width: 95%;
  }
}
</style>
