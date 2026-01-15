<template>
  <router-view v-if="isLanding" />

  <template v-else>
    <canvas ref="canvasRef" id="bubble-background"></canvas>

    <div id="app-container" :class="{ 'sidebar-open': isTotalsSidebarOpen }">

      <Transition name="slide-down">
        <div v-if="!isOnline" class="offline-banner">
          <div class="spinner"></div>
          <span>Offline Mode</span>
        </div>
      </Transition>

      <div id="app-wrapper">
        <UserHeader v-if="route.name === 'list'" />

        <div class="content-grid" :class="{ 'closed-sidebar': !store.isHelpSidebarOpen || route.name !== 'list' }">
          <main class="main-column">

            <template v-if="!store.isBestShopsOpen">

              <div class="add-item-toggle" v-if="route.name === 'list' && !store.isAddItemFormVisible">
                <button class="btn-hero-add" @click="store.showAddItemForm">
                  <span class="icon-glow">+</span>
                  <span class="text">Add New Item</span>
                </button>
              </div>

              <AddItemForm v-if="route.name === 'list'" />

              <router-view v-slot="{ Component }">
                <Transition name="fade-scale" mode="out-in">
                  <component :is="Component" />
                </Transition>
              </router-view>
            </template>

            <Transition name="fade-scale" mode="out-in">
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
        v-if="route.name === 'list' && !store.isBestShopsOpen"
        class="btn-fab btn-fab-totals"
        @click="store.toggleTotalsModal"
      >
        <div class="fab-icon-box">
          <span>💰</span>
        </div>
        <div class="fab-info">
          <span class="fab-label">Best Total</span>
          <span class="fab-value">{{ cheapestTotal }} <small>MDL</small></span>
        </div>
      </button>

      <button
        v-if="route.name === 'list' && !store.isHelpSidebarOpen"
        class="btn-fab btn-fab-guide"
        @click="store.toggleHelpSidebar"
      >
        <div class="fab-icon-box">
          <span>💡</span>
        </div>
        <div class="fab-info">
          <span class="fab-label">Need Help?</span>
          <span class="fab-value">Guide</span>
        </div>
      </button>

      <TotalsSidebar v-if="store.isTotalsSidebarOpen" />

      <Teleport to="body">
        <Transition name="modal-bounce">
          <div class="totals-modal-backdrop" v-if="store.isTotalsModalOpen" @click.self="store.toggleTotalsModal">
            <div class="totals-modal-content glass-panel">
              <button class="modal-close-btn" @click="store.toggleTotalsModal">×</button>
              <div class="modal-header">
                <div class="modal-emoji">💰</div>
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

const updateOnlineStatus = () => { isOnline.value = navigator.onLine; if (isOnline.value) store.syncPendingActions() }
onMounted(() => { window.addEventListener('online', updateOnlineStatus); window.addEventListener('offline', updateOnlineStatus) })
onUnmounted(() => { window.removeEventListener('online', updateOnlineStatus); window.removeEventListener('offline', updateOnlineStatus); document.body.style.overflow = '' })

watch(activeListId, (newId) => { if (newId) router.push(`/list/${newId}`); else router.push('/dashboard') })
watch(isTotalsModalOpen, (isOpen) => { document.body.style.overflow = isOpen ? 'hidden' : '' })
watch(() => route.name, (newRouteName) => { if (newRouteName !== 'list') store.isHelpSidebarOpen = false }, { immediate: true })
store.backToListSelector = () => { store.activeListId = null }

const cheapestTotal = computed(() => {
  const total1 = parseFloat(totals.value.store1) || 0; const total2 = parseFloat(totals.value.store2) || 0;
  if (total1 > 0 && total2 > 0) return Math.min(total1, total2).toFixed(2);
  return (total1 || total2).toFixed(2);
})
const diffCardClass = computed(() => { const diff = Number(store.totals.diff); if (diff < 0) return 'positive'; if (diff > 0) return 'negative'; return 'neutral' })
const diffIcon = computed(() => { const diff = Number(store.totals.diff); if (diff < 0) return '📉'; if (diff > 0) return '📈'; return '➖' })
const diffLabel = computed(() => { const diff = Number(store.totals.diff); if (diff < 0) return 'Metro is cheaper'; if (diff > 0) return 'Linella is cheaper'; return 'Same price' })

