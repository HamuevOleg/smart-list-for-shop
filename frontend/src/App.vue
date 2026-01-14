<template>
  <router-view v-if="isLanding" />

  <template v-else>
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

            <template v-if="!store.isBestShopsOpen">
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
            </template>

            <Transition name="fade" mode="out-in">
              <BestShops v-if="store.isBestShopsOpen" />
            </Transition>

          </main>

          <aside class="sidebar-column" v-if="route.name === 'list' && !store.isBestShopsOpen">
            <Transition name="slide-fade">
              <HowItWorksSidebar v-show="store.isHelpSidebarOpen" />
            </Transition>
          </aside>
        </div>

        <ShareModal />
        <EditModal />
        <ItemDetailModal />
        <AuthModal />
        <ProfileEditModal />
        <ChatWidget v-if="route.name === 'list'" />

      </div>

      <button
        v-if="route.name === 'list' && !store.isAddItemFormVisible && !store.isBestShopsOpen"
        class="btn-fab-totals"
        @click="store.toggleTotalsModal"
      >
        <span class="fab-icon">💰</span>
        <div class="fab-content">
          <span class="fab-label">Best Total</span>
          <span class="fab-value">{{ cheapestTotal }} MDL</span>
        </div>
      </button>

      <TotalsSidebar v-if="store.isTotalsSidebarOpen" />

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
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores/listStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'
import { useRoute, useRouter } from 'vue-router'

// Компоненты
import UserHeader from './components/UserHeader.vue'
import AddItemForm from './components/AddItemForm.vue'
import ShareModal from './components/ShareModal.vue'
import EditModal from './components/EditModal.vue'
import ItemDetailModal from './components/ItemDetailModal.vue'
import AuthModal from './components/AuthModal.vue'
import ProfileEditModal from './components/ProfileEditModal.vue'
import ChatWidget from './components/ChatWidget.vue'
import HowItWorksSidebar from './components/HowItWorksSidebar.vue'
import BestShops from './components/BestShops.vue'
import TotalsSidebar from './components/TotalsSidebar.vue'

const store = useListStore()
const { activeListId, isTotalsSidebarOpen, totals, isTotalsModalOpen } = storeToRefs(store)

const route = useRoute()
const router = useRouter()
const isOnline = ref(navigator.onLine)

const isLanding = computed(() => route.name === 'landing')

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

watch(activeListId, (newId) => {
  if (newId) router.push(`/list/${newId}`)
  else router.push('/dashboard')
})

watch(isTotalsModalOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

watch(() => route.name, (newRouteName) => {
  if (newRouteName !== 'list') {
    store.isHelpSidebarOpen = false
  }
}, { immediate: true })

store.backToListSelector = () => {
  store.activeListId = null
}

// Расчет итогов
const cheapestTotal = computed(() => {
  const total1 = parseFloat(totals.value.store1) || 0
  const total2 = parseFloat(totals.value.store2) || 0
  if (total1 > 0 && total2 > 0) return Math.min(total1, total2).toFixed(2)
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

// Инициализация фона (Важно: transparent: true)
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
  transparent: true, // ВАЖНО, чтобы CSS фон не перекрывал
})
</script>

<style>
/* Убираем конфликт стилей!
  Теперь body прозрачный, чтобы был виден fixed canvas под ним.
*/
body {
  margin: 0;
  padding: 0;
  background-color: transparent !important; /* Даем просвечивать канвасу */
  color: var(--text-color);
  font-family: 'Kumbh Sans', sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

/* Ставим дефолтный темный фон на HTML на случай если JS/Canvas не прогрузится */
html {
  background-color: #060010;
}

#bubble-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Фон позади всего */
  background: radial-gradient(circle at center, #1b1638 0%, #060010 100%);
  pointer-events: none;
}

#app-container {
  display: flex; justify-content: center;
  padding-top: 20px;
  min-height: 100vh;
}

#app-wrapper {
  max-width: 1280px; width: 100%; margin: 0 auto; padding: 2rem 1rem;
  position: relative; z-index: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

#app-container.sidebar-open #app-wrapper {
  transform: translateX(-160px); opacity: 0.8;
}

@media (max-width: 900px) {
  #app-container.sidebar-open #app-wrapper {
    transform: translateX(0); opacity: 0.5; filter: blur(2px);
  }
}

/* Глобальные анимации переходов */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-fade-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.slide-fade-leave-active { transition: all 0.3s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateX(30px); }

/* Banner */
.offline-banner {
  position: fixed; top: 0; left: 0; width: 100%;
  background-color: #ef4444; color: #fff; font-weight: 700;
  text-align: center; padding: 0.8rem; z-index: 9999;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  display: flex; justify-content: center; align-items: center; gap: 10px;
}
.spinner {
  width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.slide-down-enter-active, .slide-down-leave-active { transition: transform 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-100%); }
</style>
