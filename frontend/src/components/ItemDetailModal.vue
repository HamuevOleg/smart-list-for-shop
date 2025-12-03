<template>
  <Transition name="modal-fade">
    <div class="modal-backdrop" v-if="store.viewingItem" @click.self="store.cancelViewing">
      <div class="modal-content">

        <div class="modal-header-image">
          <img
            v-if="store.viewingItem.imageUrl"
            :src="store.viewingItem.imageUrl"
            :alt="store.viewingItem.name"
            class="detail-image"
          />
          <div v-else class="detail-image-placeholder">
            <span>{{ store.viewingItem.name.substring(0, 2).toUpperCase() }}</span>
          </div>

          <button class="btn-close" @click="store.cancelViewing">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="status-badge" :class="{ completed: store.viewingItem.completed }">
            <svg class="status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline v-if="store.viewingItem.completed" points="20 6 9 17 4 12"/>
              <path v-else d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
            </svg>
            <span>{{ store.viewingItem.completed ? 'Bought' : 'To Buy' }}</span>
          </div>
        </div>

        <div class="modal-body">
          <div class="title-row">
            <h2 class="detail-title">{{ store.viewingItem.name }}</h2>
            <span class="quantity-badge">
              <svg class="qty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 3v18"/>
              </svg>
              {{ store.viewingItem.quantity }} {{ store.viewingItem.unit }}
            </span>
          </div>

          <div class="added-by-row" v-if="store.viewingItem.addedBy">
            <svg class="added-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="added-label">Added by</span>
            <div class="user-chip">
              <div class="user-avatar">
                <img v-if="isImage(store.viewingItem.addedByAvatar)" :src="store.viewingItem.addedByAvatar" />
                <span v-else>{{ store.viewingItem.addedByAvatar }}</span>
              </div>
              <span class="user-name">{{ store.viewingItem.addedBy }}</span>
            </div>
          </div>

          <div class="tags-row">
            <span v-if="store.viewingItem.category" class="tag category">
              {{ getCategoryIcon(store.viewingItem.category) }} {{ store.viewingItem.category }}
            </span>
            <span v-if="formattedDueDate" class="tag date">
              <svg class="tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formattedDueDate }}
            </span>
          </div>

          <div v-if="store.viewingItem.comment" class="detail-comment">
            <svg class="comment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>{{ store.viewingItem.comment }}</p>
          </div>

          <div class="prices-box" v-if="hasPrices">
            <div class="price-item" v-if="store.viewingItem.priceStore1">
              <svg class="price-icon store1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
              </svg>
              <span class="p-label">Metro</span>
              <span class="p-val store1">{{ store.viewingItem.priceStore1 }} <small>MDL</small></span>
            </div>
            <div class="price-divider" v-if="store.viewingItem.priceStore1 && store.viewingItem.priceStore2"></div>
            <div class="price-item" v-if="store.viewingItem.priceStore2">
              <svg class="price-icon store2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span class="p-label">Linella</span>
              <span class="p-val store2">{{ store.viewingItem.priceStore2 }} <small>MDL</small></span>
            </div>
            <div class="price-divider" v-if="(store.viewingItem.priceStore1 || store.viewingItem.priceStore2) && store.viewingItem.userPrice"></div>
            <div class="price-item" v-if="store.viewingItem.userPrice">
              <svg class="price-icon user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span class="p-label">My Price</span>
              <span class="p-val user">{{ store.viewingItem.userPrice }} <small>MDL</small></span>
            </div>
          </div>

          <div class="actions-grid">
            <button
              class="btn-action btn-toggle"
              :class="{ completed: store.viewingItem.completed }"
              @click="handleToggle"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline v-if="!store.viewingItem.completed" points="20 6 9 17 4 12"/>
                <path v-else d="M9 11l-6 6m0-6l6 6m6-13l6 6m-6 0l6-6"/>
              </svg>
              <span v-if="!store.viewingItem.completed">Mark as Bought</span>
              <span v-else>Restore Item</span>
            </button>

            <div class="secondary-actions">
              <button class="btn-icon-action edit" @click="store.startEditing(store.viewingItem)" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon-action delete" @click="handleDelete" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useListStore } from '@/stores/listStore'

