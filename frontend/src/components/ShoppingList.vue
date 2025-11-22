<template>
  <section class="shopping-list-container">
    <div
      v-if="!store.activeList || store.activeList.items.length === 0"
      class="empty-list"
    >
      <p>📝</p>
      Your list is currently empty. Add your first item!
    </div>

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
  </section>
</template>

<script setup>
import { useListStore } from '@/stores/listStore'
import ShoppingListItem from './ShoppingListItem.vue'

const store = useListStore()
</script>

<style scoped>
.shopping-list-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-list {
  text-align: center;
  padding: 3rem;
  background: var(--card-color);
  border-radius: var(--border-radius);
  color: var(--text-light);
  font-size: 1.1rem;
}
.empty-list p {
  font-size: 3rem;
  margin: 0;
}

.category-group {
  width: 100%;
}

.category-title {
  font-size: 1.3rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.items-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.list-anim-move,
.list-anim-enter-active,
.list-anim-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}
.list-anim-enter-from,
.list-anim-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}
.list-anim-leave-active {
  position: absolute;
}
</style>
