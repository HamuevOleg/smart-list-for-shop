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
    <div v-if="item.syncStatus === 'pending'" class="pending-overlay">
      <span>⏳ Syncing...</span>
    </div>

    <div class="item-actions">
      <button @click.stop="store.startEditing(item)" class="action-btn edit" title="Edit">
        ✏️
      </button>
      <button @click.stop="store.removeItem(item.id)" class="action-btn delete" title="Delete">
        🗑️
      </button>
    </div>

    <div class="checkbox-area" @click.stop>
      <label class="custom-checkbox">
        <input
          type="checkbox"
          :checked="item.completed"
          @change="store.toggleItem(item.id)"
        />
        <span class="checkmark"></span>
      </label>
    </div>

    <div class="card-body">
      <div class="image-wrapper">
        <img
          v-if="item.imageUrl"
          :src="item.imageUrl"
          alt="item"
          loading="lazy"
          class="product-img"
        />
        <div v-else class="placeholder-img">
          {{ (item.name || '?').substring(0, 2).toUpperCase() }}
        </div>
      </div>

      <div class="info-column">
        <div class="header-row">
          <h3 class="item-name">{{ item.name }}</h3>
          <span class="item-qty">{{ item.quantity }} {{ item.unit }}</span>
        </div>

        <p v-if="item.comment" class="item-comment">
          "{{ item.comment }}"
        </p>

        <div class="footer-row">
          <div class="prices-badges" v-if="hasPrices">
            <span v-if="item.priceStore1" class="price-tag metro">M: {{ item.priceStore1 }}</span>
            <span v-if="item.priceStore2" class="price-tag linella">L: {{ item.priceStore2 }}</span>
            <span v-if="item.userPrice" class="price-tag user">Me: {{ item.userPrice }}</span>
          </div>

          <div class="user-badge" v-if="item.addedBy && !item.completed">
            <img
              v-if="isImage(item.addedByAvatar)"
              :src="item.addedByAvatar"
              class="user-avatar"
            />
            <span v-else class="user-emoji">{{ item.addedByAvatar }}</span>
            <span class="user-name">{{ item.addedBy }}</span>
          </div>
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
const { magneticStyle, onMouseMove, onMouseLeave } = useMagnetic(0.15)

const hasPrices = computed(() => {
  return props.item.priceStore1 || props.item.priceStore2 || props.item.userPrice
})

const isImage = (str) => str && (str.startsWith('http') || str.startsWith('data:image'))
</script>

<style scoped>
.list-item-card {
  position: relative;
  background: rgba(40, 40, 56, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 1.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.list-item-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  opacity: 0;
  transition: opacity 0.3s;
}

.list-item-card:hover {
  transform: translateY(-4px);
  background: rgba(50, 50, 70, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.list-item-card:hover::before {
  opacity: 1;
}

/* COMPLETED STATE */
.list-item-card.completed {
  opacity: 0.65;
  background: rgba(30, 30, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.05);
}
.list-item-card.completed .item-name {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.4);
}
.list-item-card.completed .product-img {
  filter: grayscale(100%) opacity(0.5);
}

/* PENDING STATE */
.list-item-card.pending {
  border: 1px solid #f59e0b;
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}
.pending-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #f59e0b, #fb923c);
  color: #000;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
}

/* CHECKBOX */
.checkbox-area {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.custom-checkbox {
  display: block;
  position: relative;
  padding-left: 28px;
  cursor: pointer;
  user-select: none;
}
.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkmark {
  position: absolute;
  top: -12px;
  left: 0;
  height: 24px;
  width: 24px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-item-card:hover .checkmark {
  border-color: var(--primary-color);
  background-color: rgba(96, 165, 250, 0.1);
}
.custom-checkbox input:checked ~ .checkmark {
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2.5px 2.5px 0;
  transform: rotate(45deg);
}

/* ACTIONS (HOVER) */
.item-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}
.list-item-card:hover .item-actions {
  opacity: 1;
}

@media (hover: none) {
  .item-actions {
    opacity: 1;
    top: 1rem;
    right: 1rem;
  }
}

.action-btn {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.action-btn:hover {
  transform: scale(1.15) rotate(5deg);
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.6);
}
.action-btn.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
}

/* BODY LAYOUT */
.card-body {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-left: 2.8rem;
}

.image-wrapper {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: linear-gradient(135deg, rgba(20, 20, 30, 0.8), rgba(30, 30, 45, 0.8));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}
.list-item-card:hover .image-wrapper {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.25);
}
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder-img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  font-weight: 800;
  color: #fff;
  font-size: 1.4rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.info-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 6px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.item-name {
  margin: 0;
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
  line-height: 1.3;
}
.item-qty {
  font-size: 0.95rem;
  color: var(--secondary-color);
  font-weight: 800;
  white-space: nowrap;
  background: rgba(96, 165, 250, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.item-comment {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.65);
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2px;
}

.prices-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.price-tag {
  font-size: 0.78rem;
  padding: 4px 8px;
  border-radius: 8px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
}
.price-tag:hover {
  transform: translateY(-2px);
}
.price-tag.metro {
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}
.price-tag.linella {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.1);
}
.price-tag.user {
  color: #34d399;
  border-color: rgba(52, 211, 153, 0.4);
  background: rgba(52, 211, 153, 0.1);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 10px 4px 4px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s;
}
.user-badge:hover {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.25);
}
.user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.user-emoji {
  font-size: 0.9rem;
  line-height: 1;
}
.user-name {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

@media (max-width: 768px) {
  .list-item-card {
    padding: 1rem;
  }
  .card-body {
    padding-left: 2.5rem;
    gap: 1rem;
  }
  .image-wrapper {
    width: 56px;
    height: 56px;
  }
  .item-name {
    font-size: 1.05rem;
  }
}
</style>
