<template>
  <Transition name="popover-fade">
    <div class="modal-backdrop" v-if="store.viewingItem" @click.self="store.cancelViewing">
      <div class="modal-content">
        <button class="btn-close" @click="store.cancelViewing">×</button>

        <div class="image-container">
          <img
            v-if="store.viewingItem.imageUrl"
            :src="store.viewingItem.imageUrl"
            :alt="store.viewingItem.name"
            class="detail-image"
          />
          <div v-else class="detail-image-placeholder">
            <span>{{ store.viewingItem.name.substring(0, 2).toUpperCase() }}</span>
          </div>
        </div>

        <h2 class="detail-title">{{ store.viewingItem.name }}</h2>

        <div class="detail-subtitle">
          <span v-if="store.viewingItem.quantity" class="badge">
            {{ store.viewingItem.quantity }} {{ store.viewingItem.unit }}
          </span>
          <span v-if="store.viewingItem.category" class="badge category">
            {{ store.viewingItem.category }}
          </span>
          <span v-if="formattedDueDate" class="badge date">
            📅 {{ formattedDueDate }}
          </span>
        </div>

        <p v-if="store.viewingItem.comment" class="detail-comment">
          {{ store.viewingItem.comment }}
        </p>

        <div class="detail-prices" v-if="hasPrices">
          <div class="price-row" v-if="store.viewingItem.priceStore1">
            <span class="price-label">Metro Price</span>
            <span class="price-value store1">{{ store.viewingItem.priceStore1.toFixed(2) }} Lei</span>
          </div>
          <div class="price-row" v-if="store.viewingItem.priceStore2">
            <span class="price-label">Linella Price:</span>
            <span class="price-value store2">{{ store.viewingItem.priceStore2.toFixed(2) }} Lei</span>
          </div>
          <div class="price-row" v-if="store.viewingItem.userPrice">
            <span class="price-label">My Price:</span>
            <span class="price-value user">{{ store.viewingItem.userPrice.toFixed(2) }} Lei</span>
          </div>
        </div>

        <button
          class="btn btn-primary btn-edit"
          @click="store.startEditing(store.viewingItem)"
        >
          Edit
        </button>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()

// Форматирование даты: YYYY-MM-DD -> DD.MM.YYYY
const formattedDueDate = computed(() => {
  const date = store.viewingItem?.dueDate
  if (!date) return null

  // Простая защита от некорректного формата
  const parts = date.split('-')
  if (parts.length !== 3) return date

  const [y, m, d] = parts
  return `${d}.${m}.${y}`
})

const hasPrices = computed(() => {
  if (!store.viewingItem) return false
  return store.viewingItem.priceStore1 ||
    store.viewingItem.priceStore2 ||
    store.viewingItem.userPrice
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Чуть темнее */
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background: var(--card-color);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); /* Тень посильнее */
  width: 90%;
  max-width: 450px;
  position: relative;
  border-top: 4px solid var(--primary-color);
}

.btn-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-light);
  z-index: 2; /* Чтобы кнопка была поверх картинки, если что */
}

/* --- ИСПРАВЛЕНИЕ КАРТИНКИ --- */
.image-container {
  width: 100%;
  height: 250px; /* Фиксированная высота контейнера */
  background-color: #0a0a0a; /* Темный фон для letterbox полос */
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* <<< ГЛАВНОЕ ИЗМЕНЕНИЕ: Картинка вписывается целиком */
}

.detail-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Тексты */
.detail-title {
  font-family: "Kumbh Sans", sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.1;
}

.detail-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

/* Бейджи */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.badge.category {
  color: var(--primary-color);
  background: rgba(255, 51, 102, 0.1);
  border-color: rgba(255, 51, 102, 0.2);
}

.badge.date {
  color: #fbbf24; /* Желтый */
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
}

.detail-comment {
  font-family: "Kumbh Sans", sans-serif;
  font-size: 1.1rem;
  color: #e2e8f0;
  background: var(--bg-input);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  white-space: pre-wrap;
  border-left: 3px solid var(--text-light);
}

/* Цены */
.detail-prices {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
}
.price-label {
  color: var(--text-light);
}
.price-value {
  font-weight: 700;
}
.price-value.store1 { color: #60a5fa; }
.price-value.store2 { color: #f59e0b; }
.price-value.user { color: #34d399; }

.btn-edit {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.8rem;
}

/* Анимация */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: all 0.2s ease;
}
.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
