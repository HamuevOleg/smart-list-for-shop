<template>
  <section class="shopping-list-container">

    <div class="list-controls" v-if="store.activeList && store.activeList.items.length > 0">
      <div class="view-toggles">
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'grouped' }"
          @click="viewMode = 'grouped'"
        >
          <span class="icon">📂</span>
          <span>Categories</span>
        </button>

        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'linear' }"
          @click="viewMode = 'linear'"
        >
          <span class="icon">📋</span>
          <span>All Items</span>
        </button>
      </div>
    </div>

    <div
      v-if="!store.activeList || store.activeList.items.length === 0"
      class="empty-list"
    >
      <div class="empty-icon">📝</div>
      <h3>Your list is empty</h3>
      <p>Tap "Add New Item" to get started!</p>
    </div>

    <Transition name="mode-switch" mode="out-in">
      <div v-if="viewMode === 'grouped'" key="grouped" class="list-view">
        <div
          v-for="(group, category) in store.groupedItems"
          :key="category"
          class="category-group"
        >
          <h3 class="category-title">
            <span class="cat-marker">#</span> {{ category }}
          </h3>
          <div class="items-grid">
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
        <div class="items-grid">
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
  display: flex; flex-direction: column; gap: 2rem;
  padding-bottom: 100px; /* Отступ чтобы список не ушел под кнопку Totals */
}

/* КОНТРОЛЫ */
.list-controls {
  display: flex; justify-content: flex-end;
  position: sticky; top: 1rem; z-index: 40;
}

.view-toggles {
  display: inline-flex; background: rgba(30, 30, 46, 0.8); backdrop-filter: blur(12px);
  padding: 4px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.toggle-btn {
  display: flex; align-items: center; gap: 8px; padding: 8px 16px;
  border: none; border-radius: 10px; background: transparent;
  color: #94a3b8; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;
}
.toggle-btn:hover { color: #fff; }
.toggle-btn.active { background: var(--primary-color); color: white; box-shadow: 0 2px 10px rgba(255, 51, 102, 0.4); }

/* ПУСТОЙ СПИСОК */
.empty-list {
  text-align: center; padding: 4rem 2rem; background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.1); border-radius: 20px; color: var(--text-light);
}
.empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
.empty-list h3 { color: #fff; margin: 0 0 0.5rem 0; }

/* ГРУППЫ И СЕТКА */
.category-group { margin-bottom: 2rem; }
.category-title {
  font-size: 1.1rem; color: var(--secondary-color); margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.5rem; padding-left: 0.5rem;
}
.cat-marker { color: rgba(255, 255, 255, 0.2); font-weight: 400; }
.items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }

/* АНИМАЦИИ */
.list-anim-move, .list-anim-enter-active, .list-anim-leave-active { transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
.list-anim-enter-from, .list-anim-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
.list-anim-leave-active { position: absolute; }
.mode-switch-enter-active, .mode-switch-leave-active { transition: opacity 0.2s ease; }
.mode-switch-enter-from, .mode-switch-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .list-controls { justify-content: center; top: 5px; }
  .items-grid { grid-template-columns: 1fr; }
}
</style>
