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

    <button
      v-if="route.name === 'list' && !store.isAddItemFormVisible"
      class="btn-fab-totals"
      @click="store.toggleTotalsSidebar"
      :class="{ hidden: isTotalsSidebarOpen }"
    >
      <span class="label">Total:</span>
      <span class="value">{{ cheapestTotal }}</span>
      <span class="currency">MDL</span>
    </button>

    <TotalsSidebar />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores/listStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'
import { useRoute, useRouter } from 'vue-router'

import UserHeader from './components/UserHeader.vue'
import AddItemForm from './components/AddItemForm.vue'
import ShareModal from './components/ShareModal.vue'
import EditModal from './components/EditModal.vue'
import TotalsSidebar from './components/TotalsSidebar.vue'
import ItemDetailModal from './components/ItemDetailModal.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import ChatWidget from './components/ChatWidget.vue'

const store = useListStore()
const { activeListId, isTotalsSidebarOpen, totals } = storeToRefs(store)

const route = useRoute()
const router = useRouter()

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

/* --- НОВЫЙ СТИЛЬ КНОПКИ --- */
.btn-fab-totals {
  position: fixed;
  bottom: 2rem;
  left: 2rem; /* Перенесли ВЛЕВО */
  right: auto; /* Сбросили правое позиционирование */
  z-index: 50;

  /* Glassmorphism эффект */
  background: rgba(26, 15, 31, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid var(--primary-color);
  color: #fff;

  border-radius: 16px;
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;

  /* Неоновое свечение */
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.15),
  inset 0 0 20px rgba(255, 51, 102, 0.05);

  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-fab-totals:hover {
  background: rgba(255, 51, 102, 0.15);
  box-shadow: 0 0 30px rgba(255, 51, 102, 0.3);
  transform: translateY(-3px) scale(1.02);
  border-color: var(--primary-hover);
}

/* Скрываем, когда открыт сайдбар */
.btn-fab-totals.hidden {
  transform: translateX(-100px) scale(0.8);
  opacity: 0;
}

/* Типографика внутри кнопки */
.btn-fab-totals .label {
  font-size: 0.9rem;
  color: var(--text-light);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-fab-totals .value {
  font-weight: 800;
  font-size: 1.4rem;
  color: var(--primary-color);
  text-shadow: 0 0 10px rgba(255, 51, 102, 0.4);
}

.btn-fab-totals .currency {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
}

/* Адаптив для мобильных: кнопка снизу слева может мешать, подвинем чуть выше или уменьшим */
@media (max-width: 600px) {
  .btn-fab-totals {
    bottom: 1.5rem;
    left: 1.5rem;
    padding: 0.6rem 1.2rem;
  }
  .btn-fab-totals .value {
    font-size: 1.2rem;
  }
}
</style>
