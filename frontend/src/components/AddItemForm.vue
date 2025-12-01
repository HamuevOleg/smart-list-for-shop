<template>
  <Transition name="slide-fade">
    <section class="add-item-card" v-if="store.isAddItemFormVisible">
      <div class="form-header">
        <h2>Add item 🛒</h2>
        <button class="btn-close" @click="store.hideAddItemForm">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="add-item-form">

        <div class="primary-inputs">
          <div class="input-row main-row">
            <div class="form-group name-group">
              <input
                type="text"
                id="name"
                v-model="item.name"
                class="form-input main-input"
                placeholder="What to buy? (e.g. Milk)"
                autocomplete="off"
                required
                ref="nameInputRef"
              />
            </div>
          </div>

          <div class="input-row qty-row">
            <div class="qty-wrapper">
              <button type="button" class="qty-btn" @click="decrementQty">−</button>
              <input
                type="number"
                id="quantity"
                v-model.number="item.quantity"
                class="form-input qty-input"
                placeholder="1"
              />
              <button type="button" class="qty-btn" @click="incrementQty">+</button>
            </div>

            <select id="unit" v-model="item.unit" class="form-input unit-select">
              <option>pcs</option>
              <option>kg</option>
              <option>g</option>
              <option>l</option>
              <option>ml</option>
              <option>btl</option>
              <option>pkg</option>
            </select>
          </div>
        </div>

        <div class="toggle-wrapper">
          <button type="button" class="btn-toggle-details" @click="isExpanded = !isExpanded">
            <span class="toggle-text">{{ isExpanded ? 'Hide details' : 'Add prices, date & category' }}</span>
            <span class="toggle-icon" :class="{ rotated: isExpanded }">▼</span>
          </button>
        </div>

        <div class="details-section" v-if="isExpanded">
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="form-input popover-trigger">
                    <span>{{ item.category || 'Auto' }}</span>
                    <span>🏷️</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCategorySelector
                    v-model="item.category"
                    @update:modelValue="close"
                  />
                </template>
              </PopoverWrapper>
            </div>

            <div class="form-group">
              <label>Due date</label>
              <PopoverWrapper>
                <template #trigger>
                  <button type="button" class="form-input popover-trigger">
                    <span>{{ formattedDate || 'Not set' }}</span>
                    <span>📅</span>
                  </button>
                </template>
                <template #content="{ close }">
                  <CustomCalendar
                    v-model="item.dueDate"
                    @update:modelValue="close"
                  />
                </template>
              </PopoverWrapper>
            </div>
          </div>

          <div class="form-group">
            <label>Prices (Optional)</label>
            <div class="prices-grid">
              <input type="number" step="0.01" v-model.number="item.priceStore1" class="form-input price-input" placeholder="Metro" />
              <input type="number" step="0.01" v-model.number="item.priceStore2" class="form-input price-input" placeholder="Linella" />
              <input type="number" step="0.01" v-model.number="item.userPrice" class="form-input price-input" placeholder="My Price" />
            </div>
          </div>

          <div class="form-group">
            <label>Comment</label>
            <input type="text" v-model="item.comment" class="form-input" placeholder="Any notes..." autocomplete="off" />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-submit"
          :disabled="store.isAddingItem"
          :class="{ 'loading-btn': store.isAddingItem }"
        >
          <span v-if="!store.isAddingItem">Add Item</span>
          <div v-else class="loading-content">
            <span class="spinner"></span>
            Adding...
          </div>
        </button>

      </form>
    </section>
  </Transition>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useListStore } from '@/stores/listStore'
import PopoverWrapper from './common/PopoverWrapper.vue'
import CustomCategorySelector from './common/CustomCategorySelector.vue'
import CustomCalendar from './common/CustomCalendar.vue'

const store = useListStore()
const isExpanded = ref(false)
const nameInputRef = ref(null)

const getInitialItem = () => ({
  name: '',
  quantity: 1,
  unit: 'pcs',
  category: '',
  dueDate: '',
  comment: '',
  priceStore1: null,
  priceStore2: null,
  userPrice: null,
})

const item = ref(getInitialItem())

// Фокус на поле ввода при открытии
watch(() => store.isAddItemFormVisible, async (isVisible) => {
  if (isVisible) {
    await nextTick()
    // На мобильных иногда лучше не фокусировать автоматически, чтобы клавиатура не прыгала,
    // но для удобства оставим, или можно убрать если мешает.
    if (window.innerWidth > 600) {
      nameInputRef.value?.focus()
    }
  } else {
    isExpanded.value = false // Сбрасываем раскрытие при закрытии
  }
})

