<template>
  <div class="list-selector-container">
    <h1 class="title">My lists of purchases</h1>
    <div class="list-grid">
      <div class="list-card create-new" @click="startCreating">
        <template v-if="!isCreating">
          <span class="plus-icon">+</span>
          <span>Create a list</span>
        </template>
        <template v-else>
          <form
            @submit.prevent="handleCreate"
            class="create-form"
            @click.stop
          >
            <input
              type="text"
              v-model="newListName"
              placeholder="Name of a list ..."
              class="form-input"
              ref="createInput"
              @blur="isCreating = false"
            />
            <button
              type="submit"
              class="btn btn-primary"
              @mousedown.prevent
            >
              Create
            </button>
          </form>
        </template>
      </div>

      <div
        class="list-card"
        v-for="list in store.lists"
        :key="list.id"
        @click="store.selectList(list.id)"
      >
        <span class="list-name">{{ list.name }}</span>
        <span class="list-meta">{{ list.items.length }} товар(а)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()
const isCreating = ref(false)
const newListName = ref('')
const createInput = ref(null)

const startCreating = async () => {
  // Проверяем, чтобы не сработать, если форма уже открыта
  if (isCreating.value) return

  isCreating.value = true
  // Фокусируемся на инпуте, когда он появится
  await nextTick()
  createInput.value?.focus()
}

const handleCreate = () => {
  store.createList(newListName.value)
  newListName.value = ''
  isCreating.value = false
}
</script>

<style scoped>
.title {
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 2rem;
}
.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}
.list-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 150px;
  padding: 1rem;
  background: var(--card-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}
.list-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
}
.list-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-color);
  text-align: center;
}
.list-meta {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 0.5rem;
}
.create-new {
  border: 2px dashed var(--border-color);
  color: var(--text-light);
}
.create-new:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.plus-icon {
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.create-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
