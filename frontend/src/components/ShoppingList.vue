<template>
  <section class="shopping-list-container">

    <div class="list-controls" v-if="store.activeList && store.activeList.items.length > 0">
      <div class="view-toggles">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'grouped' }"
          @click="viewMode = 'grouped'"
        >
          <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span>By Category</span>
        </button>

        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'linear' }"
          @click="viewMode = 'linear'"
        >
          <svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>All Items</span>
        </button>
      </div>
    </div>

    <div
      v-if="!store.activeList || store.activeList.items.length === 0"
      class="empty-list"
    >
      <p>📝</p>
      Your list is currently empty. Add your first item!
    </div>

    <Transition name="mode-switch" mode="out-in">

      <div v-if="viewMode === 'grouped'" key="grouped" class="list-view">
        <div
          v-for="(group, category) in store.groupedItems"
          :key="category"
          class="category-group"
        >
          <h3 class="category-title">{{ category }}</h3>
          <div class="items-wrapper">
            <TransitionGroup name="list-anim">
              <ShoppingListItem
                v-for="item in group"
                :key="item.id"
                :item="item"
              />
            </TransitionGroup>
          </div>
        </div>
      </div>

      <div v-else key="linear" class="list-view">
        <div class="items-wrapper linear-view">
          <TransitionGroup name="list-anim">
            <ShoppingListItem
              v-for="item in sortedFlatItems"
              :key="item.id"
              :item="item"
            />
          </TransitionGroup>
        </div>
      </div>

    </Transition>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useListStore } from '@/stores/listStore'
import ShoppingListItem from './ShoppingListItem.vue'

const store = useListStore()
const viewMode = ref('grouped')

// Сортировка: сначала некупленные, потом купленные
const sortedFlatItems = computed(() => {
  if (!store.activeList?.items) return []
  return [...store.activeList.items].sort((a, b) => Number(a.completed) - Number(b.completed))
})

let pollingInterval = null

onMounted(() => {
  pollingInterval = setInterval(() => {
    if (store.activeListId && !store.editingItem && !store.isAddingItem) {
      store.fetchListById(store.activeListId, { background: true })
    }
  }, 3000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
.shopping-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* === ПЕРЕКЛЮЧАТЕЛЬ (НОВЫЙ СТИЛЬ "POPOUT") === */
.list-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
  animation: fadeIn 0.5s ease;
  position: sticky;
  top: 10px;
  z-index: 40;
}

.view-toggles {
  display: flex;
  /* Более темный фон контейнера для контраста */
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding: 5px;
  border-radius: 16px; /* Закругленные углы контейнера */
  border: 1px solid rgba(255, 255, 255, 0.1);
  gap: 5px; /* Отступ между кнопками */
}

.toggle-btn {
  position: relative;
  z-index: 1;
  background: transparent; /* Неактивная кнопка прозрачная */
  border: none;
  color: rgba(255, 255, 255, 0.6); /* Цвет неактивного текста */
  padding: 10px 18px;
  border-radius: 12px; /* Закругленные углы кнопок */
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  /* Плавный переход всех свойств для эффекта "выпрыгивания" */
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex: 1;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* СТИЛЬ АКТИВНОЙ КНОПКИ - БОЛЬШЕ И ЯРЧЕ */
.toggle-btn.active {
  background: var(--primary-color); /* Розовый фон */
  color: #fff; /* Белый текст */
  /* Увеличение размера */
  transform: scale(1.05);
  z-index: 2; /* Поверх неактивной */
  /* Яркая тень для объема */
  box-shadow: 0 4px 15px rgba(255, 51, 102, 0.5), 0 2px 5px rgba(0,0,0,0.2);
}

.icon {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}
.toggle-btn.active .icon {
  opacity: 1;
}

/* === СПИСКИ === */
.empty-list {
  text-align: center;
  padding: 3rem;
  background: var(--card-color);
  border-radius: var(--border-radius);
  color: var(--text-light);
  font-size: 1.1rem;
}
.empty-list p { font-size: 3rem; margin: 0; }

.category-group { width: 100%; margin-bottom: 1.5rem; }

.category-title {
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin-bottom: 0.8rem;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid rgba(255, 51, 102, 0.2);
  display: inline-block;
}

.items-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* === АНИМАЦИИ СПИСКА === */
.list-anim-move,
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.list-anim-leave-active {
  position: absolute;
}

.mode-switch-enter-active,
.mode-switch-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.mode-switch-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.mode-switch-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* === МОБИЛЬНАЯ АДАПТАЦИЯ === */
@media (max-width: 600px) {
  .list-controls {
    justify-content: center;
    width: 100%;
    margin-bottom: 1rem;
  }

  .view-toggles {
    width: 100%;
    max-width: 350px;
    /* На мобилке кнопки чуть меньше, чтобы влезли */
    padding: 4px;
    gap: 4px;
  }

  .toggle-btn {
    padding: 10px 0;
    font-size: 0.85rem;
  }

  /* На мобилке увеличение чуть меньше, чтобы не ломать верстку */
  .toggle-btn.active {
    transform: scale(1.03);
  }

  .items-wrapper {
    grid-template-columns: 1fr;
  }

  .shopping-list-container {
    padding-bottom: 80px;
  }
}
</style>