const store = useListStore()

const handleToggle = () => {
  store.toggleItem(store.viewingItem.id)
  // Не закрываем модалку сразу, чтобы пользователь увидел изменение статуса
}

const handleDelete = async () => {
  if (confirm(`Delete "${store.viewingItem.name}"?`)) {
    await store.removeItem(store.viewingItem.id)
    store.cancelViewing()
  }
}

const formattedDueDate = computed(() => {
  const date = store.viewingItem?.dueDate
  if (!date) return null
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
})

const hasPrices = computed(() => {
  if (!store.viewingItem) return false
  return store.viewingItem.priceStore1 || store.viewingItem.priceStore2 || store.viewingItem.userPrice
})

const isImage = (avatarString) => {
  if (!avatarString) return false
  return avatarString.startsWith('http') || avatarString.startsWith('data:image')
}

const getCategoryIcon = (cat) => {
  const map = { 'Fruits': '🍎', 'Vegetables': '🥕', 'Dairy': '🥛', 'Meat': '🥩', 'Fish': '🐟', 'Groceries': '🍞', 'Beverages': '🥤', 'Household': '🧼' }
  return map[cat] || '🏷️'
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
  display: flex; justify-content: center; align-items: center; z-index: 2000;
  padding: 1rem;
}

.modal-content {
  background: var(--card-color);
  width: 100%; max-width: 420px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  border: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  position: relative;
}

/* --- HEADER IMAGE --- */
.modal-header-image {
  height: 220px;
  background: linear-gradient(135deg, #1a1625 0%, #0a0a0a 100%);
  position: relative;
  display: flex; justify-content: center; align-items: center;
  overflow: hidden;
}

.detail-image {
  width: 100%; height: 100%; object-fit: cover;
  mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  transition: transform 0.3s ease;
}

.detail-image-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, var(--bg-input), #2a1f35);
  display: flex; align-items: center; justify-content: center;
  font-size: 4rem; color: var(--primary-color); font-weight: 800;
  text-shadow: 0 4px 20px rgba(255, 51, 102, 0.3);
}

