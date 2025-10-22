<template>
  <canvas ref="canvasRef" id="bubble-background"></canvas>

  <div id="app-container" :class="{ 'sidebar-open': isTotalsSidebarOpen }">

    <div id="app-wrapper">
      <ListSelector v-if="!activeListId" />

      <div v-else class="list-view">
        <UserHeader />

        <main>
          <div class="add-item-toggle" v-if="!store.isAddItemFormVisible">
            <button class="btn btn-primary" @click="store.showAddItemForm">
              + Добавить товар
            </button>
          </div>

          <AddItemForm />

          <ShoppingList />
        </main>

      </div>

      <ShareModal />
      <EditModal />
    </div>

    <button
      v-if="activeListId && !store.isAddItemFormVisible"
      class="btn-fab-totals"
      @click="store.toggleTotalsSidebar"
      :class="{ hidden: isTotalsSidebarOpen }"
    >
      <span>Итог:</span>
      <strong>{{ cheapestTotal }}</strong>
      <span>Lei</span>
    </button>

    <TotalsSidebar />
  </div>
</template>

<script setup>
import { computed } from 'vue' // <-- ДОБАВЛЕН
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores/listStore'
import { useGalaxyBackground } from '@/composables/useGalaxyBackground'

// Импорты компонентов
import ListSelector from './components/ListSelector.vue'
import UserHeader from './components/UserHeader.vue'
import AddItemForm from './components/AddItemForm.vue'
import ShoppingList from './components/ShoppingList.vue'
import ShareModal from './components/ShareModal.vue'
import EditModal from './components/EditModal.vue'
// import TotalFooter from './components/TotalFooter.vue' // <-- УДАЛЕН
import TotalsSidebar from './components/TotalsSidebar.vue' // <-- ДОБАВЛЕН

const store = useListStore()
// V СТРОКА ОБНОВЛЕНА V
const { activeListId, isTotalsSidebarOpen, totals } = storeToRefs(store)

// V ДОБАВЛЕН БЛОК ДЛЯ КНОПКИ V
// Считаем минимальную цену для отображения на кнопке
const cheapestTotal = computed(() => {
  const total1 = parseFloat(totals.value.store1)
  const total2 = parseFloat(totals.value.store2)

  if (total1 > 0 && total2 > 0) {
    return Math.min(total1, total2).toFixed(2)
  }
  // Если есть только одна цена, показываем ее
  return (total1 || total2).toFixed(2)
})

// ... твой useGalaxyBackground ...
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

/* * НОВЫЕ ГЛОБАЛЬНЫЕ СТИЛИ ДЛЯ LAYOUT-А
 */
#app-container {
  /* Это новый главный контейнер.
    Мы используем `display: flex` для выравнивания
    #app-wrapper и #app-sidebar (когда он появится).
    Но по умолчанию #app-wrapper просто центрируется.
  */
  display: flex;
  justify-content: center;
}

#app-wrapper {
  max-width: 800px;
  width: 100%; /* Добавляем, чтобы wrapper занимал место */
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 1;
  /* ПЛАВНЫЙ ПЕРЕХОД */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* * Вот та самая "магия", которую ты просил.
 * Когда сайдбар открыт...
 */
#app-container.sidebar-open #app-wrapper {
  /* ...мы сдвигаем контент влево. */
  transform: translateX(-160px); /* 320px (ширина сайдбара) / 2 */
  /* ...и плавно уменьшаем его */
  max-width: 600px;
  opacity: 0.8;
}

@media (max-width: 900px) {
  /* На мобилках не будем сдвигать, а просто затемним */
  #app-container.sidebar-open #app-wrapper {
    transform: translateX(0);
    max-width: 800px; /* оставим как есть */
    opacity: 0.5;
    /* Можно добавить блюр */
    filter: blur(2px);
  }
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

/*
 * V ДОБАВЛЕНЫ СТИЛИ ДЛЯ КНОПКИ (FAB) V
 */
.btn-fab-totals {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50; /* Выше контента, но ниже сайдбара */

  background-color: var(--primary-color);
  color: #111; /* Темный текст для контраста */
  border: none;
  border-radius: 50px; /* Делаем овальной/круглой */
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  /* Тень в цвет нашего неона */
  box-shadow: 0 8px 25px rgba(0, 240, 255, 0.3);

  display: flex;
  align-items: center;
  gap: 0.5rem;

  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.btn-fab-totals:hover {
  background-color: var(--primary-hover);
  box-shadow: 0 10px 30px rgba(0, 240, 255, 0.4);
  transform: translateY(-3px);
}

/* Прячем кнопку, когда сайдбар открыт */
.btn-fab-totals.hidden {
  transform: scale(0.5) translateY(150px);
  opacity: 0;
}

.btn-fab-totals span {
  opacity: 0.8;
  font-weight: 500;
}
</style>
