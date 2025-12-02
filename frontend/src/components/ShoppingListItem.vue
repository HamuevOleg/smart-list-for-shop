<template>
  <div
    class="list-item-card"
    :style="magneticStyle"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    :class="{
      completed: item.completed,
      pending: item.syncStatus === 'pending'
    }"
    @click="store.startViewing(item)"
  >
    <div class="item-controls">
      <template v-if="item.syncStatus !== 'pending'">
        <button @click.stop="store.startEditing(item)" class="btn-icon" title="Edit">✎</button>
        <button @click.stop="store.removeItem(item.id)" class="btn-icon btn-delete" title="Delete">🗑</button>
      </template>
      <span v-else class="pending-badge" title="Saved locally. Waiting for connection...">
        ⏳ Waiting
      </span>
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
              <img v-if="isImage(item.addedByAvatar)" :src="item.addedByAvatar" class="mini-avatar-img" />
              <span v-else>{{ item.addedByAvatar || '👤' }}</span>
            </span>
            <span class="badge-name">{{ item.addedBy }}</span>
          </div>
        </div>

        <div class="item-prices" v-if="hasPrices">
          <span v-if="item.priceStore1" class="price store1">
            M: {{ item.priceStore1 }}
          </span>
          <span v-if="item.priceStore2" class="price store2">
            L: {{ item.priceStore2 }}
          </span>
          <span v-if="item.userPrice" class="price user">
            Me: {{ item.userPrice }}
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
  return props.item.name ? props.item.name.substring(0, 2).toUpperCase() : '??'
})

const hasPrices = computed(() => {
  return props.item.priceStore1 || props.item.priceStore2 || props.item.userPrice
})

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
  transition: transform 0.3s ease-out, opacity 0.3s;
  cursor: pointer;
  border: 1px solid transparent;
}

/* Styles for pending sync state */
.list-item-card.pending {
  opacity: 0.85;
  border-color: rgba(251, 191, 36, 0.5); /* Yellow border */
  background: linear-gradient(145deg, var(--list-item-color), rgba(251, 191, 36, 0.05));
}

.pending-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24; /* Yellow text */
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  white-space: nowrap;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.list-item-card:hover {
  transform: translateY(-4px);
}

.list-item-card.completed {
  opacity: 0.6;
  background: #334155;
  cursor: default;
  border-color: transparent;
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
  opacity: 0.7;
  transition: opacity 0.2s ease;
  z-index: 2;
  align-items: center;
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
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-icon:hover {
  background-color: var(--primary-color);
  color: white;
}
.btn-delete:hover {
  background-color: #ef4444;
  color: white;
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
  font-size: 1.15rem;
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

.user-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}
.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: var(--text-light);
}
.mini-avatar-img { width: 14px; height: 14px; border-radius: 50%; object-fit: cover; }

.item-prices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}
.price.store1 { color: #60a5fa; }
.price.store2 { color: #f59e0b; }
.price.user { color: #34d399; }
</style>