.btn-close {
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(0,0,0,0.6); border: none;
  width: 40px; height: 40px; border-radius: 50%;
  color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-close svg {
  width: 20px; height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-close:hover {
  background: rgba(255, 51, 102, 0.8);
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-close:hover svg {
  transform: rotate(90deg) scale(1.1);
}

.status-badge {
  position: absolute; bottom: 1rem; left: 1rem;
  background: rgba(255, 51, 102, 0.95); color: white;
  padding: 8px 16px; border-radius: 24px;
  font-size: 0.85rem; font-weight: 700;
  box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4);
  backdrop-filter: blur(8px);
  display: flex; align-items: center; gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255, 51, 102, 0.5);
}

.status-badge.completed {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

.status-badge.completed:hover {
  box-shadow: 0 6px 24px rgba(16, 185, 129, 0.5);
}

.status-icon {
  width: 16px; height: 16px;
}

/* --- BODY --- */
.modal-body {
  padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.2rem;
}

.title-row {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
}

.detail-title {
  margin: 0; font-size: 1.7rem; color: #fff; line-height: 1.1;
  font-family: "Kumbh Sans", sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.quantity-badge {
  background: linear-gradient(135deg, rgba(255, 51, 102, 0.15), rgba(139, 92, 246, 0.15));
  color: #fff;
  padding: 8px 14px; border-radius: 12px;
  font-weight: 700; font-size: 0.9rem;
  white-space: nowrap;
  display: flex; align-items: center; gap: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qty-icon {
  width: 16px; height: 16px;
}

/* Added By */
.added-by-row {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.added-icon {
  width: 18px; height: 18px;
  color: var(--text-light);
  opacity: 0.6;
}

.added-label {
  font-size: 0.75rem;
  color: var(--text-light);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-chip {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  padding: 6px 12px 6px 6px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-left: auto;
  transition: all 0.2s ease;
}

.user-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-2px);
}

.user-avatar {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-name { font-size: 0.9rem; color: #fff; font-weight: 600; }

/* Tags */
.tags-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.tag {
  font-size: 0.85rem; padding: 8px 14px; border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  display: flex; align-items: center; gap: 6px;
  transition: all 0.2s ease;
  font-weight: 600;
}

.tag:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.tag.category {
  color: var(--primary-color);
  border-color: rgba(255, 51, 102, 0.4);
  background: rgba(255, 51, 102, 0.1);
}

.tag.date {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(251, 191, 36, 0.1);
}

.tag-icon {
  width: 14px; height: 14px;
}

/* Comment */
.detail-comment {
  background: rgba(255, 255, 255, 0.04);
  padding: 14px;
  border-radius: 14px;
  border-left: 3px solid var(--primary-color);
  margin: 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.detail-comment:hover {
  background: rgba(255, 255, 255, 0.06);
  border-left-color: var(--secondary-color);
}

.comment-icon {
  width: 20px; height: 20px;
  color: var(--text-light);
  opacity: 0.5;
  flex-shrink: 0;
  margin-top: 2px;
}

.detail-comment p {
  margin: 0;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Prices */
.prices-box {
  display: flex; justify-content: space-between; align-items: stretch;
  background: rgba(255, 255, 255, 0.04);
  padding: 1rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  gap: 1rem;
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.price-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.price-icon {
  width: 24px; height: 24px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.p-label {
  font-size: 0.7rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.p-val {
  font-weight: 800;
  font-size: 1.2rem;
  color: #fff;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.p-val small {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.6;
}

.store1, .price-icon.store1 { color: #60a5fa; }
.store2, .price-icon.store2 { color: #f59e0b; }
.user, .price-icon.user { color: #34d399; }

.price-divider {
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
  align-self: stretch;
}

/* Actions */
.actions-grid {
  display: grid; grid-template-columns: 1fr auto; gap: 0.8rem;
  margin-top: 0.5rem;
}

.btn-action {
  border: none; border-radius: 16px; font-weight: 700; font-size: 1rem;
  cursor: pointer; padding: 1rem 1.5rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex; align-items: center; justify-content: center; gap: 8px;
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-action:hover::before {
  opacity: 1;
}

.btn-icon {
  width: 20px; height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-toggle {
  background: linear-gradient(135deg, var(--primary-color), #e91e63);
  color: #fff;
  box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-toggle:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 51, 102, 0.5);
}

.btn-toggle:hover .btn-icon {
  transform: scale(1.2) rotate(5deg);
}

.btn-toggle:active { transform: translateY(-1px) scale(0.98); }

.btn-toggle.completed {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-light);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.btn-toggle.completed:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.1);
}

.secondary-actions { display: flex; gap: 0.6rem; }

.btn-icon-action {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.btn-icon-action svg {
  width: 20px; height: 20px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
}

.btn-icon-action::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.edit {
  background: rgba(139, 92, 246, 0.1);
  color: #a78bfa;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.edit::before {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
}

.edit:hover {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
}

.edit:hover::before { opacity: 1; }
.edit:hover svg { transform: scale(1.15) rotate(-5deg); color: #c4b5fd; }

.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.delete::before {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
}

.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.delete:hover::before { opacity: 1; }
.delete:hover svg { transform: scale(1.15) rotate(5deg); color: #fca5a5; }

/* Animation */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content {
  animation: modalAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active .modal-content {
  animation: modalDisappear 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalDisappear {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    margin: 0.5rem;}
  .detail-title {
    font-size: 1.4rem;
  }
  .prices-box {
    flex-direction: column;
    gap: 0.8rem;
  }
  .price-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
