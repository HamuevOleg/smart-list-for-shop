<template>
  <div
    class="list-item-card"
    :style="magneticStyle"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    :class="{ completed: item.completed }"
    @click="store.startViewing(item)"
    title="Click to edit"
  >
    <div class="item-controls">
      <button
        @click.stop="store.startEditing(item)"
        class="btn-icon"
        title="Edit"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
        </svg>
      </button>
      <button
        @click.stop="store.removeItem(item.id)"
        class="btn-icon btn-delete"
        title="Delete"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.54 0c-.265.11-.506.224-.74.346M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    <div class="item-checkbox-wrapper" @click.stop>
      <input
        type="checkbox"
        :checked="item.completed"
        @change="store.toggleItem(item.id)"
        class="item-checkbox"
      />
    </div>

    <div class="card-content">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="item-image"
      />
      <div v-else class="photo-placeholder">
        <span>{{ photoPlaceholder }}</span>
      </div>

      <div class="item-details">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-quantity">{{ item.quantity }} {{ item.unit }}</span>

        <p v-if="item.comment" class="item-comment">
          {{ item.comment }}
        </p>

        <div class="user-badges">
          <div class="user-badge added" v-if="item.addedBy && !item.completed">
            <span class="badge-avatar">
              <img
                v-if="isImage(item.addedByAvatar)"
                :src="item.addedByAvatar"
                class="mini-avatar-img"
              />
              <span v-else>{{ item.addedByAvatar || '👤' }}</span>
            </span>
            <span class="badge-name">Added by {{ item.addedBy }}</span>
          </div>

          <div class="user-badge completed" v-if="item.completed && item.completedBy">
            <span class="badge-avatar">
              <img
                v-if="isImage(item.completedByAvatar)"
                :src="item.completedByAvatar"
                class="mini-avatar-img"
              />
              <span v-else>{{ item.completedByAvatar || '✅' }}</span>
            </span>
            <span class="badge-name">Done by {{ item.completedBy }}</span>
          </div>
        </div>

        <div class="item-prices" v-if="hasPrices">
          <span v-if="item.priceStore1" class="price store1">
            M1: {{ item.priceStore1 }}
          </span>
          <span v-if="item.priceStore2" class="price store2">
            M2: {{ item.priceStore2 }}
          </span>
          <span v-if="item.userPrice" class="price user">
            My: {{ item.userPrice }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'
import { useMagnetic } from '@/composables/useMagnetic'

const props = defineProps({
  item: { type: Object, required: true },
})

const store = useListStore()
const { magneticStyle, onMouseMove, onMouseLeave } = useMagnetic(0.2)

const photoPlaceholder = computed(() => {
  return props.item.name.substring(0, 2).toUpperCase()
})

const hasPrices = computed(() => {
  return props.item.priceStore1 || props.item.priceStore2 || props.item.userPrice
})

// Хелпер для проверки: это картинка (URL/Base64) или текст?
const isImage = (avatarString) => {
  if (!avatarString) return false
  return avatarString.startsWith('http') || avatarString.startsWith('data:image')
}
</script>

<style scoped>
.list-item-card {
  position: relative;
  background: var(--list-item-color);
  color: #e2e8f0;
  padding: 1.25rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: transform 0.3s ease-out;
  cursor: pointer;
}

.list-item-card:hover {
  transform: translateY(-4px);
}

.list-item-card.completed {
  opacity: 0.6;
  background: #334155;
  cursor: default;
}
.list-item-card.completed:hover {
  transform: none;
}
.list-item-card.completed .item-name {
  text-decoration: line-through;
}

.item-checkbox-wrapper {
  position: absolute;
  top: 1rem;
  left: 1rem;
  cursor: pointer;
  z-index: 2;
}
.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary-color);
  background-color: #475569;
  border-radius: 4px;
}

.item-controls {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  z-index: 2;
}
.list-item-card:hover .item-controls {
  opacity: 1;
}

.btn-icon {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  color: #e2e8f0;
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}
.btn-icon:hover {
  background-color: var(--primary-color);
  color: white;
}
.btn-delete:hover {
  background-color: #ef4444;
  color: white;
}
.btn-icon svg {
  width: 18px;
  height: 18px;
  display: block;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1.75rem;
}

.item-image,
.photo-placeholder {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.item-image {
  object-fit: cover;
  background-color: #475569;
}

.photo-placeholder {
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-details {
  flex-grow: 1;
  min-width: 0;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.item-quantity {
  font-size: 0.9rem;
  color: #94a3b8;
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

.item-prices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.price.store1 { color: #60a5fa; }
.price.store2 { color: #f59e0b; }
.price.user { color: #34d399; }

/* СТИЛИ ДЛЯ БЕЙДЖЕЙ */
.user-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}
.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px; /* Чуть увеличили отступ */
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.user-badge.completed {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}
.badge-avatar {
  font-size: 0.9rem;
  line-height: 1;
  display: flex;
  align-items: center;
}
/* Стили для мини-аватарки */
.mini-avatar-img {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
}
.badge-name {
  font-weight: 600;
}
</style>
