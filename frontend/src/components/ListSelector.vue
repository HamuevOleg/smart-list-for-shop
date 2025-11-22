<template>
  <div class="list-selector-container">
    <div class="header-section">
      <h1 class="title">My shop list</h1>
      <p class="subtitle">Manage your lists and save your time</p>
    </div>

    <div class="list-grid">
      <div class="list-card create-new" @click="startCreating">
        <template v-if="!isCreating">
          <div class="card-icon">
            <span class="plus-icon">+</span>
          </div>
          <span class="card-text">Create a new list</span>
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
              placeholder="list name..."
              class="form-input"
              ref="createInput"
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
        <div class="card-icon">
          <span>🛒</span>
        </div>
        <span class="list-name">{{ list.name }}</span>
        <div class="list-stats">
          <span class="stat-item">
            <span class="stat-icon">📦</span>
            {{ list.items.length }} good(s)
          </span>
          <span class="stat-item" v-if="list.items.some(i => i.completed)">
            <span class="stat-icon">✓</span>
            {{ list.items.filter(i => i.completed).length }} bought
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. Импортируем onMounted
import { ref, nextTick, onMounted } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()
const isCreating = ref(false)
const newListName = ref('')
const createInput = ref(null)

// 2. Вызываем fetchLists() при загрузке компонента,
// чтобы получить списки из MongoDB
onMounted(() => {
  store.fetchLists()
})

const startCreating = async () => {
  if (isCreating.value) return
  isCreating.value = true
  await nextTick()
  createInput.value?.focus()
}

// 3. Обновляем handleCreate, чтобы он был async
// и ждал ответа сервера перед сбросом полей
const handleCreate = async () => {
  // Не даем создать список с пустым именем
  if (!newListName.value.trim()) {
    isCreating.value = false
    return
  }

  await store.createList(newListName.value)

  newListName.value = ''
  isCreating.value = false
}
</script>

<style scoped>
/* Стили остаются без изменений */
.list-selector-container {
  width: 100%;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  color: var(--secondary-color);
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.subtitle {
  color: var(--text-light);
  font-size: 1.1rem;
  margin: 0;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.8s ease-out 0.2s backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.list-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem 1.5rem;
  background: var(--card-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.list-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), #60a5fa);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.list-card:hover::before {
  opacity: 1;
}

.list-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.15);
  border-color: var(--primary-color);
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.list-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, var(--primary-color) 0%, #60a5fa 100%);
}

.list-card:hover .card-icon span {
  filter: brightness(0) invert(1);
}

.plus-icon {
  font-size: 2.5rem;
  line-height: 1;
  color: var(--primary-color);
  font-weight: 300;
}

.card-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-light);
}

.list-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--secondary-color);
  text-align: center;
  margin-bottom: 1rem;
}

.list-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-top: auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-light);
  padding: 0.5rem;
  background: var(--bg-color);
  border-radius: 8px;
  justify-content: center;
}

.stat-icon {
  font-size: 1rem;
}

.create-new {
  border: 2px dashed #cbd5e1;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.create-new:hover {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.create-new .card-text {
  color: var(--primary-color);
  font-weight: 600;
}

.create-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-form .form-input {
  text-align: center;
}

@media (max-width: 768px) {
  .list-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .title {
    font-size: 2rem;
  }
}
</style>