const incrementQty = () => item.value.quantity++
const decrementQty = () => {
  if (item.value.quantity > 1) item.value.quantity--
}

const handleSubmit = async () => {
  if (store.isAddingItem) return
  if (!item.value.name.trim()) return

  await store.addItem(item.value)
  item.value = getInitialItem()
  isExpanded.value = false // Сворачиваем детали после добавления
}

const formattedDate = computed(() => {
  if (!item.value.dueDate) return ''
  const [y, m, d] = item.value.dueDate.split('-')
  return `${d}.${m}.${y}`
})
</script>

<style scoped>
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }

.add-item-card {
  background: var(--card-color);
  padding: 1.25rem;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.form-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
}
.form-header h2 {
  margin: 0; font-size: 1.2rem; color: var(--secondary-color);
}
.btn-close {
  background: rgba(255,255,255,0.1); border: none; font-size: 1.2rem;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: var(--text-light); display: flex; align-items: center; justify-content: center;
}

.add-item-form { display: flex; flex-direction: column; gap: 1rem; }

/* --- PRIMARY INPUTS --- */
.primary-inputs {
  display: flex; flex-direction: column; gap: 0.8rem;
}

.main-input {
  font-size: 1.1rem; padding: 0.8rem; border-color: var(--primary-color);
  background: var(--bg-input); color: #fff;
}
.main-input::placeholder { color: rgba(255,255,255,0.3); }

.qty-row {
  display: flex; gap: 0.8rem;
}

.qty-wrapper {
  display: flex; align-items: center; background: var(--bg-input);
  border: 1px solid var(--border-color); border-radius: 10px;
  flex: 1;
}
.qty-btn {
  background: none; border: none; color: var(--primary-color);
  font-size: 1.5rem; width: 40px; cursor: pointer; padding: 0; line-height: 1;
}
.qty-input {
  width: 50px; text-align: center; border: none; background: transparent;
  font-weight: 700; color: #fff; font-size: 1.1rem; padding: 0.5rem 0;
}
/* Убираем стрелки у input number */
.qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.unit-select {
  flex: 0.6; background: var(--bg-input); color: #fff;
  border: 1px solid var(--border-color); cursor: pointer;
}

/* --- TOGGLE --- */
.toggle-wrapper {
  display: flex; justify-content: center; margin-top: 0.2rem;
}
.btn-toggle-details {
  background: none; border: none; color: var(--text-light);
  font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; border-radius: 20px; transition: background 0.2s;
}
.btn-toggle-details:hover { background: rgba(255,255,255,0.05); color: #fff; }
.toggle-icon { font-size: 0.7rem; transition: transform 0.3s; }
.toggle-icon.rotated { transform: rotate(180deg); }

/* --- DETAILS SECTION --- */
.details-section {
  display: flex; flex-direction: column; gap: 1rem;
  padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05);
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

.form-row { display: flex; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
.form-group label { font-size: 0.75rem; color: var(--text-light); font-weight: 600; margin-left: 2px; }

.popover-trigger {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-input); color: #fff; border-color: var(--border-color);
  font-size: 0.9rem; padding: 0.7rem;
}

.prices-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;
}
.price-input {
  padding: 0.6rem; text-align: center; font-size: 0.9rem;
  background: var(--bg-input); color: #fff;
}

/* --- SUBMIT BUTTON --- */
.btn-submit {
  width: 100%; padding: 0.9rem; font-size: 1.1rem; border-radius: 12px;
  display: flex; justify-content: center; align-items: center; margin-top: 0.5rem;
}
.loading-btn { opacity: 0.8; cursor: not-allowed; }
.loading-content { display: flex; align-items: center; gap: 0.5rem; }
.spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%; border-top-color: #fff; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* --- MOBILE OPTIMIZATION --- */
@media (max-width: 600px) {
  .add-item-card { padding: 1rem; }

  .form-row { flex-direction: row; gap: 0.8rem; } /* Keep row for small inputs like date/cat */

  .prices-grid { grid-template-columns: 1fr 1fr 1fr; gap: 0.4rem; }
  .price-input { padding: 0.5rem 0.2rem; font-size: 0.8rem; }
}
</style>
