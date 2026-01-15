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
          “{{ item.comment }}”
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
// Магнитный эффект делаем слабее, чтобы не раздражал
const { magneticStyle, onMouseMove, onMouseLeave } = useMagnetic(0.15)

const hasPrices = computed(() => {
  return props.item.priceStore1 || props.item.priceStore2 || props.item.userPrice
})

const isImage = (str) => str && (str.startsWith('http') || str.startsWith('data:image'))
</script>

<style scoped>
.list-item-card {
  position: relative;
  /* Темный фон карточки с легкой прозрачностью */
  background: rgba(30, 30, 46, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1rem;
  transition: transform 0.2s ease, background 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.list-item-card:hover {
  transform: translateY(-2px);
  background: rgba(40, 40, 60, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}

/* COMPLETED STATE */
.list-item-card.completed {
  opacity: 0.6;
  background: rgba(20, 20, 30, 0.5);
  border-color: transparent;
}
.list-item-card.completed .item-name {
  text-decoration: line-through;
  color: #6b7280;
}
.list-item-card.completed .product-img {
  filter: grayscale(100%);
}

/* PENDING STATE */
.list-item-card.pending {
  border: 1px solid #f59e0b;
}
.pending-overlay {
  position: absolute; top: 5px; right: 5px;
  background: #f59e0b; color: #000;
  font-size: 0.7rem; font-weight: bold;
  padding: 2px 6px; border-radius: 6px; z-index: 10;
}

/* CHECKBOX */
.checkbox-area {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
}

.custom-checkbox {
  display: block; position: relative;
  padding-left: 24px; cursor: pointer; user-select: none;
}
.custom-checkbox input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark {
  position: absolute; top: -10px; left: 0;
  height: 22px; width: 22px;
  background-color: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 6px; transition: all 0.2s;
}
.list-item-card:hover .checkmark { border-color: var(--primary-color); }
.custom-checkbox input:checked ~ .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}
.checkmark:after {
  content: ""; position: absolute; display: none;
}
.custom-checkbox input:checked ~ .checkmark:after {
  display: block;
  left: 6px; top: 2px;
  width: 5px; height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* ACTIONS (HOVER) */
.item-actions {
  position: absolute; top: 0.5rem; right: 0.5rem;
  display: flex; gap: 0.5rem; opacity: 0;
  transition: opacity 0.2s; z-index: 10;
}
.list-item-card:hover .item-actions { opacity: 1; }

/* На мобильных кнопки всегда видны чуть-чуть или лучше сделать свайп,
   но пока оставим просто видными для тача */
@media (hover: none) {
  .item-actions { opacity: 1; top: 0.8rem; right: 0.8rem; }
}

.action-btn {
  background: rgba(0,0,0,0.5); border: none; border-radius: 50%;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem; color: #fff;
  transition: transform 0.2s;
}
.action-btn:hover { transform: scale(1.1); background: var(--primary-color); }
.action-btn.delete:hover { background: #ef4444; }

/* BODY LAYOUT */
.card-body {
  display: flex; align-items: center; gap: 1rem;
  padding-left: 2.2rem; /* Место под чекбокс */
}

.image-wrapper {
  width: 56px; height: 56px; flex-shrink: 0;
  border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.1);
  background: #000;
}
.product-img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-img {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), #4f46e5);
  font-weight: 800; color: #fff; font-size: 1.2rem;
}

.info-column { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.item-name {
  margin: 0; font-size: 1.1rem; color: #fff; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 80%;
}
.item-qty { font-size: 0.9rem; color: var(--secondary-color); font-weight: 700; white-space: nowrap; }

.item-comment {
  margin: 2px 0 6px 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);
  font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px; }

.prices-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.price-tag {
  font-size: 0.75rem; padding: 2px 6px; border-radius: 6px;
  font-weight: 600; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
}
.price-tag.metro { color: #60a5fa; border-color: rgba(96, 165, 250, 0.3); }
.price-tag.linella { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
.price-tag.user { color: #34d399; border-color: rgba(52, 211, 153, 0.3); }

.user-badge {
  display: flex; align-items: center; gap: 4px;
  background: rgba(0,0,0,0.3); padding: 2px 8px 2px 2px;
  border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
}
.user-avatar { width: 16px; height: 16px; border-radius: 50%; object-fit: cover; }
.user-emoji { font-size: 0.8rem; line-height: 1; }
.user-name { font-size: 0.7rem; color: rgba(255,255,255,0.8); }
</style>
