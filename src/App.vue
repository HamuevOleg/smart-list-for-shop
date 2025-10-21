<template>
  <canvas ref="canvasRef" id="bubble-background"></canvas>

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

      <TotalFooter />
    </div>

    <ShareModal />
    <EditModal />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useListStore } from '@/stores/listStore'
// 3. ИЗМЕНЕНИЕ: Импортируем 'usePlasmaBackground'
import { usePlasmaBackground } from '@/composables/usePlasmaBackground'

// Импорты компонентов
import ListSelector from './components/ListSelector.vue'
import UserHeader from './components/UserHeader.vue'
import AddItemForm from './components/AddItemForm.vue'
import ShoppingList from './components/ShoppingList.vue'
import ShareModal from './components/ShareModal.vue'
import EditModal from './components/EditModal.vue'
import TotalFooter from './components/TotalFooter.vue'

const store = useListStore()
const { activeListId } = storeToRefs(store)

// 4. ИЗМЕНЕНИЕ: Вызываем 'usePlasmaBackground'
const { canvasRef } = usePlasmaBackground()
</script>

<style>
/* 5. ГЛОБАЛЬНЫЕ стили (не 'scoped')
  Они остаются без изменений с прошлого шага
*/
#bubble-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1; /* Помещаем фон ПОЗАДИ всего */
}

#app-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative; /* Обязательно для z-index */
  z-index: 1;
}
</style>

<style scoped>
/* 6. Стили для компонентов (остаются как были) */
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
</style>