const { canvasRef } = useGalaxyBackground({ starSpeed: 0.5, density: 1, glowIntensity: 0.5, transparent: true })
</script>

<style>
/* Base */
body { background-color: transparent !important; margin: 0; overflow-x: hidden; }
html { background-color: #060010; }
#bubble-background { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
#app-container { display: flex; justify-content: center; padding-top: 20px; min-height: 100vh; }
#app-wrapper { max-width: 1200px; width: 100%; margin: 0 auto; padding: 1rem; position: relative; z-index: 1; transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
#app-container.sidebar-open #app-wrapper { transform: translateX(-100px); opacity: 0.7; filter: blur(2px); }

/* --- HERO ADD BUTTON --- */
.add-item-toggle { display: flex; justify-content: center; margin-bottom: 2.5rem; width: 100%; perspective: 1000px; }
.btn-hero-add {
  background: rgba(30, 30, 46, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 3rem;
  border-radius: 24px;
  color: #fff; font-size: 1.2rem; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; gap: 12px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.btn-hero-add:hover {
  transform: translateY(-5px) scale(1.02);
  background: rgba(40, 40, 60, 0.8);
  border-color: var(--primary-color);
  box-shadow: 0 20px 50px rgba(255, 51, 102, 0.3);
}
.icon-glow {
  background: linear-gradient(135deg, var(--primary-color), #f472b6);
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; line-height: 1; box-shadow: 0 0 15px var(--primary-color);
}

/* --- FLOATING ACTION BUTTONS (FAB) --- */
.btn-fab {
  position: fixed; z-index: 50;
  display: flex; align-items: center; gap: 12px;
  padding: 0.8rem 1.2rem;
  border-radius: 24px;
  background: rgba(20, 20, 30, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff; cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-fab:hover {
  transform: translateY(-6px) scale(1.03);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}

.btn-fab-totals { bottom: 2rem; left: 2rem; }
.btn-fab-guide { bottom: 2rem; right: 2rem; border-color: rgba(96, 165, 250, 0.3); }

.fab-icon-box {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
}
.fab-info { display: flex; flex-direction: column; align-items: flex-start; }
.fab-label { font-size: 0.7rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
.fab-value { font-size: 1.1rem; font-weight: 800; color: #fff; }
.fab-value small { font-size: 0.75rem; opacity: 0.7; font-weight: 500; }

/* Totals Modal */
.totals-modal-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 100; }
.totals-modal-content { width: 90%; max-width: 380px; background: #1a1a24; border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; overflow: hidden; position: relative; padding-bottom: 1rem; }
.glass-panel { background: rgba(30, 30, 45, 0.85); backdrop-filter: blur(25px); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }

.modal-header { text-align: center; padding: 2rem 1rem 1rem; background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent); }
.modal-emoji { font-size: 3.5rem; filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4)); animation: float 3s infinite ease-in-out; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.modal-body { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 0.8rem; }
.price-row { display: flex; justify-content: space-between; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); color: #fff; font-weight: 600; }
.store1 { border-left: 4px solid #60a5fa; } .store2 { border-left: 4px solid #f59e0b; }
.difference-box { text-align: center; padding: 1.2rem; border-radius: 16px; margin-top: 0.5rem; font-weight: 700; }
.difference-box.positive { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.difference-box.negative { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.diff-value { font-size: 1.8rem; display: block; margin-top: 0.3rem; }

.modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.1); border: none; width: 36px; height: 36px; border-radius: 50%; color: #fff; cursor: pointer; transition: all 0.2s; }
.modal-close-btn:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }

/* Animations */
.fade-scale-enter-active, .fade-scale-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fade-scale-enter-from, .fade-scale-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }

.modal-bounce-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-bounce-leave-active { transition: all 0.3s ease; }
.modal-bounce-enter-from, .modal-bounce-leave-to { opacity: 0; transform: scale(0.8) translateY(20px); }

@media (max-width: 768px) {
  .btn-fab { padding: 0.7rem; gap: 8px; bottom: 1.5rem; }
  .btn-fab-totals { left: 1rem; }
  .btn-fab-guide { right: 1rem; }
  .fab-icon-box { width: 36px; height: 36px; font-size: 1.2rem; }
  .fab-label { display: none; }
}
</style>
