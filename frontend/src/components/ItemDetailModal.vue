<template>
  <Transition name="popover-fade">
    <div class="modal-backdrop" v-if="store.viewingItem" @click.self="store.cancelViewing">
      <div class="modal-content">
        <button class="btn-close" @click="store.cancelViewing">×</button>

        <img
          v-if="store.viewingItem.imageUrl"
          :src="store.viewingItem.imageUrl"
          :alt="store.viewingItem.name"
          class="detail-image"
        />
        <div v-else class="detail-image-placeholder">
          <span>{{ store.viewingItem.name.substring(0, 2).toUpperCase() }}</span>
        </div>

        <h2 class="detail-title">{{ store.viewingItem.name }}</h2>

        <div class="detail-subtitle">
          <span v-if="store.viewingItem.quantity">
            {{ store.viewingItem.quantity }} {{ store.viewingItem.unit }}
          </span>
          <span v-if="store.viewingItem.category">
            {{ store.viewingItem.category }}
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

// Проверяем, есть ли хотя бы одна цена для отображения
const hasPrices = computed(() => {
  if (!store.viewingItem.value) return false
  return store.viewingItem.value.priceStore1 ||
    store.viewingItem.value.priceStore2 ||
    store.viewingItem.value.userPrice
})
</script>

<style scoped>
/* Стили модалки (похожи на EditModal) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Темнее для фокуса */
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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 450px; /* Узкая модалка для просмотра */
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
}

/* Стили для картинки */
.detail-image, .detail-image-placeholder {
  width: 100%;
  height: 250px; /* Большая высота */
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: var(--bg-input);
}
.detail-image {
  object-fit: cover; /* Масштабируем красиво */
}
.detail-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* Стили для текста */
.detail-title {
  font-family: "Kumbh Sans", sans-serif; /* Наш кастомный шрифт */
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.detail-subtitle {
  display: flex;
  gap: 1rem;
  font-size: 1rem;
  color: var(--text-light);
  margin-bottom: 1.5rem;
}
.detail-comment {
  font-family: "Kumbh Sans", sans-serif;
  font-size: 1.1rem;
  color: #fff;
  background: var(--bg-input);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  white-space: pre-wrap; /* Сохраняем переносы строк */
}

/* Стили для цен */
.detail-prices {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  width: 100%; /* Кнопка во всю ширину */
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
