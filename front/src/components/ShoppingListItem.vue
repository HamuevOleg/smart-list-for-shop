<template>
  <div
    class="list-item-card"
    :style="magneticStyle"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    :class="{ completed: item.completed }"
  >
    <div class="item-controls">
      <button
        @click="store.startEditing(item)"
        class="btn-icon"
        title="Редактировать"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      </button>
      <button
        @click="store.removeItem(item.id)"
        class="btn-icon btn-delete"
        title="Удалить"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.54 0c-.265.11-.506.224-.74.346M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    <div class="item-checkbox-wrapper">
      <input
        type="checkbox"
        :checked="item.completed"
        @change="store.toggleItem(item.id)"
        class="item-checkbox"
      />
    </div>

    <div class="card-content">
      <div class="photo-placeholder">
        <span>{{ photoPlaceholder }}</span>
      </div>

      <div class="item-details">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-quantity">{{ item.quantity }} {{ item.unit }}</span>
        <p v-if="item.comment" class="item-comment">
          {{ item.comment }}
        </p>

        <div class="item-prices" v-if="hasPrices">
          <span v-if="item.priceStore1" class="price store1">
            M1: {{ item.priceStore1 }}
          </span>
          <span v-if="item.priceStore2" class="price store2">
            M2: {{ item.priceStore2 }}
          </span>
          <span v-if="item.userPrice" class="price user">
            Моя: {{ item.userPrice }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
// 1. Импортируем наш новый composable
import { useMagnetic } from '@/composables/useMagnetic'

const props = defineProps({
  item: { type: Object, required: true },
})

const store = useListStore()

// 2. Инициализируем "магию". Демпфинг 0.2 - хороший баланс
const { magneticStyle, onMouseMove, onMouseLeave } = useMagnetic(0.2)

// 3. Логика для заглушки фото
const photoPlaceholder = computed(() => {
  return props.item.name.substring(0, 2).toUpperCase()
})

// 4. Логика для отображения цен
const hasPrices = computed(() => {
  return props.item.priceStore1 || props.item.priceStore2 || props.item.userPrice
})
</script>

<style scoped>
/*
 *
 * НОВЫЕ СТИЛИ ДЛЯ КАРТОЧКИ
 *
*/

.list-item-card {
  position: relative; /* Для .item-controls */
  background: var(--secondary-color); /* Темно-синий */
  color: #e2e8f0; /* Светлый текст */
  padding: 1.25rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);

  /* Ключевой момент:
    transition срабатывает, когда мышь уходит (onMouseLeave),
    и 'transform' плавно возвращается в 'translate(0,0)'.
    Когда мышь движется, :style напрямую меняет 'transform'
    БЫСТРЕЕ, чем transition, создавая эффект "прилипания".
  */
  transition: transform 0.3s ease-out;
}

.list-item-card.completed {
  opacity: 0.4;
  background: #334155; /* Чуть бледнее */
}
.list-item-card.completed .item-name {
  text-decoration: line-through;
}

/* Расположение чекбокса */
.item-checkbox-wrapper {
  position: absolute;
  top: 1rem;
  left: 1rem;
}
.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color);
  background-color: #475569;
  border-radius: 4px;
}

/* Расположение кнопок */
.item-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0.5; /* Слегка прячем */
  transition: opacity 0.2s ease;
}
.list-item-card:hover .item-controls {
  opacity: 1; /* Показываем при наведении */
}

/* Стили иконок */
.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  color: #e2e8f0; /* Светлая иконка */
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  background-color: var(--primary-color);
  color: white;
}
.btn-delete:hover {
  background-color: #ef4444; /* Red */
  color: white;
}
.btn-icon svg {
  width: 18px;
  height: 18px;
  display: block; /* Убирает лишний отступ */
}

/* Контент карточки */
.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* Отступ от чекбокса */
  margin-left: 1.75rem;
}

/* Кружок-заглушка */
.photo-placeholder {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.item-details {
  flex-grow: 1;
  min-width: 0; /* Для 'text-overflow' */
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block; /* 'text-overflow' требует 'block' */
}

.item-quantity {
  font-size: 0.9rem;
  color: #94a3b8; /* Светло-серый */
}

.item-comment {
  font-size: 0.85rem;
  margin: 0.25rem 0 0 0;
  font-style: italic;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Цены в темной теме */
.item-prices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.price.store1 {
  color: #60a5fa; /* Светло-синий */
}
.price.store2 {
  color: #f59e0b; /* Оранжевый */
}
.price.user {
  color: #34d399; /* Зеленый */
}
</style>
